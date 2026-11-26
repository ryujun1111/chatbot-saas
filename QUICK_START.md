# 🚀 대시보드 빠른 시작 가이드

## 즉시 실행하기

```bash
cd C:\Users\1\OneDrive\Desktop\WebProjects\chatbot-saas
npm run dev
```

그런 다음 브라우저에서 http://localhost:3000/dashboard 를 열어보세요!

## 🎨 구현된 기능

### 1️⃣ 사이드바 네비게이션
- **홈** (Home) - 메인 대시보드
- **챗봇** (Chatbots) - 챗봇 관리
- **문서** (Documents) - 문서 관리
- **통계** (Analytics) - 성과 분석
- **설정** (Settings) - 환경 설정

### 2️⃣ 상단 헤더
- 모바일 메뉴 버튼 (햄버거 아이콘)
- 검색 바 (데스크톱에서만 표시)
- 알림 버튼 (빨간 점 표시)
- 사용자 프로필 드롭다운
  - 프로필 보기
  - 설정 이동
  - 로그아웃

### 3️⃣ 메인 대시보드
- **환영 메시지** - 사용자 이름으로 개인화
- **통계 카드 4개**
  - 총 챗봇: 12개 (↑ +2)
  - 총 대화: 2,547개 (↑ +23%)
  - 활성 사용자: 1,234명 (↑ +12%)
  - 응답률: 94.5% (↑ +2.1%)
- **빠른 액션 3개**
  - 새 챗봇 만들기 (그라디언트 버튼)
  - 문서 업로드
  - 통계 보기
- **최근 챗봇 목록**
  - 고객 지원 봇
  - 제품 안내 봇
  - 예약 봇
- **시작 가이드**
  - 4단계 온보딩 프로세스

## 📱 반응형 테스트

### 데스크톱 모드 (1920px)
1. 사이드바가 왼쪽에 고정됨
2. 통계 카드가 4열로 표시
3. 모든 기능 완전히 보임

### 태블릿 모드 (768px)
1. 사이드바 토글 가능
2. 통계 카드가 2열로 표시
3. 검색바 보임

### 모바일 모드 (375px)
1. 햄버거 메뉴 버튼 표시
2. 사이드바가 오버레이로 슬라이드
3. 통계 카드가 1열로 스택
4. 검색바 숨김

## 🎯 테스트 체크리스트

```
✅ 로그인 후 대시보드 접근
✅ 사이드바 메뉴 클릭
✅ 모바일 메뉴 열기/닫기
✅ 사용자 드롭다운 클릭
✅ 로그아웃 작동
✅ 모든 링크 라우팅
✅ 반응형 레이아웃 (3가지 화면 크기)
✅ 호버 애니메이션
✅ 그라디언트 효과
```

## 🔧 커스터마이징 방법

### 색상 변경
`tailwind.config.js`에서 색상 팔레트 수정:
```js
colors: {
  primary: '#3B82F6',  // Blue
  secondary: '#6366F1', // Indigo
}
```

### 메뉴 항목 추가
`components/dashboard/Sidebar.tsx`의 `menuItems` 배열 수정:
```typescript
const menuItems = [
  { icon: Home, label: '홈', href: '/dashboard' },
  { icon: Star, label: '즐겨찾기', href: '/dashboard/favorites' }, // 새 항목
  // ...
];
```

### 통계 데이터 변경
`app/dashboard/page.tsx`의 StatCard 컴포넌트 props 수정:
```tsx
<StatCard
  title="새 메트릭"
  value="999"
  icon={YourIcon}
  trend={{ value: '+50%', isPositive: true }}
  color="blue"
/>
```

## 🐛 문제 해결

### 개발 서버가 시작되지 않는 경우
```bash
# 종속성 재설치
npm install

# 캐시 삭제
rm -rf .next
npm run dev
```

### TypeScript 오류
```bash
# 타입 체크
npm run build
```

### 스타일이 적용되지 않는 경우
```bash
# Tailwind 재컴파일
npm run dev
```

## 📚 더 알아보기

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

---

**🎉 완료! 이제 멋진 대시보드를 사용할 수 있습니다!**
