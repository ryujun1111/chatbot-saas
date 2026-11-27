-- Auth Integration: Connect Supabase Auth to public.users
-- Created: 2026-11-28

-- ============================================
-- 1. Update users table to use auth.uid()
-- ============================================

-- Remove auto-generated UUID, use auth ID instead
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- ============================================
-- 2. Auto-create user profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'free',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 3. Comments
-- ============================================

COMMENT ON FUNCTION handle_new_user IS 
  'Automatically creates a user profile in public.users when a new auth user signs up.
   Sets default plan to free.';
