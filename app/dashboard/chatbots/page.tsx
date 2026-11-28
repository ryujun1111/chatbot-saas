'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Bot, 
  Edit, 
  Trash2, 
  ExternalLink,
  Loader2,
  MessageSquare,
  Globe,
  Filter,
  Sparkles
} from 'lucide-react';

interface Chatbot {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  website_url?: string;
  initial_message: string;
  color: string;
  model: 'gpt-4o-mini' | 'deepseek-chat';
  temperature: number;
  max_tokens: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export default function ChatbotsPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load once; search and status filtering happen client-side
  useEffect(() => {
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chatbots');
      
      if (!response.ok) {
        throw new Error('Failed to load chatbots');
      }

      const data = await response.json();
      setChatbots(data.chatbots || []);
    } catch (error) {
      console.error('Chatbot list error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Its knowledge base and conversation history will be permanently deleted.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chatbot');
      }

      await fetchChatbots();
    } catch (error) {
      console.error('Chatbot delete error:', error);
      alert('Failed to delete chatbot');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredChatbots = chatbots.filter(chatbot => {
    const matchesSearch = 
      chatbot.name.toLowerCase().includes(search.toLowerCase()) ||
      (chatbot.description && chatbot.description.toLowerCase().includes(search.toLowerCase()));
    
    return matchesSearch && (statusFilter === 'all' || chatbot.status === statusFilter);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 text-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Bot className="w-8 h-8 text-blue-600" />
                My Chatbots
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your chatbots, knowledge and embed codes
              </p>
            </div>
            <Link
              href="/dashboard/chatbots/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Chatbot
            </Link>
          </div>
        </div>

        {/* Search & filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description..."
              aria-label="Search chatbots"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              aria-label="Filter by status"
              className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : filteredChatbots.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {search || statusFilter !== 'all' 
                ? 'No matching chatbots'
                : 'No chatbots yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {search || statusFilter !== 'all'
                ? 'Try a different search or filter'
                : 'Create your first chatbot and train it on your website'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link
                href="/dashboard/chatbots/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Chatbot
              </Link>
            )}
          </div>
        ) : (
          /* Chatbot cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChatbots.map((chatbot) => (
              <div
                key={chatbot.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Card header */}
                <div 
                  className="p-6 rounded-t-xl"
                  style={{ backgroundColor: `${chatbot.color}15` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: chatbot.color }}
                    >
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          chatbot.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {chatbot.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {chatbot.name}
                  </h3>
                  {chatbot.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {chatbot.description}
                    </p>
                  )}
                </div>

                {/* Card body */}
                <div className="p-6 space-y-3">
                  {/* Website URL */}
                  {chatbot.website_url && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <a
                        href={chatbot.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 truncate"
                      >
                        {chatbot.website_url}
                      </a>
                    </div>
                  )}

                  {/* Welcome message */}
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="line-clamp-2">{chatbot.initial_message}</p>
                  </div>

                  {/* AI model */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {chatbot.model === 'gpt-4o-mini' ? 'GPT-4o Mini' : 'DeepSeek Chat'}
                    </span>
                  </div>

                  {/* Created */}
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                    Created {new Date(chatbot.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Card actions */}
                <div className="p-6 pt-0 flex gap-2">
                  <Link
                    href={`/dashboard/chatbots/${chatbot.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    <ExternalLink className="w-4 h-4 inline mr-1" />
                    Manage
                  </Link>
                  <button
                    onClick={() => handleDelete(chatbot.id, chatbot.name)}
                    disabled={deletingId === chatbot.id}
                    aria-label={`Delete ${chatbot.name}`}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === chatbot.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        {!loading && chatbots.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total chatbots</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{chatbots.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {chatbots.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <p className="text-3xl font-bold text-gray-600 mt-1">
                    {chatbots.filter(c => c.status === 'inactive').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
