# DeepSeek R1 테스트 가이드

## 빠른 시작

### 1. 환경 변수 설정

`.env.local` 파일에 다음 내용을 추가하세요:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
OPENAI_API_KEY=sk-your-actual-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. API 테스트

#### 임베딩 API 테스트

```bash
curl -X POST http://localhost:3000/api/embed \
  -H "Content-Type: application/json" \
  -d '{
    "text": "안녕하세요, 이것은 테스트 텍스트입니다.",
    "chatbotId": "test-chatbot-id"
  }'
```

**예상 응답:**
```json
{
  "success": true,
  "embedding": [0.123, -0.456, ...],
  "chunks": ["안녕하세요, 이것은 테스트 텍스트입니다."],
  "metadata": {
    "chatbotId": "test-chatbot-id",
    "dimension": 1536,
    "chunkCount": 1,
    "totalChunks": 1,
    "model": "text-embedding-3-small"
  }
}
```

#### 채팅 API 테스트

> **참고**: 채팅 API는 Supabase 벡터 검색이 필요하므로, 먼저 데이터베이스에 문서가 임베딩되어 있어야 합니다.

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "chatbotId": "your-chatbot-id",
    "message": "안녕하세요?"
  }'
```

**예상 응답:**
```json
{
  "answer": "안녕하세요! 무엇을 도와드릴까요?",
  "sources": ["https://example.com/page1"]
}
```

### 4. 브라우저 테스트

1. `http://localhost:3000/test-chat` 접속
2. 챗봇 ID 입력
3. 메시지 전송
4. DeepSeek R1의 응답 확인

## 주요 변경 사항 확인

### `/lib/ai-client.ts` 확인

```bash
cat lib/ai-client.ts | Select-String "deepseek"
```

**출력 예시:**
```
export const deepseekClient = new OpenAI({
export const DEEPSEEK_MODEL = 'deepseek/deepseek-r1';
```

### `/app/api/chat/route.ts` 확인

```bash
cat app/api/chat/route.ts | Select-String "createChatCompletion|DeepSeek"
```

**출력 예시:**
```
import { openaiClient, OPENAI_EMBEDDING_MODEL, createChatCompletion } from '@/lib/ai-client'
    // 4. DeepSeek R1으로 답변 생성
    const answer = await createChatCompletion({
```

### 환경 변수 확인

```bash
# .env.local 파일에서 필수 키 확인
cat .env.local | Select-String "OPENROUTER_API_KEY|OPENAI_API_KEY"
```

**출력 예시:**
```
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
```

## 문제 해결

### Error: OPENROUTER_API_KEY is not set

**해결 방법:**
1. `.env.local` 파일 확인
2. `OPENROUTER_API_KEY=sk-or-v1-...` 추가
3. 서버 재시작: `npm run dev`

### Error: Failed to create chat completion

**원인:**
- OpenRouter API 키가 잘못됨
- 크레딧 부족
- 네트워크 문제

**해결 방법:**
1. [OpenRouter Dashboard](https://openrouter.ai/activity)에서 키 확인
2. [Credits](https://openrouter.ai/credits)에서 크레딧 충전
3. 네트워크 연결 확인

### Error: Failed to create embedding

**원인:**
- OpenAI API 키가 잘못됨
- OpenAI API 한도 초과

**해결 방법:**
1. [OpenAI API Keys](https://platform.openai.com/api-keys)에서 키 확인
2. [Usage](https://platform.openai.com/usage)에서 사용량 확인

## 성능 비교

### 응답 시간 비교

| 모델 | 평균 응답 시간 | 토큰 수 |
|------|----------------|---------|
| GPT-4o-mini | 1-2초 | 100-300 |
| DeepSeek R1 | 2-5초 | 200-500 |

> **참고**: DeepSeek R1은 사고 과정(CoT)을 포함하므로 응답 시간이 더 길 수 있습니다.

### 품질 비교 테스트

다음 질문으로 품질을 비교해보세요:

1. **단순 질문**: "안녕하세요?"
   - GPT-4o-mini: 간단한 인사
   - DeepSeek R1: 더 자세한 인사 + 추가 정보

2. **복잡한 추론**: "A와 B 중 어떤 것이 더 나은가요?"
   - GPT-4o-mini: 간단한 비교
   - DeepSeek R1: 단계별 분석 + 추론 과정

3. **전문 지식**: "양자역학의 불확정성 원리는 무엇인가요?"
   - GPT-4o-mini: 기본 설명
   - DeepSeek R1: 더 깊은 설명 + 예시

## 다음 단계

1. ✅ DeepSeek R1 적용 완료
2. ⏳ 프로덕션 환경 배포
3. ⏳ 모니터링 설정 (OpenRouter + OpenAI 사용량)
4. ⏳ 에러 핸들링 강화
5. ⏳ Rate limiting 추가

## 참고 자료

- [DeepSeek 설정 가이드](./docs/deepseek-setup.md)
- [OpenRouter 문서](https://openrouter.ai/docs)
- [OpenAI Embeddings 가이드](https://platform.openai.com/docs/guides/embeddings)

---

**작성일**: 2024-11-26
