# DeepSeek R1 적용 가이드

이 문서는 Chatbot SaaS 프로젝트에 DeepSeek R1 모델을 적용하는 방법을 설명합니다.

## 개요

- **답변 생성**: DeepSeek R1 (via OpenRouter)
- **임베딩**: OpenAI text-embedding-3-small
- **이유**: DeepSeek은 현재 임베딩 모델을 제공하지 않으므로, 임베딩은 여전히 OpenAI를 사용합니다.

## 1. API 키 발급

### OpenRouter API 키 (DeepSeek R1용)

1. [OpenRouter](https://openrouter.ai/) 접속
2. 계정 생성 또는 로그인
3. [API Keys](https://openrouter.ai/keys) 페이지로 이동
4. "Create Key" 클릭하여 새 API 키 생성
5. 생성된 키 복사 (형식: `sk-or-v1-...`)

### OpenAI API 키 (임베딩용)

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. 계정 생성 또는 로그인
3. [API Keys](https://platform.openai.com/api-keys) 페이지로 이동
4. "Create new secret key" 클릭
5. 생성된 키 복사 (형식: `sk-...`)

## 2. 환경 변수 설정

### `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```bash
# OpenRouter Configuration (DeepSeek R1)
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here

# OpenAI Configuration (Embedding Only)
OPENAI_API_KEY=sk-your-actual-key-here

# Optional: 임베딩 모델 커스터마이징 (기본값: text-embedding-3-small)
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Application URL (OpenRouter HTTP-Referer용)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 환경 변수 설명

| 변수 | 필수 | 설명 |
|------|------|------|
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API 키 (DeepSeek R1 사용) |
| `OPENAI_API_KEY` | ✅ | OpenAI API 키 (임베딩 전용) |
| `OPENAI_EMBEDDING_MODEL` | ❌ | 임베딩 모델 (기본: text-embedding-3-small) |
| `NEXT_PUBLIC_APP_URL` | ❌ | 앱 URL (OpenRouter HTTP-Referer 헤더용) |

## 3. 의존성 설치

프로젝트에 필요한 패키지가 이미 설치되어 있어야 합니다:

```bash
npm install
```

## 4. 주요 변경 사항

### 파일 구조

```
chatbot-saas/
├── lib/
│   ├── ai-client.ts          # 새로 생성 (DeepSeek + OpenAI 클라이언트)
│   └── openai.ts              # 기존 파일 (더 이상 사용하지 않음)
├── app/
│   └── api/
│       ├── chat/
│       │   └── route.ts       # 수정됨 (DeepSeek R1 사용)
│       └── embed/
│           └── route.ts       # 수정됨 (import 경로 변경)
└── docs/
    └── deepseek-setup.md      # 이 문서
```

### `/lib/ai-client.ts` (새 파일)

```typescript
// DeepSeek R1 클라이언트 (OpenRouter)
export const deepseekClient = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export const DEEPSEEK_MODEL = 'deepseek/deepseek-r1';

// OpenAI 클라이언트 (임베딩 전용)
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

### `/app/api/chat/route.ts` (수정됨)

**변경 전:**
```typescript
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const chatCompletion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  // ...
});
```

**변경 후:**
```typescript
import { createChatCompletion, openaiClient } from '@/lib/ai-client';

// 임베딩은 OpenAI
const embeddingResponse = await openaiClient.embeddings.create({
  model: OPENAI_EMBEDDING_MODEL,
  // ...
});

// 답변 생성은 DeepSeek R1
const answer = await createChatCompletion({
  messages: [...],
  temperature: 0.7,
});
```

### `/app/api/embed/route.ts` (수정됨)

**변경 전:**
```typescript
import { createEmbedding, createEmbeddings, splitTextIntoChunks } from '@/lib/openai';
```

**변경 후:**
```typescript
import { createEmbedding, createEmbeddings, splitTextIntoChunks } from '@/lib/ai-client';
```

## 5. 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 6. 테스트

### API 테스트

1. **임베딩 테스트** (`/api/embed`)
   ```bash
   curl -X POST http://localhost:3000/api/embed \
     -H "Content-Type: application/json" \
     -d '{
       "text": "안녕하세요, 테스트입니다.",
       "chatbotId": "test-chatbot-id"
     }'
   ```

2. **채팅 테스트** (`/api/chat`)
   ```bash
   curl -X POST http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{
       "chatbotId": "test-chatbot-id",
       "message": "안녕하세요?"
     }'
   ```

### 브라우저 테스트

1. `http://localhost:3000/test-chat` 접속
2. 챗봇 ID 입력
3. 메시지 입력 후 전송
4. DeepSeek R1의 응답 확인

## 7. 비용 비교

| 항목 | OpenAI (GPT-4o-mini) | DeepSeek R1 (via OpenRouter) |
|------|----------------------|------------------------------|
| 입력 (1M 토큰) | $0.150 | ~$0.55 |
| 출력 (1M 토큰) | $0.600 | ~$2.19 |
| 성능 | 중간 | 고성능 (추론 능력 우수) |
| 추론 시간 | 빠름 | 중간 (CoT 사고 과정 포함) |

> **참고**: DeepSeek R1은 복잡한 추론이 필요한 경우에 더 나은 성능을 보입니다.

## 8. 모니터링

### OpenRouter 사용량 확인

1. [OpenRouter Dashboard](https://openrouter.ai/activity) 접속
2. API 사용량 및 비용 확인

### OpenAI 사용량 확인

1. [OpenAI Usage](https://platform.openai.com/usage) 접속
2. 임베딩 API 사용량 확인

## 9. 문제 해결

### Error: OPENROUTER_API_KEY is not set

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. `OPENROUTER_API_KEY` 값이 올바른지 확인
3. 개발 서버 재시작: `npm run dev`

### Error: OPENAI_API_KEY is not set

**원인**: OpenAI API 키 누락

**해결**:
1. `.env.local`에 `OPENAI_API_KEY` 추가
2. 임베딩 기능은 여전히 OpenAI를 사용하므로 필수입니다.

### 429 Too Many Requests (OpenRouter)

**원인**: API 요청 한도 초과

**해결**:
1. [OpenRouter Credits](https://openrouter.ai/credits) 에서 크레딧 충전
2. Rate limiting 확인

### DeepSeek 응답이 너무 길거나 불필요한 추론 과정 포함

**원인**: DeepSeek R1은 Chain-of-Thought (CoT) 사고 과정을 포함할 수 있음

**해결**:
1. `/lib/ai-client.ts`의 `createChatCompletion` 함수에서 `maxTokens` 옵션 조정:
   ```typescript
   const response = await deepseekClient.chat.completions.create({
     model: DEEPSEEK_MODEL,
     messages: messages as any[],
     temperature,
     max_tokens: 1000, // 최대 토큰 제한
   });
   ```

2. 시스템 프롬프트 수정으로 간결한 답변 유도:
   ```typescript
   {
     role: 'system',
     content: `...
   답변은 간결하고 핵심만 전달하세요. 추론 과정은 생략하고 최종 답변만 제공하세요.
   ...`
   }
   ```

## 10. 다시 OpenAI로 되돌리기

DeepSeek R1 대신 다시 OpenAI를 사용하려면:

1. `/app/api/chat/route.ts` 수정:
   ```typescript
   // Before
   import { createChatCompletion } from '@/lib/ai-client';
   const answer = await createChatCompletion({ ... });

   // After
   import { openaiClient } from '@/lib/ai-client';
   const chatCompletion = await openaiClient.chat.completions.create({
     model: 'gpt-4o-mini',
     messages: [...],
     temperature: 0.7,
   });
   const answer = chatCompletion.choices[0]?.message?.content || '...';
   ```

2. 또는 `/lib/ai-client.ts`에서 `createChatCompletion` 함수를 OpenAI 클라이언트를 사용하도록 수정

## 11. 추가 리소스

- [DeepSeek 공식 문서](https://www.deepseek.com/)
- [OpenRouter 문서](https://openrouter.ai/docs)
- [OpenAI Embeddings 가이드](https://platform.openai.com/docs/guides/embeddings)

## 12. 라이선스 & 주의사항

- DeepSeek R1은 오픈소스 모델이지만, OpenRouter를 통해 사용 시 비용이 발생합니다.
- 프로덕션 환경에서는 rate limiting 및 에러 핸들링을 강화하는 것을 권장합니다.
- 민감한 정보는 절대 API 요청에 포함하지 마세요.

---

**작성일**: 2024-11-26  
**작성자**: AI Assistant  
**버전**: 1.0
