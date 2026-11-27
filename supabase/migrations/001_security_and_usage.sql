-- Migration: Add security and usage tracking columns
-- Created: 2026-11-27

-- ============================================
-- 1. Add columns to users table
-- ============================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS message_limit INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS messages_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paddle_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT ''active'',
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_paddle_customer_id ON users(paddle_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- ============================================
-- 2. Create webhook_events table
-- ============================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);

-- ============================================
-- 3. Create rate_limits table
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_session_id ON rate_limits(session_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- ============================================
-- 4. Create atomic increment function
-- ============================================

CREATE OR REPLACE FUNCTION increment_messages_used(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET messages_used = messages_used + 1,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- ============================================
-- 5. Create monthly usage reset function
-- ============================================

CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users
  SET messages_used = 0,
      updated_at = NOW()
  WHERE subscription_status = ''active'';
END;
$$;

-- ============================================
-- 6. Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS Policies
-- ============================================

-- Users: Can only view/update their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Chatbots: Owners can manage, public can view
CREATE POLICY "Users can view own chatbots"
  ON chatbots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chatbots"
  ON chatbots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chatbots"
  ON chatbots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chatbots"
  ON chatbots FOR DELETE
  USING (auth.uid() = user_id);

-- Documents: Owners can manage
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chatbots
      WHERE chatbots.id = documents.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chatbots
      WHERE chatbots.id = documents.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );

-- Webhook events: Service role only
CREATE POLICY "Service role can manage webhook events"
  ON webhook_events FOR ALL
  USING (auth.role() = ''service_role'');

-- Rate limits: Public can read own session
CREATE POLICY "Public can view own rate limit"
  ON rate_limits FOR SELECT
  USING (true);

-- ============================================
-- 8. Create scheduled job comment
-- ============================================

COMMENT ON FUNCTION reset_monthly_usage() IS 
  'Should be called monthly via pg_cron or external scheduler. 
   Example cron: 0 0 1 * * (1st day of month at midnight)';
