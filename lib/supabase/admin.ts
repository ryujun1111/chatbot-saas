import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. Server-side only (API routes) — never import in client components.
// Use it only after the caller's identity/ownership has been checked, or for public endpoints
// that expose nothing but whitelisted fields.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
