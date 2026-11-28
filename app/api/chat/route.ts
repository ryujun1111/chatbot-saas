import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  createEmbeddings,
  createChatCompletion,
  type ChatMessage,
} from "@/lib/ai-client";
import {
  reserveChatMessage,
  completeMessage,
  release,
  getClientIP,
} from "@/lib/rate-limit";
import { corsJson, corsPreflight } from "@/lib/cors";

// Public endpoint used by the embeddable widget (cross-origin)
export const maxDuration = 30;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function OPTIONS() {
  return corsPreflight();
}

// GET /api/chat?chatbotId=... → public widget config (whitelisted fields only)
export async function GET(request: NextRequest) {
  const chatbotId = request.nextUrl.searchParams.get("chatbotId") || "";
  if (!UUID_RE.test(chatbotId))
    return corsJson({ error: "Invalid chatbotId" }, 400);

  const { data } = await supabaseAdmin
    .from("chatbots")
    .select("name, color, initial_message, status")
    .eq("id", chatbotId)
    .maybeSingle();

  if (!data || data.status !== "active")
    return corsJson({ error: "Chatbot not found" }, 404);
  return corsJson({
    name: data.name,
    color: data.color,
    initialMessage: data.initial_message,
  });
}

// POST /api/chat → RAG answer
export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  let reservationId: string | null = null;
  try {
    const body = await request.json().catch(() => null);
    const chatbotId = body?.chatbotId;
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId.slice(0, 100) : "";

    // 1. Input validation
    if (typeof chatbotId !== "string" || !UUID_RE.test(chatbotId))
      return corsJson({ error: "Invalid chatbotId" }, 400);
    if (!message) return corsJson({ error: "Message is required" }, 400);
    if (message.length > 2000)
      return corsJson({ error: "Message too long (max 2000 characters)" }, 400);
    if (!sessionId) return corsJson({ error: "sessionId is required" }, 400);

    // Last few turns for follow-up questions (client-supplied, so strictly capped)
    const history: ChatMessage[] = Array.isArray(body?.history)
      ? body.history
          .filter(
            (m: any) =>
              (m?.role === "user" || m?.role === "assistant") &&
              typeof m?.content === "string",
          )
          .slice(-6)
          .map((m: any) => ({
            role: m.role,
            content: m.content.slice(0, 1000),
          }))
      : [];

    // 2. Chatbot must exist and be active
    const { data: chatbot } = await supabaseAdmin
      .from("chatbots")
      .select("user_id, name, model, temperature, max_tokens, status")
      .eq("id", chatbotId)
      .maybeSingle();
    if (!chatbot) return corsJson({ error: "Chatbot not found" }, 404);
    if (chatbot.status !== "active")
      return corsJson({ error: "This chatbot is currently offline." }, 403);

    // 3. Abuse protection before any paid API call (reserve-then-count, race-safe)
    const ip = getClientIP(request);
    const slot = await reserveChatMessage(sessionId, chatbotId, ip, message);
    if (!slot.ok) return corsJson({ error: slot.reason }, slot.status);
    reservationId = slot.id;

    // 4. Owner's monthly plan quota (atomic check + increment)
    const { data: usage, error: usageError } = await supabaseAdmin.rpc(
      "check_and_increment_usage",
      {
        p_user_id: chatbot.user_id,
      },
    );
    const quota = Array.isArray(usage) ? usage[0] : usage;
    if (usageError) {
      console.error("Usage check failed:", usageError);
      await release(reservationId);
      return corsJson(
        { error: "Service temporarily unavailable. Please try again." },
        503,
      );
    }
    if (!quota?.can_use) {
      await release(reservationId);
      return corsJson(
        {
          error:
            "This chatbot has reached its monthly message limit. Please contact the site owner.",
        },
        429,
      );
    }

    // 5. Retrieve relevant knowledge (vector search scoped to this chatbot)
    const [questionEmbedding] = await createEmbeddings([message]);
    const { data: documents, error: searchError } = await supabaseAdmin.rpc(
      "match_documents",
      {
        query_embedding: questionEmbedding,
        match_threshold: 0.3,
        match_count: 5,
        p_chatbot_id: chatbotId,
      },
    );
    if (searchError) {
      console.error("Vector search error:", searchError);
      await release(reservationId);
      return corsJson(
        { error: "Service temporarily unavailable. Please try again." },
        503,
      );
    }

    const context = (documents || [])
      .map((d: any) => d.content)
      .join("\n\n---\n\n");
    const sources = [
      ...new Set((documents || []).map((d: any) => d.url).filter(Boolean)),
    ] as string[];

    // 6. Generate the answer, grounded in the retrieved context
    const answer = await createChatCompletion({
      model: chatbot.model,
      temperature: chatbot.temperature,
      maxTokens: Math.min(chatbot.max_tokens || 500, 2000),
      messages: [
        {
          role: "system",
          content: `You are "${chatbot.name}", a helpful assistant on a business website.
Answer using ONLY the information in the context below. If the answer is not in the context, say you don't have that information and suggest contacting the business directly. Never invent prices, policies or contact details.
You may respond to greetings and small talk briefly and politely.
Always answer in the same language as the user's latest message. Be concise and specific.

Context:
${context || "(no relevant information found)"}`,
        },
        ...history,
        { role: "user", content: message },
      ],
    });

    // 7. Store the answer on the reserved row (conversation history + analytics)
    await completeMessage(reservationId, answer, Date.now() - startedAt);

    return corsJson({ answer, sources });
  } catch (error) {
    console.error("Chat API error:", error);
    if (reservationId) await release(reservationId);
    return corsJson(
      { error: "Failed to generate a response. Please try again." },
      500,
    );
  }
}
