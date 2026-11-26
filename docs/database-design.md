# Chatbot SaaS 데이터베이스 설계 문서

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [데이터베이스 아키텍처](#데이터베이스-아키텍처)
4. [테이블 상세 설명](#테이블-상세-설명)
5. [관계도 (ERD)](#관계도-erd)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [인덱스 전략](#인덱스-전략)
8. [벡터 검색 (pgvector)](#벡터-검색-pgvector)
9. [확장성 고려사항](#확장성-고려사항)
10. [사용 예시](#사용-예시)

---

## 프로젝트 개요

**Chatbot SaaS** 플랫폼의 데이터베이스 스키마입니다. 사용자가 자신만의 AI 챗봇을 생성하고, 문서를 업로드하여 지식 기반을 구축하며, 대화 로그를 관리할 수 있습니다.

### 주요 기능
- ✅ 사용자 계정 및 구독 관리 (Free/Starter/Growth/Agency)
- ✅ 다중 챗봇 생성 및 커스터마이징
- ✅ 문서 업로드 및 벡터 임베딩 저장
- ✅ AI 기반 유사도 검색 (pgvector)
- ✅ 대화 로그 및 세션 관리
- ✅ Row Level Security로 데이터 보안 강화

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| **데이터베이스** | PostgreSQL 15+ |
| **플랫폼** | Supabase |
| **벡터 검색** | pgvector extension |
| **인증** | Supabase Auth |
| **결제** | Stripe |
| **임베딩** | OpenAI text-embedding-3-small (1536 dimensions) |

---

## 데이터베이스 아키텍처

### 테이블 구성

총 **4개**의 주요 테이블로 구성:

1. **users** - 사용자 프로필 및 구독 정보
2. **chatbots** - 챗봇 설정 및 메타데이터
3. **documents** - 지식 베이스 문서 + 벡터 임베딩
4. **messages** - 대화 로그

### Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID 생성
CREATE EXTENSION IF NOT EXISTS "pgvector";    -- 벡터 검색
```

---

## 테이블 상세 설명

### 1. users

**목적**: Supabase Auth의 `auth.users`를 확장하여 구독 정보 및 결제 정보 저장

| 컬럼 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| `id` | UUID | PK, FK → auth.users | Supabase Auth 사용자 ID |
| `email` | TEXT | NOT NULL, UNIQUE | 사용자 이메일 |
| `subscription_tier` | TEXT | NOT NULL, DEFAULT 'free' | free/starter/growth/agency |
| `stripe_customer_id` | TEXT | UNIQUE | Stripe 고객 ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 계정 생성 시각 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 마지막 수정 시각 |

**특징**:
- Supabase Auth와 1:1 관계
- 사용자 삭제 시 모든 관련 데이터 CASCADE 삭제
- `subscription_tier`로 기능 제한 구현 가능

---

### 2. chatbots

**목적**: 사용자가 생성한 챗봇의 설정 및 커스터마이징 정보

| 컬럼 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| `id` | UUID | PK | 챗봇 고유 ID |
| `user_id` | UUID | FK → users.id, NOT NULL | 소유자 |
| `name` | TEXT | NOT NULL | 챗봇 이름 |
| `greeting_message` | TEXT | DEFAULT '안녕하세요!...' | 인사 메시지 |
| `color` | TEXT | DEFAULT '#6366f1' | UI 테마 색상 |
| `is_active` | BOOLEAN | DEFAULT true | 활성화 상태 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 수정 시각 |

**특징**:
- 한 사용자가 여러 챗봇 소유 가능 (1:N)
- `is_active`로 챗봇 비활성화 가능
- 삭제 시 관련 문서/메시지 CASCADE 삭제

---

### 3. documents

**목적**: 챗봇의 지식 기반이 되는 문서 저장 + 벡터 임베딩

| 컬럼 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| `id` | UUID | PK | 문서 고유 ID |
| `chatbot_id` | UUID | FK → chatbots.id, NOT NULL | 소속 챗봇 |
| `filename` | TEXT | NOT NULL | 원본 파일명 |
| `content` | TEXT | NOT NULL | 문서 텍스트 내용 |
| `embedding` | vector(1536) | NULL | OpenAI 임베딩 벡터 |
| `metadata` | JSONB | DEFAULT '{}' | 추가 메타데이터 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 업로드 시각 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 수정 시각 |

**특징**:
- **pgvector** 사용: 1536차원 벡터 저장 (OpenAI text-embedding-3-small)
- HNSW 인덱스로 빠른 유사도 검색
- `metadata`에 청크 정보, 출처 등 추가 정보 저장 가능

---

### 4. messages

**목적**: 챗봇과 사용자 간 대화 로그 저장

| 컬럼 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| `id` | UUID | PK | 메시지 고유 ID |
| `chatbot_id` | UUID | FK → chatbots.id, NOT NULL | 대화 챗봇 |
| `session_id` | TEXT | NULL | 세션 그룹핑 ID |
| `question` | TEXT | NOT NULL | 사용자 질문 |
| `answer` | TEXT | NOT NULL | 챗봇 답변 |
| `tokens_used` | INTEGER | DEFAULT 0 | 사용된 토큰 수 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 대화 시각 |

**특징**:
- 모든 대화 기록 저장
- `session_id`로 대화 세션 그룹핑
- `tokens_used`로 비용 추적 가능
- 사용량 분석 및 대시보드 데이터 제공

---

## 관계도 (ERD)

```
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
│  (provided by   │
│   Supabase)     │
└────────┬────────┘
         │
         │ 1:1
         │
         ▼
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK, FK)     │◄─────┐
│ email           │      │
│ subscription_   │      │
│ stripe_customer │      │
│ created_at      │      │
│ updated_at      │      │
└─────────────────┘      │
         │               │
         │ 1:N           │ user_id (FK)
         │               │
         ▼               │
┌─────────────────┐      │
│    chatbots     │──────┘
│─────────────────│
│ id (PK)         │◄─────┐
│ user_id (FK)    │      │
│ name            │      │
│ greeting_msg    │      │
│ color           │      │
│ is_active       │      │
│ created_at      │      │
│ updated_at      │      │
└─────────────────┘      │
         │               │
         │               │ chatbot_id (FK)
         ├───────────────┤
         │               │
         ▼               │
┌─────────────────┐      │
│   documents     │──────┘
│─────────────────│
│ id (PK)         │
│ chatbot_id (FK) │
│ filename        │
│ content         │
│ embedding       │ ◄─── vector(1536) for similarity search
│ metadata        │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │ chatbot_id (FK)
         │
         ▼
┌─────────────────┐
│    messages     │
│─────────────────│
│ id (PK)         │
│ chatbot_id (FK) │
│ session_id      │
│ question        │
│ answer          │
│ tokens_used     │
│ created_at      │
└─────────────────┘
```

---

## Row Level Security (RLS)

### 보안 원칙

- ✅ **모든 테이블에 RLS 활성화**
- ✅ **사용자는 자신의 데이터만 접근 가능**
- ✅ **익명 사용자는 메시지 생성만 가능** (공개 챗봇 사용)

### 주요 정책

#### users 테이블
```sql
-- 자신의 데이터만 조회/수정/삽입
auth.uid() = id
```

#### chatbots 테이블
```sql
-- 자신이 소유한 챗봇만 CRUD 가능
auth.uid() = user_id
```

#### documents 테이블
```sql
-- 자신의 챗봇에 속한 문서만 접근
EXISTS (
    SELECT 1 FROM chatbots
    WHERE chatbots.id = documents.chatbot_id
    AND chatbots.user_id = auth.uid()
)
```

#### messages 테이블
```sql
-- 조회: 자신의 챗봇 메시지만
-- 삽입: 활성화된 챗봇이면 누구나 가능 (공개 사용)
-- 삭제: 소유자만
```

### 보안 이점

1. **데이터 격리**: 사용자 간 데이터 완전 분리
2. **자동 필터링**: 쿼리에 WHERE 절 불필요
3. **공격 방어**: SQL Injection 등 방어
4. **공개 API 안전**: 익명 사용자가 메시지만 생성 가능

---

## 인덱스 전략

### 목적별 인덱스

#### 1. Primary Key Indexes (자동 생성)
```sql
users(id), chatbots(id), documents(id), messages(id)
```

#### 2. Foreign Key Indexes
```sql
idx_chatbots_user_id        -- JOIN 성능 향상
idx_documents_chatbot_id
idx_messages_chatbot_id
```

#### 3. Query Optimization Indexes
```sql
idx_users_email              -- 로그인 조회
idx_users_subscription_tier  -- 구독 등급별 필터링
idx_chatbots_is_active       -- 활성 챗봇만 조회 (Partial Index)
idx_messages_session_id      -- 세션별 대화 조회
```

#### 4. Time-based Indexes
```sql
idx_chatbots_created_at DESC   -- 최신 챗봇 먼저
idx_documents_created_at DESC  -- 최신 문서 먼저
idx_messages_created_at DESC   -- 최신 대화 먼저
```

#### 5. Vector Similarity Index ⭐
```sql
CREATE INDEX idx_documents_embedding 
ON documents USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**HNSW 파라미터**:
- `m = 16`: 연결 수 (기본값, 정확도와 속도 균형)
- `ef_construction = 64`: 인덱스 구축 품질 (높을수록 정확하지만 느림)

---

## 벡터 검색 (pgvector)

### OpenAI Embeddings 통합

1. **임베딩 생성**:
   ```javascript
   const response = await openai.embeddings.create({
     model: "text-embedding-3-small",
     input: documentText,
   });
   const embedding = response.data[0].embedding; // 1536 차원
   ```

2. **문서 저장**:
   ```sql
   INSERT INTO documents (chatbot_id, filename, content, embedding)
   VALUES ($1, $2, $3, $4::vector);
   ```

3. **유사도 검색** (함수 사용):
   ```sql
   SELECT * FROM match_documents(
     query_embedding := $1::vector(1536),
     match_chatbot_id := $2::uuid,
     match_threshold := 0.7,
     match_count := 5
   );
   ```

### match_documents 함수

```sql
CREATE FUNCTION match_documents(
    query_embedding vector(1536),
    match_chatbot_id uuid,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (id, chatbot_id, filename, content, similarity)
```

**동작**:
1. 쿼리 임베딩과 문서 임베딩 간 코사인 유사도 계산
2. `match_threshold` 이상만 반환
3. 유사도 높은 순으로 정렬
4. `match_count` 개수만큼 반환

**활용**:
- 사용자 질문 → 임베딩 → 관련 문서 검색 → RAG 답변 생성

---

## 확장성 고려사항

### 1. 수평 확장

- **Supabase**: 자동 스케일링 지원
- **Connection Pooling**: PgBouncer 내장
- **Read Replicas**: 읽기 부하 분산 가능

### 2. 성능 최적화

```sql
-- 파티셔닝 (대량 메시지 처리 시)
-- 월별로 파티션 생성 가능
CREATE TABLE messages_2026_11 PARTITION OF messages
FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
```

### 3. 비용 최적화

- **Cold Storage**: 오래된 메시지 아카이빙
- **Embedding Cache**: 동일 문서 중복 임베딩 방지
- **Token Tracking**: `tokens_used`로 비용 모니터링

### 4. 플랜별 제한 구현

```javascript
// 애플리케이션 레벨에서 구독 등급별 제한
const LIMITS = {
  free: { chatbots: 1, documents: 10, messages: 100 },
  starter: { chatbots: 3, documents: 100, messages: 1000 },
  growth: { chatbots: 10, documents: 1000, messages: 10000 },
  agency: { chatbots: -1, documents: -1, messages: -1 }, // unlimited
};
```

### 5. 백업 및 복구

- Supabase: 자동 백업 (Point-in-Time Recovery)
- **중요**: `embedding` 컬럼 크기 주의 (스토리지 비용)

---

## 사용 예시

### 1. 사용자 가입 후 프로필 생성

```sql
-- Supabase Auth에서 사용자 생성 후
INSERT INTO users (id, email, subscription_tier)
VALUES (auth.uid(), 'user@example.com', 'free');
```

### 2. 챗봇 생성

```sql
INSERT INTO chatbots (user_id, name, greeting_message, color)
VALUES (
  auth.uid(),
  '고객 지원 봇',
  '안녕하세요! 무엇을 도와드릴까요?',
  '#6366f1'
)
RETURNING id;
```

### 3. 문서 업로드 + 임베딩 저장

```javascript
// 1. OpenAI로 임베딩 생성
const embedding = await generateEmbedding(documentContent);

// 2. Supabase에 저장
const { data, error } = await supabase
  .from('documents')
  .insert({
    chatbot_id: chatbotId,
    filename: 'terms.pdf',
    content: documentContent,
    embedding: embedding,
  });
```

### 4. 질문 처리 (RAG)

```javascript
// 1. 질문 임베딩
const queryEmbedding = await generateEmbedding(userQuestion);

// 2. 유사 문서 검색
const { data: matches } = await supabase.rpc('match_documents', {
  query_embedding: queryEmbedding,
  match_chatbot_id: chatbotId,
  match_threshold: 0.7,
  match_count: 3,
});

// 3. 컨텍스트 생성
const context = matches.map(m => m.content).join('\n\n');

// 4. OpenAI로 답변 생성
const answer = await generateAnswer(userQuestion, context);

// 5. 대화 로그 저장
await supabase.from('messages').insert({
  chatbot_id: chatbotId,
  question: userQuestion,
  answer: answer,
  tokens_used: totalTokens,
});
```

### 5. 대시보드 조회

```sql
-- 사용자별 챗봇 수
SELECT COUNT(*) FROM chatbots WHERE user_id = auth.uid();

-- 오늘 메시지 수
SELECT COUNT(*) 
FROM messages m
JOIN chatbots c ON c.id = m.chatbot_id
WHERE c.user_id = auth.uid()
  AND m.created_at >= CURRENT_DATE;

-- 이번 달 토큰 사용량
SELECT SUM(tokens_used)
FROM messages m
JOIN chatbots c ON c.id = m.chatbot_id
WHERE c.user_id = auth.uid()
  AND m.created_at >= date_trunc('month', CURRENT_DATE);
```

---

## 마이그레이션 가이드

### Supabase에서 실행

1. **Supabase Dashboard** 접속
2. **SQL Editor** 메뉴로 이동
3. `database-schema.sql` 파일 내용 복사
4. **Run** 클릭하여 실행

### 로컬 개발 환경

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 프로젝트 초기화
supabase init

# 로컬 DB 시작
supabase start

# 마이그레이션 실행
supabase db push
```

---

## 체크리스트

- [x] pgvector extension 활성화
- [x] 4개 테이블 생성 (users, chatbots, documents, messages)
- [x] Foreign Key 관계 설정
- [x] RLS 정책 모든 테이블 적용
- [x] 필수 인덱스 생성
- [x] 벡터 유사도 검색 함수 구현
- [x] Trigger (updated_at 자동 갱신)
- [x] 주석 (COMMENT) 추가

---

## 추가 고려사항

### 향후 확장 가능 기능

1. **analytics** 테이블
   - 일별/월별 사용량 집계
   - 대시보드 성능 향상

2. **api_keys** 테이블
   - 외부 API 연동용 키 관리
   - 위젯 임베딩용 public key

3. **templates** 테이블
   - 챗봇 템플릿 (FAQ, 쇼핑몰, 고객지원 등)
   - 사용자가 선택 후 빠른 시작

4. **webhooks** 테이블
   - 메시지 발생 시 외부 URL 호출
   - Slack, Discord 연동

5. **feedback** 테이블
   - 답변 품질 평가 (👍/👎)
   - 모델 개선 데이터

---

## 문의 및 지원

- 스키마 수정이 필요한 경우 `database-schema.sql` 파일 편집
- RLS 정책 추가/변경 시 Supabase Dashboard 활용
- 성능 이슈 발생 시 `EXPLAIN ANALYZE` 활용

**작성일**: 2026-11-26  
**버전**: 1.0.0  
**작성자**: Aside AI
