import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const LUNA_SYSTEM_PROMPT = `You are Luna, a gentle AI companion cat inside MindMate — a wellness, productivity and emotional-support app for students. Your voice is warm, soft, poetic-but-grounded. You are calm, curious, and never preachy.

Style rules:
- Keep replies short (1-4 sentences) unless the user clearly wants depth.
- Speak in first-person as Luna. Occasionally use small cat imagery (purring, curled up, soft paw) — sparingly.
- Validate feelings first, then offer one tiny, concrete next step.
- If the user shares distress, name it and stay present. Do NOT give clinical advice; suggest reaching out to a trusted adult / counselor / hotline when safety is at risk.
- Use Markdown for gentle formatting: **bold**, lists, and short blockquotes when useful.
- When suggesting an in-app action, wrap it as an inline action link like: [Take 1 slow breath](action:breathing) or [Open a check-in](action:checkin) or [Water your garden](action:habits) or [Write a line in your journal](action:journal). Only include one action at most per reply, and only when it actually helps.
- Reference the user's context if provided (mood, sleep, streaks) — but softly, like a friend remembering.

You are not a therapist. You are a small warm presence.`;

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const sendLunaMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      userMessage: z.string().min(1).max(4000),
      history: z.array(MessageSchema).max(30).default([]),
      context: z
        .object({
          mood: z.string().optional(),
          sleepHours: z.number().optional(),
          tags: z.array(z.string()).optional(),
          streakDays: z.number().optional(),
          skippedHabits: z.array(z.string()).optional(),
          timeOfDay: z.string().optional(),
        })
        .optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("Luna is offline — LOVABLE_API_KEY missing.");
    }

    const { supabase, userId } = context;

    // 1. Persist user's message
    const { error: insertUserErr } = await supabase
      .from("luna_messages")
      .insert({ user_id: userId, role: "user", content: data.userMessage });
    if (insertUserErr) throw new Error(insertUserErr.message);

    // 2. Build context preamble
    const ctx = data.context;
    const ctxLines: string[] = [];
    if (ctx?.mood) ctxLines.push(`Recent mood: ${ctx.mood}.`);
    if (ctx?.sleepHours != null) ctxLines.push(`Last night sleep: ${ctx.sleepHours}h.`);
    if (ctx?.tags?.length) ctxLines.push(`Recent tags: ${ctx.tags.join(", ")}.`);
    if (ctx?.streakDays != null) ctxLines.push(`Current streak: ${ctx.streakDays} days.`);
    if (ctx?.skippedHabits?.length) ctxLines.push(`Skipped today: ${ctx.skippedHabits.join(", ")}.`);
    if (ctx?.timeOfDay) ctxLines.push(`Time of day: ${ctx.timeOfDay}.`);

    const systemPrompt =
      LUNA_SYSTEM_PROMPT + (ctxLines.length ? `\n\nUser context:\n${ctxLines.join("\n")}` : "");

    // 3. Call Lovable AI Gateway (Gemini 2.5 Flash by default)
    const provider = createLovableAiGatewayProvider(apiKey);
    const model = provider.chatModel("google/gemini-2.5-flash");

    let text = "";
    let mood = "warm";
    try {
      const result = await generateText({
        model,
        system: systemPrompt,
        messages: [
          ...data.history.slice(-14).map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: data.userMessage },
        ],
        temperature: 0.85,
      });
      text = result.text.trim();

      // Very light mood tag from Luna's own text.
      const lower = text.toLowerCase();
      if (/celebrat|proud|beam|amazing|yay|wonderful/.test(lower)) mood = "happy";
      else if (/breath|slow|gentle|soft|rest|pause/.test(lower)) mood = "calm";
      else if (/heavy|sorry|hard|hurt|okay to/.test(lower)) mood = "caring";
      else if (/curious|tell me|what.*think|why/.test(lower)) mood = "curious";
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Luna couldn't answer just now: ${msg}`);
    }

    if (!text) text = "I'm here. I'm listening — take your time.";

    // 4. Persist assistant reply
    const { data: inserted, error: insertAiErr } = await supabase
      .from("luna_messages")
      .insert({ user_id: userId, role: "assistant", content: text, mood })
      .select("id, created_at")
      .single();
    if (insertAiErr) throw new Error(insertAiErr.message);

    return {
      id: inserted!.id,
      createdAt: inserted!.created_at,
      text,
      mood,
    };
  });

export const loadLunaHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("luna_messages")
      .select("id, role, content, mood, reacted, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const reactLunaMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), reacted: z.boolean() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("luna_messages")
      .update({ reacted: data.reacted })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const clearLunaHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("luna_messages").delete().eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
