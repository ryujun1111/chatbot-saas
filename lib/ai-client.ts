import OpenAI from 'openai';

// ============================================
// OpenRouter 클라이언트 (DeepSeek R1)
// ============================================
if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in environment variables');
}

export const deepseekClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Chatbot SaaS',
  },
});

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-chat';

// ============================================
// OpenAI 클라이언트 (임베딩 전용)
// ============================================
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

// ============================================
// 임베딩 함수 (OpenAI)
// ============================================

/**
 * 텍스트를 청크로 분할하는 함수
 * @param text 분할할 텍스트
 * @param chunkSize 청크 크기 (기본값: 500)
 * @returns 분할된 텍스트 청크 배열
 */
export function splitTextIntoChunks(text: string, chunkSize: number = 500): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: string[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    const chunk = text.slice(currentIndex, currentIndex + chunkSize);
    chunks.push(chunk.trim());
    currentIndex += chunkSize;
  }

  return chunks.filter(chunk => chunk.length > 0);
}

/**
 * 텍스트를 임베딩 벡터로 변환 (OpenAI)
 * @param text 임베딩할 텍스트
 * @returns 1536차원 임베딩 벡터
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openaiClient.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw new Error('Failed to create embedding');
  }
}

/**
 * 여러 텍스트를 배치로 임베딩 생성 (OpenAI)
 * @param texts 임베딩할 텍스트 배열
 * @returns 임베딩 벡터 배열
 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openaiClient.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw new Error('Failed to create embeddings');
  }
}

// ============================================
// 채팅 함수 (DeepSeek R1)
// ============================================

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

/**
 * DeepSeek R1으로 채팅 완성 생성
 * @param options 채팅 옵션
 * @returns 생성된 응답 텍스트
 */
export async function createChatCompletion(options: ChatCompletionOptions): Promise<string> {
  try {
    const { messages, temperature = 0.7, maxTokens } = options;

    const response = await deepseekClient.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: messages as any[],
      temperature,
      ...(maxTokens && { max_tokens: maxTokens }),
    });

    return response.choices[0]?.message?.content || '답변을 생성할 수 없습니다.';
  } catch (error) {
    console.error('Error creating chat completion:', error);
    throw new Error('Failed to create chat completion');
  }
}

