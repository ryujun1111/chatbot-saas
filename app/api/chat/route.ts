import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { openaiClient, OPENAI_EMBEDDING_MODEL, createChatCompletion } from '@/lib/ai-client'
import { checkSessionRateLimit, checkIPRateLimit, recordMessage, getClientIP } from '@/lib/rate-limit'

// Service Role client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatbotId, message, sessionId } = body

    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: 'chatbotId and message are required' },
        { status: 400 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    // 1. Rate limiting FIRST (session and IP-based)
    const clientIP = getClientIP(request);
    
    // Check session-based rate limit (50 messages per 24 hours)
    const sessionLimit = await checkSessionRateLimit(sessionId, 50);
    if (!sessionLimit.allowed) {
      return NextResponse.json(
        { 
          error: sessionLimit.reason || 'Session message limit exceeded',
          remaining: sessionLimit.remaining,
          resetAt: sessionLimit.resetAt
        },
        { status: 429 }
      );
    }
    
    // Check IP-based rate limit (100 messages per hour)
    const ipLimit = await checkIPRateLimit(clientIP, 100);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { 
          error: ipLimit.reason || 'Too many requests from this IP',
          remaining: ipLimit.remaining,
          resetAt: ipLimit.resetAt
        },
        { status: 429 }
      );
    }

    // 2. Get chatbot and owner (Service Role bypasses RLS)
    const { data: chatbot, error: chatbotError } = await supabaseAdmin
      .from('chatbots')
      .select('user_id, name')
      .eq('id', chatbotId)
      .single()

    if (chatbotError || !chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      )
    }

    const ownerId = chatbot.user_id

    // 3. Atomic quota check and usage increment
    const { data: usageResult, error: usageError } = await supabaseAdmin.rpc(
      'check_and_increment_usage',
      { p_user_id: ownerId }
    )

    if (usageError) {
      console.error('Usage check failed:', usageError)
      return NextResponse.json(
        { error: 'Failed to check usage quota' },
        { status: 500 }
      )
    }

    if (!usageResult || !usageResult.can_use) {
      return NextResponse.json(
        { 
          error: 'Monthly message limit reached',
          limit: usageResult?.current_limit || 0,
          used: usageResult?.current_used || 0
        },
        { status: 429 }
      )
    }

    // 4. Convert question to embedding
    const embeddingResponse = await openaiClient.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: message,
    })
    const questionEmbedding = embeddingResponse.data[0].embedding

    // 5. Vector search
    const { data: documents, error: searchError } = await supabaseAdmin.rpc(
      'match_documents',
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.3,
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
      return NextResponse.json({
        answer: "I'm sorry, I couldn't find relevant information to answer your question. Could you try rephrasing it or ask something else?",
        sources: [],
        usage: {
          used: usageResult.current_used,
          limit: usageResult.current_limit
        }
      })
    }

    // 6. Build context
    const context = documents
      .map((doc: any) => doc.content)
      .join('\n\n---\n\n')

    const sources = documents.map((doc: any) => doc.source || doc.url || '')

    // 7. Generate answer
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
      maxTokens: 500,
    })

    // 8. Record message for rate limiting (required)
    await recordMessage(sessionId, chatbotId, clientIP);

    // 9. Return response
    return NextResponse.json({
      answer,
      sources: sources.filter((s: string) => s),
      usage: {
        used: usageResult.current_used,
        limit: usageResult.current_limit
      }
    })
  } catch (error) {
    console.error('API error:', error)
    
    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

