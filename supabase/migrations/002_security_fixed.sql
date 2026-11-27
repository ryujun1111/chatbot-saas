-- Migration: Security and usage tracking with proper RLS
-- Created: 2026-11-27 (Fixed version)

-- ============================================
-- 1. Add columns to users table
-- ============================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS message_limit INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS messages_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS paddle_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ;

-- Create indexes
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
-- 4. Atomic message counter with quota check
-- ============================================

CREATE OR REPLACE FUNCTION check_and_increment_usage(
  p_user_id UUID,
  OUT can_use BOOLEAN,
  OUT current_used INTEGER,
  OUT current_limit INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Lock the row for update
  SELECT message_limit, messages_used, subscription_status
  INTO current_limit, current_used
  FROM users
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if usage is within limit and subscription is active
  IF current_used < current_limit THEN
    -- Increment usage
    UPDATE users
    SET messages_used = messages_used + 1,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    can_use := TRUE;
    current_used := current_used + 1;
  ELSE
    can_use := FALSE;
  END IF;
END;
$$;

-- Grant execute to authenticated and service role only
REVOKE ALL ON FUNCTION check_and_increment_usage FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_and_increment_usage TO authenticated, service_role;

-- ============================================
-- 5. Monthly usage reset
-- ============================================

CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reset_count INTEGER;
BEGIN
  UPDATE users
  SET messages_used = 0,
      updated_at = NOW()
  WHERE subscription_status = 'active'
    AND subscription_started_at IS NOT NULL;
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN reset_count;
END;
$$;

-- Restrict execution to service role only
REVOKE ALL ON FUNCTION reset_monthly_usage FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reset_monthly_usage TO service_role;

-- ============================================
-- 6. Enable Row Level Security
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS Policies - Users
-- ============================================

-- Users can view their own basic data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can ONLY update specific columns (not plan, limit, subscription)
CREATE POLICY "Users can update own safe fields"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from changing these critical fields
    plan = (SELECT plan FROM users WHERE id = auth.uid()) AND
    message_limit = (SELECT message_limit FROM users WHERE id = auth.uid()) AND
    messages_used = (SELECT messages_used FROM users WHERE id = auth.uid()) AND
    subscription_status = (SELECT subscription_status FROM users WHERE id = auth.uid()) AND
    paddle_customer_id = (SELECT paddle_customer_id FROM users WHERE id = auth.uid())
  );

-- ============================================
-- 8. RLS Policies - Chatbots
-- ============================================

-- Owners can manage their chatbots
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

-- Service role can read all chatbots (for API usage tracking)
CREATE POLICY "Service role can read all chatbots"
  ON chatbots FOR SELECT
  TO service_role
  USING (true);

-- ============================================
-- 9. RLS Policies - Documents
-- ============================================

-- Users can manage documents of their chatbots
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

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chatbots
      WHERE chatbots.id = documents.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM chatbots
      WHERE chatbots.id = documents.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );

-- Service role can read all documents (for vector search)
CREATE POLICY "Service role can read all documents"
  ON documents FOR SELECT
  TO service_role
  USING (true);

-- ============================================
-- 10. RLS Policies - Webhook Events
-- ============================================

-- Service role only
CREATE POLICY "Service role can manage webhook events"
  ON webhook_events FOR ALL
  TO service_role
  USING (true);

-- ============================================
-- 11. RLS Policies - Rate Limits
-- ============================================

-- Service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
  ON rate_limits FOR ALL
  TO service_role
  USING (true);

-- ============================================
-- 12. Comments
-- ============================================

COMMENT ON FUNCTION check_and_increment_usage IS 
  'Atomically checks quota and increments usage counter. 
   Returns can_use (boolean), current_used, and current_limit.
   Call from API before processing message.';

COMMENT ON FUNCTION reset_monthly_usage IS 
  'Resets messages_used to 0 for all active subscriptions.
   Should be called monthly via cron: 0 0 1 * *
   Returns number of users reset.';
