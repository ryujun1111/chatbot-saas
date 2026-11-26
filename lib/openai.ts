import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
 * 텍스트를 임베딩 벡터로 변환
 * @param text 임베딩할 텍스트
 * @returns 1536차원 임베딩 벡터
 */
export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
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
 * 여러 텍스트를 배치로 임베딩 생성
 * @param texts 임베딩할 텍스트 배열
 * @returns 임베딩 벡터 배열
 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw new Error('Failed to create embeddings');
  }
}
