import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { crawlSite, UserError } from "@/lib/crawler";
import { createChatCompletion } from "@/lib/ai-client";
import {
  reserveDemo,
  completeMessage,
  release,
  getClientIP,
} from "@/lib/rate-limit";

// Public "Try it free" demo (no signup). Nothing is stored except the abuse-control log.
//   { action: 'crawl', url }                              → reads up to 3 pages, returns content + signature
//   { action: 'chat', title, content, sig, message }      → answers only from server-signed content
// Crawls and questions share a budget of 15 per IP per day.
export const maxDuration = 60;

const MAX_CONTEXT = 12000;

// Signature proves the content came from our crawler, so the endpoint can't be used as a free
// general-purpose LLM with arbitrary prompts. Keyed with a server-only secret.
function sign(title: string, content: string) {
  return crypto
    .createHmac(
      "sha256",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "missing-secret",
    )
    .update(`try-demo:${title}\n${content}`)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const ip = getClientIP(request);
  let reservationId: string | null = null;

  try {
    if (body.action === "crawl") {
      if (typeof body.url !== "string" || body.url.length > 2000) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
      }
      const slot = await reserveDemo("demo-crawl", ip, body.url);
      if (!slot.ok)
        return NextResponse.json(
          { error: slot.reason },
          { status: slot.status },
        );

      const pages = await crawlSite(body.url, 3, 25000);
      if (pages.length === 0) {
        return NextResponse.json(
          {
            error:
              "Could not read any content from this website. Try another URL.",
          },
          { status: 422 },
        );
      }
      const title = pages[0].title.slice(0, 200);
      const content = pages
        .map((p) => `# ${p.title}\n${p.content}`)
        .join("\n\n")
        .slice(0, MAX_CONTEXT);
      return NextResponse.json({
        url: pages[0].url,
        title,
        pages: pages.length,
        content,
        sig: sign(title, content),
      });
    }

    if (body.action === "chat") {
      const message =
        typeof body.message === "string"
          ? body.message.trim().slice(0, 500)
          : "";
      const content = typeof body.content === "string" ? body.content : "";
      const title = typeof body.title === "string" ? body.title : "";
      const sig = typeof body.sig === "string" ? body.sig : "";
      if (!message || !content)
        return NextResponse.json(
          { error: "Message and content are required" },
          { status: 400 },
        );

      const expected = sign(title, content);
      if (
        sig.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
      ) {
        return NextResponse.json(
          { error: "Demo session expired. Please enter your website again." },
          { status: 400 },
        );
      }

      const slot = await reserveDemo("demo", ip, message);
      if (!slot.ok)
        return NextResponse.json(
          { error: slot.reason },
          { status: slot.status },
        );
      reservationId = slot.id;

      const startedAt = Date.now();
      const answer = await createChatCompletion({
        maxTokens: 400,
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for the website "${title}". Answer ONLY from the website content below. If the answer isn't there, say so. Reply in the user's language, concisely.\n\nWebsite content:\n${content}`,
          },
          { role: "user", content: message },
        ],
      });

      await completeMessage(reservationId, answer, Date.now() - startedAt);
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (reservationId) await release(reservationId);
    console.error(
      "Try demo error:",
      error instanceof Error ? error.message : error,
    );
    // Only crawler validation messages are meant for end users
    const message =
      error instanceof UserError
        ? error.message
        : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
