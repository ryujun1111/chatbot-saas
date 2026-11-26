'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface CrawlData {
  url: string;
  title: string;
  content: string;
}

interface CrawlResult {
  url: string;
  pages: CrawlData[];
  crawledAt: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ResultPage() {
  const router = useRouter();
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const MAX_MESSAGES = 5;
  const userMessageCount = messages.filter(m => m.role === 'user').length;

  useEffect(() => {
    // localStorage에서 크롤링 결과 가져오기
    const savedResult = localStorage.getItem('crawlResult');
    
    if (!savedResult) {
      // 크롤링 결과가 없으면 처음 페이지로 리다이렉트
      router.push('/try');
      return;
    }

    const result: CrawlResult = JSON.parse(savedResult);
    setCrawlResult(result);

    // 초기 환영 메시지
    setMessages([
      {
        role: 'assistant',
        content: `안녕하세요! ${result.pages[0]?.title || '웹사이트'}에 대한 AI 챗봇입니다. 무엇을 도와드릴까요? (최대 ${MAX_MESSAGES}개의 질문 가능)`
      }
    ]);
  }, [router]);

  useEffect(() => {
    // 메시지가 추가될 때마다 스크롤을 아래로
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = (userQuestion: string): string => {
    if (!crawlResult || !crawlResult.pages[0]) {
      return '죄송합니다. 웹사이트 정보를 불러올 수 없습니다.';
    }

    const content = crawlResult.pages[0].content.toLowerCase();
    const question = userQuestion.toLowerCase();

    // 간단한 키워드 기반 응답 (실제로는 OpenAI API를 사용해야 함)
    if (question.includes('무엇') || question.includes('what')) {
      return `${crawlResult.pages[0].title}는 다양한 정보를 제공하는 웹사이트입니다. 웹사이트에서 ${crawlResult.pages[0].content.substring(0, 150)}... 등의 내용을 확인하실 수 있습니다.`;
    }
    
    if (question.includes('연락') || question.includes('contact')) {
      if (content.includes('email') || content.includes('이메일')) {
        return '웹사이트에서 연락처 정보를 확인하실 수 있습니다. 자세한 내용은 웹사이트를 직접 방문해주세요.';
      }
    }

    // 기본 응답
    return `${userQuestion}에 대한 정보를 웹사이트에서 찾고 있습니다. 웹사이트에는 "${crawlResult.pages[0].title}" 관련 내용이 포함되어 있습니다. 더 자세한 정보가 필요하시면 ${crawlResult.url}를 방문해주세요.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || userMessageCount >= MAX_MESSAGES) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // 간단한 지연 후 응답 생성 (실제 AI처럼 보이게)
    setTimeout(() => {
      const response = generateResponse(userMessage.content);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleTryAnother = () => {
    localStorage.removeItem('crawlResult');
    router.push('/try');
  };

  if (!crawlResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            🎉 챗봇이 준비되었습니다!
          </h1>
          <p className="text-gray-600 mb-4">
            <strong>{crawlResult.pages[0]?.title || 'Website'}</strong>의 내용을 학습했습니다.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📍 {crawlResult.url}</span>
            <span>📄 {crawlResult.pages[0]?.content.split(/\s+/).length || 0} words</span>
          </div>
        </div>

        {/* 채팅 인터페이스 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 메시지 영역 */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="border-t p-4">
            {userMessageCount < MAX_MESSAGES ? (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  전송
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  무료 체험 한도에 도달했습니다. ({MAX_MESSAGES}개 질문)
                </p>
                <button
                  onClick={() => router.push('/signup')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  회원가입하고 계속 사용하기
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 text-center">
              {userMessageCount}/{MAX_MESSAGES} 질문 사용됨
            </p>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleTryAnother}
            className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            다른 웹사이트 시도하기
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            정식 버전 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
