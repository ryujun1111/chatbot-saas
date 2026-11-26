'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import RecentChatbots from '@/components/dashboard/RecentChatbots';
import { 
  Bot, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Plus,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const user = getCurrentUser();
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    setUserEmail(user.email);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {userEmail.split('@')[0]}님! 👋
          </h1>
          <p className="text-gray-600">
            오늘도 멋진 하루 되세요. 대시보드에서 모든 것을 관리하세요.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="총 챗봇"
            value="12"
            icon={Bot}
            trend={{ value: '+2', isPositive: true }}
            color="blue"
          />
          <StatCard
            title="총 대화"
            value="2,547"
            icon={MessageSquare}
            trend={{ value: '+23%', isPositive: true }}
            color="green"
          />
          <StatCard
            title="활성 사용자"
            value="1,234"
            icon={Users}
            trend={{ value: '+12%', isPositive: true }}
            color="purple"
          />
          <StatCard
            title="응답률"
            value="94.5%"
            icon={TrendingUp}
            trend={{ value: '+2.1%', isPositive: true }}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/chatbots/new"
            className="group bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 hover:from-blue-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Plus className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-xl font-bold mb-2">새 챗봇 만들기</h3>
            <p className="text-blue-100 text-sm">
              AI 챗봇을 몇 분 안에 만들어보세요
            </p>
          </Link>

          <Link
            href="/dashboard/documents"
            className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">문서 업로드</h3>
            <p className="text-gray-600 text-sm">
              지식 베이스 파일을 추가하세요
            </p>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">통계 보기</h3>
            <p className="text-gray-600 text-sm">
              성과와 인사이트를 확인하세요
            </p>
          </Link>
        </div>

        {/* Recent Chatbots */}
        <div className="mb-8">
          <RecentChatbots />
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                시작 가이드
              </h3>
              <p className="text-gray-600">
                몇 가지 간단한 단계로 첫 번째 AI 챗봇을 만들어보세요
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">문서 업로드</h4>
                  <p className="text-sm text-gray-600">
                    PDF, TXT, DOCX 파일이나 웹사이트 URL을 업로드하세요
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">챗봇 설정</h4>
                  <p className="text-sm text-gray-600">
                    이름, 색상, 환영 메시지를 커스터마이징하세요
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">임베드 코드 받기</h4>
                  <p className="text-sm text-gray-600">
                    간단한 코드 한 줄로 웹사이트에 추가하세요
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">24/7 자동 응답</h4>
                  <p className="text-sm text-gray-600">
                    이제 챗봇이 자동으로 질문에 답변합니다!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="/dashboard/chatbots/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              지금 시작하기
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200"
            >
              문서 보기
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
