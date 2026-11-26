# Chatbot SaaS - 개발 환경 설정 가이드

이 가이드는 Chatbot SaaS 프로젝트를 로컬 환경에서 설정하고 실행하는 방법을 안내합니다.

---

## 📋 목차

1. [필요한 계정](#1-필요한-계정)
2. [사전 요구사항](#2-사전-요구사항)
3. [프로젝트 클론 및 설치](#3-프로젝트-클론-및-설치)
4. [환경 변수 설정](#4-환경-변수-설정)
5. [데이터베이스 설정](#5-데이터베이스-설정)
6. [개발 서버 실행](#6-개발-서버-실행)
7. [배포 준비](#7-배포-준비)
8. [문제 해결](#8-문제-해결)

---

## 1. 필요한 계정

### 필수 계정

#### 1.1 Supabase (데이터베이스 & 인증)
- **가입**: https://supabase.com
- **무료 플랜**: 2개의 프로젝트, 500MB 데이터베이스
- **필요한 정보**:
  - Project URL
  - Anon (public) key
  - Service role key (서버 측 작업용)

#### 1.2 OpenAI (AI 모델 & 임베딩)
- **가입**: https://platform.openai.com
- **요금제**: 사용량 기반 (종량제)
- **필요한 정보**:
  - API Key
- **권장 모델**:
  - GPT-4o-mini (채팅)
  - text-embedding-3-small (문서 임베딩)

#### 1.3 Paddle 또는 Stripe (결제 처리)

**Option A: Paddle (권장)**
- **가입**: https://www.paddle.com
- **무료 샌드박스**: 테스트 환경 제공
- **필요한 정보**:
  - Vendor ID
  - API Key
  - Webhook Secret

**Option B: Stripe**
- **가입**: https://stripe.com
- **무료 테스트 모드**: 무제한 테스트 가능
- **필요한 정보**:
  - Secret Key
  - Publishable Key
  - Webhook Secret

### 선택 계정

#### 1.4 Cloudflare (선택 - 배포 최적화)
- **가입**: https://cloudflare.com
- **무료 플랜**: Workers 10만 요청/일
- **필요한 정보**:
  - Account ID
  - API Token
  - Zone ID (도메인 연결 시)

---

## 2. 사전 요구사항

개발 환경에 다음 도구들이 설치되어 있어야 합니다:

```bash
# Node.js 18.17 이상
node --version  # v18.17.0 이상

# npm 9.0 이상
npm --version   # 9.0.0 이상

# Git
git --version
```

**Node.js가 없다면**: https://nodejs.org (LTS 버전 권장)

---

## 3. 프로젝트 클론 및 설치

### 3.1 프로젝트 클론

```bash
# Git 저장소에서 클론 (저장소 URL을 실제 주소로 변경)
git clone https://github.com/your-username/chatbot-saas.git

# 프로젝트 디렉토리로 이동
cd chatbot-saas
```

### 3.2 의존성 설치

```bash
# npm 패키지 설치
npm install
```

설치되는 주요 패키지:
- **Next.js**: React 프레임워크
- **Supabase**: 데이터베이스 & 인증 클라이언트
- **Tailwind CSS**: 스타일링
- **TypeScript**: 타입 안전성

---

## 4. 환경 변수 설정

### 4.1 환경 변수 파일 생성

```bash
# .env.example을 복사하여 .env.local 생성
cp .env.example .env.local
```

### 4.2 Supabase 설정

1. Supabase 대시보드 접속: https://app.supabase.com
2. 새 프로젝트 생성:
   - Organization 선택 또는 생성
   - Project name: `chatbot-saas` (또는 원하는 이름)
   - Database Password: 안전한 비밀번호 설정
   - Region: `Northeast Asia (Seoul)` 권장

3. 프로젝트 생성 후 **Settings > API** 메뉴에서 다음 값 복사:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **주의**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출하지 마세요!

### 4.3 OpenAI 설정

1. OpenAI 대시보드 접속: https://platform.openai.com/api-keys
2. **Create new secret key** 클릭
3. 키 이름 설정 (예: `chatbot-saas-dev`)
4. 생성된 키 복사 (한 번만 표시됨):

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. (선택) 모델 설정:

```env
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

### 4.4 Paddle 설정

1. Paddle 대시보드 접속: https://vendors.paddle.com
2. **Developer Tools > Authentication** 메뉴에서:

```env
PADDLE_VENDOR_ID=12345
PADDLE_API_KEY=xxxxxxxxxxxxxxxxxxxxx
PADDLE_ENVIRONMENT=sandbox
```

3. **Developer Tools > Webhooks** 메뉴에서 웹훅 생성:
   - Webhook URL: `https://your-domain.com/api/webhooks/paddle`
   - Secret 생성 및 복사:

```env
PADDLE_WEBHOOK_SECRET=pdl_whsec_xxxxxxxxxxxxx
```

### 4.5 애플리케이션 URL 설정

```env
# 로컬 개발
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 프로덕션 (배포 후)
# NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 5. 데이터베이스 설정

### 5.1 pgvector 확장 활성화

Supabase 프로젝트에서 pgvector가 이미 활성화되어 있지만, 확인하려면:

1. Supabase 대시보드 > **Database > Extensions**
2. `vector` 검색 후 활성화 확인

### 5.2 데이터베이스 스키마 적용

1. Supabase 대시보드 > **SQL Editor**
2. 새 쿼리 생성
3. `docs/database-schema.sql` 파일 내용 복사
4. 쿼리 실행 (Run 버튼 클릭)

또는 Supabase CLI 사용:

```bash
# Supabase CLI 설치
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

### 5.3 데이터베이스 확인

스키마가 올바르게 생성되었는지 확인:

1. Supabase 대시보드 > **Table Editor**
2. 다음 테이블이 보여야 함:
   - `users`
   - `chatbots`
   - `documents`
   - `messages`

---

## 6. 개발 서버 실행

### 6.1 개발 서버 시작

```bash
npm run dev
```

서버가 시작되면 다음 메시지가 표시됩니다:

```
   ▲ Next.js 16.4.6
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.5s
```

### 6.2 브라우저에서 확인

브라우저에서 http://localhost:3000 접속

### 6.3 주요 엔드포인트

- **홈페이지**: `/`
- **로그인**: `/login`
- **회원가입**: `/signup`
- **대시보드**: `/dashboard`
- **무료 체험**: `/try`

### 6.4 Hot Reload

파일을 수정하면 자동으로 브라우저가 새로고침됩니다.

---

## 7. 배포 준비

### 7.1 Vercel 배포 (권장)

Vercel은 Next.js를 만든 회사의 호스팅 플랫폼입니다.

#### 단계:

1. **Vercel 가입**: https://vercel.com
2. **GitHub 연동**: 저장소 연결
3. **프로젝트 임포트**:
   ```
   Import Git Repository > 저장소 선택
   ```
4. **환경 변수 설정**:
   - Settings > Environment Variables
   - `.env.local`의 모든 변수 추가
   - `NEXT_PUBLIC_APP_URL`을 Vercel 도메인으로 변경

5. **배포**:
   ```bash
   # 자동 배포 (Git push 시)
   git push origin main
   
   # 또는 Vercel CLI 사용
   npm install -g vercel
   vercel
   ```

### 7.2 Cloudflare Workers 배포 (선택)

정적 에셋을 Cloudflare에 배포하여 전 세계 엣지 서버에서 제공:

#### 사전 준비:

```bash
# Wrangler CLI 설치
npm install -g wrangler

# Cloudflare 로그인
wrangler login
```

#### `wrangler.toml` 생성:

```toml
name = "chatbot-saas"
compatibility_date = "2024-01-01"

[site]
bucket = "./.next/static"
```

#### 배포:

```bash
# 프로덕션 빌드
npm run build

# Cloudflare에 배포
wrangler publish
```

### 7.3 도메인 연결

#### Vercel:

1. Vercel 대시보드 > **Settings > Domains**
2. 도메인 추가 (예: `chatbot.yourdomain.com`)
3. DNS 레코드 설정:
   ```
   Type: CNAME
   Name: chatbot
   Value: cname.vercel-dns.com
   ```

#### Cloudflare:

1. Cloudflare 대시보드 > **DNS**
2. A 레코드 추가:
   ```
   Type: A
   Name: @
   Value: [Worker IP]
   Proxy: Enabled (오렌지 클라우드)
   ```

### 7.4 Paddle Webhook 설정

배포 완료 후 Paddle 웹훅 URL 업데이트:

1. Paddle 대시보드 > **Developer Tools > Webhooks**
2. Webhook URL 수정:
   ```
   https://your-domain.com/api/webhooks/paddle
   ```
3. 테스트 웹훅 전송으로 확인

---

## 8. 문제 해결

### 8.1 일반적인 문제

#### "Module not found" 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 환경 변수가 로드되지 않음

- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 개발 서버 재시작: `Ctrl+C` 후 `npm run dev`
- 환경 변수 이름이 정확한지 확인 (`NEXT_PUBLIC_` 접두사 필요 여부)

#### Supabase 연결 오류

```bash
# Supabase URL과 키 확인
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 브라우저 콘솔에서 확인
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

#### OpenAI API 오류

- API 키 형식 확인 (`sk-proj-` 또는 `sk-` 시작)
- OpenAI 계정의 사용 한도 및 잔액 확인
- API 키 권한 확인 (models, chat.completions 접근)

### 8.2 데이터베이스 문제

#### RLS (Row Level Security) 오류

```sql
-- Supabase SQL Editor에서 RLS 정책 확인
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- 테이블별 RLS 활성화 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### 벡터 검색이 작동하지 않음

```sql
-- pgvector 확장 확인
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 임베딩 인덱스 확인
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'documents' AND indexname LIKE '%embedding%';
```

### 8.3 빌드 오류

#### TypeScript 타입 오류

```bash
# 타입 체크
npm run build

# 타입 체크만
npx tsc --noEmit
```

#### 메모리 부족 오류

```bash
# Node.js 메모리 증가
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### 8.4 도움 받기

- **GitHub Issues**: 프로젝트 저장소의 Issues 탭
- **Supabase 문서**: https://supabase.com/docs
- **Next.js 문서**: https://nextjs.org/docs
- **OpenAI 문서**: https://platform.openai.com/docs

---

## 📚 추가 리소스

### 공식 문서
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Paddle Documentation](https://developer.paddle.com/getting-started)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 학습 자료
- [Next.js Learn](https://nextjs.org/learn)
- [Supabase Tutorial](https://supabase.com/docs/guides/getting-started)
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook)

### 커뮤니티
- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com)

---

## ✅ 체크리스트

배포 전 확인사항:

- [ ] 모든 환경 변수가 설정됨
- [ ] 데이터베이스 스키마가 적용됨
- [ ] 로컬에서 정상 작동 확인
- [ ] 프로덕션 환경 변수 설정 완료
- [ ] Paddle/Stripe 웹훅 설정 완료
- [ ] 도메인 연결 완료
- [ ] SSL/HTTPS 적용 확인
- [ ] 에러 추적 (Sentry 등) 설정
- [ ] 성능 모니터링 설정

---

**설정 완료! 🎉**

문제가 발생하면 위의 [문제 해결](#8-문제-해결) 섹션을 참고하세요.
