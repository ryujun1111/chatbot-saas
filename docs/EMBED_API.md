# OpenAI 임베딩 API 가이드

## 개요

이 API는 텍스트를 OpenAI의 임베딩 모델을 사용하여 1536차원 벡터로 변환합니다. 챗봇의 의미론적 검색 기능을 구현하기 위해 사용됩니다.

## 파일 구조

```
chatbot-saas/
├── lib/
│   └── openai.ts              # OpenAI 클라이언트 및 유틸리티 함수
└── app/
    └── api/
        └── embed/
            └── route.ts       # 임베딩 API 엔드포인트
```

## 환경 설정

### 1. OpenAI API 키 설정

`.env.local` 파일에 다음을 추가하세요:

```env
OPENAI_API_KEY=sk-proj-...your-actual-key...
```

### 2. 패키지 설치 확인

```bash
npm install openai
```

## API 사용법

### 엔드포인트

```
POST /api/embed
```

### 요청 형식

```typescript
{
  text: string;        // 임베딩할 텍스트 (필수)
  chatbotId: string;   // 챗봇 ID (필수)
}
```

### 응답 형식

```typescript
{
  success: boolean;
  embedding: number[];  // 1536차원 벡터
  chunks: string[];     // 분할된 텍스트 청크
  metadata: {
    chatbotId: string;
    dimension: number;      // 1536
    chunkCount: number;     // 생성된 청크 개수
    totalChunks: number;    // 전체 임베딩 개수
    model: string;          // "text-embedding-3-small"
  }
}
```

### cURL 예제

```bash
curl -X POST http://localhost:3000/api/embed \
  -H "Content-Type: application/json" \
  -d '{
    "text": "안녕하세요. 임베딩 테스트입니다.",
    "chatbotId": "chatbot-123"
  }'
```

### JavaScript/TypeScript 예제

```typescript
const response = await fetch('/api/embed', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: '여기에 임베딩할 텍스트를 입력하세요.',
    chatbotId: 'chatbot-123',
  }),
});

const data = await response.json();

if (data.success) {
  console.log('임베딩 차원:', data.embedding.length);  // 1536
  console.log('청크 개수:', data.chunks.length);
  console.log('임베딩 벡터:', data.embedding);
}
```

## 주요 기능

### 1. 텍스트 청크 분할

긴 텍스트는 자동으로 500자 단위로 분할됩니다:

```typescript
// lib/openai.ts
export function splitTextIntoChunks(text: string, chunkSize: number = 500): string[]
```

### 2. 단일 임베딩 생성

```typescript
// lib/openai.ts
export async function createEmbedding(text: string): Promise<number[]>
```

### 3. 배치 임베딩 생성

여러 텍스트를 한 번에 임베딩으로 변환:

```typescript
// lib/openai.ts
export async function createEmbeddings(texts: string[]): Promise<number[][]>
```

## 테스트

### 개발 서버 실행

```bash
npm run dev
```

### 테스트 스크립트 실행

```bash
node test-embed.mjs
```

테스트 스크립트는 다음을 검증합니다:
- ✅ API 정보 조회 (GET)
- ✅ 임베딩 생성 (POST)
- ✅ 임베딩 차원 1536 확인
- ✅ 청크 분할 기능
- ✅ 긴 텍스트 처리

## Supabase 저장 예제

임베딩 벡터를 Supabase에 저장하는 예제:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function saveEmbedding(chatbotId: string, text: string, embedding: number[]) {
  const { data, error } = await supabase
    .from('embeddings')
    .insert({
      chatbot_id: chatbotId,
      content: text,
      embedding: embedding,
      created_at: new Date().toISOString(),
    });

  if (error) throw error;
  return data;
}
```

### Supabase 테이블 생성

```sql
-- 임베딩 테이블 생성
create table embeddings (
  id uuid default uuid_generate_v4() primary key,
  chatbot_id text not null,
  content text not null,
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 벡터 유사도 검색을 위한 인덱스
create index on embeddings using ivfflat (embedding vector_cosine_ops);
```

## 에러 처리

API는 다음과 같은 에러 응답을 반환할 수 있습니다:

### 400 Bad Request

```json
{
  "success": false,
  "error": "Text is required and must be a string"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to create embedding"
}
```

## 비용 최적화 팁

1. **청크 크기 조정**: 필요에 따라 청크 크기를 조정하여 API 호출 수를 최적화
2. **배치 처리**: 여러 텍스트를 한 번에 처리하여 비용 절감
3. **캐싱**: 동일한 텍스트에 대한 임베딩을 캐싱하여 중복 호출 방지

## 참고 자료

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [text-embedding-3-small 모델 문서](https://platform.openai.com/docs/models/embeddings)
- [Supabase Vector 확장](https://supabase.com/docs/guides/ai/vector-columns)

## 버전

- **OpenAI 모델**: text-embedding-3-small
- **임베딩 차원**: 1536
- **청크 크기**: 500자 (조정 가능)
