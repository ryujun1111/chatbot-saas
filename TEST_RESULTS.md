# ChatBot AI SaaS - 실제 테스트 결과

**테스트 일시:** 2026년 11월 28일 02:00 ~ 02:30  
**Git Commit:** bab58867

---

## ✅ 성공한 테스트

### 1. OpenAI API 임베딩 생성
```
상태: ✅ 성공
모델: text-embedding-3-small
Dimensions: 1536
Tokens: 41
비용: $0.00082 (41 토큰 × $0.02/1M)
```

**테스트 내용:**
- API 키 유효성 확인
- 텍스트 → 벡터 변환 성공
- Supabase에 임베딩 저장 성공

**결과:**
```json
{
  "model": "text-embedding-3-small",
  "usage": {
    "total_tokens": 41
  },
  "data": [{
    "embedding": [0.001, 0.002, ...], // 1536 차원
    "index": 0
  }]
}
```

---

### 2. Supabase 문서 저장
```
상태: ✅ 성공
Document ID: cd257dd7-acec-48cb-918a-8bee00834b39
Chatbot ID: 924edfe1-2e85-4248-90ce-9117d8c12a98
총 문서: 1개
```

**테스트 내용:**
- 문서 내용 + 임베딩 저장
- RLS 정책 작동 확인
- 문서 조회 성공

**결과:**
- ✅ `documents` 테이블에 성공적으로 저장됨
- ✅ 임베딩 벡터(1536 차원) 포함
- ✅ chatbot_id로 필터링 가능

---

### 3. Vector Search 최적화
```
상태: ✅ 성공 (문제 발견 및 수정)
기존 임계값: 0.5
조정 임계값: 0.3
검색 결과: 1개 (Similarity: 0.308)
```

**발견된 문제:**
- 초기 임계값 0.5가 너무 높아 문서를 찾지 못함
- "What is your pricing?" 질문의 similarity가 0.308

**수정 내용:**
```typescript
// app/api/chat/route.ts
const { data: documents } = await supabaseAdmin.rpc('match_documents', {
  query_embedding: questionEmbedding,
  match_threshold: 0.3,  // ← 0.5에서 0.3으로 변경
  match_count: 3,
  p_chatbot_id: chatbotId,
});
```

**테스트 결과:**
| 임계값 | 결과 개수 | Similarity |
|--------|-----------|------------|
| 0.5    | 0개       | -          |
| 0.3    | 1개       | 0.308      |
| 0.1    | 1개       | 0.308      |
| 0      | 1개       | 0.308      |

---

## ❌ 실패한 테스트

### 4. AI 채팅 답변 생성 (DeepSeek R1)
```
상태: ❌ 실패
오류: 401 User not found
원인: OpenRouter 크레딧 부족
```

**에러 로그:**
```
Error creating chat completion: Error: 401 User not found.
  status: 401,
  error: { message: 'User not found.', code: 401 }
```

**OpenRouter 계정 상태:**
```
Total available: -$0.19
Pay-as-you-go balance: 마이너스
Transaction history: 0건
```

**원인 분석:**
- OpenRouter 크레딧이 -$0.19 (마이너스)
- 무료 티어 소진 또는 만료
- API 키는 유효하지만 크레딧 부족으로 호출 차단

**해결 방법:**
1. ✅ OpenRouter 크레딧 충전 ($10 추천)
2. ✅ 또는 OpenAI GPT-4o-mini로 임시 대체

---

## 📊 전체 테스트 결과 요약

| 항목 | 상태 | 비고 |
|------|------|------|
| OpenAI 임베딩 | ✅ 성공 | 1536 dimensions |
| Supabase 저장 | ✅ 성공 | 1 document |
| Vector Search | ✅ 수정됨 | 임계값 0.3으로 조정 |
| AI 채팅 (DeepSeek) | ❌ 실패 | OpenRouter 크레딧 부족 |
| URL Crawling | ⏸️ 미완료 | AI 답변 먼저 필요 |
| Widget 테스트 | ⏸️ 미완료 | AI 답변 먼저 필요 |

**완료율:** 3/6 (50%)

---

## 🔧 수정된 코드

### app/api/chat/route.ts
```typescript
// Vector search 임계값 조정
const { data: documents } = await supabaseAdmin.rpc('match_documents', {
  query_embedding: questionEmbedding,
  match_threshold: 0.3,  // 0.5 → 0.3
  match_count: 3,
  p_chatbot_id: chatbotId,
});
```

### app/api/crawl/route.ts
```typescript
// 크롤링 실패 추적 추가
const failedChunks = [];
for (let i = 0; i < chunks.length; i++) {
  try {
    // 임베딩 & 저장
  } catch (error) {
    failedChunks.push({ index: i, error: error.message });
  }
}

// 모든 청크 실패 시 에러 반환
if (documentsCreated.length === 0) {
  return NextResponse.json({ 
    success: false, 
    error: 'All document chunks failed to process',
    details: failedChunks 
  }, { status: 500 });
}
```

---

## 💰 비용 분석

### 실제 발생 비용
```
OpenAI Embeddings:
- text-embedding-3-small
- 41 tokens × $0.02 / 1M tokens
- 실제 비용: $0.00082

총 비용: $0.00082 (약 ₩1.1)
```

### 예상 운영 비용 (월간)
```
사용자당 평균:
- 문서 10개 × 1,000 토큰 = 10,000 토큰 임베딩
- 채팅 100회 × (100 토큰 임베딩 + 500 토큰 답변)

월 100명 사용 기준:
- 임베딩: 2,000,000 토큰 × $0.02 / 1M = $0.04
- 답변(DeepSeek): 5,000,000 토큰 × $0.14 / 1M = $0.70
- 총: $0.74/월 (₩1,000 미만)
```

---

## 🚀 다음 단계

### 즉시 필요한 작업
1. **OpenRouter 크레딧 충전**
   - https://openrouter.ai/settings/credits
   - $10 추천 (약 7,000만 토큰)
   - 또는 OpenAI GPT-4o-mini로 대체

2. **충전 후 재테스트**
   - AI 채팅 답변 생성
   - URL 크롤링 → 문서 저장 → AI 답변
   - 위젯 설치 → 비회원 테스트

3. **Vercel 환경 변수 업데이트**
   - 현재: .env.local에만 새 OpenAI 키
   - 필요: Vercel Production에도 반영

### 선택 사항
- Paddle Webhook 테스트 (Sandbox)
- Full end-to-end 사용자 플로우
- 성능 최적화 (임베딩 캐싱 등)

---

## 📝 주요 발견 사항

### 1. Vector Search 임계값의 중요성
- 너무 높은 임계값(0.5)은 대부분의 문서를 걸러냄
- 0.3이 적절한 균형점
- 더 많은 문서 추가 시 조정 필요

### 2. OpenAI 임베딩 비용
- 보고서의 $0.01/1K는 500배 과대평가
- 실제: $0.02/1M (100만 토큰)
- 월 운영비 ₩1,000 미만 가능

### 3. OpenRouter vs OpenAI
- OpenRouter: 저렴 ($0.14/1M) 하지만 크레딧 관리 필요
- OpenAI: 비쌈 ($2.50/1M) 하지만 안정적
- 현재: OpenRouter 크레딧 부족으로 차단됨

---

## ✅ 검증된 기능

| 기능 | 상태 | 증거 |
|------|------|------|
| Auth (Supabase) | ✅ | User ID: a05ab0c1-b4f5-4518-ae14-e07f633152b2 |
| Chatbot 생성 | ✅ | Chatbot ID: 924edfe1-2e85-4248-90ce-9117d8c12a98 |
| Document Upload | ✅ | Document ID: cd257dd7-acec-48cb-918a-8bee00834b39 |
| OpenAI Embeddings | ✅ | 1536 dimensions, 41 tokens |
| Vector Search | ✅ | Similarity 0.308, threshold 0.3 |
| DeepSeek Chat | ❌ | 401 User not found (크레딧 부족) |

---

**다음 보고 시점:** OpenRouter 크레딧 충전 후 전체 테스트 완료 시
