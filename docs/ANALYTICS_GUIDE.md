# 사용량 통계 및 분석 대시보드 가이드

## 📊 개요

챗봇 성능과 사용 현황을 실시간으로 모니터링할 수 있는 종합 분석 대시보드입니다.

## ✅ 완료된 작업

### 1. **통계 API 엔드포인트** (`/app/api/analytics/route.ts`)
   - GET `/api/analytics?period=7` (7일 또는 30일)
   - GET `/api/analytics?chatbotId=xxx` (특정 챗봇 필터)
   
   **제공 데이터:**
   - 총 메시지 수
   - 이번 달 메시지
   - 활성 챗봇 수
   - 평균 응답 시간
   - 일별/시간대별 메시지 분포
   - 챗봇별 사용량
   - 인기 질문 TOP 10

### 2. **분석 대시보드 페이지** (`/app/dashboard/analytics/page.tsx`)
   
   **주요 기능:**
   - ✅ 4개의 주요 지표 카드 (색상 코딩)
   - ✅ 일별 메시지 추이 (LineChart)
   - ✅ 챗봇별 사용량 (BarChart)
   - ✅ 시간대별 분포 (BarChart)
   - ✅ 인기 질문 TOP 10 리스트
   - ✅ 플랜 사용량 진행 바 (Green/Yellow/Red 색상)
   - ✅ 반응형 디자인
   - ✅ 로딩 스켈레톤

### 3. **차트 라이브러리** (Recharts)
   - ✅ 설치 완료 (`npm install recharts`)
   - ✅ LineChart (일별 추이)
   - ✅ BarChart (챗봇별, 시간대별)
   - ✅ 반응형 컨테이너
   - ✅ 커스텀 색상 및 스타일

## 🎨 UI/UX 특징

### 주요 지표 카드
- **총 메시지 수**: 전체 기간 메시지 (파란색)
- **이번 달 메시지**: 현재 월 메시지 (초록색)
- **활성 챗봇**: 운영 중인 챗봇 수 (주황색)
- **평균 응답 시간**: 응답 속도 (보라색)

### 차트
1. **일별 메시지 추이**
   - LineChart로 트렌드 시각화
   - 7일/30일 필터 지원

2. **챗봇별 메시지 수**
   - BarChart로 비교
   - 상위 10개 챗봇

3. **시간대별 분포**
   - 24시간 활동 패턴
   - 피크 타임 파악

4. **인기 질문 TOP 10**
   - 순위 뱃지
   - 질문 빈도 표시

### 플랜 사용량
- 진행 바로 사용률 시각화
- 색상 코딩:
  - 🟢 Green: 0-70%
  - 🟡 Yellow: 70-90%
  - 🔴 Red: 90-100%
- 업그레이드 버튼

## 🔧 사용 방법

### 1. 접속
```
http://localhost:3000/dashboard/analytics
```

### 2. 기간 필터 선택
- **7일**: 최근 1주일 데이터
- **30일**: 최근 1개월 데이터

### 3. API 직접 호출
```javascript
// 30일 전체 통계
GET /api/analytics?period=30

// 7일 + 특정 챗봇
GET /api/analytics?period=7&chatbotId=abc123
```

### 4. 응답 형식
```json
{
  "summary": {
    "totalMessages": 1234,
    "monthMessages": 567,
    "activeChatbots": 3,
    "avgResponseTime": 1500
  },
  "charts": {
    "daily": [...],
    "chatbots": [...],
    "hourly": [...]
  },
  "topQuestions": [...]
}
```

## 📋 필요한 데이터베이스 테이블

### messages 테이블
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chatbot_id UUID REFERENCES chatbots(id),
  content TEXT,
  role VARCHAR(20), -- 'user' or 'assistant'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### chatbots 테이블
```sql
CREATE TABLE chatbots (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 테스트 방법

### 1. 개발 서버 실행
```bash
cd C:\Users\1\OneDrive\Desktop\WebProjects\chatbot-saas
npm run dev
```

### 2. 브라우저에서 확인
```
http://localhost:3000/dashboard/analytics
```

### 3. API 직접 테스트
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/analytics?period=30" -Method GET

# 또는 브라우저에서
http://localhost:3000/api/analytics?period=30
```

## 🎯 주요 기능 체크리스트

- [x] 통계 API 엔드포인트
- [x] 주요 지표 카드 4개
- [x] 일별 메시지 LineChart
- [x] 챗봇별 사용량 BarChart
- [x] 시간대별 분포 BarChart
- [x] 인기 질문 TOP 10
- [x] 플랜 사용량 진행 바
- [x] 7일/30일 필터
- [x] 반응형 디자인
- [x] 로딩 스켈레톤
- [x] 색상 코딩 (Green/Yellow/Red)

## 🛠️ 추가 개선 가능 사항

1. **실시간 업데이트**
   - WebSocket 또는 Polling으로 자동 갱신

2. **CSV/Excel 내보내기**
   - 통계 데이터 다운로드 기능

3. **고급 필터**
   - 날짜 범위 커스텀 선택
   - 여러 챗봇 비교

4. **알림 설정**
   - 메시지 한도 도달 시 알림
   - 성능 저하 감지

5. **A/B 테스트**
   - 챗봇 버전별 성능 비교

## 📝 참고사항

- Recharts는 반응형으로 자동 조정됩니다
- 모든 차트는 마우스 호버 시 상세 정보 표시
- 색상 테마는 Tailwind CSS 기반
- API는 Supabase RLS 정책을 따릅니다

## 🔒 보안

- 로그인 필요 (getCurrentUser 체크)
- API는 서버 사이드에서만 Supabase 접근
- 사용자는 자신의 챗봇 데이터만 조회 가능

## 📞 문의

추가 기능이나 버그 수정이 필요하면 개발팀에 문의하세요.
