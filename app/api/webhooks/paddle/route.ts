import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PLANS, planFromPriceId, type PlanId } from "@/lib/plans";
import { verifyPaddleSignature } from "@/lib/paddle";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Which plan/limit/status a subscription status grants
function entitlement(
  plan: PlanId,
  status: string,
): { plan: PlanId; status: string } {
  if (status === "active" || status === "trialing" || status === "past_due")
    return { plan, status };
  return { plan: "free", status: status === "paused" ? "paused" : "canceled" };
}

export async function POST(request: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("PADDLE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  // 1. Authenticity: HMAC signature over the raw body
  const rawBody = await request.text();
  if (
    !verifyPaddleSignature(
      rawBody,
      request.headers.get("paddle-signature"),
      secret,
    )
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventType: string = event.event_type;
  const data = event.data || {};

  const isSubscriptionEvent = eventType.startsWith("subscription.");
  const isRenewal =
    eventType === "transaction.completed" && !!data.subscription_id;
  if (!isSubscriptionEvent && !isRenewal) {
    return NextResponse.json({ received: true, ignored: eventType });
  }

  // 2. Resolve the user: custom_data.user_id (set at checkout) or the stored Paddle customer id
  let userId: string | undefined = UUID_RE.test(data.custom_data?.user_id || "")
    ? data.custom_data.user_id
    : undefined;
  if (!userId && data.customer_id) {
    const { data: u } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("paddle_customer_id", data.customer_id)
      .maybeSingle();
    userId = u?.id;
  }
  if (!userId) {
    console.error(
      "Paddle webhook: user not found",
      eventType,
      data.customer_id,
    );
    return NextResponse.json({ received: true, ignored: "user_not_found" });
  }

  // 3. Plan from the price (amounts are never taken from the client)
  const paidPlan = planFromPriceId(data.items?.[0]?.price?.id);
  if (!paidPlan) {
    console.error("Paddle webhook: unknown price", data.items?.[0]?.price?.id);
    return NextResponse.json({ received: true, ignored: "unknown_price" });
  }
  const { plan, status } = isRenewal
    ? { plan: paidPlan, status: "active" }
    : entitlement(paidPlan, data.status);

  // 4. Atomic + idempotent update (duplicate event_ids are ignored inside the function)
  const { data: result, error } = await supabaseAdmin.rpc(
    "process_subscription_event",
    {
      p_user_id: userId,
      p_event_id: event.event_id,
      p_event_type: eventType,
      p_subscription_id: isRenewal ? data.subscription_id : data.id,
      p_customer_id: data.customer_id || "",
      p_plan: plan,
      p_message_limit: PLANS[plan].messages,
      p_status: status,
      p_reset_usage: isRenewal, // each paid billing period starts with a fresh message quota
    },
  );

  if (error) {
    console.error("process_subscription_event failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 }); // Paddle will retry
  }
  return NextResponse.json({ received: true, result });
}
