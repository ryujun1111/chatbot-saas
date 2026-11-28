'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Alert } from '@/components/ui';
import { Bot, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // Sends a Supabase password-reset email that links back to /reset-password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
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
            Need Help?
          </h1>
          <p className="text-xl text-gray-600">
            Don't worry, we'll help you reset your password and get you back to building amazing chatbots.
          </p>
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-sm text-gray-600">Get help anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
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
              {success ? 'Check Your Email' : 'Reset Password'}
            </h2>
            <p className="text-gray-600">
              {success 
                ? 'If an account exists for this email, we sent a reset link'
                : 'Enter your email and we will send you a reset link'
              }
            </p>
          </div>

          {!success ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

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
                {loading ? 'Processing...' : 'Reset Password'}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <Alert variant="success" title="Reset link sent">
                Check your inbox (and spam folder) for an email with a link to set a new password.
              </Alert>

              <Link href="/login">
                <Button
                  className="w-full"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Go to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
