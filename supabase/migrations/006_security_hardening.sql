-- 006: Security hardening (from security review). Idempotent.

-- 1. No direct INSERTs from the browser: chatbots/documents are created only by the API
--    (which enforces plan limits, validation and the knowledge cap). Users keep SELECT/UPDATE/DELETE on own rows.
DROP POLICY IF EXISTS "Users can insert own chatbots" ON public.chatbots;
DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;

-- 2. Field validation enforced in the database too (direct UPDATEs via REST can't store junk)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chatbots_fields_check') THEN
    ALTER TABLE public.chatbots ADD CONSTRAINT chatbots_fields_check CHECK (
      char_length(name) BETWEEN 1 AND 50
      AND char_length(initial_message) BETWEEN 1 AND 500
      AND (description IS NULL OR char_length(description) <= 500)
      AND (website_url IS NULL OR (website_url ~* '^https?://' AND char_length(website_url) <= 2000))
      AND color ~ '^#[0-9A-Fa-f]{6}$'
      AND temperature BETWEEN 0 AND 2
      AND max_tokens BETWEEN 100 AND 2000
    );
  END IF;
END $$;

-- 3. Paddle webhooks: ignore events older than the last applied one (Paddle can deliver/retry out of order)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS paddle_event_at TIMESTAMPTZ;

DROP FUNCTION IF EXISTS public.process_subscription_event(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, BOOLEAN);
CREATE OR REPLACE FUNCTION public.process_subscription_event(
  p_user_id UUID,
  p_event_id TEXT,
  p_event_type TEXT,
  p_subscription_id TEXT,
  p_customer_id TEXT,
  p_plan TEXT,
  p_message_limit INTEGER,
  p_status TEXT,
  p_reset_usage BOOLEAN,
  p_occurred_at TIMESTAMPTZ
)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_last TIMESTAMPTZ;
BEGIN
  -- Idempotency: the UNIQUE(event_id) insert succeeds only the first time
  INSERT INTO webhook_events (event_id, event_type, user_id, subscription_id, success)
  VALUES (p_event_id, p_event_type, p_user_id, NULLIF(p_subscription_id, ''), true)
  ON CONFLICT (event_id) DO NOTHING;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'duplicate_event', 'event_id', p_event_id);
  END IF;

  SELECT paddle_event_at INTO v_last FROM users WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  IF v_last IS NOT NULL AND p_occurred_at < v_last THEN
    RETURN json_build_object('success', false, 'error', 'stale_event', 'event_id', p_event_id);
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
    paddle_event_at = p_occurred_at,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object('success', true, 'user_id', p_user_id, 'plan', p_plan, 'event_id', p_event_id);
END;
$$;
REVOKE ALL ON FUNCTION public.process_subscription_event(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, BOOLEAN, TIMESTAMPTZ) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_subscription_event(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT, BOOLEAN, TIMESTAMPTZ) TO service_role;

-- Trigger function is never meant to be called directly
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';
