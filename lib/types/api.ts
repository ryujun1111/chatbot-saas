// ============================================
// API 타입 정의
// ============================================

export interface ChatRequest {
  chatbotId: string
  message: string
}

export interface ChatResponse {
  answer: string
  sources: string[]
}

export interface ChatError {
  error: string
  details?: string
}

export interface Document {
  id: string
  chatbot_id: string
  content: string
  source?: string
  url?: string
  embedding: number[]
  similarity?: number
}

export interface MatchDocumentsParams {
  query_embedding: number[]
  match_threshold?: number
  match_count?: number
  p_chatbot_id?: string
}
