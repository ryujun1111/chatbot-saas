-- ============================================
-- Supabase 벡터 검색 함수
-- ============================================
-- 이 SQL을 Supabase SQL Editor에서 실행하세요
-- https://app.supabase.com/project/_/sql

-- 벡터 검색을 위한 RPC 함수 생성
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),  -- OpenAI text-embedding-3-small의 차원
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 3,
  p_chatbot_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  chatbot_id uuid,
  content text,
  source text,
  url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.chatbot_id,
    documents.content,
    documents.source,
    documents.url,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 
    -- chatbot_id 필터링 (제공된 경우에만)
    (p_chatbot_id IS NULL OR documents.chatbot_id = p_chatbot_id)
    -- 유사도 임계값
    AND 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- 사용 예시
-- ============================================
-- SELECT * FROM match_documents(
--   query_embedding := '[0.1, 0.2, ...]'::vector,
--   match_threshold := 0.5,
--   match_count := 3,
--   p_chatbot_id := 'your-chatbot-uuid'
-- );

-- ============================================
-- 주의사항
-- ============================================
-- 1. documents 테이블에 embedding 컬럼이 vector(1536) 타입으로 존재해야 합니다
-- 2. pgvector 확장이 활성화되어 있어야 합니다:
--    CREATE EXTENSION IF NOT EXISTS vector;
-- 3. 성능 향상을 위해 인덱스 생성 권장:
--    CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
