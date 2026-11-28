import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { reserveSignup, release, getClientIP } from "@/lib/rate-limit";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

// Creates the account server-side (pre-confirmed, so customers aren't blocked by email delivery).
// The browser then signs in with the same credentials to get a session cookie.
export async function POST(request: NextRequest) {
  const parsed = signupSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
  const { name, email, password } = parsed.data;

  // Throttle automated account creation (5 per IP per day)
  const slot = await reserveSignup(getClientIP(request));
  if (!slot.ok) return NextResponse.json({ error: slot.reason }, { status: slot.status });

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (error) {
    await release(slot.id);
    const exists = /already|registered|exists/i.test(error.message);
    if (!exists) console.error("Signup error:", error.message);
    return NextResponse.json(
      {
        error: exists
          ? "An account with this email already exists. Please sign in."
          : "Could not create account. Please try again.",
      },
      { status: exists ? 409 : 400 },
    );
  }

  // public.users profile is created by the on_auth_user_created trigger
  return NextResponse.json({
    success: true,
    user: { id: data.user.id, email: data.user.email },
  });
}
