# ChatBot Widget 사용 가이드

## 📦 생성된 파일

### 1. `/public/widget.js`
- **역할**: 웹사이트에 임베드되는 위젯 스크립트
- **크기**: ~5.4KB
- **기능**:
  - 플로팅 채팅 버튼 생성
  - iframe으로 채팅 UI 로드
  - 열기/닫기 애니메이션
  - 색상 커스터마이징
  - 반응형 디자인

### 2. `/app/widget/[chatbotId]/page.tsx`
- **역할**: iframe 내부에서 보여지는 채팅 UI
- **크기**: ~6.3KB
- **기능**:
  - 메시지 송수신
  - 실시간 채팅 인터페이스
  - 로딩 상태 표시
  - API 연동 (/api/chat)

### 3. `/components/EmbedCodeGenerator.tsx`
- **역할**: 대시보드에서 사용할 임베드 코드 생성기
- **크기**: ~4.8KB
- **기능**:
  - 임베드 코드 생성
  - 색상 선택기
  - 위치 선택 (우측/좌측)
  - 코드 복사 기능
  - 위젯 미리보기

### 4. `/public/test-widget.html`
- **역할**: 위젯 테스트 페이지
- **크기**: ~4.2KB
- **접속**: http://localhost:3000/test-widget.html

---

## 🚀 사용 방법

### 1. 기본 설치

웹사이트의 `</body>` 태그 바로 위에 다음 코드를 추가:

```html
<script src="https://your-domain.com/widget.js" 
        data-chatbot-id="your-chatbot-id" 
        data-color="#3B82F6">
</script>
```

### 2. 옵션 설정

#### 필수 옵션
- `data-chatbot-id`: 챗봇 ID (필수)

#### 선택 옵션
- `data-color`: 주 색상 (기본값: `#3B82F6`)
- `data-position`: 위치 (기본값: `bottom-right`)
  - `bottom-right`: 우측 하단
  - `bottom-left`: 좌측 하단

### 3. 예제 코드

```html
<!-- 기본 (파란색, 우측 하단) -->
<script src="https://your-domain.com/widget.js" 
        data-chatbot-id="abc123">
</script>

<!-- 커스텀 색상 (보라색, 좌측 하단) -->
<script src="https://your-domain.com/widget.js" 
        data-chatbot-id="abc123" 
        data-color="#667eea"
        data-position="bottom-left">
</script>

<!-- 녹색, 우측 하단 -->
<script src="https://your-domain.com/widget.js" 
        data-chatbot-id="abc123" 
        data-color="#10b981">
</script>
```

---

## 🎨 위젯 디자인

### 플로팅 버튼
```
┌─────────┐
│   💬    │  ← 60x60px 원형 버튼
└─────────┘
```

### 채팅 윈도우
```
┌────────────────────────┐
│ 💬 Chat with us        │ ← 헤더 (커스텀 색상)
│ We typically reply...  │
├────────────────────────┤
│                        │
│ Hi! How can I help... │ ← AI 메시지 (회색)
│                        │
│        Hello!          │ ← 사용자 메시지 (커스텀 색상)
│                        │
├────────────────────────┤
│ Type your message...   │ ← 입력창
│                  [Send]│
└────────────────────────┘
380x600px (데스크톱)
전체 화면 (모바일)
```

---

## 🔧 대시보드 통합

`EmbedCodeGenerator` 컴포넌트를 대시보드에 추가:

```tsx
import EmbedCodeGenerator from '@/components/EmbedCodeGenerator';

// 챗봇 상세 페이지에서
<EmbedCodeGenerator 
  chatbotId={chatbot.id}
  defaultColor="#3B82F6"
/>
```

---

## 📱 반응형 디자인

### 데스크톱 (> 480px)
- 위젯 크기: 380 x 600px
- 버튼 크기: 60 x 60px
- 위치: 화면 가장자리에서 20px

### 모바일 (≤ 480px)
- 위젯 크기: 전체 화면 - 20px 여백
- 버튼 크기: 56 x 56px
- 위치: 화면 가장자리에서 10px

---

## ⌨️ 키보드 단축키

- **ESC**: 채팅창 닫기
- **Enter**: 메시지 전송
- **Shift + Enter**: 줄바꿈 (현재는 단일 줄)

---

## 🔗 API 연동

위젯은 `/api/chat` 엔드포인트로 메시지를 전송합니다:

### 요청 형식
```json
{
  "chatbotId": "abc123",
  "message": "Hello",
  "history": [
    {
      "id": "1",
      "role": "user",
      "content": "Hi",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 응답 형식
```json
{
  "message": "Hello! How can I help you?"
}
```

---

## 🧪 테스트

### 로컬 테스트
1. 개발 서버 실행: `npm run dev`
2. 테스트 페이지 접속: http://localhost:3000/test-widget.html
3. 우측 하단 💬 버튼 클릭
4. 메시지 입력 및 전송 테스트

### 프로덕션 배포 전 체크리스트
- [ ] 위젯 버튼이 정상적으로 표시되는가?
- [ ] 클릭 시 채팅창이 열리는가?
- [ ] 메시지 전송이 작동하는가?
- [ ] API 응답이 정상적으로 표시되는가?
- [ ] 모바일에서 정상 작동하는가?
- [ ] 색상 커스터마이징이 적용되는가?
- [ ] ESC 키로 닫히는가?

---

## 🎯 다음 단계

1. **API 엔드포인트 구현**
   - `/api/chat` 라우트 생성
   - OpenAI API 연동
   - 대화 히스토리 관리

2. **대시보드 통합**
   - 챗봇 목록 페이지에 임베드 코드 섹션 추가
   - `EmbedCodeGenerator` 컴포넌트 사용

3. **고급 기능 추가**
   - 파일 업로드
   - 이미지 전송
   - 대화 히스토리 저장
   - 오프라인 메시지 큐

4. **스타일 커스터마이징**
   - 폰트 선택
   - 버튼 크기 조절
   - 환영 메시지 커스터마이징
   - 브랜딩 추가

---

## 📄 파일 구조

```
chatbot-saas/
├── public/
│   ├── widget.js           ✅ 위젯 스크립트
│   └── test-widget.html    ✅ 테스트 페이지
├── app/
│   └── widget/
│       └── [chatbotId]/
│           └── page.tsx    ✅ iframe 채팅 UI
├── components/
│   └── EmbedCodeGenerator.tsx  ✅ 코드 생성기
└── docs/
    └── WIDGET_GUIDE.md     ✅ 이 문서
```

---

## 💡 추가 정보

- 위젯은 iframe을 사용하여 메인 웹사이트와 완전히 격리됩니다
- 스타일 충돌이 발생하지 않습니다
- 위젯 로딩이 메인 사이트 성능에 영향을 주지 않습니다
- CORS 설정이 필요할 수 있습니다 (프로덕션 환경)

---

**작성일**: 2024-11-26  
**버전**: 1.0.0
