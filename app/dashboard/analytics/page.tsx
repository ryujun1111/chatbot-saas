'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    uniqueVisitors: number;
  };
  usage: { planName: string; used: number; limit: number };
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

  // The proxy already blocks logged-out visitors; a 401 here means the session expired
  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?period=${period}`);
      if (response.status === 401) return router.replace('/login?next=/dashboard/analytics');
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">Could not load analytics.</p>
        </div>
      </div>
    );
  }

  const usagePct = data.usage.limit ? Math.min((data.usage.used / data.usage.limit) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">← Back to Dashboard</Link>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-1">How visitors use your chatbots</p>
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
                7 days
              </button>
              <button
                onClick={() => setPeriod('30')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === '30'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                30 days
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total messages */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total messages</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.totalMessages.toLocaleString()}
                  </p>
                  <p className="text-xs text-success-600 mt-2">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    All time
                  </p>
                </div>
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-primary-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This month */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Messages this month</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.monthMessages.toLocaleString()}
                  </p>
                  <p className="text-xs text-success-600 mt-2">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {data.usage.used.toLocaleString()} / {data.usage.limit.toLocaleString()} plan quota
                  </p>
                </div>
                <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-success-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active chatbots */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active chatbots</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.activeChatbots}
                  </p>
                  <p className="text-xs text-primary-600 mt-2">
                    <Bot className="w-3 h-3 inline mr-1" />
                    {data.summary.uniqueVisitors.toLocaleString()} visitors in period
                  </p>
                </div>
                <div className="w-14 h-14 bg-warning-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-7 h-7 text-warning-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avg response time */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg response time</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {data.summary.avgResponseTime ? formatResponseTime(data.summary.avgResponseTime) : '-'}
                  </p>
                  <p className="text-xs text-success-600 mt-2">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Selected period
                  </p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily messages */}
          <Card>
            <CardHeader>
              <CardTitle>Messages per day</CardTitle>
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

          {/* Per chatbot */}
          <Card>
            <CardHeader>
              <CardTitle>Messages by chatbot</CardTitle>
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

        {/* Hourly & top questions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hourly */}
          <Card>
            <CardHeader>
              <CardTitle>Messages by hour (UTC)</CardTitle>
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

          {/* Top questions */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 questions</CardTitle>
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
                        <p className="text-xs text-gray-500 mt-1">Asked {item.count} time{item.count === 1 ? '' : 's'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No questions yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan usage */}
        <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary-600" />
              Plan usage this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Messages</span>
                  <span className="text-sm font-bold text-gray-900">
                    {data.usage.used.toLocaleString()} / {data.usage.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePct > 90 ? 'bg-red-500' : usagePct > 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">{usagePct.toFixed(1)}% used</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Current plan</p>
                  <p className="text-lg font-bold text-gray-900">{data.usage.planName}</p>
                </div>
                <Link href="/dashboard/settings?tab=billing" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                  Upgrade
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
