'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Alert } from '@/components/ui';
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

      // 결과 페이지로 이동
      router.push('/try/result');
      
    } catch (err) {
      console.error('Crawl error:', err);
      setError(err instanceof Error ? err.message : 'Failed to build chatbot');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Bot className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-display font-bold gradient-text">ChatBot AI</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="gradient-bg section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-6 animate-slide-down">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">No Signup Required</span>
              </div>
              
              <h1 className="mb-6 animate-slide-up">
                Turn Your Website <br />
                <span className="gradient-text">Into an AI Chatbot</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.1s'}}>
                Enter your website URL and try it in minutes. No credit card required.
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-large p-8 md:p-12 mb-12 animate-scale-in">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  disabled={isLoading}
                  error={error}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={isLoading}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {isLoading ? 'Building Your Chatbot...' : 'Build My AI Chatbot'}
                </Button>

                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span>No signup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span>Free to try</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Setup</h3>
                <p className="text-gray-600 text-sm">
                  We'll crawl your website and create a chatbot in minutes
                </p>
              </div>

              <div className="card text-center">
                <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-7 h-7 text-success-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
                <p className="text-gray-600 text-sm">
                  Uses GPT-4 to understand and answer questions accurately
                </p>
              </div>

              <div className="card text-center">
                <div className="w-14 h-14 bg-warning-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-warning-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Commitment</h3>
                <p className="text-gray-600 text-sm">
                  Try before you buy. See results immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
