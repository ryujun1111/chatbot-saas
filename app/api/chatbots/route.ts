import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createChatbotSchema } from "@/lib/types/chatbot";
import { getPlan } from "@/lib/plans";

// GET: current user's chatbots (RLS-scoped)
export async function GET() {
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  const { data: chatbots, error } = await supabase
    .from("chatbots")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Chatbot list error:", error);
    return NextResponse.json(
      { error: "Failed to load chatbots" },
      { status: 500 },
    );
  }
  return NextResponse.json({ chatbots });
}

// POST: create a chatbot (enforces the plan's chatbot limit)
export async function POST(request: NextRequest) {
  const { supabase, user } = await getAuthUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  const parsed = createChatbotSchema.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // Plan limit check — plan is read server-side, never trusted from the client
  const [{ data: profile }, { count }] = await Promise.all([
    supabaseAdmin.from("users").select("plan").eq("id", user.id).maybeSingle(),
    supabase
      .from("chatbots")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);
  const plan = getPlan(profile?.plan);
  if ((count ?? 0) >= plan.chatbots) {
    return NextResponse.json(
      {
        error: `Your ${plan.name} plan allows ${plan.chatbots} chatbot${plan.chatbots === 1 ? "" : "s"}. Upgrade your plan to create more.`,
      },
      { status: 403 },
    );
  }

  const { data: chatbot, error } = await supabase
    .from("chatbots")
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description || null,
      website_url: input.website_url || null,
      initial_message: input.initial_message,
      color: input.color,
      model: input.model,
      temperature: input.temperature,
      max_tokens: input.max_tokens,
      status: "active",
    })
    .select()
    .single();

  if (error) {
    console.error("Chatbot create error:", error);
    return NextResponse.json(
      { error: "Failed to create chatbot" },
      { status: 500 },
    );
  }
  return NextResponse.json({ chatbot }, { status: 201 });
}
