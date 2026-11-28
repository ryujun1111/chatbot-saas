"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Loader2,
  Edit,
  Trash2,
  Copy,
  Check,
  Code,
  MessageSquare,
  Globe,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Chatbot } from "@/lib/types/chatbot";

interface Stats {
  totalMessages: number;
  uniqueVisitors: number;
  avgResponseTime: number;
}

export default function ChatbotDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [sourceCount, setSourceCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Chatbot settings, 90-day stats and knowledge source count
  useEffect(() => {
    if (!id) return;
    Promise.all([
      fetch(`/api/chatbots/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/analytics?period=90&chatbotId=${id}`).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch(`/api/documents?chatbot_id=${id}`).then((r) =>
        r.ok ? r.json() : null,
      ),
    ]).then(([bot, analytics, docs]) => {
      if (!bot?.chatbot) {
        router.push("/dashboard/chatbots");
        return;
      }
      setChatbot(bot.chatbot);
      if (analytics) setStats(analytics.summary);
      setSourceCount(docs?.documents?.length ?? 0);
      setLoading(false);
    });
  }, [id, router]);

  const handleDelete = async () => {
    if (
      !chatbot ||
      !confirm(
        `Delete "${chatbot.name}"? Its knowledge base and conversation history will be permanently deleted.`,
      )
    )
      return;
    const response = await fetch(`/api/chatbots/${id}`, { method: "DELETE" });
    if (response.ok) router.push("/dashboard/chatbots");
    else alert("Failed to delete chatbot");
  };

  const handleToggleStatus = async () => {
    if (!chatbot) return;
    const response = await fetch(`/api/chatbots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: chatbot.status === "active" ? "inactive" : "active",
      }),
    });
    if (response.ok) setChatbot((await response.json()).chatbot);
    else alert("Failed to change status");
  };

  // One-line embed snippet; the widget loads name/color/greeting from the API
  const embedCode = chatbot
    ? `<script src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js" data-chatbot-id="${chatbot.id}" defer></script>`
    : "";

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatMs = (ms: number) =>
    ms ? (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`) : "-";
  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading || !chatbot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 text-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/chatbots"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to chatbots
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: chatbot.color }}
              >
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
                  {chatbot.name}
                </h1>
                {chatbot.description && (
                  <p className="mt-1 text-gray-600">{chatbot.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleStatus}
                title={
                  chatbot.status === "active"
                    ? "Click to take the chatbot offline"
                    : "Click to put the chatbot online"
                }
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  chatbot.status === "active"
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {chatbot.status === "active" ? (
                  <>
                    <Eye className="w-4 h-4 inline mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 inline mr-1" />
                    Inactive
                  </>
                )}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {sourceCount === 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-yellow-800">
              This chatbot has no knowledge yet, so it can&apos;t answer
              questions about your business. Train it on your website first.
            </p>
            <Link
              href={`/dashboard/chatbots/${id}/documents`}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 text-center whitespace-nowrap"
            >
              Add knowledge
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Embed code */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Install on your website
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Paste this code into your website&apos;s HTML, just before the
                closing{" "}
                <code className="px-2 py-1 bg-gray-100 rounded">
                  &lt;/body&gt;
                </code>{" "}
                tag. Works with WordPress, Shopify, Wix, Webflow and custom
                sites.
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap break-all">
                <code>{embedCode}</code>
              </pre>
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy code
                    </>
                  )}
                </button>
                <Link
                  href={`/widget/${chatbot.id}`}
                  target="_blank"
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center text-gray-700"
                >
                  Test chatbot
                </Link>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Chatbot settings
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Chatbot ID
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                      {chatbot.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <p className="mt-1">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                          chatbot.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {chatbot.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                </div>

                {chatbot.website_url && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website
                    </label>
                    <a
                      href={chatbot.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:underline block break-all"
                    >
                      {chatbot.website_url}
                    </a>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Welcome message
                  </label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {chatbot.initial_message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI model
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {chatbot.model === "gpt-4o-mini"
                        ? "GPT-4o mini"
                        : "DeepSeek Chat"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Theme color
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: chatbot.color }}
                      />
                      <span className="text-sm text-gray-900 font-mono">
                        {chatbot.color}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Creativity (temperature)
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {chatbot.temperature}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Max answer length
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {chatbot.max_tokens} tokens
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Created
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(chatbot.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Last updated
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(chatbot.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Usage (last 90 days)
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Visitors</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats?.uniqueVisitors ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Messages</span>
                    <MessageSquare className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats?.totalMessages ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Avg response time
                    </span>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatMs(stats?.avgResponseTime ?? 0)}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Knowledge sources
                    </span>
                    <BookOpen className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {sourceCount ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Quick actions
              </h2>
              <div className="space-y-2">
                <Link
                  href={`/dashboard/chatbots/${chatbot.id}/documents`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Knowledge base
                </Link>
                <Link
                  href={`/dashboard/chatbots/${chatbot.id}/edit`}
                  className="block w-full px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors text-center"
                >
                  <Edit className="w-4 h-4 inline mr-2" />
                  Edit settings
                </Link>
                <Link
                  href={`/dashboard/chatbots/${chatbot.id}/conversations`}
                  className="block w-full px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors text-center"
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Conversation history
                </Link>
                <Link
                  href={`/widget/${chatbot.id}`}
                  target="_blank"
                  className="block w-full px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors text-center"
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Test chatbot
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
