'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Bot, 
  Edit, 
  Trash2, 
  ExternalLink,
  Loader2,
  MessageSquare,
  Globe,
  Filter,
  Sparkles
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

export default function ChatbotsPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchChatbots();
  }, [search, statusFilter]);

  const fetchChatbots = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/chatbots?${params}`);
      
      if (!response.ok) {
        throw new Error('챗봇을 불러오는데 실패했습니다');
      }

      const data = await response.json();
      setChatbots(data.chatbots || []);
    } catch (error) {
      console.error('챗봇 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 챗봇을 정말 삭제하시겠습니까?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('챗봇 삭제에 실패했습니다');
      }

      // 목록 새로고침
      await fetchChatbots();
    } catch (error) {
      console.error('챗봇 삭제 오류:', error);
      alert('챗봇 삭제에 실패했습니다');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredChatbots = chatbots.filter(chatbot => {
    const matchesSearch = 
      chatbot.name.toLowerCase().includes(search.toLowerCase()) ||
      (chatbot.description && chatbot.description.toLowerCase().includes(search.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Bot className="w-8 h-8 text-blue-600" />
                내 챗봇
              </h1>
              <p className="mt-2 text-gray-600">
                생성한 챗봇을 관리하고 설정을 변경하세요
              </p>
            </div>
            <Link
              href="/dashboard/chatbots/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              새 챗봇 만들기
            </Link>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* 검색 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="챗봇 이름 또는 설명으로 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 상태 필터 */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>

        {/* 로딩 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredChatbots.length === 0 ? (
          /* 빈 상태 */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {search || statusFilter !== 'all' 
                ? '검색 결과가 없습니다' 
                : '아직 챗봇이 없습니다'}
            </h3>
            <p className="text-gray-600 mb-6">
              {search || statusFilter !== 'all'
                ? '다른 검색어나 필터를 시도해보세요'
                : '첫 번째 챗봇을 만들어서 고객과 대화를 시작하세요'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link
                href="/dashboard/chatbots/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                새 챗봇 만들기
              </Link>
            )}
          </div>
        ) : (
          /* 챗봇 목록 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChatbots.map((chatbot) => (
              <div
                key={chatbot.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* 카드 헤더 */}
                <div 
                  className="p-6 rounded-t-xl"
                  style={{ backgroundColor: `${chatbot.color}15` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: chatbot.color }}
                    >
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          chatbot.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {chatbot.status === 'active' ? '활성' : '비활성'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {chatbot.name}
                  </h3>
                  {chatbot.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {chatbot.description}
                    </p>
                  )}
                </div>

                {/* 카드 내용 */}
                <div className="p-6 space-y-3">
                  {/* 웹사이트 URL */}
                  {chatbot.website_url && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <a
                        href={chatbot.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 truncate"
                      >
                        {chatbot.website_url}
                      </a>
                    </div>
                  )}

                  {/* 초기 메시지 */}
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="line-clamp-2">{chatbot.initial_message}</p>
                  </div>

                  {/* AI 모델 */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {chatbot.model === 'gpt-4o-mini' ? 'GPT-4o Mini' : 'DeepSeek Chat'}
                    </span>
                  </div>

                  {/* 생성일 */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    생성일: {new Date(chatbot.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>

                {/* 카드 액션 */}
                <div className="p-6 pt-0 flex gap-2">
                  <Link
                    href={`/dashboard/chatbots/${chatbot.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    <ExternalLink className="w-4 h-4 inline mr-1" />
                    상세보기
                  </Link>
                  <button
                    onClick={() => handleDelete(chatbot.id, chatbot.name)}
                    disabled={deletingId === chatbot.id}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === chatbot.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 통계 (선택사항) */}
        {!loading && chatbots.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 챗봇</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{chatbots.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">활성 챗봇</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {chatbots.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">비활성 챗봇</p>
                  <p className="text-3xl font-bold text-gray-600 mt-1">
                    {chatbots.filter(c => c.status === 'inactive').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
