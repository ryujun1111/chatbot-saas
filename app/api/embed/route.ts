import { NextRequest, NextResponse } from 'next/server';
import { createEmbedding, createEmbeddings, splitTextIntoChunks } from '@/lib/ai-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/embed
 * 텍스트를 임베딩 벡터로 변환하는 API
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { text, chatbotId } = body;

    // 입력 검증
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Text is required and must be a string' 
        },
        { status: 400 }
      );
    }

    if (!chatbotId || typeof chatbotId !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'chatbotId is required and must be a string' 
        },
        { status: 400 }
      );
    }

    // 텍스트를 청크로 분할 (500자 단위)
    const chunks = splitTextIntoChunks(text, 500);

    if (chunks.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Text is empty after processing' 
        },
        { status: 400 }
      );
    }

    // 단일 청크인 경우 개별 임베딩 생성
    let embedding: number[];
    let allEmbeddings: number[][] = [];

    if (chunks.length === 1) {
      embedding = await createEmbedding(chunks[0]);
      allEmbeddings = [embedding];
    } else {
      // 여러 청크인 경우 배치로 임베딩 생성
      allEmbeddings = await createEmbeddings(chunks);
      // 첫 번째 청크의 임베딩을 대표 임베딩으로 사용
      embedding = allEmbeddings[0];
    }

    // 임베딩 차원 검증 (text-embedding-3-small은 1536차원)
    if (embedding.length !== 1536) {
      console.error(`Unexpected embedding dimension: ${embedding.length}`);
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid embedding dimension: ${embedding.length}` 
        },
        { status: 500 }
      );
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      embedding: embedding,
      chunks: chunks,
      metadata: {
        chatbotId,
        dimension: embedding.length,
        chunkCount: chunks.length,
        totalChunks: allEmbeddings.length,
        model: 'text-embedding-3-small',
      }
    });

  } catch (error) {
    console.error('Error in /api/embed:', error);
    
    // 에러 응답
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/embed
 * API 정보 반환
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'OpenAI Embedding API',
    usage: {
      method: 'POST',
      endpoint: '/api/embed',
      body: {
        text: 'string (required)',
        chatbotId: 'string (required)',
      },
      response: {
        success: 'boolean',
        embedding: 'number[] (1536 dimensions)',
        chunks: 'string[]',
        metadata: {
          chatbotId: 'string',
          dimension: 'number',
          chunkCount: 'number',
          totalChunks: 'number',
          model: 'string',
        }
      }
    },
    model: 'text-embedding-3-small',
    dimensions: 1536,
    chunkSize: 500,
  });
}
