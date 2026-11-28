import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPlan } from "@/lib/plans";

// GET: account profile, plan and usage for the settings page
export async function GET() {
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  const [{ data: profile }, { count: chatbotCount }] = await Promise.all([
    supabaseAdmin
      .from("users")
      .select(
        "plan, messages_used, message_limit, usage_reset_at, subscription_status, paddle_subscription_id",
      )
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("chatbots")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const plan = getPlan(profile?.plan);
  const resetAt = profile?.usage_reset_at
    ? new Date(profile.usage_reset_at)
    : new Date();
  const nextReset = new Date(resetAt);
  nextReset.setUTCMonth(nextReset.getUTCMonth() + 1);
  const windowExpired = nextReset.getTime() <= Date.now();

  return NextResponse.json({
    email: user.email,
    name: (user.user_metadata?.full_name as string) || "",
    plan: profile?.plan || "free",
    planName: plan.name,
    subscriptionStatus: profile?.subscription_status || "active",
    hasSubscription:
      !!profile?.paddle_subscription_id && profile?.plan !== "free",
    usage: {
      messagesUsed: windowExpired ? 0 : (profile?.messages_used ?? 0),
      messageLimit: profile?.message_limit ?? plan.messages,
      chatbots: chatbotCount ?? 0,
      chatbotLimit: Number.isFinite(plan.chatbots) ? plan.chatbots : null,
      resetsAt: windowExpired ? null : nextReset.toISOString(),
    },
  });
}

// DELETE: permanently delete the account. Chatbots, knowledge and logs cascade-delete.
export async function DELETE() {
  const { user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("plan, subscription_status, paddle_subscription_id")
    .eq("id", user.id)
    .maybeSingle();

  // Don't leave a paying subscription running for a deleted account
  if (
    profile?.paddle_subscription_id &&
    profile.plan !== "free" &&
    profile.subscription_status !== "canceled"
  ) {
    return NextResponse.json(
      {
        error:
          "Please cancel your subscription in the Billing tab before deleting your account.",
      },
      { status: 409 },
    );
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("Account deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
