# P0 보안 수정 완료 보고서

**작성 시각:** 2026-11-27 21:20:01
**Commit SHA:** 6b8b89b7ab7dddd2fd6ccc6b10f330de1f848676
**GitHub:** https://github.com/ryujun1111/chatbot-saas/commit/6b8b89b7ab7dddd2fd6ccc6b10f330de1f848676

---

## ✅ P0 수정 완료 항목

### 1. Paddle Webhook 서명 검증 ✅
**파일:** \pp/api/webhooks/paddle/route.ts\

**수정 내용:**
- \erifyPaddleSignature()\ 함수 추가
- HMAC SHA-256 서명 검증
- \crypto.timingSafeEqual()\로 타이밍 공격 방지
- 서명 없는 요청 거부 (401)

**코드:**
\\\	ypescript
function verifyPaddleSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const [tsHeader, h1] = signature.split(';').map(pair => {
    const [key, value] = pair.split('=');
    return value;
  });
  const signedPayload = \\:\\;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(h1),
    Buffer.from(expectedSignature)
  );
}
\\\

**테스트 필요:**
- Paddle Sandbox 환경에서 실제 Webhook 전송 테스트
- 위조된 Webhook 전송 시 거부 확인

---

### 2. Webhook 중복 이벤트 처리 ✅
**파일:** \pp/api/webhooks/paddle/route.ts\

**수정 내용:**
- \processedEvents\ Set으로 event_id 추적
- 중복 이벤트 감지 시 즉시 반환
- 처리 완료 후에만 event_id 저장

**코드:**
\\\	ypescript
const processedEvents = new Set<string>();

if (processedEvents.has(eventId)) {
  console.log(\Event \ already processed\);
  return NextResponse.json({ received: true });
}

// ... process event ...

processedEvents.add(eventId);
\\\

**제한사항:**
- 메모리 기반 (서버 재시작 시 초기화)
- 프로덕션에서는 Redis 권장

---

### 3. Paddle 실제 이벤트 스키마 사용 ✅
**파일:** \pp/api/webhooks/paddle/route.ts\

**수정 내용:**
- \	ransaction.customer.email\ 경로 수정
- \	ransaction.items[0].price.id\ 경로 수정
- \	ransaction.id\ (실제 거래 ID) 저장
- 필수 필드 누락 시 400 에러 반환

**코드:**
\\\	ypescript
const transaction = body.data;
const customerId = transaction.customer_id;
const customerEmail = transaction.customer?.email;
const transactionId = transaction.id;
const priceId = transaction.items?.[0]?.price?.id;

if (!customerEmail || !priceId) {
  console.error('Missing required transaction data');
  return NextResponse.json(
    { error: 'Invalid transaction data' },
    { status: 400 }
  );
}
\\\

---

### 4. Supabase 업데이트 에러 처리 ✅
**파일:** \pp/api/webhooks/paddle/route.ts\

**수정 내용:**
- 모든 Supabase 쿼리에서 \rror\ 체크
- 업데이트 실패 시 500 반환 (성공으로 반환하지 않음)
- 에러 로그 출력

**코드:**
\\\	ypescript
const { error: updateError } = await supabase
  .from('users')
  .update({ ... })
  .eq('id', user.id);

if (updateError) {
  console.error('Failed to update user:', updateError);
  return NextResponse.json(
    { error: 'Database update failed' },
    { status: 500 }
  );
}
\\\

---

### 5. 구독 라이프사이클 이벤트 처리 ✅
**파일:** \pp/api/webhooks/paddle/route.ts\

**추가된 이벤트:**
- \subscription.canceled\ → \subscription_status = 'canceled'\
- \subscription.updated\ → 플랜 변경 반영
- \	ransaction.payment_failed\ → \subscription_status = 'payment_failed'\

**코드:**
\\\	ypescript
else if (eventType === 'subscription.canceled') { ... }
else if (eventType === 'subscription.updated') { ... }
else if (eventType === 'transaction.payment_failed') { ... }
\\\

---

### 6. AI 시스템 프롬프트 언어 강제 제거 ✅
**파일:** \pp/api/chat/route.ts\

**변경 전:**
\\\
답변은 한국어로 작성하고,
가능한 구체적이고 명확하게 작성하세요.
\\\

**변경 후:**
\\\
Answer in the same language as the user's question.
Be specific and clear in your responses.
\\\

**결과:**
- 영어 질문 → 영어 답변
- 한국어 질문 → 한국어 답변
- 다국어 지원 가능

---

### 7. 모든 에러 메시지 영어로 변경 ✅
**파일:** \pp/api/chat/route.ts\, \pp/api/webhooks/paddle/route.ts\

**변경 예시:**
- \'chatbotId와 message는 필수입니다'\ → \'chatbotId and message are required'\
- \'문서 검색 중 오류가 발생했습니다'\ → \'Failed to search documents'\
- \'답변 생성 중 오류가 발생했습니다'\ → \'Failed to generate response'\

---

### 8. 서버 사이드 메시지 사용량 제한 ✅
**파일:** \pp/api/chat/route.ts\

**구현 내용:**
- 플랜별 월간 메시지 한도 체크
- \messages_used >= message_limit\ 시 429 에러
- 메시지 전송마다 \messages_used++\
- 응답에 사용량 포함

**코드:**
\\\	ypescript
const { data: user } = await supabase
  .from('users')
  .select('plan, message_limit, messages_used')
  .eq('id', userId)
  .single()

const messagesUsed = user.messages_used || 0;
const messageLimit = user.message_limit || 5;

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
\\\

**필요한 DB 스키마:**
\\\sql
ALTER TABLE users ADD COLUMN message_limit INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN messages_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN paddle_transaction_id TEXT;
\\\

---

### 9. API Rate Limiting 및 비용 제한 ✅
**파일:** \pp/api/chat/route.ts\

**Rate Limit:**
- 사용자당 60 요청/분
- 메모리 기반 (프로덕션에서는 Redis 권장)

**Token Limit:**
- \max_tokens: 500\ (응답 길이 제한)
- 메시지 길이 제한: 2000자

**코드:**
\\\	ypescript
function checkRateLimit(userId: string, maxRequests: number = 60): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);
  if (!userLimit || userLimit.resetAt < now) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (userLimit.count >= maxRequests) {
    return false;
  }
  userLimit.count++;
  return true;
}

if (message.length > 2000) {
  return NextResponse.json(
    { error: 'Message too long (max 2000 characters)' },
    { status: 400 }
  )
}
\\\

---

## 📝 법적 문서 추가

### 생성된 파일:
- \public/terms.md\ - Terms of Service
- \public/privacy.md\ - Privacy Policy
- \public/refund.md\ - Refund Policy

### 주요 내용:
- 14-day money-back guarantee
- Usage limits per plan
- Data collection and storage
- Third-party services (Paddle, Google Analytics, OpenAI)
- Contact: support@chatbotai.com

---

## 🔧 환경 변수 추가

### 새로 필요한 환경 변수:
\\\
PADDLE_WEBHOOK_SECRET=your-paddle-webhook-secret
\\\

### Vercel에서 설정:
1. Project Settings > Environment Variables
2. \PADDLE_WEBHOOK_SECRET\ 추가
3. Paddle Dashboard에서 Webhook Secret 복사하여 입력

---

## ⚠️ 미검증 항목 (P1)

### 1. Paddle Webhook 실제 테스트 ❌
**필요한 작업:**
- Paddle Dashboard에서 Webhook URL 등록
- Sandbox 환경에서 테스트 결제
- 실제 Webhook 수신 로그 확인
- DB 업데이트 확인

**Webhook URL:**
\https://chatbot-saas-tau-sandy.vercel.app/api/webhooks/paddle\

### 2. Google Analytics 실제 연결 ❌
**필요한 작업:**
- Google Analytics 4 계정 생성
- Measurement ID 발급
- Vercel 환경 변수에 추가
- DebugView에서 이벤트 확인

### 3. Pricing 페이지 렌더링 ❌
**필요한 작업:**
- https://chatbot-saas-tau-sandy.vercel.app/pricing 접속
- 4개 플랜 카드 정상 표시 확인
- Paddle Checkout 버튼 작동 확인

### 4. Supabase 스키마 업데이트 ❌
**필요한 SQL:**
\\\sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS message_limit INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN IF NOT EXISTS messages_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS paddle_transaction_id TEXT;
\\\

### 5. 실제 결제 테스트 ❌
**테스트 시나리오:**
1. Paddle Sandbox에서 테스트 카드 결제
2. Webhook 수신 확인
3. DB에서 사용자 플랜 변경 확인
4. 메시지 한도 변경 확인
5. 구독 취소 테스트

---

## 📊 보안 개선 평가

| 항목 | 수정 전 | 수정 후 |
|------|---------|---------|
| Webhook 서명 검증 | ❌ 없음 | ✅ HMAC SHA-256 |
| 중복 이벤트 방지 | ❌ 없음 | ✅ event_id 추적 |
| DB 에러 처리 | ❌ 미흡 | ✅ 에러 시 500 반환 |
| 언어 강제 | ❌ 한국어만 | ✅ 질문 언어 따름 |
| 사용량 제한 | ❌ 없음 | ✅ 플랜별 체크 |
| Rate Limit | ❌ 없음 | ✅ 60req/min |
| 메시지 길이 제한 | ❌ 없음 | ✅ 2000자 |
| Token 제한 | ❌ 없음 | ✅ 500 tokens |
| 법적 문서 | ❌ 없음 | ✅ TOS/Privacy/Refund |

---

## 🎯 다음 단계

### 즉시 필요:
1. Paddle Dashboard에서 Webhook Secret 발급 → Vercel 환경 변수 등록
2. Supabase에서 DB 스키마 업데이트 (message_limit, messages_used, paddle_transaction_id 컬럼 추가)
3. Paddle Sandbox에서 실제 결제 테스트

### 운영 전 필요:
1. Google Analytics 연결
2. 법적 문서 페이지 생성 (/terms, /privacy, /refund)
3. Paddle Production 계정 승인
4. 실제 카드 결제 테스트

---

**작성자:** Aside AI  
**검증 방법:** 실제 소스코드 확인 및 커밋  
**완료 표시 기준:** 코드 작성 + 커밋 완료 (실제 테스트는 별도 필요)
