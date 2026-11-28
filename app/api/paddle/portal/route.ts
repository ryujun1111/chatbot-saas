import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// POST: create a Paddle customer-portal session (update card, invoices, cancel subscription)
export async function POST() {
  const { user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("paddle_customer_id, paddle_subscription_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.paddle_customer_id) {
    return NextResponse.json(
      { error: "No billing account yet. Choose a plan to subscribe." },
      { status: 404 },
    );
  }

  const apiBase =
    process.env.PADDLE_ENVIRONMENT === "production"
      ? "https://api.paddle.com"
      : "https://sandbox-api.paddle.com";
  const res = await fetch(
    `${apiBase}/customers/${encodeURIComponent(profile.paddle_customer_id)}/portal-sessions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        profile.paddle_subscription_id
          ? { subscription_ids: [profile.paddle_subscription_id] }
          : {},
      ),
    },
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.data?.urls?.general?.overview) {
    console.error("Paddle portal session failed:", res.status, json?.error);
    return NextResponse.json(
      { error: "Billing portal is unavailable. Please try again later." },
      { status: 502 },
    );
  }
  return NextResponse.json({ url: json.data.urls.general.overview });
}
