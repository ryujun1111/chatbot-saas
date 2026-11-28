"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface CrawlResult {
  url: string;
  title: string;
  pages: number;
  content: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MAX_MESSAGES = 5;

export default function ResultPage() {
  const router = useRouter();
  const [crawlResult, setCrawlResult] = useState<CrawlResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    // The /try page stores what it read from the website in sessionStorage
    const saved = sessionStorage.getItem("crawlResult");
    if (!saved) {
      router.push("/try");
      return;
    }
    const result: CrawlResult = JSON.parse(saved);
    setCrawlResult(result);
    setMessages([
      {
        role: "assistant",
        content: `Hi! I'm an AI assistant trained on ${result.title || "your website"}. Ask me anything about it. (Up to ${MAX_MESSAGES} questions in this demo)`,
      },
    ]);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real AI answer from the crawled content (/api/try, rate-limited per IP)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!crawlResult || !input.trim() || userMessageCount >= MAX_MESSAGES)
      return;

    const question = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/try", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          title: crawlResult.title,
          content: crawlResult.content,
          message: question,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || data.error || "Sorry, something went wrong.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTryAnother = () => {
    sessionStorage.removeItem("crawlResult");
    router.push("/try");
  };

  if (!crawlResult) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            🎉 Your chatbot is ready!
          </h1>
          <p className="text-gray-600 mb-4">
            It has read <strong>{crawlResult.title || "your website"}</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 break-all">
            <span>📍 {crawlResult.url}</span>
            <span>
              📄 {crawlResult.pages} page{crawlResult.pages === 1 ? "" : "s"} ·{" "}
              {crawlResult.content.split(/\s+/).length.toLocaleString()} words
            </span>
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            {userMessageCount < MAX_MESSAGES ? (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about the website..."
                  maxLength={500}
                  aria-label="Your question"
                  className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="shrink-0 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">
                  You&apos;ve reached the free demo limit ({MAX_MESSAGES}{" "}
                  questions).
                </p>
                <button
                  onClick={() => router.push("/signup")}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Sign up to keep chatting
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 text-center">
              {userMessageCount}/{MAX_MESSAGES} questions used
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleTryAnother}
            className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            Try another website
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create my chatbot for free
          </button>
        </div>
      </div>
    </div>
  );
}
