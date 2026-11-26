'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Bot, 
  Loader2, 
  Edit, 
  Trash2, 
  Copy, 
  Check,
  Code,
  MessageSquare,
  Globe,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  ThumbsUp,
  Eye,
  EyeOff
} from 'lucide-react';

interface Chatbot {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  website_url?: string;
  initial_message: string;
  color: string;
  model: 'gpt-4o-mini' | 'deepseek-chat';
  temperature: number;
  max_tokens: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export default function ChatbotDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showFullCode, setShowFullCode] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChatbot();
    }
  }, [id]);

  const fetchChatbot = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chatbots/${id}`);
      
      if (!response.ok) {
        throw new Error('챗봇을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setChatbot(data.chatbot);
    } catch (error) {
      console.error('챗봇 조회 오류:', error);
      router.push('/dashboard/chatbots');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!chatbot || !confirm(`"${chatbot.name}" 챗봇을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('챗봇 삭제에 실패했습니다');
      }

      router.push('/dashboard/chatbots');
    } catch (error) {
      console.error('챗봇 삭제 오류:', error);
      alert('챗봇 삭제에 실패했습니다');
    }
  };

  const handleToggleStatus = async () => {
    if (!chatbot) return;

    const newStatus = chatbot.status === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다');
      }

      const data = await response.json();
      setChatbot(data.chatbot);
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경에 실패했습니다');
    }
  };

  const getEmbedCode = () => {
    if (!chatbot) return '';
    
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `<!-- 챗봇 위젯 -->
<script>
  window.chatbotConfig = {
    chatbotId: "${chatbot.id}",
    color: "${chatbot.color}"
  };
</script>
<script src="${baseUrl}/widget.js" defer></script>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!chatbot) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/dashboard/chatbots"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            챗봇 목록으로
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: chatbot.color }}
              >
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{chatbot.name}</h1>
                {chatbot.description && (
                  <p className="mt-1 text-gray-600">{chatbot.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  chatbot.status === 'active'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {chatbot.status === 'active' ? (
                  <>
                    <Eye className="w-4 h-4 inline mr-1" />
                    활성
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 inline mr-1" />
                    비활성
                  </>
                )}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                삭제
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 챗봇 정보 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                챗봇 정보
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">챗봇 ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                      {chatbot.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">상태</label>
                    <p className="mt-1">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          chatbot.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {chatbot.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </p>
                  </div>
                </div>

                {chatbot.website_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      웹사이트 URL
                    </label>
                    <a
                      href={chatbot.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:underline block"
                    >
                      {chatbot.website_url}
                    </a>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    초기 메시지
                  </label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {chatbot.initial_message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI 모델
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {chatbot.model === 'gpt-4o-mini' ? 'GPT-4o Mini' : 'DeepSeek Chat'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">테마 색상</label>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: chatbot.color }}
                      />
                      <span className="text-sm text-gray-900 font-mono">{chatbot.color}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">창의성 (Temperature)</label>
                    <p className="mt-1 text-sm text-gray-900">{chatbot.temperature}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">최대 토큰 수</label>
                    <p className="mt-1 text-sm text-gray-900">{chatbot.max_tokens}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="text-sm font-medium text-gray-700">생성일</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(chatbot.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">최종 수정일</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(chatbot.updated_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 임베드 코드 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                임베드 코드
              </h2>
              
              <p className="text-sm text-gray-600 mb-4">
                아래 코드를 웹사이트의 <code className="px-2 py-1 bg-gray-100 rounded">&lt;/body&gt;</code> 태그 직전에 삽입하세요
              </p>

              <div className="relative">
                <pre className={`bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto ${
                  !showFullCode && 'max-h-32'
                }`}>
                  <code>{getEmbedCode()}</code>
                </pre>
                {!showFullCode && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent rounded-b-lg" />
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      복사됨!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      코드 복사
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowFullCode(!showFullCode)}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  {showFullCode ? '접기' : '전체 보기'}
                </button>
              </div>
            </div>
          </div>

          {/* 사이드바 - 통계 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                사용량 통계
              </h2>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">전체 대화</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500 mt-1">아직 대화가 없습니다</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">전체 메시지</span>
                    <MessageSquare className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500 mt-1">아직 메시지가 없습니다</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">평균 응답 시간</span>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                  <p className="text-xs text-gray-500 mt-1">데이터 없음</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">만족도</span>
                    <ThumbsUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">-</p>
                  <p className="text-xs text-gray-500 mt-1">데이터 없음</p>
                </div>
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h2>
              
              <div className="space-y-2">
                <Link
                  href={`/dashboard/chatbots/${chatbot.id}/edit`}
                  className="block w-full px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors text-center"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  설정 수정
                </Link>
                <Link
                  href={`/dashboard/chatbots/${chatbot.id}/conversations`}
                  className="block w-full px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors text-center"
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  대화 내역
                </Link>
                <Link
                  href={`/test-chat?chatbotId=${chatbot.id}`}
                  target="_blank"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  테스트하기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
