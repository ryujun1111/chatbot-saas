import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseFile, validateFileSize, validateFileType } from '@/lib/file-parser';
import { splitTextIntoChunks, createEmbeddings } from '@/lib/ai-client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/documents
 * 문서 추가 (파일 업로드, URL 크롤링, 텍스트 직접 입력)
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let chatbotId: string;
    let title: string;
    let content: string;
    let source: 'file' | 'url' | 'text';
    let fileType: string | undefined;
    let url: string | undefined;

    // FormData 처리 (파일 업로드)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      chatbotId = formData.get('chatbot_id') as string;
      title = formData.get('title') as string;
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json(
          { success: false, error: '파일이 필요합니다' },
          { status: 400 }
        );
      }

      // 파일 크기 검증 (10MB)
      if (!validateFileSize(file.size)) {
        return NextResponse.json(
          { success: false, error: '파일 크기는 10MB 이하여야 합니다' },
          { status: 400 }
        );
      }

      // 파일 타입 검증
      if (!validateFileType(file.type)) {
        return NextResponse.json(
          { success: false, error: '지원하지 않는 파일 형식입니다. PDF, DOCX, TXT 파일만 지원합니다' },
          { status: 400 }
        );
      }

      // 파일에서 텍스트 추출
      const buffer = Buffer.from(await file.arrayBuffer());
      content = await parseFile(buffer, file.type);
      source = 'file';
      fileType = file.type;

      if (!title) {
        title = file.name;
      }
    } 
    // JSON 처리 (URL 또는 텍스트)
    else {
      const body = await request.json();
      chatbotId = body.chatbot_id;
      title = body.title;
      source = body.source;
      url = body.url;

      if (source === 'url') {
        // URL 크롤링
        const crawlResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/crawl`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (!crawlResponse.ok) {
          return NextResponse.json(
            { success: false, error: 'URL 크롤링에 실패했습니다' },
            { status: 400 }
          );
        }

        const crawlData = await crawlResponse.json();
        if (!crawlData.success || !crawlData.pages || crawlData.pages.length === 0) {
          return NextResponse.json(
            { success: false, error: 'URL에서 콘텐츠를 가져올 수 없습니다' },
            { status: 400 }
          );
        }

        content = crawlData.pages[0].content;
        if (!title) {
          title = crawlData.pages[0].title;
        }
      } else if (source === 'text') {
        content = body.content;
      } else {
        return NextResponse.json(
          { success: false, error: '잘못된 source 타입입니다' },
          { status: 400 }
        );
      }
    }

    // 입력 검증
    if (!chatbotId || !title || !content) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다' },
        { status: 400 }
      );
    }

    // 문서 저장 (processing 상태)
    const { data: document, error: insertError } = await supabase
      .from('documents')
      .insert({
        chatbot_id: chatbotId,
        title,
        content,
        source,
        file_type: fileType,
        url,
        status: 'processing',
      })
      .select()
      .single();

    if (insertError) {
      console.error('문서 저장 에러:', insertError);
      return NextResponse.json(
        { success: false, error: '문서 저장에 실패했습니다' },
        { status: 500 }
      );
    }

    // 비동기로 임베딩 생성 (백그라운드)
    processDocumentEmbedding(document.id, chatbotId, content).catch(err => {
      console.error('임베딩 처리 에러:', err);
    });

    return NextResponse.json({
      success: true,
      document,
    });

  } catch (error) {
    console.error('문서 업로드 에러:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '문서 업로드에 실패했습니다' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents?chatbot_id=xxx
 * 문서 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatbotId = searchParams.get('chatbot_id');

    if (!chatbotId) {
      return NextResponse.json(
        { success: false, error: 'chatbot_id가 필요합니다' },
        { status: 400 }
      );
    }

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('chatbot_id', chatbotId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('문서 조회 에러:', error);
      return NextResponse.json(
        { success: false, error: '문서 조회에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents,
    });

  } catch (error) {
    console.error('문서 조회 에러:', error);
    return NextResponse.json(
      { success: false, error: '문서 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents?id=xxx
 * 문서 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: 'document id가 필요합니다' },
        { status: 400 }
      );
    }

    // 문서 청크 삭제
    await supabase
      .from('document_chunks')
      .delete()
      .eq('document_id', documentId);

    // 문서 삭제
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('문서 삭제 에러:', error);
      return NextResponse.json(
        { success: false, error: '문서 삭제에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('문서 삭제 에러:', error);
    return NextResponse.json(
      { success: false, error: '문서 삭제에 실패했습니다' },
      { status: 500 }
    );
  }
}

/**
 * 문서 임베딩 처리 (비동기)
 */
async function processDocumentEmbedding(
  documentId: string,
  chatbotId: string,
  content: string
): Promise<void> {
  try {
    // 텍스트를 청크로 분할 (500자)
    const chunks = splitTextIntoChunks(content, 500);

    // 임베딩 생성
    const embeddings = await createEmbeddings(chunks);

    // 청크와 임베딩을 document_chunks 테이블에 저장
    const chunkRecords = chunks.map((chunk, index) => ({
      document_id: documentId,
      chatbot_id: chatbotId,
      content: chunk,
      embedding: embeddings[index],
      chunk_index: index,
    }));

    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert(chunkRecords);

    if (chunkError) {
      throw chunkError;
    }

    // 문서 상태를 'completed'로 업데이트
    await supabase
      .from('documents')
      .update({ 
        status: 'completed',
        chunk_count: chunks.length,
      })
      .eq('id', documentId);

  } catch (error) {
    console.error('임베딩 처리 에러:', error);
    
    // 문서 상태를 'failed'로 업데이트
    await supabase
      .from('documents')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : '임베딩 생성 실패',
      })
      .eq('id', documentId);
  }
}
