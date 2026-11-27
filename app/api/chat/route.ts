import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openaiClient, OPENAI_EMBEDDING_MODEL, createChatCompletion } from '@/lib/ai-client'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string, maxRequests: number = 60): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || userLimit.resetAt < now) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + 60000 }); // 1 minute
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatbotId, message, userId } = body

    // Required parameter validation
    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: 'chatbotId and message are required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      )
    }

    // Message length validation (max 2000 characters)
    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user plan and usage
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('plan, message_limit, messages_used')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check message limit
    const messagesUsed = user.messages_used || 0;
    const messageLimit = user.message_limit || 5;

    if (messagesUsed >= messageLimit) {
      return NextResponse.json(
        { 
          error: 'Monthly message limit reached',
          limit: messageLimit,
          used: messagesUsed
        },
        { status: 429 }
      )
    }

    // Rate limiting (60 requests per minute)
    if (!checkRateLimit(userId, 60)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // 1. Convert question to embedding (OpenAI)
    const embeddingResponse = await openaiClient.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: message,
    })
    const questionEmbedding = embeddingResponse.data[0].embedding

    // 2. Vector search in Supabase (top 3)
    const { data: documents, error: searchError } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.5,
        match_count: 3,
        p_chatbot_id: chatbotId,
      }
    )

    if (searchError) {
      console.error('Vector search error:', searchError)
      return NextResponse.json(
        { error: 'Failed to search documents' },
        { status: 500 }
      )
    }

    // No results found
    if (!documents || documents.length === 0) {
      // Increment usage even for no-match responses
      await supabase
        .from('users')
        .update({ messages_used: messagesUsed + 1 })
        .eq('id', userId)

      return NextResponse.json({
        answer: "I'm sorry, I couldn't find relevant information to answer your question. Could you try rephrasing it or ask something else?",
        sources: [],
      })
    }

    // 3. Build context from search results
    const context = documents
      .map((doc: any) => doc.content)
      .join('\n\n---\n\n')

    const sources = documents.map((doc: any) => doc.source || doc.url || '')

    // 4. Generate answer with DeepSeek R1
    const answer = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant.
Answer the user's question accurately and kindly based on the given context.
Do not make up information that is not in the context. If you don't know, say so.
Answer in the same language as the user's question.
Be specific and clear in your responses.

Context:
${context}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500, // Limit response length
    })

    // 5. Increment usage counter
    const { error: updateError } = await supabase
      .from('users')
      .update({ messages_used: messagesUsed + 1 })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update usage:', updateError)
    }

    // 6. Return response
    return NextResponse.json({
      answer,
      sources: sources.filter((s: string) => s),
      usage: {
        used: messagesUsed + 1,
        limit: messageLimit
      }
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
