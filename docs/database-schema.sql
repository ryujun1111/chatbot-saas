-- ============================================
-- Chatbot SaaS Database Schema
-- ============================================
-- Supabase PostgreSQL + pgvector
-- Created: 2026-11-26
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ============================================
-- Table: users
-- ============================================
-- Note: Supabase Auth handles the core auth.users table
-- This table extends user data with subscription info
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'growth', 'agency')),
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: chatbots
-- ============================================
CREATE TABLE IF NOT EXISTS public.chatbots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    greeting_message TEXT DEFAULT '안녕하세요! 무엇을 도와드릴까요?',
    color TEXT DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: documents
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: messages
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    session_id TEXT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Chatbots
CREATE INDEX IF NOT EXISTS idx_chatbots_user_id ON public.chatbots(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbots_is_active ON public.chatbots(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_chatbots_created_at ON public.chatbots(created_at DESC);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_chatbot_id ON public.documents(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- Vector similarity search index (HNSW for fast approximate nearest neighbor search)
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON public.documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_chatbot_id ON public.messages(chatbot_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON public.messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies: users
-- ============================================

-- Users can read their own data
CREATE POLICY "Users can view own data"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own data (triggered on signup)
CREATE POLICY "Users can insert own data"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS Policies: chatbots
-- ============================================

-- Users can view their own chatbots
CREATE POLICY "Users can view own chatbots"
    ON public.chatbots
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create chatbots
CREATE POLICY "Users can create chatbots"
    ON public.chatbots
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own chatbots
CREATE POLICY "Users can update own chatbots"
    ON public.chatbots
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own chatbots
CREATE POLICY "Users can delete own chatbots"
    ON public.chatbots
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: documents
-- ============================================

-- Users can view documents of their chatbots
CREATE POLICY "Users can view own documents"
    ON public.documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chatbots
            WHERE chatbots.id = documents.chatbot_id
            AND chatbots.user_id = auth.uid()
        )
    );

-- Users can create documents for their chatbots
CREATE POLICY "Users can create documents"
    ON public.documents
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chatbots
            WHERE chatbots.id = chatbot_id
            AND chatbots.user_id = auth.uid()
        )
    );

-- Users can update documents of their chatbots
CREATE POLICY "Users can update own documents"
    ON public.documents
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.chatbots
            WHERE chatbots.id = documents.chatbot_id
            AND chatbots.user_id = auth.uid()
        )
    );

-- Users can delete documents of their chatbots
CREATE POLICY "Users can delete own documents"
    ON public.documents
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.chatbots
            WHERE chatbots.id = documents.chatbot_id
            AND chatbots.user_id = auth.uid()
        )
    );

-- ============================================
-- RLS Policies: messages
-- ============================================

-- Users can view messages of their chatbots
CREATE POLICY "Users can view own messages"
    ON public.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chatbots
            WHERE chatbots.id = messages.chatbot_id
            AND chatbots.user_id = auth.uid()
        )
    );

-- Anyone can insert messages (public chatbot usage)
-- But we validate chatbot_id exists
CREATE POLICY "Public can create messages"
    ON public.messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chatbots
            WHERE chatbots.id = chatbot_id
            AND chatbots.is_active = true
        )
    );

-- Users can delete messages of their chatbots
CREATE POLICY "Users can delete own messages"
    ON public.messages
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.chatbots
            WHERE chatbots.id = messages.chatbot_id
            AND chatbots.user_id = auth.uid()
        )
    );

-- ============================================
-- Functions
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbots_updated_at
    BEFORE UPDATE ON public.chatbots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function: Vector Similarity Search
-- ============================================

-- Search for similar documents using cosine similarity
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_chatbot_id uuid,
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    chatbot_id uuid,
    filename text,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        documents.id,
        documents.chatbot_id,
        documents.filename,
        documents.content,
        1 - (documents.embedding <=> query_embedding) AS similarity
    FROM public.documents
    WHERE documents.chatbot_id = match_chatbot_id
        AND documents.embedding IS NOT NULL
        AND 1 - (documents.embedding <=> query_embedding) > match_threshold
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================
-- Initial Data / Seed (Optional)
-- ============================================

-- Create a default user (for testing only - remove in production)
-- INSERT INTO public.users (id, email, subscription_tier)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com', 'free')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Grants (if needed for service role)
-- ============================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chatbots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT INSERT ON public.messages TO anon; -- Allow anonymous message creation

-- Grant sequence permissions (for auto-increment if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================
-- Comments
-- ============================================

COMMENT ON TABLE public.users IS 'Extended user data with subscription information';
COMMENT ON TABLE public.chatbots IS 'Chatbot configurations owned by users';
COMMENT ON TABLE public.documents IS 'Knowledge base documents with vector embeddings';
COMMENT ON TABLE public.messages IS 'Chat conversation history';

COMMENT ON COLUMN public.documents.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions)';
COMMENT ON COLUMN public.messages.session_id IS 'Optional session identifier for grouping conversations';
COMMENT ON COLUMN public.messages.tokens_used IS 'Number of tokens consumed for this message';

-- ============================================
-- End of Schema
-- ============================================
