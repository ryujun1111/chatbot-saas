# 문서 업로드 및 관리 기능

## 개요
이 기능은 챗봇에 학습시킬 문서를 업로드하고 관리할 수 있는 시스템입니다.

## 주요 기능

### 1. 문서 업로드
- **파일 업로드**: PDF, DOCX, TXT 파일 지원
- **URL 크롤링**: 웹페이지 URL을 입력하여 콘텐츠 추출
- **텍스트 직접 입력**: 텍스트를 직접 입력하여 추가
- **드래그 앤 드롭**: 파일을 드래그하여 업로드

### 2. 파일 처리
- 파일 크기 제한: 최대 10MB
- 텍스트 자동 추출
- 500자 단위로 청크 분할
- 자동 임베딩 생성

### 3. 문서 관리
- 문서 목록 조회
- 검색 기능
- 처리 상태 표시 (처리 중/완료/실패)
- 문서 삭제

### 4. 임베딩
- OpenAI text-embedding-3-small 모델 사용
- 1536차원 벡터
- Supabase 벡터 검색 지원

## 파일 구조

```
chatbot-saas/
├── app/
│   ├── api/
│   │   └── documents/
│   │       └── route.ts              # 문서 API (POST, GET, DELETE)
│   └── dashboard/
│       └── chatbots/
│           └── [id]/
│               └── documents/
│                   └── page.tsx      # 문서 관리 페이지
├── lib/
│   ├── file-parser.ts                # 파일 파싱 유틸리티
│   └── types/
│       └── document.ts               # 문서 타입 정의
└── docs/
    ├── supabase-documents-schema.sql # 데이터베이스 스키마
    └── DOCUMENTS_FEATURE.md          # 이 문서
```

## 설치 및 설정

### 1. 패키지 설치
이미 설치되었습니다:
```bash
npm install pdf-parse mammoth
```

### 2. Supabase 설정
`docs/supabase-documents-schema.sql` 파일의 SQL을 Supabase SQL Editor에서 실행하세요:
1. Supabase 대시보드 접속
2. SQL Editor 메뉴로 이동
3. 새 쿼리 생성
4. `supabase-documents-schema.sql` 내용 붙여넣기
5. 실행

### 3. 환경 변수
`.env.local` 파일에 다음 변수가 필요합니다:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API 엔드포인트

### POST /api/documents
문서 추가

**파일 업로드:**
```bash
# FormData로 전송
Content-Type: multipart/form-data

chatbot_id: string
title: string (optional)
file: File
```

**URL 크롤링:**
```bash
Content-Type: application/json

{
  "chatbot_id": "uuid",
  "source": "url",
  "url": "https://example.com"
}
```

**텍스트 입력:**
```bash
Content-Type: application/json

{
  "chatbot_id": "uuid",
  "source": "text",
  "title": "문서 제목",
  "content": "문서 내용..."
}
```

**응답:**
```json
{
  "success": true,
  "document": {
    "id": "uuid",
    "chatbot_id": "uuid",
    "title": "문서 제목",
    "status": "processing",
    ...
  }
}
```

### GET /api/documents?chatbot_id=xxx
문서 목록 조회

**응답:**
```json
{
  "success": true,
  "documents": [
    {
      "id": "uuid",
      "chatbot_id": "uuid",
      "title": "문서 제목",
      "status": "completed",
      "chunk_count": 15,
      ...
    }
  ]
}
```

### DELETE /api/documents?id=xxx
문서 삭제

**응답:**
```json
{
  "success": true
}
```

## 사용 방법

### 1. 문서 업로드 페이지 접속
```
/dashboard/chatbots/[chatbot_id]/documents
```

### 2. 문서 업로드
- **파일**: 파일 선택 또는 드래그 앤 드롭
- **URL**: URL 입력 후 "URL 추가" 버튼
- **텍스트**: 제목과 내용 입력 후 "텍스트 추가" 버튼

### 3. 처리 과정
1. 문서 업로드 (상태: processing)
2. 텍스트 추출
3. 청크 분할
4. 임베딩 생성
5. Supabase 저장 (상태: completed)

### 4. 에러 처리
- 처리 실패 시 상태가 'failed'로 변경
- 에러 메시지 표시
- 재업로드 가능

## 데이터베이스 구조

### documents 테이블
```sql
id              UUID (PK)
chatbot_id      UUID
title           TEXT
content         TEXT
source          TEXT ('file', 'url', 'text')
file_type       TEXT
url             TEXT
status          TEXT ('processing', 'completed', 'failed')
error_message   TEXT
chunk_count     INTEGER
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### document_chunks 테이블
```sql
id              UUID (PK)
document_id     UUID (FK)
chatbot_id      UUID
content         TEXT
embedding       vector(1536)
chunk_index     INTEGER
created_at      TIMESTAMP
```

## 벡터 검색

챗봇이 사용자 질문에 답할 때 관련 문서를 찾기 위해 벡터 검색을 사용합니다:

```sql
SELECT * FROM match_document_chunks(
  query_embedding := '[0.1, 0.2, ...]'::vector,
  match_threshold := 0.5,
  match_count := 5,
  p_chatbot_id := 'chatbot-uuid'
);
```

## 성능 최적화

1. **인덱스**
   - chatbot_id에 인덱스
   - 벡터 검색을 위한 ivfflat 인덱스

2. **청크 크기**
   - 500자로 설정 (조정 가능)
   - 너무 작으면: 검색 품질 저하
   - 너무 크면: 관련성 저하

3. **배치 처리**
   - 여러 청크의 임베딩을 한 번에 생성
   - API 호출 최소화

## 보안

1. **파일 검증**
   - 파일 크기 제한 (10MB)
   - 허용된 파일 타입만 허용
   - MIME 타입 검증

2. **URL 크롤링**
   - SSRF 방어
   - robots.txt 준수
   - Rate limiting

3. **RLS (Row Level Security)**
   - Supabase RLS 정책 적용
   - 사용자별 접근 제어

## 문제 해결

### 임베딩 생성 실패
- OpenAI API 키 확인
- API 할당량 확인
- 에러 로그 확인

### 파일 업로드 실패
- 파일 크기 확인 (10MB 이하)
- 파일 형식 확인 (PDF, DOCX, TXT)
- 브라우저 콘솔 확인

### 문서가 목록에 나타나지 않음
- Supabase 연결 확인
- RLS 정책 확인
- chatbot_id 확인

## 향후 개선 사항

- [ ] 더 많은 파일 형식 지원 (Excel, PPT 등)
- [ ] 대용량 파일 지원 (스트리밍 업로드)
- [ ] 문서 미리보기
- [ ] 문서 편집 기능
- [ ] 임베딩 재생성
- [ ] 문서 버전 관리
- [ ] 문서 카테고리/태그
- [ ] 일괄 업로드
