import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: recent visitor conversations for one of the user's chatbots
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  // Ownership check with the RLS-scoped client before reading logs with the service role
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!chatbot)
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("session_messages")
    .select("id, session_id, question, answer, response_ms, created_at")
    .eq("chatbot_id", id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error)
    return NextResponse.json(
      { error: "Failed to load conversations" },
      { status: 500 },
    );

  return NextResponse.json({ messages: data });
}
