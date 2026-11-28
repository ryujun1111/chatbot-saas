-- 005: Launch schema — brings the live DB in line with the application code.
-- Idempotent: safe to run more than once. Supersedes 003_session_messages.sql
-- and 004_webhook_transaction.sql (both included here in corrected form).

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- 1. users: billing columns + monthly usage window
-- ============================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS message_limit INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS messages_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS usage_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.users ALTER COLUMN message_limit SET DEFAULT 50;

-- Deleting an auth user removes the profile and (via cascades) all chatbot data
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_id_auth_fkey') THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_id_auth_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Users may read their own row. ALL writes go through the server (service role),
-- so plan / limits / usage can never be changed from the browser.
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own safe fields" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Auto-create profile on signup (re-created so it exists even if 003 was skipped)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, plan) VALUES (NEW.id, NEW.email, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. chatbots: settings columns used by the dashboard / widget
-- ============================================
ALTER TABLE public.chatbots
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS initial_message TEXT NOT NULL DEFAULT 'Hi! How can I help you today?',
  ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#3B82F6',
  ADD COLUMN IF NOT EXISTS model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  ADD COLUMN IF NOT EXISTS temperature REAL NOT NULL DEFAULT 0.7,
  ADD COLUMN IF NOT EXISTS max_tokens INTEGER NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

ALTER TABLE public.chatbots ALTER COLUMN user_id SET NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chatbots_status_check') THEN
    ALTER TABLE public.chatbots ADD CONSTRAINT chatbots_status_check CHECK (status IN ('active', 'inactive'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chatbots_model_check') THEN
    ALTER TABLE public.chatbots ADD CONSTRAINT chatbots_model_check CHECK (model IN ('gpt-4o-mini', 'deepseek-chat'));
  END IF;
END $$;

-- ============================================
-- 3. documents: one row = one embedded chunk; source_id groups chunks of one page/file/text
-- ============================================
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS source_id UUID;
UPDATE public.documents SET source_id = id WHERE source_id IS NULL;
ALTER TABLE public.documents ALTER COLUMN source_id SET DEFAULT gen_random_uuid();
ALTER TABLE public.documents ALTER COLUMN source_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_source ON public.documents(chatbot_id, source_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.chatbots c WHERE c.id = documents.chatbot_id AND c.user_id = auth.uid())
);

-- ============================================
-- 4. session_messages: rate limiting + conversation log + analytics
--    chatbot_id NULL = public /try demo message
-- ============================================
CREATE TABLE IF NOT EXISTS public.session_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  chatbot_id UUID REFERENCES public.chatbots(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.session_messages
  ADD COLUMN IF NOT EXISTS question TEXT,
  ADD COLUMN IF NOT EXISTS answer TEXT,
  ADD COLUMN IF NOT EXISTS response_ms INTEGER;
ALTER TABLE public.session_messages ALTER COLUMN chatbot_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_session_messages_session_id ON public.session_messages(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_messages_ip ON public.session_messages(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_messages_chatbot ON public.session_messages(chatbot_id, created_at DESC);

ALTER TABLE public.session_messages ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: only the server (service role) reads/writes this table.
DROP POLICY IF EXISTS "No public access to session messages" ON public.session_messages;
DROP POLICY IF EXISTS "Service role can manage session messages" ON public.session_messages;

CREATE OR REPLACE FUNCTION public.cleanup_old_session_messages()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.session_messages WHERE chatbot_id IS NULL AND created_at < NOW() - INTERVAL '7 days';
$$;
REVOKE ALL ON FUNCTION public.cleanup_old_session_messages() FROM PUBLIC, anon, authenticated;

-- ============================================
-- 5. Usage quota: atomic check + increment, with a rolling monthly window (no cron needed)
-- ============================================
CREATE OR REPLACE FUNCTION public.check_and_increment_usage(
  p_user_id UUID,
  OUT can_use BOOLEAN,
  OUT current_used INTEGER,
  OUT current_limit INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_reset_at TIMESTAMPTZ;
BEGIN
  SELECT message_limit, messages_used, usage_reset_at
    INTO current_limit, current_used, v_reset_at
    FROM users WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    can_use := FALSE;
    RETURN;
  END IF;

  -- New monthly window: reset the counter
  IF v_reset_at <= NOW() - INTERVAL '1 month' THEN
    current_used := 0;
    UPDATE users SET messages_used = 0, usage_reset_at = NOW() WHERE id = p_user_id;
  END IF;

  IF current_used < current_limit THEN
    UPDATE users SET messages_used = messages_used + 1, updated_at = NOW() WHERE id = p_user_id;
    can_use := TRUE;
    current_used := current_used + 1;
  ELSE
    can_use := FALSE;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.check_and_increment_usage(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_usage(UUID) TO service_role;

DROP FUNCTION IF EXISTS public.increment_messages_used(UUID);
REVOKE ALL ON FUNCTION public.reset_monthly_usage() FROM PUBLIC, anon, authenticated;

-- ============================================
-- 6. Paddle webhooks: idempotent, atomic subscription update
-- ============================================
ALTER TABLE public.webhook_events
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Keep billing history when an account is deleted
ALTER TABLE public.webhook_events DROP CONSTRAINT IF EXISTS webhook_events_user_id_fkey;
ALTER TABLE public.webhook_events
  ADD CONSTRAINT webhook_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_events_user ON public.webhook_events(user_id, created_at DESC);

DROP FUNCTION IF EXISTS public.process_subscription_event(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT);
CREATE OR REPLACE FUNCTION public.process_subscription_event(
  p_user_id UUID,
  p_event_id TEXT,
  p_event_type TEXT,
  p_subscription_id TEXT,
  p_customer_id TEXT,
  p_plan TEXT,
  p_message_limit INTEGER,
  p_status TEXT,
  p_reset_usage BOOLEAN
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Idempotency: the UNIQUE(event_id) insert succeeds only the first time
  INSERT INTO webhook_events (event_id, event_type, user_id, subscription_id, success)
  VALUES (p_event_id, p_event_type, p_user_id, NULLIF(p_subscription_id, ''), true)
  ON CONFLICT (event_id) DO NOTHING;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'duplicate_event', 'event_id', p_event_id);
  END IF;

  UPDATE users SET
    plan = p_plan,
    message_limit = p_message_limit,
    subscription_status = p_status,
    paddle_subscription_id = COALESCE(NULLIF(p_subscription_id, ''), paddle_subscription_id),
    paddle_customer_id = COALESCE(NULLIF(p_customer_id, ''), paddle_customer_id),
    messages_used = CASE WHEN p_reset_usage OR plan IS DISTINCT FROM p_plan THEN 0 ELSE messages_used END,
    usage_reset_at = CASE WHEN p_reset_usage OR plan IS DISTINCT FROM p_plan THEN NOW() ELSE usage_reset_at END,
    subscription_started_at = COALESCE(subscription_started_at, NOW()),
    updated_at = NOW()
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    -- Rolls back the webhook_events insert too, so Paddle's retry can succeed later
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  RETURN json_build_object('success', true, 'user_id', p_user_id, 'plan', p_plan, 'event_id', p_event_id);
END;
$$;
REVOKE ALL ON FUNCTION public.process_subscription_event(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_subscription_event(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, BOOLEAN) TO service_role;

-- ============================================
-- 7. Legacy table hardening
-- ============================================
DROP POLICY IF EXISTS "Public can view own rate limit" ON public.rate_limits;
REVOKE ALL ON FUNCTION public.match_documents(vector, float, int, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_documents(vector, float, int, UUID) TO authenticated, service_role;

-- Make PostgREST pick up the new columns/functions immediately
NOTIFY pgrst, 'reload schema';
