'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function WidgetPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const chatbotId = params.chatbotId as string;
  const [config, setConfig] = useState<{ name: string; color: string } | null>(null);
  const primaryColor = searchParams.get('color') || config?.color || '#3B82F6';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId] = useState(() => 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11));

  // Load the chatbot's public config (name, color, welcome message)
  useEffect(() => {
    fetch(`/api/chat?chatbotId=${encodeURIComponent(chatbotId)}`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) setConfig({ name: d.name, color: d.color });
        setMessages([{ id: '1', role: 'assistant', timestamp: new Date(),
          content: ok ? d.initialMessage : (d.error || 'This chatbot is not available.') }]);
      })
      .catch(() => setMessages([{ id: '1', role: 'assistant', timestamp: new Date(), content: 'Connection error.' }]));
  }, [chatbotId]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatbotId,
          message: userMessage.content,
          sessionId,
          history: messages.slice(1).slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || data.error || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-6 py-4 text-white shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">💬</div>
          <div>
            <h1 className="font-semibold text-lg">{config?.name || 'Chat with us'}</h1>
            <p className="text-xs opacity-90">We typically reply instantly</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                message.role === 'user'
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
              style={
                message.role === 'user'
                  ? { backgroundColor: primaryColor }
                  : {}
              }
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-white/70' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2.5 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm text-gray-900"
            aria-label="Message"
            disabled={isLoading}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 rounded-full text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md text-sm"
            style={{ 
              backgroundColor: primaryColor,
              opacity: !inputValue.trim() || isLoading ? 0.5 : 1
            }}
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          Powered by ChatBot AI
        </p>
      </div>
    </div>
  );
}
