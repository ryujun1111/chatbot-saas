'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/auth';
import { Button, Input, Alert } from '@/components/ui';
import { Bot, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { user, error } = await signIn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    if (user) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-bg items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Bot className="w-12 h-12 text-primary-600" />
            <span className="text-3xl font-display font-bold gradient-text">ChatBot AI</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome Back!
          </h1>
          <p className="text-xl text-gray-600">
            Sign in to continue managing your AI-powered chatbots and customer support.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Powered</h3>
                <p className="text-sm text-gray-600">GPT-4 technology</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">24/7 Support</h3>
                <p className="text-sm text-gray-600">Always available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <Bot className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-display font-bold gradient-text">ChatBot AI</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign In
            </h2>
            <p className="text-gray-600">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <Alert variant="error">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
