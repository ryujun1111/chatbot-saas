export interface Document {
  id: string;
  chatbot_id: string;
  title: string;
  content: string;
  source: 'file' | 'url' | 'text';
  file_type?: string;
  url?: string;
  status: 'processing' | 'completed' | 'failed';
  error_message?: string;
  chunk_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chatbot_id: string;
  content: string;
  embedding: number[];
  chunk_index: number;
  created_at: string;
}

export interface CreateDocumentRequest {
  chatbot_id: string;
  title: string;
  source: 'file' | 'url' | 'text';
  content?: string;
  url?: string;
  file_type?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  document?: Document;
  error?: string;
}
