/**
 * Server-side rate limiting + message log, backed by the session_messages table.
 * Reserve-then-count: the request's own row is inserted FIRST and then counted, so a burst of
 * parallel requests can't all pass the check before any of them is recorded.
 * Fails closed: if the limiter can't be checked, the request is denied.
 * Rows with chatbot_id NULL are abuse-control entries (demo, demo crawl, signup) — never shown in analytics.
 */
import { supabaseAdmin } from "@/lib/supabase/admin";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

interface Limit {
  filters: Record<string, string>; // column = value
  windowMs: number;
  max: number;
  reason: string;
  abuseLogOnly?: boolean; // count only chatbot_id IS NULL rows
}

type Reservation =
  { ok: true; id: string } | { ok: false; reason: string; status: number };

async function reserve(
  row: {
    sessionId: string;
    chatbotId: string | null;
    ip: string;
    question: string | null;
  },
  limits: Limit[],
): Promise<Reservation> {
  const { data, error } = await supabaseAdmin
    .from("session_messages")
    .insert({
      session_id: row.sessionId,
      chatbot_id: row.chatbotId,
      ip_address: row.ip,
      question: row.question,
    })
    .select("id")
    .single();
  if (error || !data) {
    console.error("Rate limit reserve failed:", error);
    return {
      ok: false,
      reason: "Service temporarily unavailable. Please try again.",
      status: 503,
    };
  }

  try {
    for (const limit of limits) {
      let query = supabaseAdmin
        .from("session_messages")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - limit.windowMs).toISOString());
      for (const [column, value] of Object.entries(limit.filters))
        query = query.eq(column, value);
      if (limit.abuseLogOnly) query = query.is("chatbot_id", null);
      const { count, error: countError } = await query;
      if (countError) throw countError;
      if ((count ?? 0) > limit.max) {
        await release(data.id);
        return { ok: false, reason: limit.reason, status: 429 };
      }
    }
    return { ok: true, id: data.id };
  } catch (e) {
    console.error("Rate limit check failed:", e);
    await release(data.id);
    return {
      ok: false,
      reason: "Service temporarily unavailable. Please try again.",
      status: 503,
    };
  }
}

// Widget chat: 50 messages per visitor session per day, 30 per IP (or IPv6 /64) per hour
export function reserveChatMessage(
  sessionId: string,
  chatbotId: string,
  ip: string,
  question: string,
) {
  return reserve({ sessionId, chatbotId, ip, question }, [
    {
      filters: { session_id: sessionId },
      windowMs: DAY,
      max: 50,
      reason:
        "Message limit reached for this session. Please try again tomorrow.",
    },
    {
      filters: { ip_address: ip },
      windowMs: HOUR,
      max: 30,
      reason: "Too many messages. Please try again later.",
    },
  ]);
}

// Public /try demo: crawls + questions share 15 per IP per day
export function reserveDemo(
  kind: "demo" | "demo-crawl",
  ip: string,
  question: string,
) {
  return reserve({ sessionId: kind, chatbotId: null, ip, question }, [
    {
      filters: { ip_address: ip },
      windowMs: DAY,
      max: 15,
      abuseLogOnly: true,
      reason: "Free demo limit reached. Sign up to keep chatting.",
    },
  ]);
}

// Account creation: 5 per IP per day
export function reserveSignup(ip: string) {
  return reserve({ sessionId: "signup", chatbotId: null, ip, question: null }, [
    {
      filters: { ip_address: ip, session_id: "signup" },
      windowMs: DAY,
      max: 5,
      abuseLogOnly: true,
      reason: "Too many sign-ups from this network. Please try again tomorrow.",
    },
  ]);
}

// Store the answer on the reserved row (conversation log + analytics)
export async function completeMessage(
  id: string,
  answer: string,
  responseMs: number,
) {
  const { error } = await supabaseAdmin
    .from("session_messages")
    .update({ answer, response_ms: responseMs })
    .eq("id", id);
  if (error) console.error("Error recording answer:", error);
}

// Drop a reservation (request rejected or failed before producing an answer)
export async function release(id: string) {
  await supabaseAdmin.from("session_messages").delete().eq("id", id);
}

// Client IP. Vercel overwrites x-forwarded-for with the real client IP, so the first entry is trustworthy.
// IPv6 addresses are grouped by /64 (one customer usually controls a whole /64).
export function getClientIP(request: Request): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!ip.includes(":") || ip.includes(".")) return ip;
  const [head, tail = ""] = ip.toLowerCase().split("::");
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const full = [
    ...h,
    ...Array(Math.max(0, 8 - h.length - t.length)).fill("0"),
    ...t,
  ];
  return `${full.slice(0, 4).join(":")}::/64`;
}
