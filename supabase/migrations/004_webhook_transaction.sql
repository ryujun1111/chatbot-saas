-- Atomic Webhook Event Processing
-- Ensures subscription updates and event logging happen together

CREATE OR REPLACE FUNCTION process_subscription_event(
  p_user_id UUID,
  p_event_id TEXT,
  p_event_type TEXT,
  p_subscription_id TEXT,
  p_plan TEXT,
  p_message_limit INTEGER,
  p_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Start transaction (implicit in function)
  
  -- 1. Check for duplicate event
  IF EXISTS (
    SELECT 1 FROM webhook_events WHERE event_id = p_event_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'duplicate_event',
      'event_id', p_event_id
    );
  END IF;

  -- 2. Update user subscription
  UPDATE users
  SET
    plan = p_plan,
    message_limit = p_message_limit,
    messages_used = CASE
      WHEN p_plan != plan THEN 0  -- Reset on plan change
      ELSE messages_used
    END,
    subscription_status = p_status,
    paddle_subscription_id = p_subscription_id,
    subscription_started_at = CASE
      WHEN p_event_type = 'subscription.created' THEN NOW()
      ELSE subscription_started_at
    END,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Check if user was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- 3. Record webhook event
  INSERT INTO webhook_events (
    event_id,
    event_type,
    user_id,
    subscription_id,
    processed_at,
    success
  ) VALUES (
    p_event_id,
    p_event_type,
    p_user_id,
    p_subscription_id,
    NOW(),
    true
  );

  -- 4. Build result
  v_result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'plan', p_plan,
    'message_limit', p_message_limit,
    'event_id', p_event_id
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO webhook_events (
      event_id,
      event_type,
      user_id,
      processed_at,
      success,
      error_message
    ) VALUES (
      p_event_id,
      p_event_type,
      p_user_id,
      NOW(),
      false,
      SQLERRM
    );

    -- Re-raise
    RAISE;
END;
$$;

-- Add columns to webhook_events if not exist
ALTER TABLE webhook_events 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS success BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS payload JSONB;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhook_events_user 
ON webhook_events(user_id, created_at DESC);

-- Comments
COMMENT ON FUNCTION process_subscription_event IS 'Atomically process Paddle webhook events';
COMMENT ON COLUMN webhook_events.success IS 'Whether event processing succeeded';
COMMENT ON COLUMN webhook_events.error_message IS 'Error details if processing failed';
