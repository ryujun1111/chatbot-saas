# DeepSeek R1 마이그레이션 완료 보고서

## 📋 작업 요약

**작업 일시**: 2024-11-26  
**작업 대상**: Chatbot SaaS 프로젝트  
**목표**: OpenAI GPT-4o-mini → DeepSeek R1 (via OpenRouter) 마이그레이션

---

## ✅ 완료된 작업

### 1. 새로 생성된 파일 (2개)

#### `/lib/ai-client.ts` (4,006 bytes)
- **역할**: AI 클라이언트 통합 관리
- **내용**:
  - DeepSeek R1 클라이언트 (OpenRouter)
  - OpenAI 임베딩 클라이언트
  - 헬퍼 함수들 (splitTextIntoChunks, createEmbedding, createChatCompletion 등)
- **주요 상수**:
  - `DEEPSEEK_MODEL = 'deepseek/deepseek-r1'`
  - `OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'`

#### `/docs/deepseek-setup.md` (8,181 bytes)
- **역할**: 상세 설정 가이드
- **내용**:
  - API 키 발급 방법
  - 환경 변수 설정
  - 주요 변경 사항 설명
  - 문제 해결 가이드
  - 비용 비교표
  - OpenAI로 되돌리는 방법

### 2. 수정된 파일 (3개)

#### `/app/api/chat/route.ts` (3,062 bytes)
- **변경 사항**:
  - ❌ 제거: `import OpenAI from 'openai'`
  - ❌ 제거: `const openai = new OpenAI({ ... })`
  - ✅ 추가: `import { openaiClient, createChatCompletion } from '@/lib/ai-client'`
  - ✅ 변경: 임베딩은 `openaiClient` 사용 (OpenAI)
  - ✅ 변경: 답변 생성은 `createChatCompletion` 사용 (DeepSeek R1)

#### `/app/api/embed/route.ts` (3,472 bytes)
- **변경 사항**:
  - ✅ 변경: `import { ... } from '@/lib/openai'` → `'@/lib/ai-client'`
  - ℹ️ 임베딩 로직은 그대로 유지 (OpenAI 계속 사용)

#### `.env.example` (3,024 bytes)
- **변경 사항**:
  - ✅ 추가: `OPENROUTER_API_KEY` 섹션
  - ✅ 변경: OpenAI 섹션 설명 "(Embedding Only)"로 명확화
  - ✅ 제거: `OPENAI_MODEL` (더 이상 사용하지 않음)

### 3. 추가 산출물 (1개)

#### `TEST-DEEPSEEK.md`
- **역할**: 빠른 테스트 가이드
- **내용**:
  - 환경 변수 설정 예시
  - API 테스트 명령어
  - 주요 변경 사항 확인 방법
  - 문제 해결 가이드
  - 성능 비교표

---

## 🔧 기술적 변경 사항

### Before (OpenAI GPT-4o-mini)
```typescript
// 단일 OpenAI 클라이언트
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 임베딩
const embedding = await openai.embeddings.create({ ... });

// 채팅
const chatCompletion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  ...
});
```

### After (DeepSeek R1 + OpenAI Embeddings)
```typescript
// 두 개의 클라이언트
import { deepseekClient, openaiClient, createChatCompletion } from '@/lib/ai-client';

// 임베딩 (OpenAI 계속 사용)
const embedding = await openaiClient.embeddings.create({ ... });

// 채팅 (DeepSeek R1)
const answer = await createChatCompletion({
  messages: [...],
  temperature: 0.7,
});
```

---

## 🌐 API 엔드포인트

| API | 모델 | 용도 | 비용 |
|-----|------|------|------|
| `/api/embed` | OpenAI text-embedding-3-small | 텍스트 → 벡터 | $0.020/1M tokens |
| `/api/chat` | DeepSeek R1 (via OpenRouter) | 질문 → 답변 | ~$0.55/1M input, ~$2.19/1M output |

---

## 🔐 필수 환경 변수

```bash
# .env.local
OPENROUTER_API_KEY=sk-or-v1-...  # DeepSeek R1용 (필수)
OPENAI_API_KEY=sk-...            # 임베딩용 (필수)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # OpenRouter HTTP-Referer용 (선택)
```

---

## 🧪 테스트 방법

### 1. 환경 변수 설정
```bash
# .env.local 파일 생성
cp .env.example .env.local

# API 키 입력
# OPENROUTER_API_KEY=sk-or-v1-...
# OPENAI_API_KEY=sk-...
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. API 테스트
```bash
# 임베딩 테스트
curl -X POST http://localhost:3000/api/embed \
  -H "Content-Type: application/json" \
  -d '{"text":"테스트","chatbotId":"test-id"}'

# 채팅 테스트 (Supabase 설정 필요)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"chatbotId":"test-id","message":"안녕하세요?"}'
```

### 4. 브라우저 테스트
- `http://localhost:3000/test-chat` 접속
- 챗봇 ID 입력
- 메시지 전송
- DeepSeek R1 응답 확인

---

## 📊 성능 & 비용 비교

| 항목 | OpenAI GPT-4o-mini | DeepSeek R1 |
|------|-------------------|-------------|
| **입력 비용** | $0.150/1M tokens | ~$0.55/1M tokens |
| **출력 비용** | $0.600/1M tokens | ~$2.19/1M tokens |
| **응답 시간** | 1-2초 | 2-5초 (CoT 포함) |
| **추론 능력** | 중간 | 고급 |
| **한국어 지원** | 우수 | 우수 |
| **최대 토큰** | 16,385 | 32,768 |

### 비용 예시 (1,000회 요청 기준)

**가정**: 평균 입력 500 tokens, 평균 출력 200 tokens

- **GPT-4o-mini**: (500 × 1000 / 1,000,000 × $0.150) + (200 × 1000 / 1,000,000 × $0.600) = **$0.195**
- **DeepSeek R1**: (500 × 1000 / 1,000,000 × $0.55) + (200 × 1000 / 1,000,000 × $2.19) = **$0.713**

> **결론**: DeepSeek R1이 약 3.6배 더 비싸지만, 복잡한 추론이 필요한 경우 더 나은 품질을 제공합니다.

---

## ⚠️ 주의사항

1. **임베딩은 여전히 OpenAI 사용**
   - DeepSeek은 현재 임베딩 모델을 제공하지 않습니다.
   - 벡터 DB의 기존 임베딩과 호환성을 유지합니다.

2. **OpenRouter 크레딧 필요**
   - [OpenRouter Credits](https://openrouter.ai/credits)에서 충전

3. **HTTP-Referer 헤더**
   - OpenRouter는 `HTTP-Referer` 헤더를 요구합니다.
   - `NEXT_PUBLIC_APP_URL` 환경 변수 설정 필요

4. **응답 시간 증가**
   - DeepSeek R1은 사고 과정(Chain-of-Thought)을 포함하므로 응답 시간이 더 길 수 있습니다.
   - 필요 시 `maxTokens` 옵션으로 제한 가능

5. **Rate Limiting**
   - OpenRouter의 rate limit을 확인하세요.
   - 프로덕션 환경에서는 에러 핸들링 강화 필요

---

## 🔄 롤백 방법

DeepSeek R1에서 다시 OpenAI로 되돌리려면:

### Option 1: 간단한 방법
`/app/api/chat/route.ts` 수정:
```typescript
// Before (DeepSeek)
const answer = await createChatCompletion({ ... });

// After (OpenAI)
const chatCompletion = await openaiClient.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  temperature: 0.7,
});
const answer = chatCompletion.choices[0]?.message?.content || '...';
```

### Option 2: ai-client.ts 수정
`/lib/ai-client.ts`의 `createChatCompletion` 함수를 OpenAI 클라이언트를 사용하도록 변경

---

## 📝 다음 단계

- [ ] 프로덕션 환경 배포
- [ ] 모니터링 설정 (OpenRouter + OpenAI 사용량)
- [ ] 에러 핸들링 강화
- [ ] Rate limiting 추가
- [ ] 성능 벤치마크 테스트
- [ ] 사용자 피드백 수집

---

## 📚 참고 문서

- [DeepSeek 설정 가이드](./docs/deepseek-setup.md) - 상세 설정 방법
- [테스트 가이드](./TEST-DEEPSEEK.md) - 빠른 테스트 방법
- [OpenRouter 문서](https://openrouter.ai/docs)
- [DeepSeek 공식 사이트](https://www.deepseek.com/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

---

## ✨ 작업 완료 체크리스트

- [x] `/lib/ai-client.ts` 작성
- [x] `/app/api/chat/route.ts` 수정
- [x] `/app/api/embed/route.ts` 수정
- [x] `.env.example` 업데이트
- [x] `/docs/deepseek-setup.md` 작성
- [x] `TEST-DEEPSEEK.md` 작성
- [x] 마이그레이션 보고서 작성

**모든 작업이 성공적으로 완료되었습니다!** 🎉

---

**작성일**: 2024-11-26  
**작성자**: AI Assistant  
**버전**: 1.0  
**상태**: ✅ 완료
