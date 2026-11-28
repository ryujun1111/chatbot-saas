-- Session Messages Table for Rate Limiting
-- Tracks messages per session and IP for abuse prevention

CREATE TABLE IF NOT EXISTS session_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for fast lookups
  CONSTRAINT session_messages_session_id_idx UNIQUE (id)
);

-- Index for session-based rate limiting
CREATE INDEX IF NOT EXISTS idx_session_messages_session_id 
ON session_messages(session_id, created_at DESC);

-- Index for IP-based rate limiting
CREATE INDEX IF NOT EXISTS idx_session_messages_ip 
ON session_messages(ip_address, created_at DESC);

-- Index for chatbot-based queries
CREATE INDEX IF NOT EXISTS idx_session_messages_chatbot 
ON session_messages(chatbot_id, created_at DESC);

-- Auto-delete old records (> 7 days) to save storage
CREATE OR REPLACE FUNCTION cleanup_old_session_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM session_messages
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE session_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role can manage session messages"
ON session_messages
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: No public access (only via service role in API)
CREATE POLICY "No public access to session messages"
ON session_messages
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Comments
COMMENT ON TABLE session_messages IS 'Tracks messages per session and IP for rate limiting';
COMMENT ON COLUMN session_messages.session_id IS 'Widget session ID from localStorage';
COMMENT ON COLUMN session_messages.ip_address IS 'Client IP address from x-forwarded-for';
COMMENT ON COLUMN session_messages.created_at IS 'Message timestamp for 24h/1h limits';
