import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { openaiClient, OPENAI_EMBEDDING_MODEL } from '@/lib/ai-client';
import * as cheerio from 'cheerio';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiting: IP당 시간당 10회
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1시간

// HTML 크기 제한 (1MB)
const MAX_HTML_SIZE = 1024 * 1024;

// SSRF 방어: 차단할 IP 범위
const BLOCKED_IP_PATTERNS = [
  /^127\./,           // 127.0.0.0/8
  /^10\./,            // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./,      // 192.168.0.0/16
  /^169\.254\./,      // 169.254.0.0/16
  /^0\./,             // 0.0.0.0/8
  /^::1$/,            // IPv6 localhost
  /^fe80:/,           // IPv6 link-local
  /^fc00:/,           // IPv6 private
];

function isPrivateIP(hostname: string): boolean {
  // IP 주소 형태인지 확인
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i;
  
  if (ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname)) {
    return BLOCKED_IP_PATTERNS.some(pattern => pattern.test(hostname));
  }
  
  // localhost 등의 호스트명 차단
  const blockedHostnames = ['localhost', '0.0.0.0', 'broadcasthost'];
  if (blockedHostnames.includes(hostname.toLowerCase())) {
    return true;
  }
  
  return false;
}

function validateUrl(urlString: string): { valid: boolean; url?: URL; error?: string } {
  try {
    const url = new URL(urlString);
    
    // HTTP/HTTPS만 허용
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, error: 'HTTP/HTTPS 프로토콜만 허용됩니다' };
    }
    
    // SSRF 방어
    if (isPrivateIP(url.hostname)) {
      return { valid: false, error: '내부 IP 주소는 허용되지 않습니다' };
    }
    
    return { valid: true, url };
  } catch (error) {
    return { valid: false, error: '유효하지 않은 URL입니다' };
  }
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    // 새로운 윈도우 시작
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

async function checkRobotsTxt(url: URL): Promise<boolean> {
  try {
    const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'ChatbotSaaS-Crawler/1.0' },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      // robots.txt가 없으면 허용
      return true;
    }
    
    const robotsTxt = await response.text();
    const lines = robotsTxt.split('\n');
    let isOurAgent = false;
    let disallowed = false;
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.startsWith('user-agent:')) {
        const agent = trimmed.substring(11).trim();
        isOurAgent = agent === '*' || agent.includes('chatbotsaas');
      }
      
      if (isOurAgent && trimmed.startsWith('disallow:')) {
        const path = trimmed.substring(9).trim();
        if (path === '/' || url.pathname.startsWith(path)) {
          disallowed = true;
          break;
        }
      }
    }
    
    return !disallowed;
  } catch (error) {
    // robots.txt 확인 실패시 허용
    return true;
  }
}

async function crawlPage(url: string): Promise<{ url: string; title: string; content: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ChatbotSaaS-Crawler/1.0',
      },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      return null;
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return null;
    }
    
    // 크기 제한 확인
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_HTML_SIZE) {
      return null;
    }
    
    const html = await response.text();
    
    // 실제 크기 확인
    if (html.length > MAX_HTML_SIZE) {
      return null;
    }
    
    // Cheerio로 HTML 파싱
    const $ = cheerio.load(html);
    
    // 불필요한 요소 제거
    $('script, style, noscript, iframe').remove();
    
    // 제목 추출
    const title = $('title').text().trim() || 
                  $('h1').first().text().trim() || 
                  'No Title';
    
    // 본문 텍스트 추출
    const content = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // 최대 10KB
    
    return {
      url,
      title,
      content,
    };
  } catch (error) {
    console.error(`크롤링 실패 (${url}):`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // IP 주소 가져오기
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting 확인
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.',
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }
    
    // 요청 본문 파싱
    const body = await request.json();
    const { chatbotId, url, maxPages = 10 } = body;

    if (!chatbotId) {
      return NextResponse.json(
        { success: false, error: 'chatbotId is required' },
        { status: 400 }
      );
    }

    // 2. Verify chatbot ownership
    const { data: chatbot, error: chatbotError } = await supabase
      .from('chatbots')
      .select('user_id')
      .eq('id', chatbotId)
      .single();

    if (chatbotError || !chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    if (chatbot.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Not your chatbot' },
        { status: 403 }
      );
    }
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // maxPages 범위 제한 (1-50)
    const limitedMaxPages = Math.max(1, Math.min(maxPages, 50));
    
    // URL 검증
    const validation = validateUrl(url);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    // robots.txt 확인
    const robotsAllowed = await checkRobotsTxt(validation.url!);
    if (!robotsAllowed) {
      return NextResponse.json(
        { success: false, error: 'Crawling not allowed by robots.txt' },
        { status: 403 }
      );
    }
    
    // 크롤링 수행
    const pageData = await crawlPage(url);
    
    if (!pageData) {
      return NextResponse.json(
        { success: false, error: 'Failed to crawl URL' },
        { status: 400 }
      );
    }

    // 3. Create embeddings and store in database
    const chunks = pageData.content.match(/.{1,1000}/g) || [pageData.content];
    const documentsCreated = [];

    for (const chunk of chunks) {
      try {
        // Generate embedding
        const embeddingResponse = await openaiClient.embeddings.create({
          model: OPENAI_EMBEDDING_MODEL,
          input: chunk,
        });

        const embedding = embeddingResponse.data[0].embedding;

        // Store document
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .insert([{
            chatbot_id: chatbotId,
            content: chunk,
            url: pageData.url,
            source: 'crawl',
            embedding: embedding,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single();

        if (!docError && doc) {
          documentsCreated.push(doc.id);
        }
      } catch (embError) {
        console.error('Embedding error:', embError);
        // Continue with next chunk
      }
    }
    
    // 응답
    return NextResponse.json(
      {
        success: true,
        url: pageData.url,
        title: pageData.title,
        chunks: chunks.length,
        documents: documentsCreated,
      },
      {
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
    
  } catch (error) {
    console.error('크롤링 API 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
