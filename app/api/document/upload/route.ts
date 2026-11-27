import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { openaiClient, OPENAI_EMBEDDING_MODEL } from '@/lib/ai-client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { chatbotId, content, url, source } = await request.json();

    if (!chatbotId || !content) {
      return NextResponse.json(
        { error: 'chatbotId and content are required' },
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
