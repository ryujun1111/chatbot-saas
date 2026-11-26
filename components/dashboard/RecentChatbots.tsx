'use client';

import { Bot, MoreVertical, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Chatbot {
  id: string;
  name: string;
  description: string;
  messagesCount: number;
  lastActive: string;
  status: 'active' | 'inactive';
}

// Mock data - 실제로는 API에서 가져옴
const mockChatbots: Chatbot[] = [
  {
    id: '1',
    name: '고객 지원 봇',
    description: '일반적인 고객 문의에 답변합니다',
    messagesCount: 1234,
    lastActive: '2시간 전',
    status: 'active',
  },
  {
    id: '2',
    name: '제품 안내 봇',
    description: '제품 정보와 사양을 제공합니다',
    messagesCount: 856,
    lastActive: '1일 전',
    status: 'active',
  },
  {
    id: '3',
    name: '예약 봇',
    description: '예약 및 일정 관리를 도와줍니다',
    messagesCount: 432,
    lastActive: '3일 전',
    status: 'inactive',
  },
];

export default function RecentChatbots() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">최근 챗봇</h3>
          <Link
            href="/dashboard/chatbots"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            모두 보기
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {mockChatbots.map((chatbot) => (
          <div
            key={chatbot.id}
            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {chatbot.name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        chatbot.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {chatbot.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{chatbot.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>💬 {chatbot.messagesCount.toLocaleString()} 메시지</span>
                    <span>🕒 {chatbot.lastActive}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {mockChatbots.length === 0 && (
        <div className="p-12 text-center">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">아직 생성된 챗봇이 없습니다</p>
          <Link
            href="/dashboard/chatbots/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Bot className="w-4 h-4" />
            첫 챗봇 만들기
          </Link>
        </div>
      )}
    </div>
  );
}
