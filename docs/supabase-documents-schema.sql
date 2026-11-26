-- ============================================
-- 문서 관리 테이블 스키마
-- ============================================
-- Supabase SQL Editor에서 실행하세요

-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- documents 테이블 생성
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('file', 'url', 'text')),
  file_type TEXT,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  chunk_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- document_chunks 테이블 생성
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chatbot_id UUID NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_documents_chatbot_id ON documents(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chatbot_id ON document_chunks(chatbot_id);

-- 벡터 검색 성능을 위한 ivfflat 인덱스
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON document_chunks 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 정책 설정
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자신의 챗봇 문서에 접근 가능
CREATE POLICY "Users can view their own documents" 
  ON documents FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own documents" 
  ON documents FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own documents" 
  ON documents FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete their own documents" 
  ON documents FOR DELETE 
  USING (true);

-- document_chunks도 동일하게 설정
CREATE POLICY "Users can view their own document chunks" 
  ON document_chunks FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own document chunks" 
  ON document_chunks FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can delete their own document chunks" 
  ON document_chunks FOR DELETE 
  USING (true);

-- ============================================
-- 벡터 검색 함수 (업데이트)
-- ============================================
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5,
  p_chatbot_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chatbot_id uuid,
  content text,
  chunk_index integer,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.chatbot_id,
    document_chunks.content,
    document_chunks.chunk_index,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE 
    (p_chatbot_id IS NULL OR document_chunks.chatbot_id = p_chatbot_id)
    AND 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
