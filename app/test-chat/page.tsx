'use client'

import { useState } from 'react'

export default function TestChatPage() {
  const [chatbotId, setChatbotId] = useState('')
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [sources, setSources] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setAnswer('')
    setSources([])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatbotId,
          message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAnswer(data.answer)
        setSources(data.sources || [])
      } else {
        setError(data.error || '오류가 발생했습니다')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chat API 테스트</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">
              Chatbot ID
            </label>
            <input
              type="text"
              value={chatbotId}
              onChange={(e) => setChatbotId(e.target.value)}
              placeholder="챗봇 ID를 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              질문
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="질문을 입력하세요"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? '처리 중...' : '전송'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <h3 className="font-semibold text-red-800 mb-1">오류</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {answer && (
          <div className="space-y-4">
            <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-3">답변</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
            </div>

            {sources.length > 0 && (
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-3">출처</h3>
                <ul className="space-y-2">
                  {sources.map((source, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {source.startsWith('http') ? (
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {source}
                        </a>
                      ) : (
                        source
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">테스트 안내</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Chatbot ID: Supabase에 등록된 챗봇 UUID</li>
            <li>• 질문: 챗봇에게 물어볼 내용</li>
            <li>• API는 RAG 방식으로 관련 문서를 검색하여 답변합니다</li>
            <li>• 환경 변수가 올바르게 설정되어 있어야 합니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
