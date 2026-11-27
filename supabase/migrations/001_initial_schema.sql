-- Initial Schema for ChatBot SaaS
-- Created: 2026-11-28

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. Users table
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  paddle_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 2. Chatbots table
-- ============================================

CREATE TABLE IF NOT EXISTS chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbots_user_id ON chatbots(user_id);

-- ============================================
-- 3. Documents table with vector embeddings
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  url TEXT,
  source TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_chatbot_id ON documents(chatbot_id);

-- ============================================
-- 4. Vector search function
-- ============================================

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_chatbot_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  url TEXT,
  source TEXT,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    url,
    source,
    1 - (embedding <=> query_embedding) as similarity
  FROM documents
  WHERE chatbot_id = p_chatbot_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- ============================================
-- 5. Comments
-- ============================================

COMMENT ON TABLE users IS 'User accounts with subscription plans';
COMMENT ON TABLE chatbots IS 'User-created chatbots';
COMMENT ON TABLE documents IS 'Documents with vector embeddings for RAG';
COMMENT ON FUNCTION match_documents IS 'Vector similarity search for document retrieval';
