"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react";

interface LogEntry {
  id: string;
  session_id: string;
  question: string | null;
  answer: string | null;
  response_ms: number | null;
  created_at: string;
}

// Recent visitor questions and the chatbot's answers (latest 200)
export default function ConversationsPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<LogEntry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/chatbots/${id}/messages`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) =>
        ok
          ? setMessages(d.messages)
          : setError(d.error || "Failed to load conversations"),
      )
      .catch(() => setError("Failed to load conversations"));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/dashboard/chatbots/${id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to chatbot
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          Conversation History
        </h1>
        <p className="text-gray-600 mb-8">
          The latest questions visitors asked and how your chatbot answered.
        </p>

        {error && (
          <p className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </p>
        )}
        {!messages && !error && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}
        {messages?.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-600">
            No conversations yet. Install the chatbot on your website or test it
            to see messages here.
          </div>
        )}

        <div className="space-y-4">
          {messages?.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>Visitor {m.session_id.slice(-6)}</span>
                <span>
                  {new Date(m.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {m.response_ms
                    ? ` · ${(m.response_ms / 1000).toFixed(1)}s`
                    : ""}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-2 whitespace-pre-wrap break-words">
                Q: {m.question}
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap break-words">
                {m.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
