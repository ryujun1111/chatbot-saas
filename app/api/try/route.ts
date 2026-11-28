import { NextRequest, NextResponse } from "next/server";
import { crawlSite } from "@/lib/crawler";
import { createChatCompletion } from "@/lib/ai-client";
import {
  checkDemoRateLimit,
  recordMessage,
  getClientIP,
} from "@/lib/rate-limit";

// Public "Try it free" demo (no signup). Nothing is stored except the rate-limit log.
//   { action: 'crawl', url }                         → reads up to 3 pages of the site
//   { action: 'chat', url, title, content, message }  → answers from that content (10 msgs/IP/day)
export const maxDuration = 60;

const MAX_CONTEXT = 12000;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  try {
    if (body.action === "crawl") {
      if (typeof body.url !== "string")
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
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
      const content = pages
        .map((p) => `# ${p.title}\n${p.content}`)
        .join("\n\n")
        .slice(0, MAX_CONTEXT);
      return NextResponse.json({
        url: pages[0].url,
        title: pages[0].title,
        pages: pages.length,
        content,
      });
    }

    if (body.action === "chat") {
      const message =
        typeof body.message === "string"
          ? body.message.trim().slice(0, 500)
          : "";
      const content =
        typeof body.content === "string"
          ? body.content.slice(0, MAX_CONTEXT)
          : "";
      const title =
        typeof body.title === "string"
          ? body.title.slice(0, 200)
          : "this website";
      if (!message || !content)
        return NextResponse.json(
          { error: "Message and content are required" },
          { status: 400 },
        );

      const ip = getClientIP(request);
      const limit = await checkDemoRateLimit(ip);
      if (!limit.allowed)
        return NextResponse.json({ error: limit.reason }, { status: 429 });

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

      await recordMessage({
        sessionId: "demo",
        chatbotId: null,
        ip,
        question: message,
        answer,
        responseMs: Date.now() - startedAt,
      });
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Something went wrong";
    console.error("Try demo error:", msg);
    return NextResponse.json(
      {
        error:
          // Crawler errors are written for end users; AI/provider errors are not shown
          body.action === "crawl" && msg.length < 120
            ? msg
            : "Something went wrong. Please try again.",
      },
      { status: 400 },
    );
  }
}
