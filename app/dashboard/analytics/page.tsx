'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { 
  MessageSquare, 
  Bot, 
  Clock, 
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Users
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalMessages: number;
    monthMessages: number;
    activeChatbots: number;
    avgResponseTime: number;
  };
  charts: {
    daily: Array<{ date: string; count: number; label: string }>;
    chatbots: Array<{ name: string; count: number }>;
    hourly: Array<{ hour: number; count: number; label: string }>;
  };
  topQuestions: Array<{ question: string; count: number }>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#14b8a6', '#84cc16'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('30');
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">사용량 통계</h1>
              <p className="text-gray-600 mt-1">챗봇 성능 및 사용 현황을 한눈에 확인하세요</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('7')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === '7'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                7일
              </button>
              <button
                onClick={() => setPeriod('30')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === '30'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                30일
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="container-custom py-8">
        {/* 주요 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 총 메시지 수 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">총 메시지 수</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.totalMessages.toLocaleString()}
                  </p>
                  <p className="text-xs text-success-600 mt-2">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    전체 기간
                  </p>
                </div>
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 이번 달 메시지 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">이번 달 메시지</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.monthMessages.toLocaleString()}
                  </p>
                  <p className="text-xs text-success-600 mt-2">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    이번 달
                  </p>
                </div>
                <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-success-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 활성 챗봇 수 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">활성 챗봇</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.activeChatbots}
                  </p>
                  <p className="text-xs text-primary-600 mt-2">
                    <Bot className="w-3 h-3 inline mr-1" />
                    운영 중
                  </p>
                </div>
                <div className="w-14 h-14 bg-warning-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-7 h-7 text-warning-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 평균 응답 시간 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">평균 응답 시간</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatResponseTime(data.summary.avgResponseTime)}
                  </p>
                  <p className="text-xs text-success-600 mt-2">
                    <Clock className="w-3 h-3 inline mr-1" />
                    빠른 응답
                  </p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 일별 메시지 추이 */}
          <Card>
            <CardHeader>
              <CardTitle>일별 메시지 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.charts.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 챗봇별 사용량 */}
          <Card>
            <CardHeader>
              <CardTitle>챗봇별 메시지 수</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.charts.chatbots}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 시간대별 분포 & 인기 질문 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 시간대별 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>시간대별 메시지 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.charts.hourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#6b7280"
                    fontSize={10}
                    interval={2}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 인기 질문 TOP 10 */}
          <Card>
            <CardHeader>
              <CardTitle>인기 질문 TOP 10</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {data.topQuestions.length > 0 ? (
                  data.topQuestions.map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 line-clamp-2">{item.question}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.count}회 질문됨</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    데이터가 충분하지 않습니다
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 플랜 사용량 */}
        <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary-600" />
              현재 플랜 사용량
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">메시지 사용량</span>
                  <span className="text-sm font-bold text-gray-900">
                    {data.summary.monthMessages.toLocaleString()} / 10,000
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      (data.summary.monthMessages / 10000) * 100 > 90 
                        ? 'bg-red-500' 
                        : (data.summary.monthMessages / 10000) * 100 > 70 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((data.summary.monthMessages / 10000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {((data.summary.monthMessages / 10000) * 100).toFixed(1)}% 사용 중
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">현재 플랜</p>
                  <p className="text-lg font-bold text-gray-900">Pro Plan</p>
                </div>
                <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                  업그레이드
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
