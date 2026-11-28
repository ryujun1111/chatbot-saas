"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, ArrowRight, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Same dark card layout as /login and /reset-password
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Sends a Supabase password-reset email that links back to /reset-password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await createClient().auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 lg:p-10">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Bot className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ChatBot AI
            </span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {success ? "Check Your Email" : "Reset Password"}
            </h2>
            <p className="text-sm md:text-base text-gray-400">
              {success
                ? "If an account exists for this email, we sent a link to set a new password. Check your spam folder too."
                : "Enter your email and we will send you a reset link."}
            </p>
          </div>

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {error && (
                <div
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                  role="alert"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? "Sending..." : "Send Reset Link"}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}

          <div className="text-center pt-6 mt-6 border-t border-white/10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
