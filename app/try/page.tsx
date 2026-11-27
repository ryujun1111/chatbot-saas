'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, Zap, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default function TryPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    // URL 형식 간단 검증
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setIsLoading(true);
    
    try {
      // 크롤링 API 호출
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to crawl website');
      }

      if (!data.success || !data.pages || data.pages.length === 0) {
        throw new Error('No content found on the website');
      }

      // 크롤링 결과를 localStorage에 저장
      localStorage.setItem('crawlResult', JSON.stringify({
        url,
        pages: data.pages,
        crawledAt: new Date().toISOString(),
      }));

      // 테스트 채팅 페이지로 이동
      router.push('/test-chat');
      
    } catch (err) {
      console.error('Crawl error:', err);
      setError(err instanceof Error ? err.message : 'Failed to build chatbot');
      setIsLoading(false);
    }
  };

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
                <Link href="/login" className="btn-secondary text-xs md:text-sm px-3 md:px-6 py-2 md:py-2.5">
                  Log In
                </Link>
                <Link href="/signup" className="btn-primary text-xs md:text-sm px-3 md:px-6 py-2 md:py-2.5">
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <section className="relative pt-20 md:pt-28 lg:pt-32 pb-12 md:pb-16 lg:pb-20 px-4 md:px-6">
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm mb-4 md:mb-6">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                <span className="text-xs md:text-sm text-gray-300">No Signup Required</span>
              </div>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Turn Your Website
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Into an AI Chatbot
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto">
                Enter your website URL and try it in minutes. No credit card required.
              </p>
            </div>

            {/* Form */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 p-6 md:p-8 lg:p-10 mb-8 md:mb-12">
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                {/* URL Input */}
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    disabled={isLoading}
                    required
                    className="w-full px-4 py-3 md:py-4 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm md:text-base text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  <span>{isLoading ? 'Building Your Chatbot...' : 'Build My AI Chatbot'}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />}
                </button>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-2 text-xs md:text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>No signup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Free to try</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-white/5 p-5 md:p-6 text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Zap className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">Instant Setup</h3>
                <p className="text-sm text-gray-400">
                  We'll crawl your website and create a chatbot in minutes
                </p>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-white/5 p-5 md:p-6 text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Bot className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-sm text-gray-400">
                  Uses DeepSeek R1 to understand and answer questions accurately
                </p>
              </div>

              <div className="bg-gray-800/30 backdrop-blur-xl rounded-xl border border-white/5 p-5 md:p-6 text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-green-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-2">No Commitment</h3>
                <p className="text-sm text-gray-400">
                  Try before you buy. See results immediately
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
