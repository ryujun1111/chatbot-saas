'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { Button, Input, Alert } from '@/components/ui';
import { Bot, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { user, error } = await signUp(email, password);

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
            Start Building Today
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses using AI chatbots to transform their customer support.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-success-600" />
              <span className="text-gray-700">No credit card required</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-success-600" />
              <span className="text-gray-700">Free trial included</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-success-600" />
              <span className="text-gray-700">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-success-600" />
              <span className="text-gray-700">24/7 support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <Bot className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-display font-bold gradient-text">ChatBot AI</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Free Trial Available</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Start building your AI chatbot in minutes
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
                helperText="We'll never share your email"
              />

              <Input
                type="password"
                label="Password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                helperText="Minimum 6 characters"
              />
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
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary-600 hover:text-primary-700"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                By signing up, you agree to our{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">Terms</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
