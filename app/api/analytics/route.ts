import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPlan } from "@/lib/plans";

const DAY = 24 * 60 * 60 * 1000;

// GET /api/analytics?period=7|30|90[&chatbotId=...] — stats for the logged-in user's chatbots only
export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  const period = [7, 30, 90].includes(
    Number(request.nextUrl.searchParams.get("period")),
  )
    ? Number(request.nextUrl.searchParams.get("period"))
    : 30;
  const filterId = request.nextUrl.searchParams.get("chatbotId");

  // 1. The user's chatbots (RLS-scoped) define which message logs may be read
  const { data: chatbots, error } = await supabase
    .from("chatbots")
    .select("id, name, status, created_at")
    .eq("user_id", user.id);
  if (error)
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 },
    );

  if (filterId && !chatbots.some((c) => c.id === filterId)) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }
  const ids = filterId ? [filterId] : chatbots.map((c) => c.id);

  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const startOfPeriod = new Date(now.getTime() - period * DAY);

  // 2. Message logs (service role, restricted to the ids above)
  let totalMessages = 0;
  let monthMessages = 0;
  let rows: {
    chatbot_id: string;
    session_id: string;
    question: string | null;
    response_ms: number | null;
    created_at: string;
  }[] = [];
  if (ids.length > 0) {
    const [total, month, periodRows] = await Promise.all([
      supabaseAdmin
        .from("session_messages")
        .select("id", { count: "exact", head: true })
        .in("chatbot_id", ids),
      supabaseAdmin
        .from("session_messages")
        .select("id", { count: "exact", head: true })
        .in("chatbot_id", ids)
        .gte("created_at", startOfMonth.toISOString()),
      supabaseAdmin
        .from("session_messages")
        .select("chatbot_id, session_id, question, response_ms, created_at")
        .in("chatbot_id", ids)
        .gte("created_at", startOfPeriod.toISOString())
        .order("created_at", { ascending: false })
        .limit(20000),
    ]);
    if (total.error || month.error || periodRows.error) {
      console.error(
        "Analytics query error:",
        total.error || month.error || periodRows.error,
      );
      return NextResponse.json(
        { error: "Failed to load analytics" },
        { status: 500 },
      );
    }
    totalMessages = total.count ?? 0;
    monthMessages = month.count ?? 0;
    rows = periodRows.data;
  }

  // 3. Aggregations
  const daily = new Map<string, number>();
  for (
    let t = startOfPeriod.getTime() + DAY;
    t <= now.getTime() + 1;
    t += DAY
  ) {
    daily.set(new Date(t).toISOString().slice(0, 10), 0);
  }
  const hourly = Array(24).fill(0);
  const perBot = new Map<string, number>();
  const questions = new Map<string, number>();
  const sessions = new Set<string>();
  let responseSum = 0;
  let responseCount = 0;

  for (const r of rows) {
    const day = r.created_at.slice(0, 10);
    if (daily.has(day)) daily.set(day, daily.get(day)! + 1);
    hourly[new Date(r.created_at).getUTCHours()]++;
    perBot.set(r.chatbot_id, (perBot.get(r.chatbot_id) || 0) + 1);
    sessions.add(r.session_id);
    if (r.response_ms) {
      responseSum += r.response_ms;
      responseCount++;
    }
    const q = r.question?.trim().toLowerCase().slice(0, 100);
    if (q) questions.set(q, (questions.get(q) || 0) + 1);
  }

  // 4. Plan usage (rolling monthly window; mirrors check_and_increment_usage)
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("plan, messages_used, message_limit, usage_reset_at")
    .eq("id", user.id)
    .maybeSingle();
  const plan = getPlan(profile?.plan);
  const resetAt = profile?.usage_reset_at
    ? new Date(profile.usage_reset_at)
    : now;
  const windowExpired =
    new Date(resetAt).setUTCMonth(resetAt.getUTCMonth() + 1) <= now.getTime();

  const nameOf = new Map(chatbots.map((c) => [c.id, c.name]));
  return NextResponse.json({
    summary: {
      totalChatbots: chatbots.length,
      activeChatbots: chatbots.filter((c) => c.status === "active").length,
      chatbotsThisMonth: chatbots.filter(
        (c) => new Date(c.created_at) >= startOfMonth,
      ).length,
      totalMessages,
      monthMessages,
      periodMessages: rows.length,
      uniqueVisitors: sessions.size,
      avgResponseTime: responseCount
        ? Math.round(responseSum / responseCount)
        : 0,
    },
    charts: {
      daily: [...daily].map(([date, count]) => ({
        date,
        count,
        label: new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
      })),
      chatbots: [...perBot]
        .map(([id, count]) => ({
          id,
          name: nameOf.get(id) || "Deleted chatbot",
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      hourly: hourly.map((count, hour) => ({
        hour,
        count,
        label: `${String(hour).padStart(2, "0")}:00`,
      })),
    },
    topQuestions: [...questions]
      .map(([question, count]) => ({ question, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    usage: {
      plan: profile?.plan || "free",
      planName: plan.name,
      used: windowExpired ? 0 : (profile?.messages_used ?? 0),
      limit: profile?.message_limit ?? plan.messages,
      chatbotLimit: Number.isFinite(plan.chatbots) ? plan.chatbots : null,
    },
  });
}
