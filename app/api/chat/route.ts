import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openaiClient, OPENAI_EMBEDDING_MODEL, createChatCompletion } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chatbotId, message, sessionId } = body

    // Required parameter validation
    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: 'chatbotId and message are required' },
        { status: 400 }
      )
    }

    // Message length validation
    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 1. Get chatbot and owner information
    const { data: chatbot, error: chatbotError } = await supabase
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

    // 2. Get owner's plan and usage (atomic increment)
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select('plan, message_limit, messages_used, subscription_status')
      .eq('id', ownerId)
      .single()

    if (ownerError || !owner) {
      return NextResponse.json(
        { error: 'Owner not found' },
        { status: 404 }
      )
    }

    // Check subscription status
    if (owner.subscription_status === 'canceled' || owner.subscription_status === 'payment_failed') {
      return NextResponse.json(
        { error: 'Subscription inactive. Please renew your plan.' },
        { status: 403 }
      )
    }

    // 3. Check message limit (owner's quota)
    const messagesUsed = owner.messages_used || 0
    const messageLimit = owner.message_limit || 5

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

    // 4. Rate limiting check (session-based)
    if (sessionId) {
      const { data: rateLimitData } = await supabase
        .from('rate_limits')
        .select('count, reset_at')
        .eq('session_id', sessionId)
        .single()

      const now = Date.now()
      if (rateLimitData) {
        if (new Date(rateLimitData.reset_at).getTime() > now) {
          if (rateLimitData.count >= 20) { // 20 messages per minute per session
            return NextResponse.json(
              { error: 'Too many requests. Please try again later.' },
              { status: 429 }
            )
          }
          // Increment count
          await supabase
            .from('rate_limits')
            .update({ count: rateLimitData.count + 1 })
            .eq('session_id', sessionId)
        } else {
          // Reset
          await supabase
            .from('rate_limits')
            .update({ count: 1, reset_at: new Date(now + 60000).toISOString() })
            .eq('session_id', sessionId)
        }
      } else {
        // Create new rate limit entry
        await supabase
          .from('rate_limits')
          .insert({ 
            session_id: sessionId, 
            count: 1, 
            reset_at: new Date(now + 60000).toISOString() 
          })
      }
    }

    // 5. Convert question to embedding
    const embeddingResponse = await openaiClient.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: message,
    })
    const questionEmbedding = embeddingResponse.data[0].embedding

    // 6. Vector search
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

    // 7. Increment usage counter (atomic)
    const { error: incrementError } = await supabase.rpc(
      'increment_messages_used',
      { user_id: ownerId }
    )

    if (incrementError) {
      console.error('Failed to increment usage:', incrementError)
    }

    // No results found
    if (!documents || documents.length === 0) {
      return NextResponse.json({
        answer: "I'm sorry, I couldn't find relevant information to answer your question. Could you try rephrasing it or ask something else?",
        sources: [],
        usage: {
          used: messagesUsed + 1,
          limit: messageLimit
        }
      })
    }

    // 8. Build context
    const context = documents
      .map((doc: any) => doc.content)
      .join('\n\n---\n\n')

    const sources = documents.map((doc: any) => doc.source || doc.url || '')

    // 9. Generate answer
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

    // 10. Return response
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
    
    // Check if it's an AI API error
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
