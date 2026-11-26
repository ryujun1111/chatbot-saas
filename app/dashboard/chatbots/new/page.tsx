'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';

export default function NewChatbotPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website_url: '',
    initial_message: '안녕하세요! 무엇을 도와드릴까요?',
    color: '#3B82F6',
    model: 'deepseek-chat' as 'deepseek-chat' | 'gpt-4o-mini',
    temperature: 0.7,
    max_tokens: 1000,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '챗봇 이름을 입력해주세요';
    } else if (formData.name.length > 50) {
      newErrors.name = '챗봇 이름은 50자를 넘을 수 없습니다';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = '설명은 500자를 넘을 수 없습니다';
    }

    if (formData.website_url && formData.website_url.trim()) {
      try {
        new URL(formData.website_url);
      } catch {
        newErrors.website_url = '올바른 URL을 입력해주세요';
      }
    }

    if (!formData.initial_message.trim()) {
      newErrors.initial_message = '초기 메시지를 입력해주세요';
    } else if (formData.initial_message.length > 500) {
      newErrors.initial_message = '초기 메시지는 500자를 넘을 수 없습니다';
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = '올바른 색상 코드를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '챗봇 생성에 실패했습니다');
      }

      // 성공 시 챗봇 목록 페이지로 이동
      router.push('/dashboard/chatbots');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/dashboard/chatbots"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            챗봇 목록으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            새 챗봇 만들기
          </h1>
          <p className="mt-2 text-gray-600">
            챗봇의 기본 정보와 설정을 입력해주세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* 기본 정보 */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
            
            <div className="space-y-6">
              {/* 챗봇 이름 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  챗봇 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="고객 지원 챗봇"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* 설명 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="이 챗봇에 대한 간단한 설명을 입력하세요"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* 웹사이트 URL */}
              <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
                  웹사이트 URL
                </label>
                <input
                  type="url"
                  id="website_url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.website_url ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com"
                />
                {errors.website_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.website_url}</p>
                )}
              </div>
            </div>
          </div>

          {/* 대화 설정 */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">대화 설정</h2>
            
            <div className="space-y-6">
              {/* 초기 메시지 */}
              <div>
                <label htmlFor="initial_message" className="block text-sm font-medium text-gray-700 mb-2">
                  초기 메시지 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="initial_message"
                  name="initial_message"
                  value={formData.initial_message}
                  onChange={handleChange}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.initial_message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="안녕하세요! 무엇을 도와드릴까요?"
                />
                {errors.initial_message && (
                  <p className="mt-1 text-sm text-red-600">{errors.initial_message}</p>
                )}
              </div>

              {/* AI 모델 */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  AI 모델
                </label>
                <select
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="deepseek-chat">DeepSeek Chat (빠르고 저렴)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (높은 품질)</option>
                </select>
              </div>
            </div>
          </div>

          {/* UI 설정 */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">UI 설정</h2>
            
            <div className="space-y-6">
              {/* 색상 */}
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  테마 색상
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="h-12 w-24 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={handleChange}
                    name="color"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                )}
              </div>
            </div>
          </div>

          {/* 고급 설정 */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">고급 설정</h2>
            
            <div className="space-y-6">
              {/* Temperature */}
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                  창의성 (Temperature): {formData.temperature}
                </label>
                <input
                  type="range"
                  id="temperature"
                  name="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={handleNumberChange}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  낮을수록 일관된 답변, 높을수록 창의적인 답변
                </p>
              </div>

              {/* Max Tokens */}
              <div>
                <label htmlFor="max_tokens" className="block text-sm font-medium text-gray-700 mb-2">
                  최대 토큰 수: {formData.max_tokens}
                </label>
                <input
                  type="range"
                  id="max_tokens"
                  name="max_tokens"
                  min="100"
                  max="4000"
                  step="100"
                  value={formData.max_tokens}
                  onChange={handleNumberChange}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  답변의 최대 길이를 조절합니다
                </p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  생성 중...
                </>
              ) : (
                '챗봇 생성'
              )}
            </button>
          </div>
        </form>

        {/* 미리보기 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">미리보기</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white mb-3"
              style={{ backgroundColor: formData.color }}
            >
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-sm font-medium">
                {formData.name || '챗봇 이름'}
              </span>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-sm text-gray-800">
                {formData.initial_message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
