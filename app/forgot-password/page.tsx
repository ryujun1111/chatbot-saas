'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Alert } from '@/components/ui';
import { Bot, Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  // 랜덤 임시 비밀번호 생성 (8자)
  const generateTempPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // localStorage에서 사용자 찾기
      const usersData = localStorage.getItem('users');
      if (!usersData) {
        setError('No users found. Please sign up first.');
        setLoading(false);
        return;
      }

      const users = JSON.parse(usersData);
      const userIndex = users.findIndex((u: any) => u.email === email);

      if (userIndex === -1) {
        setError('Email not found. Please check your email or sign up.');
        setLoading(false);
        return;
      }

      // 임시 비밀번호 생성
      const newTempPassword = generateTempPassword();
      
      // localStorage 업데이트
      users[userIndex].password = newTempPassword;
      localStorage.setItem('users', JSON.stringify(users));

      setTempPassword(newTempPassword);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
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
              {success ? 'Check Your Password' : 'Reset Password'}
            </h2>
            <p className="text-gray-600">
              {success 
                ? 'Your password has been reset successfully'
                : 'Enter your email to receive a temporary password'
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
              <Alert variant="success" title="Password Reset Successful!">
                <div className="mt-3">
                  <p className="mb-3">Your temporary password is:</p>
                  <div className="p-4 bg-white rounded-lg border-2 border-success-300">
                    <div className="font-mono text-2xl font-bold text-gray-900 text-center tracking-wider">
                      {tempPassword}
                    </div>
                  </div>
                  <p className="mt-4 text-sm">
                    Please save this password and use it to sign in.
                    <br />
                    <span className="text-xs text-gray-600">(In production, this will be sent to your email)</span>
                  </p>
                </div>
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
