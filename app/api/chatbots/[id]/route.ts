import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { updateChatbotSchema } from "@/lib/types/chatbot";

type Params = { params: Promise<{ id: string }> };

// All queries go through the RLS-scoped client AND filter by user_id (defense in depth)

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!chatbot)
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  return NextResponse.json({ chatbot });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  const parsed = updateChatbotSchema.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
  // Empty URL field means "remove the website URL"
  const update = {
    ...parsed.data,
    website_url:
      parsed.data.website_url === "" ? null : parsed.data.website_url,
    updated_at: new Date().toISOString(),
  };

  const { data: chatbot } = await supabase
    .from("chatbots")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .maybeSingle();

  if (!chatbot)
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  return NextResponse.json({ chatbot });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  // Documents and message logs are removed by ON DELETE CASCADE
  const { data, error } = await supabase
    .from("chatbots")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (error)
    return NextResponse.json(
      { error: "Failed to delete chatbot" },
      { status: 500 },
    );
  if (!data?.length)
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
