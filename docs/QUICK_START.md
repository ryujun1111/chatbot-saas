# 문서 업로드 기능 빠른 시작 가이드

## 🚀 5분 안에 시작하기

### 1단계: 데이터베이스 설정 (1분)

1. [Supabase 대시보드](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New Query** 버튼 클릭
5. `docs/supabase-documents-schema.sql` 파일 내용 복사 & 붙여넣기
6. **Run** 버튼 클릭
7. ✅ "Success. No rows returned" 메시지 확인

### 2단계: 환경 변수 확인 (1분)

`.env.local` 파일에 다음 변수가 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3단계: 개발 서버 실행 (1분)

```bash
# 패키지가 이미 설치되어 있음
npm run dev
```

### 4단계: 문서 업로드 페이지 접속 (1분)

1. 브라우저에서 `http://localhost:3000` 접속
2. 로그인
3. 챗봇 생성 또는 기존 챗봇 선택
4. URL을 `/dashboard/chatbots/[챗봇ID]/documents`로 변경
5. 🎉 문서 업로드 페이지 도착!

### 5단계: 첫 문서 업로드 (1분)

#### 방법 1: 텍스트 입력 (가장 빠름)
1. **"텍스트 입력"** 탭 클릭
2. 제목: "테스트 문서"
3. 내용: "안녕하세요. 이것은 테스트 문서입니다."
4. **"텍스트 추가"** 버튼 클릭
5. ✅ 완료!

#### 방법 2: 파일 업로드
1. **"파일 업로드"** 탭 클릭
2. PDF/DOCX/TXT 파일 드래그 앤 드롭
3. ✅ 완료!

#### 방법 3: URL 크롤링
1. **"URL 크롤링"** 탭 클릭
2. URL 입력 (예: https://example.com)
3. **"URL 추가"** 버튼 클릭
4. ✅ 완료!

## 📊 확인하기

### 문서 목록 확인
- 아래로 스크롤하면 업로드한 문서 목록 표시
- 상태: **처리 중** → **완료** (몇 초 소요)
- 청크 수: 임베딩 조각 개수

### 데이터베이스 확인
Supabase SQL Editor에서:

```sql
-- 문서 확인
SELECT id, title, status, chunk_count 
FROM documents 
ORDER BY created_at DESC 
LIMIT 5;

-- 임베딩 확인
SELECT id, content, chunk_index
FROM document_chunks 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🎯 다음 단계

### 문서 관리
- 🔍 검색창에 키워드 입력하여 문서 찾기
- 🗑️ 휴지통 아이콘 클릭하여 문서 삭제

### 챗봇 테스트
1. 챗봇 테스트 페이지로 이동
2. 업로드한 문서 내용 관련 질문하기
3. 챗봇이 문서 기반 답변 생성 확인

### 더 많은 문서 추가
- PDF 파일 여러 개 업로드
- 웹사이트 여러 페이지 크롤링
- 긴 텍스트 입력

## ⚡ 문제 해결

### "파일 크기는 10MB 이하여야 합니다"
→ 더 작은 파일을 사용하거나 텍스트를 복사해서 직접 입력

### "URL 크롤링에 실패했습니다"
→ 다른 URL 시도 (예: Wikipedia, 블로그)

### 문서 목록이 비어있음
→ 페이지 새로고침 (F5)

### 임베딩 생성 실패
→ OpenAI API 키 확인 및 할당량 확인

## 📚 더 자세한 정보

- 전체 기능 설명: `docs/DOCUMENTS_FEATURE.md`
- 테스트 가이드: `docs/TESTING_GUIDE.md`
- 완성 보고서: `DOCUMENT_UPLOAD_COMPLETION_REPORT.md`

## 💡 팁

1. **작은 파일부터 시작**: 첫 테스트는 1-2페이지 PDF나 짧은 텍스트
2. **처리 시간**: 작은 문서는 5-10초, 큰 문서는 1-2분 소요
3. **청크 수**: 500자당 1청크, 많을수록 검색 정확도 향상
4. **API 비용**: 문서 1,000자당 약 $0.0001 (OpenAI 임베딩)

## 🎉 축하합니다!

문서 업로드 기능을 성공적으로 사용하셨습니다!

이제 챗봇에 지식을 추가하여 더 똑똑하게 만들 수 있습니다.
