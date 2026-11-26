import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openaiClient, OPENAI_EMBEDDING_MODEL, createChatCompletion } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    // 요청 body 파싱
    const body = await request.json()
    const { chatbotId, message } = body

    // 필수 파라미터 검증
    if (!chatbotId || !message) {
      return NextResponse.json(
        { error: 'chatbotId와 message는 필수입니다' },
        { status: 400 }
      )
    }

    // 1. 질문을 임베딩으로 변환 (OpenAI 사용)
    const embeddingResponse = await openaiClient.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: message,
    })
    const questionEmbedding = embeddingResponse.data[0].embedding

    // 2. Supabase 벡터 검색 (상위 3개)
    const supabase = await createClient()
    
    const { data: documents, error: searchError } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.5, // 유사도 임계값
        match_count: 3, // 상위 3개
        p_chatbot_id: chatbotId, // chatbot_id 필터
      }
    )

    if (searchError) {
      console.error('벡터 검색 오류:', searchError)
      return NextResponse.json(
        { error: '문서 검색 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    // 검색 결과가 없는 경우
    if (!documents || documents.length === 0) {
      return NextResponse.json({
        answer: '죄송합니다. 관련된 정보를 찾을 수 없습니다. 다른 질문을 해주시겠어요?',
        sources: [],
      })
    }

    // 3. 검색된 문서들을 컨텍스트로 구성
    const context = documents
      .map((doc: any) => doc.content)
      .join('\n\n---\n\n')

    const sources = documents.map((doc: any) => doc.source || doc.url || '')

    // 4. DeepSeek R1으로 답변 생성
    const answer = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content: `당신은 도움이 되는 AI 어시스턴트입니다. 
주어진 컨텍스트를 바탕으로 사용자의 질문에 정확하고 친절하게 답변해주세요.
컨텍스트에 없는 정보는 추측하지 말고, 모르면 모른다고 답변하세요.
답변은 한국어로 작성하고, 가능한 구체적이고 명확하게 작성하세요.

컨텍스트:
${context}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
    })

    // 5. 응답 반환
    return NextResponse.json({
      answer,
      sources: sources.filter((s: string) => s), // 빈 소스 제거
    })
  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json(
      { 
        error: '답변 생성 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}
