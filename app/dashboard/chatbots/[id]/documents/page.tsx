'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Link as LinkIcon, 
  Check, 
  X, 
  Loader2,
  AlertCircle,
  Search,
  ChevronLeft,
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  source: 'file' | 'url' | 'text';
  status: 'processing' | 'completed' | 'failed';
  chunk_count?: number;
  file_type?: string;
  url?: string;
  error_message?: string;
  created_at: string;
}

export default function DocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Upload states
  const [uploadType, setUploadType] = useState<'file' | 'url' | 'text'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [chatbotId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents?chatbot_id=${chatbotId}`);
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('문서 로딩 에러:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('파일 크기는 10MB 이하여야 합니다');
      return;
    }

    // 파일 타입 검증
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('PDF, DOCX, TXT 파일만 지원합니다');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadSuccess('');
      setUploadProgress(30);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatbot_id', chatbotId);
      formData.append('title', file.name);

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(70);

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        setUploadSuccess('파일이 업로드되었습니다. 임베딩 처리 중...');
        await loadDocuments();
        
        // 파일 입력 리셋
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setTimeout(() => {
          setUploadSuccess('');
          setUploadProgress(0);
        }, 3000);
      } else {
        throw new Error(data.error || '업로드 실패');
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '업로드에 실패했습니다');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      setUploadError('URL을 입력해주세요');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadSuccess('');
      setUploadProgress(30);

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbot_id: chatbotId,
          source: 'url',
          url: urlInput,
        }),
      });

      setUploadProgress(70);

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        setUploadSuccess('URL이 추가되었습니다. 임베딩 처리 중...');
        setUrlInput('');
        await loadDocuments();

        setTimeout(() => {
          setUploadSuccess('');
          setUploadProgress(0);
        }, 3000);
      } else {
        throw new Error(data.error || '업로드 실패');
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '업로드에 실패했습니다');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textInput.trim() || !textTitle.trim()) {
      setUploadError('제목과 내용을 모두 입력해주세요');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      setUploadSuccess('');
      setUploadProgress(30);

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbot_id: chatbotId,
          source: 'text',
          title: textTitle,
          content: textInput,
        }),
      });

      setUploadProgress(70);

      const data = await response.json();

      if (data.success) {
        setUploadProgress(100);
        setUploadSuccess('텍스트가 추가되었습니다. 임베딩 처리 중...');
        setTextInput('');
        setTextTitle('');
        await loadDocuments();

        setTimeout(() => {
          setUploadSuccess('');
          setUploadProgress(0);
        }, 3000);
      } else {
        throw new Error(data.error || '업로드 실패');
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '업로드에 실패했습니다');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('이 문서를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await loadDocuments();
      } else {
        alert('삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('삭제 에러:', error);
      alert('삭제에 실패했습니다');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <X className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-600 font-medium">완료</span>;
      case 'failed':
        return <span className="text-red-600 font-medium">실패</span>;
      case 'processing':
        return <span className="text-blue-600 font-medium">처리 중</span>;
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">문서 관리</h1>
              <p className="text-sm text-gray-600">챗봇 학습 문서 업로드 및 관리</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">새 문서 추가</h2>

          {/* Upload Type Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setUploadType('file')}
              className={`px-4 py-2 font-medium transition-colors ${
                uploadType === 'file'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              파일 업로드
            </button>
            <button
              onClick={() => setUploadType('url')}
              className={`px-4 py-2 font-medium transition-colors ${
                uploadType === 'url'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LinkIcon className="w-4 h-4 inline mr-2" />
              URL 크롤링
            </button>
            <button
              onClick={() => setUploadType('text')}
              className={`px-4 py-2 font-medium transition-colors ${
                uploadType === 'text'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              텍스트 입력
            </button>
          </div>

          {/* File Upload */}
          {uploadType === 'file' && (
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-700 mb-2">
                  파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PDF, DOCX, TXT 파일 지원 (최대 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  파일 선택
                </button>
              </div>
            </div>
          )}

          {/* URL Upload */}
          {uploadType === 'url' && (
            <div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
              <button
                onClick={handleUrlUpload}
                disabled={uploading || !urlInput.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? '처리 중...' : 'URL 추가'}
              </button>
            </div>
          )}

          {/* Text Upload */}
          {uploadType === 'text' && (
            <div>
              <input
                type="text"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="문서 제목"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="텍스트를 입력하세요..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 resize-none"
              />
              <button
                onClick={handleTextUpload}
                disabled={uploading || !textInput.trim() || !textTitle.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? '처리 중...' : '텍스트 추가'}
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Messages */}
          {uploadError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{uploadError}</p>
            </div>
          )}

          {uploadSuccess && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800">{uploadSuccess}</p>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">문서 목록</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="문서 검색..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">로딩 중...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">문서가 없습니다</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">제목</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">소스</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">청크</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">상태</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">업로드 시간</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.title}</p>
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {doc.url}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {doc.source === 'file' ? '파일' : doc.source === 'url' ? 'URL' : '텍스트'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {doc.chunk_count || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.status)}
                          {getStatusText(doc.status)}
                        </div>
                        {doc.error_message && (
                          <p className="text-xs text-red-600 mt-1">{doc.error_message}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-sm">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
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
