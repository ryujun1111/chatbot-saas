import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAuthUser } from "@/lib/supabase/server";
import { splitTextIntoChunks, createEmbeddings } from "@/lib/ai-client";
import { crawlSite, UserError } from "@/lib/crawler";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { detectFileType, extractText, MAX_FILE_BYTES } from "@/lib/file-parser";

// Knowledge base API. Each `documents` row is one embedded chunk; rows sharing a source_id
// form one "source" (a crawled page, an uploaded file or a pasted text).
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHUNKS_PER_CHATBOT = 3000;

type Supabase = Awaited<ReturnType<typeof getAuthUser>>["supabase"];

// Returns true only if the chatbot belongs to the logged-in user
async function ownsChatbot(
  supabase: Supabase,
  userId: string,
  chatbotId: unknown,
) {
  if (typeof chatbotId !== "string" || !chatbotId) return false;
  const { data } = await supabase
    .from("chatbots")
    .select("id")
    .eq("id", chatbotId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

// Chunk + embed + insert. Returns number of chunks stored.
async function storeSources(
  supabase: Supabase,
  chatbotId: string,
  sources: {
    title: string;
    url: string | null;
    source: "url" | "file" | "text";
    text: string;
  }[],
) {
  const rows = sources.flatMap((s) => {
    const sourceId = randomUUID();
    return splitTextIntoChunks(s.text).map((content) => ({
      chatbot_id: chatbotId,
      source_id: sourceId,
      title: s.title.slice(0, 300),
      url: s.url,
      source: s.source,
      content,
    }));
  });
  if (rows.length === 0) throw new UserError("No readable text found");

  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("chatbot_id", chatbotId);
  if ((count ?? 0) + rows.length > MAX_CHUNKS_PER_CHATBOT) {
    throw new UserError(
      "Knowledge base is full for this chatbot. Delete some sources first.",
    );
  }

  // Embed and insert in batches of 100 chunks
  for (let i = 0; i < rows.length; i += 100) {
    const batch = rows.slice(i, i + 100);
    const embeddings = await createEmbeddings(batch.map((r) => r.content));
    // Insert with the service role: users have no direct INSERT policy (keeps the chunk cap enforceable).
    // Ownership of chatbotId was verified by the caller before this point.
    const { error } = await supabaseAdmin
      .from("documents")
      .insert(batch.map((r, j) => ({ ...r, embedding: embeddings[j] })));
    if (error) throw new Error(`Failed to save knowledge: ${error.message}`);
  }
  return rows.length;
}

// GET /api/documents?chatbot_id=... → list of sources with chunk counts
export async function GET(request: NextRequest) {
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );

  const chatbotId = request.nextUrl.searchParams.get("chatbot_id");
  if (!(await ownsChatbot(supabase, user.id, chatbotId))) {
    return NextResponse.json(
      { success: false, error: "Chatbot not found" },
      { status: 404 },
    );
  }

  const { data, error } = await supabase
    .from("documents")
    .select("source_id, title, url, source, created_at")
    .eq("chatbot_id", chatbotId!)
    .order("created_at", { ascending: false })
    .limit(MAX_CHUNKS_PER_CHATBOT);
  if (error)
    return NextResponse.json(
      { success: false, error: "Failed to load documents" },
      { status: 500 },
    );

  const grouped = new Map<
    string,
    {
      id: string;
      title: string;
      url: string | null;
      source: string;
      chunk_count: number;
      created_at: string;
    }
  >();
  for (const row of data) {
    const g = grouped.get(row.source_id);
    if (g) g.chunk_count++;
    else
      grouped.set(row.source_id, {
        id: row.source_id,
        title: row.title || row.url || "Untitled",
        url: row.url,
        source: row.source,
        chunk_count: 1,
        created_at: row.created_at,
      });
  }
  return NextResponse.json({ success: true, documents: [...grouped.values()] });
}

// POST /api/documents → add knowledge: { source: 'url' | 'text' } JSON, or multipart file upload
export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );

  try {
    // File upload
    if (
      (request.headers.get("content-type") || "").includes(
        "multipart/form-data",
      )
    ) {
      // Reject oversized uploads before buffering the whole body
      if (Number(request.headers.get("content-length") || 0) > MAX_FILE_BYTES + 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "File must be 10MB or smaller" },
          { status: 413 },
        );
      }
      const form = await request.formData();
      const chatbotId = form.get("chatbot_id");
      const file = form.get("file");
      if (!(await ownsChatbot(supabase, user.id, chatbotId))) {
        return NextResponse.json(
          { success: false, error: "Chatbot not found" },
          { status: 404 },
        );
      }
      if (!(file instanceof File))
        return NextResponse.json(
          { success: false, error: "File is required" },
          { status: 400 },
        );
      if (file.size > MAX_FILE_BYTES)
        return NextResponse.json(
          { success: false, error: "File must be 10MB or smaller" },
          { status: 400 },
        );
      const type = detectFileType(file);
      if (!type)
        return NextResponse.json(
          {
            success: false,
            error: "Only PDF, DOCX and TXT files are supported",
          },
          { status: 400 },
        );

      const text = await extractText(
        Buffer.from(await file.arrayBuffer()),
        type,
      );
      const chunks = await storeSources(supabase, chatbotId as string, [
        { title: file.name, url: null, source: "file", text },
      ]);
      return NextResponse.json({ success: true, sources: 1, chunks });
    }

    const body = await request.json().catch(() => ({}));
    if (!(await ownsChatbot(supabase, user.id, body.chatbot_id))) {
      return NextResponse.json(
        { success: false, error: "Chatbot not found" },
        { status: 404 },
      );
    }

    // Website crawl: same-site pages starting at the given URL
    if (body.source === "url") {
      if (typeof body.url !== "string" || !body.url.trim()) {
        return NextResponse.json(
          { success: false, error: "URL is required" },
          { status: 400 },
        );
      }
      const maxPages = Math.max(1, Math.min(Number(body.maxPages) || 10, 25));
      const pages = await crawlSite(body.url, maxPages);
      if (pages.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Could not read any content from this website. It may block crawlers or render content with JavaScript only.",
          },
          { status: 422 },
        );
      }
      // Re-training a URL replaces its previous content
      await supabase
        .from("documents")
        .delete()
        .eq("chatbot_id", body.chatbot_id)
        .in(
          "url",
          pages.map((p) => p.url),
        );
      const chunks = await storeSources(
        supabase,
        body.chatbot_id,
        pages.map((p) => ({
          title: p.title,
          url: p.url,
          source: "url" as const,
          text: p.content,
        })),
      );
      return NextResponse.json({
        success: true,
        sources: pages.length,
        chunks,
        pages: pages.map((p) => ({ url: p.url, title: p.title })),
      });
    }

    // Pasted text
    if (body.source === "text") {
      const title = typeof body.title === "string" ? body.title.trim() : "";
      const content = typeof body.content === "string" ? body.content : "";
      if (!title || !content.trim())
        return NextResponse.json(
          { success: false, error: "Title and content are required" },
          { status: 400 },
        );
      if (content.length > 100000)
        return NextResponse.json(
          {
            success: false,
            error: "Text is too long (max 100,000 characters)",
          },
          { status: 400 },
        );
      const chunks = await storeSources(supabase, body.chatbot_id, [
        { title, url: null, source: "text", text: content },
      ]);
      return NextResponse.json({ success: true, sources: 1, chunks });
    }

    return NextResponse.json(
      { success: false, error: "Invalid source type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Document upload error:", error);
    // Only validation messages are shown to users; internal errors stay in the logs
    const message =
      error instanceof UserError
        ? error.message
        : "Could not process this content. Please try again or use a different source.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 },
    );
  }
}

// DELETE /api/documents?chatbot_id=...&id=<source_id>
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );

  const chatbotId = request.nextUrl.searchParams.get("chatbot_id");
  const sourceId = request.nextUrl.searchParams.get("id");
  if (!sourceId || !(await ownsChatbot(supabase, user.id, chatbotId))) {
    return NextResponse.json(
      { success: false, error: "Document not found" },
      { status: 404 },
    );
  }

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("chatbot_id", chatbotId!)
    .eq("source_id", sourceId);
  if (error)
    return NextResponse.json(
      { success: false, error: "Failed to delete document" },
      { status: 500 },
    );
  return NextResponse.json({ success: true });
}
