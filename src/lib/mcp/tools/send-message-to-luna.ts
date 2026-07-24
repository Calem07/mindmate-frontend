import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const LUNA_SYSTEM_PROMPT = `You are Luna, a gentle AI companion cat inside MindMate — a wellness, productivity and emotional-support app for students. Keep replies short (1-4 sentences), warm, and grounded. Validate feelings first, then one tiny concrete next step. You are not a therapist.`;

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "send_message_to_luna",
  title: "Send a message to Luna",
  description:
    "Send a message from the signed-in user to Luna. Persists both the user's message and Luna's reply to the user's chat history, and returns Luna's reply.",
  inputSchema: {
    message: z.string().min(1).max(4000).describe("The user's message to Luna."),
  },
  annotations: { readOnlyHint: false, openWorldHint: false },
  handler: async ({ message }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { content: [{ type: "text", text: "Luna is offline (missing API key)." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const { error: insertErr } = await supabase
      .from("luna_messages")
      .insert({ user_id: userId, role: "user", content: message });
    if (insertErr) {
      return { content: [{ type: "text", text: insertErr.message }], isError: true };
    }

    const { data: historyRows } = await supabase
      .from("luna_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(14);
    const history = (historyRows ?? []).reverse();

    const provider = createLovableAiGatewayProvider(apiKey);
    const model = provider.chatModel("google/gemini-2.5-flash");

    let text = "";
    try {
      const result = await generateText({
        model,
        system: LUNA_SYSTEM_PROMPT,
        messages: history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        temperature: 0.85,
      });
      text = result.text.trim();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { content: [{ type: "text", text: `Luna couldn't answer: ${msg}` }], isError: true };
    }
    if (!text) text = "I'm here. I'm listening — take your time.";

    const { data: inserted, error: insertAiErr } = await supabase
      .from("luna_messages")
      .insert({ user_id: userId, role: "assistant", content: text, mood: "warm" })
      .select("id, created_at")
      .single();
    if (insertAiErr) {
      return { content: [{ type: "text", text: insertAiErr.message }], isError: true };
    }

    return {
      content: [{ type: "text", text }],
      structuredContent: { id: inserted!.id, createdAt: inserted!.created_at, reply: text },
    };
  },
});
