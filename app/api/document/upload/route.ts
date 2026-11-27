import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { openaiClient, OPENAI_EMBEDDING_MODEL } from '@/lib/ai-client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // 1. Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // 2. Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { chatbotId, content, url, source } = await request.json();

    if (!chatbotId || !content) {
      return NextResponse.json(
        { error: 'chatbotId and content are required' },
        { status: 400 }
      );
    }

    // 3. Verify chatbot ownership
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

    // 4. Check content size (max 10KB per document)
    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Content too large (max 10KB)' },
        { status: 400 }
      );
    }

    // 5. Check document count limit (max 100 documents per chatbot)
    const { count } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true })
      .eq('chatbot_id', chatbotId);

    if (count && count >= 100) {
      return NextResponse.json(
        { error: 'Document limit reached (max 100 per chatbot)' },
        { status: 400 }
      );
    }

    // Generate embedding for the content
    const embeddingResponse = await openaiClient.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: content,
    });
    
    const embedding = embeddingResponse.data[0].embedding;

    // Store document with embedding
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          chatbot_id: chatbotId,
          content: content,
          url: url || null,
          source: source || 'manual',
          embedding: embedding,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Document upload error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      document: data
    });

  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
