# Chat API 사용 가이드

## 엔드포인트
```
POST /api/chat
```

## 요청 형식

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "chatbotId": "uuid-string",
  "message": "사용자 질문"
}
```

### 파라미터
- `chatbotId` (string, 필수): 챗봇 ID
- `message` (string, 필수): 사용자 질문

## 응답 형식

### 성공 (200)
```json
{
  "answer": "AI가 생성한 답변",
  "sources": ["출처1", "출처2", "출처3"]
}
```

### 오류 (400)
```json
{
  "error": "chatbotId와 message는 필수입니다"
}
```

### 오류 (500)
```json
{
  "error": "답변 생성 중 오류가 발생했습니다",
  "details": "상세 오류 메시지"
}
```

## 사용 예제

### JavaScript (Fetch API)
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    chatbotId: 'your-chatbot-uuid',
    message: '안녕하세요, 무엇을 도와드릴까요?',
  }),
})

const data = await response.json()
console.log('답변:', data.answer)
console.log('출처:', data.sources)
```

### React 컴포넌트 예제
```tsx
'use client'
import { useState } from 'react'

export default function ChatInterface({ chatbotId }: { chatbotId: string }) {
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbotId, message }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setAnswer(data.answer)
      } else {
        console.error('오류:', data.error)
      }
    } catch (error) {
      console.error('요청 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="질문을 입력하세요"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? '처리 중...' : '전송'}
        </button>
      </form>
      {answer && (
        <div>
          <h3>답변:</h3>
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}
```

### cURL
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "chatbotId": "your-chatbot-uuid",
    "message": "안녕하세요"
  }'
```

## RAG 처리 흐름

1. **질문 임베딩 생성**
   - OpenAI `text-embedding-3-small` 모델 사용
   - 질문을 1536차원 벡터로 변환

2. **벡터 검색**
   - Supabase에서 코사인 유사도 기반 검색
   - 유사도 임계값: 0.5 이상
   - 상위 3개 문서 반환

3. **답변 생성**
   - 검색된 문서를 컨텍스트로 사용
   - GPT-4o-mini 모델로 답변 생성
   - Temperature: 0.7

4. **응답 반환**
   - 생성된 답변과 출처 정보 반환

## 필수 환경 변수

```env
# OpenAI
OPENAI_API_KEY=sk-your-api-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase 설정

API가 작동하려면 Supabase에 다음이 필요합니다:

1. **pgvector 확장 활성화**
2. **documents 테이블** (embedding 컬럼 포함)
3. **match_documents 함수** (벡터 검색용)

자세한 SQL은 `docs/supabase-vector-search.sql` 참조
