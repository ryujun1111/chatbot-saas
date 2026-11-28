"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";

export interface ChatbotFormValues {
  name: string;
  description: string;
  website_url: string;
  initial_message: string;
  color: string;
  model: "gpt-4o-mini" | "deepseek-chat";
  temperature: number;
  max_tokens: number;
}

const DEFAULTS: ChatbotFormValues = {
  name: "",
  description: "",
  website_url: "",
  initial_message: "Hi! How can I help you today?",
  color: "#3B82F6",
  model: "gpt-4o-mini",
  temperature: 0.7,
  max_tokens: 500,
};

// Shared by "New chatbot" (POST) and "Edit chatbot" (PATCH)
export default function ChatbotForm({
  chatbotId,
  initial,
}: {
  chatbotId?: string;
  initial?: Partial<ChatbotFormValues>;
}) {
  const router = useRouter();
  const isEdit = !!chatbotId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ChatbotFormValues>({
    ...DEFAULTS,
    ...initial,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) }));
  };

  // Client-side checks for instant feedback (the server validates again)
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Please enter a chatbot name";
    else if (formData.name.length > 50)
      newErrors.name = "Name must be 50 characters or less";
    if (formData.description.length > 500)
      newErrors.description = "Description must be 500 characters or less";
    if (formData.website_url.trim()) {
      try {
        const u = new URL(formData.website_url.trim());
        if (!/^https?:$/.test(u.protocol)) throw new Error();
      } catch {
        newErrors.website_url =
          "Please enter a valid URL starting with https://";
      }
    }
    if (!formData.initial_message.trim())
      newErrors.initial_message = "Please enter a welcome message";
    else if (formData.initial_message.length > 500)
      newErrors.initial_message =
        "Welcome message must be 500 characters or less";
    if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color))
      newErrors.color = "Please enter a valid hex color (e.g. #3B82F6)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      const payload = { ...formData, website_url: formData.website_url.trim() };
      const response = await fetch(
        isEdit ? `/api/chatbots/${chatbotId}` : "/api/chatbots",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save chatbot");

      const id = data.chatbot.id;
      // New chatbot with a website: go straight to training on that website
      if (!isEdit && payload.website_url) {
        router.push(
          `/dashboard/chatbots/${id}/documents?crawl=${encodeURIComponent(payload.website_url)}`,
        );
      } else {
        router.push(`/dashboard/chatbots/${id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 text-gray-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={
              isEdit
                ? `/dashboard/chatbots/${chatbotId}`
                : "/dashboard/chatbots"
            }
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isEdit ? "Back to chatbot" : "Back to chatbots"}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            {isEdit ? "Edit Chatbot" : "Create a New Chatbot"}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit
              ? "Update how your chatbot looks and behaves"
              : "Enter your website URL and we will train the chatbot on its content"}
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <p className="text-red-600 text-sm">{error}</p>
            {error.includes("Upgrade") && (
              <Link
                href="/pricing"
                className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline"
              >
                See plans →
              </Link>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-8"
        >
          {/* Basics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basics</h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Chatbot name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass("name")}
                  placeholder="Customer Support Bot"
                  maxLength={50}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass("description")}
                  placeholder="What is this chatbot for? (only visible to you)"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="website_url"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Website URL
                </label>
                <input
                  type="url"
                  id="website_url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  className={inputClass("website_url")}
                  placeholder="https://example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {isEdit
                    ? "To re-train on your website, use the Knowledge Base page."
                    : "We will read up to 10 pages of this site to train your chatbot. You can add more content later."}
                </p>
                {errors.website_url && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.website_url}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Conversation
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="initial_message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Welcome message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="initial_message"
                  name="initial_message"
                  value={formData.initial_message}
                  onChange={handleChange}
                  rows={2}
                  className={inputClass("initial_message")}
                  placeholder="Hi! How can I help you today?"
                />
                {errors.initial_message && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.initial_message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="model"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  AI model
                </label>
                <select
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="gpt-4o-mini">GPT-4o mini (recommended)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Appearance
            </h2>
            <div>
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Theme color
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
                  aria-label="Theme color hex value"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="#3B82F6"
                />
              </div>
              {errors.color && (
                <p className="mt-1 text-sm text-red-600">{errors.color}</p>
              )}
            </div>
          </div>

          {/* Advanced */}
          <div className="mb-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Advanced
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="temperature"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Creativity (temperature): {formData.temperature}
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
                  Lower = more consistent answers, higher = more creative
                </p>
              </div>
              <div>
                <label
                  htmlFor="max_tokens"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Max answer length (tokens): {formData.max_tokens}
                </label>
                <input
                  type="range"
                  id="max_tokens"
                  name="max_tokens"
                  min="100"
                  max="2000"
                  step="100"
                  value={formData.max_tokens}
                  onChange={handleNumberChange}
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Limits how long each answer can be
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Chatbot"
              )}
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white mb-3"
              style={{ backgroundColor: formData.color }}
            >
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-sm font-medium">
                {formData.name || "Chatbot name"}
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
