"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  FileText,
  Trash2,
  Link as LinkIcon,
  Check,
  Loader2,
  AlertCircle,
  Search,
  ChevronLeft,
} from "lucide-react";

interface KnowledgeSource {
  id: string;
  title: string;
  source: "file" | "url" | "text" | string;
  chunk_count: number;
  url?: string | null;
  created_at: string;
}

export default function DocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [documents, setDocuments] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [uploadType, setUploadType] = useState<"file" | "url" | "text">("url");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const autoCrawlStarted = useRef(false);

  const loadDocuments = useCallback(async () => {
    try {
      const response = await fetch(`/api/documents?chatbot_id=${chatbotId}`);
      const data = await response.json();
      if (data.success) setDocuments(data.documents);
      else if (response.status === 404) router.replace("/dashboard/chatbots");
    } finally {
      setLoading(false);
    }
  }, [chatbotId, router]);

  // Shared submit: crawling/embedding happens synchronously on the server, so success = ready to answer
  const submit = useCallback(
    async (init: RequestInit, successText: (d: any) => string) => {
      setUploading(true);
      setUploadError("");
      setUploadSuccess("");
      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          ...init,
        });
        const data = await response
          .json()
          .catch(() => ({
            success: false,
            error: "Request failed or timed out",
          }));
        if (!data.success) throw new Error(data.error || "Upload failed");
        setUploadSuccess(successText(data));
        await loadDocuments();
        return true;
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Upload failed",
        );
        return false;
      } finally {
        setUploading(false);
      }
    },
    [loadDocuments],
  );

  const crawlUrl = useCallback(
    (url: string) =>
      submit(
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatbot_id: chatbotId, source: "url", url }),
        },
        (d) =>
          `Learned ${d.sources} page${d.sources === 1 ? "" : "s"} from the website (${d.chunks} knowledge chunks). Your chatbot can answer questions about it now.`,
      ),
    [chatbotId, submit],
  );

  useEffect(() => {
    loadDocuments();
    // Coming from "Create chatbot" with a website URL: start training immediately
    const crawl = new URLSearchParams(window.location.search).get("crawl");
    if (crawl && !autoCrawlStarted.current) {
      autoCrawlStarted.current = true;
      setUploadType("url");
      setUrlInput(crawl);
      window.history.replaceState(null, "", window.location.pathname);
      crawlUrl(crawl);
    }
  }, [loadDocuments, crawlUrl]);

  const handleFileUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024)
      return setUploadError("File must be 10MB or smaller");
    if (!/\.(pdf|docx|txt|md)$/i.test(file.name))
      return setUploadError("Only PDF, DOCX and TXT files are supported");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatbot_id", chatbotId);
    await submit(
      { body: formData },
      (d) => `"${file.name}" added (${d.chunks} knowledge chunks).`,
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return setUploadError("Please enter a URL");
    if (await crawlUrl(urlInput.trim())) setUrlInput("");
  };

  const handleTextUpload = async () => {
    if (!textInput.trim() || !textTitle.trim())
      return setUploadError("Please enter both a title and content");
    const ok = await submit(
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatbot_id: chatbotId,
          source: "text",
          title: textTitle,
          content: textInput,
        }),
      },
      (d) => `Text added (${d.chunks} knowledge chunks).`,
    );
    if (ok) {
      setTextInput("");
      setTextTitle("");
    }
  };

  const handleDelete = async (sourceId: string, title: string) => {
    if (!confirm(`Remove "${title}" from the knowledge base?`)) return;
    const response = await fetch(
      `/api/documents?chatbot_id=${chatbotId}&id=${sourceId}`,
      { method: "DELETE" },
    );
    if ((await response.json()).success) await loadDocuments();
    else alert("Failed to delete");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFileUpload(e.dataTransfer.files);
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const sourceLabel = (s: string) =>
    s === "file" ? "File" : s === "url" || s === "crawl" ? "Website" : "Text";
  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const tabClass = (t: string) =>
    `px-4 py-2 font-medium transition-colors whitespace-nowrap ${
      uploadType === t
        ? "text-blue-600 border-b-2 border-blue-600"
        : "text-gray-600 hover:text-gray-900"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/dashboard/chatbots/${chatbotId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to chatbot"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Knowledge Base
                </h1>
                <p className="text-sm text-gray-600">
                  Content your chatbot uses to answer questions
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/chatbots/${chatbotId}`}
              className="hidden sm:inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Get embed code →
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Add knowledge */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Add knowledge</h2>

          <div className="flex flex-wrap gap-x-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setUploadType("url")}
              className={tabClass("url")}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              Website
            </button>
            <button
              onClick={() => setUploadType("file")}
              className={tabClass("file")}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              File upload
            </button>
            <button
              onClick={() => setUploadType("text")}
              className={tabClass("text")}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Text
            </button>
          </div>

          {uploadType === "file" && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-700 mb-2">
                Drag &amp; drop a file here, or click to choose
              </p>
              <p className="text-sm text-gray-500 mb-4">
                PDF, DOCX or TXT (max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                aria-label="Choose file"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? "Processing..." : "Choose file"}
              </button>
            </div>
          )}

          {uploadType === "url" && (
            <div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                aria-label="Website URL"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 text-gray-900"
              />
              <p className="text-xs text-gray-500 mb-4">
                We read this page and up to 9 more pages linked from it on the
                same site. Re-adding a page updates it.
              </p>
              <button
                onClick={handleUrlUpload}
                disabled={uploading || !urlInput.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? "Reading website..." : "Train on website"}
              </button>
            </div>
          )}

          {uploadType === "text" && (
            <div>
              <input
                type="text"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="Title (e.g. Shipping policy)"
                aria-label="Title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 text-gray-900"
              />
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste FAQs, policies, product details..."
                rows={10}
                aria-label="Content"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 resize-none text-gray-900"
              />
              <button
                onClick={handleTextUpload}
                disabled={uploading || !textInput.trim() || !textTitle.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? "Processing..." : "Add text"}
              </button>
            </div>
          )}

          {uploading && (
            <div className="mt-4 flex items-center gap-3 text-sm text-blue-700">
              <Loader2 className="w-5 h-5 animate-spin" />
              Reading and learning your content. This can take up to a minute...
            </div>
          )}

          {uploadError && (
            <div
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{uploadError}</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start gap-3 flex-1">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800">{uploadSuccess}</p>
              </div>
              <Link
                href={`/dashboard/chatbots/${chatbotId}`}
                className="text-sm font-semibold text-green-800 underline whitespace-nowrap"
              >
                Install on your website →
              </Link>
            </div>
          )}
        </div>

        {/* Sources */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold">Sources ({documents.length})</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sources..."
                aria-label="Search sources"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">
                No knowledge yet. Add your website above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Chunks
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Added
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 break-words">
                              {doc.title}
                            </p>
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline break-all"
                              >
                                {doc.url}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {sourceLabel(doc.source)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {doc.chunk_count}
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm whitespace-nowrap">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                          aria-label={`Delete ${doc.title}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
