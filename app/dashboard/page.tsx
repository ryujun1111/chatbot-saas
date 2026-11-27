'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Bot, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Plus,
  Settings,
  LogOut
} from 'lucide-react';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string>('demo@example.com');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push('/login');
  };

  if (loading) {
    return (
      <>
        <div className="bg-blob bg-blob-blue"></div>
        <div className="bg-blob bg-blob-purple"></div>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Background Blobs */}
      <div className="bg-blob bg-blob-blue"></div>
      <div className="bg-blob bg-blob-purple"></div>

      <div className="min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 md:gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-lg opacity-75"></div>
                  <Bot className="relative w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ChatBot AI
                </span>
              </Link>
              <div className="flex items-center gap-2 md:gap-4">
                <span className="hidden md:block text-sm text-gray-400">{userEmail}</span>
                <button 
                  onClick={handleLogout}
                  className="btn-secondary text-xs md:text-sm px-3 md:px-6 py-2 md:py-2.5 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <section className="relative pt-20 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20 px-4 md:px-6">
          <div className="container mx-auto max-w-7xl">
            {/* Welcome Section */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-sm md:text-base text-gray-400">
                Manage your AI chatbots and analyze conversations
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
              {/* Stat Card 1 */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg md:rounded-xl border border-white/10 p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                  </div>
                  <span className="text-xs md:text-sm text-gray-400">Total Chatbots</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">12</div>
                <div className="text-xs md:text-sm text-green-400">+2 this month</div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg md:rounded-xl border border-white/10 p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
                  </div>
                  <span className="text-xs md:text-sm text-gray-400">Total Chats</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">2,547</div>
                <div className="text-xs md:text-sm text-green-400">+23% this week</div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg md:rounded-xl border border-white/10 p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                  </div>
                  <span className="text-xs md:text-sm text-gray-400">Active Users</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">892</div>
                <div className="text-xs md:text-sm text-green-400">+15% this week</div>
              </div>

              {/* Stat Card 4 */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-lg md:rounded-xl border border-white/10 p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                  </div>
                  <span className="text-xs md:text-sm text-gray-400">Avg Response</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">1.2s</div>
                <div className="text-xs md:text-sm text-green-400">-0.3s faster</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <Link href="/try" className="block">
                  <button className="w-full flex items-center gap-3 p-4 md:p-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg md:rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                    <Plus className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    <div className="text-left">
                      <div className="text-sm md:text-base font-semibold text-white">Create Chatbot</div>
                      <div className="text-xs text-white/80">From your website</div>
                    </div>
                  </button>
                </Link>

                <button className="w-full flex items-center gap-3 p-4 md:p-5 bg-gray-700/50 rounded-lg md:rounded-xl hover:bg-gray-700 transition-all duration-300">
                  <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                  <div className="text-left">
                    <div className="text-sm md:text-base font-semibold text-white">View Analytics</div>
                    <div className="text-xs text-gray-400">See performance</div>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 p-4 md:p-5 bg-gray-700/50 rounded-lg md:rounded-xl hover:bg-gray-700 transition-all duration-300">
                  <Settings className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  <div className="text-left">
                    <div className="text-sm md:text-base font-semibold text-white">Settings</div>
                    <div className="text-xs text-gray-400">Configure your bots</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Chatbots */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 p-4 md:p-6 lg:p-8">
              <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Recent Chatbots</h2>
              <div className="space-y-3 md:space-y-4">
                {/* Chatbot 1 */}
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg md:rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm md:text-base font-semibold text-white">Support Bot</div>
                      <div className="text-xs md:text-sm text-gray-400">234 conversations</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-xs md:text-sm text-green-400">Active</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Chatbot 2 */}
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg md:rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm md:text-base font-semibold text-white">Sales Bot</div>
                      <div className="text-xs md:text-sm text-gray-400">156 conversations</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-xs md:text-sm text-green-400">Active</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>

                {/* Chatbot 3 */}
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg md:rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm md:text-base font-semibold text-white">FAQ Bot</div>
                      <div className="text-xs md:text-sm text-gray-400">89 conversations</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline text-xs md:text-sm text-green-400">Active</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
