/**
 * Server-side rate limiting + message log, backed by the session_messages table.
 * Fails closed: if the limiter can't be checked, the request is denied.
 */
import { supabaseAdmin } from "@/lib/supabase/admin";

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
}

// Count rows matching a filter within the last `windowMs`
async function countSince(
  column: "session_id" | "ip_address",
  value: string,
  windowMs: number,
  demoOnly = false,
) {
  let query = supabaseAdmin
    .from("session_messages")
    .select("id", { count: "exact", head: true })
    .eq(column, value)
    .gte("created_at", new Date(Date.now() - windowMs).toISOString());
  if (demoOnly) query = query.is("chatbot_id", null);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Widget chat: 50 messages per visitor session per day, 100 per IP per hour
export async function checkChatRateLimit(
  sessionId: string,
  ip: string,
): Promise<RateLimitResult> {
  try {
    if ((await countSince("session_id", sessionId, DAY)) >= 50) {
      return {
        allowed: false,
        reason:
          "Message limit reached for this session. Please try again tomorrow.",
      };
    }
    if ((await countSince("ip_address", ip, HOUR)) >= 100) {
      return {
        allowed: false,
        reason: "Too many requests. Please try again in an hour.",
      };
    }
    return { allowed: true };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return {
      allowed: false,
      reason: "Service temporarily unavailable. Please try again.",
    };
  }
}

// Public /try demo: 10 messages per IP per day
export async function checkDemoRateLimit(ip: string): Promise<RateLimitResult> {
  try {
    if ((await countSince("ip_address", ip, DAY, true)) >= 10) {
      return {
        allowed: false,
        reason: "Free demo limit reached. Sign up to keep chatting.",
      };
    }
    return { allowed: true };
  } catch (error) {
    console.error("Demo rate limit check failed:", error);
    return {
      allowed: false,
      reason: "Service temporarily unavailable. Please try again.",
    };
  }
}

export async function recordMessage(entry: {
  sessionId: string;
  chatbotId: string | null;
  ip: string;
  question: string;
  answer: string;
  responseMs: number;
}): Promise<void> {
  const { error } = await supabaseAdmin.from("session_messages").insert({
    session_id: entry.sessionId,
    chatbot_id: entry.chatbotId,
    ip_address: entry.ip,
    question: entry.question,
    answer: entry.answer,
    response_ms: entry.responseMs,
  });
  if (error) console.error("Error recording message:", error);
}

// Vercel overwrites x-forwarded-for with the real client IP, so the first entry is trustworthy there
export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
