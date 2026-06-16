import { createFileRoute } from "@tanstack/react-router";
import { Settings, Play, Send, Heart, Award, Sparkles, Paperclip, Image as ImageIcon, Mic, Camera, X, RefreshCw, MessageCircle } from "lucide-react";
import luna from "@/assets/luna.png";
import waves from "@/assets/waves.jpg";
import { Shell, ScreenHeader } from "@/components/Shell";
import { luna as lunaData, lastCheckIn, habits } from "@/data/mock";
import { EmptyState, ErrorState } from "@/components/StateViews";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/luna")({
  head: () => ({ meta: [{ title: "Luna — Your companion" }, { name: "description", content: "Chat with Luna, your AI companion who grows alongside you." }] }),
  component: LunaScreen,
});

type Msg = {
  id: string;
  from: "luna" | "me";
  text: string;
  time: string;
  attachment?: { kind: "image" | "audio" | "file"; name: string };
  status?: "sending" | "sent" | "error";
};

type Suggestion = { label: string; reply: string; reason?: string };

function buildContextSuggestions(): Suggestion[] {
  const out: Suggestion[] = [];
  const mood = lastCheckIn.mood;
  const tags = lastCheckIn.tags;
  const skipped = habits.filter((h) => h.status === "not_started");
  const inProgress = habits.filter((h) => h.status === "in_progress");
  const longestStreak = habits.reduce((a, b) => (b.streak > a.streak ? b : a), habits[0]);
  const hour = new Date().getHours();

  // Mood-aware
  if (mood === "low" || mood === "rough") {
    out.push({
      label: "Yesterday felt heavy",
      reason: `Your last check-in was ${mood}`,
      reply: "I remember. Heavy days deserve softer mornings. Want to start with one slow breath instead of a list?",
    });
  } else if (mood === "okay") {
    out.push({
      label: "Help me lift today a little",
      reason: "Yesterday was just okay",
      reply: "Let's find one small bright thing. What's the easiest kind thing you could do for yourself in the next hour?",
    });
  } else {
    out.push({
      label: "Help me keep this momentum",
      reason: `Yesterday felt ${mood}`,
      reply: "Yes! Let's protect this energy. Pick one ritual to anchor it — even five minutes counts.",
    });
  }

  // Sleep-aware
  if (lastCheckIn.sleepHours < 7) {
    out.push({
      label: "I slept badly",
      reason: `Only ${lastCheckIn.sleepHours}h of sleep`,
      reply: "Tired bodies carry tired thoughts. Be gentle today. Water, light, and one easy win — that's the plan.",
    });
  }

  // Tag-aware (exam stress)
  if (tags.includes("exam-stress") || tags.includes("anxious")) {
    out.push({
      label: "Calm my exam nerves",
      reason: "You mentioned exam stress",
      reply: "Feet on the floor. Shoulders down. You've prepared more than your fear tells you. Want a 2-min grounding with me?",
    });
  }

  // Habit-aware
  if (skipped.length > 0) {
    const h = skipped[0];
    out.push({
      label: `Nudge me on ${h.name.toLowerCase()}`,
      reason: "Not started today",
      reply: `No pressure — let's shrink it. Could you do just 10% of "${h.name}" right now? I'll be here when you're back.`,
    });
  }
  if (inProgress.length > 0) {
    const h = inProgress[0];
    out.push({
      label: `Finish ${h.name.toLowerCase()} with me`,
      reason: "In progress",
      reply: `You're already moving. Want me to set a quiet timer for the last stretch of "${h.name}"?`,
    });
  }
  if (longestStreak && longestStreak.streak >= 5) {
    out.push({
      label: `Celebrate my ${longestStreak.streak}-day streak`,
      reason: longestStreak.name,
      reply: `${longestStreak.streak} days of "${longestStreak.name}" — that's not luck, that's you choosing yourself. I'm beaming.`,
    });
  }

  // Time-aware
  if (hour < 11) {
    out.push({ label: "Set a soft intention", reason: "Morning", reply: "Beautiful. Finish this sentence with me: 'Today, I want to feel ___.'" });
  } else if (hour >= 21) {
    out.push({ label: "Help me wind down", reason: "Late evening", reply: "Dim the lights. One long exhale. Tomorrow can wait — let's land here first." });
  } else {
    out.push({ label: "I need a midday reset", reason: "Afternoon", reply: "Stand up, look far, drink water. 60 seconds. I'll wait — then we go again." });
  }

  return out.slice(0, 4);
}

const followupSuggestions = [
  "Why do I feel this way?",
  "Help me reframe this",
  "Suggest a tiny next step",
  "Just sit with me",
];

const lunaReplies = [
  "Mm, tell me more. I'm right here.",
  "That sounds heavy. You don't have to carry it alone tonight.",
  "I love that you noticed that about yourself. That's growth.",
  "Let's name it together — sometimes feelings get smaller in the light.",
];

function uid() { return Math.random().toString(36).slice(2, 9); }
function nowTime() { return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }

function LunaScreen() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: uid(), from: "luna", text: "Hey you. I've been thinking about you. How are you, really?", time: "9:30 AM", status: "sent" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [pending, setPending] = useState<{ kind: "image" | "audio" | "file"; name: string } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const contextSuggestions = useMemo(() => buildContextSuggestions(), []);
  const showStarters = useMemo(() => messages.filter((m) => m.from === "me").length === 0, [messages]);

  const respond = (userText: string, msgId: string) => {
    setTyping(true);
    // Simulate occasional failure (~8%)
    const willFail = Math.random() < 0.08;
    setTimeout(() => {
      setTyping(false);
      if (willFail) {
        setError("Luna couldn't reach you just now. Tap retry — she's still here.");
        setMessages((m) => m.map((x) => (x.id === msgId ? { ...x, status: "error" } : x)));
        return;
      }
      const starter = contextSuggestions.find((s) => s.label.toLowerCase() === userText.toLowerCase());
      const reply = starter
        ? starter.reply
        : lunaReplies[Math.floor(Math.random() * lunaReplies.length)] + " " + lunaData.whispers[Math.floor(Math.random() * lunaData.whispers.length)];
      setMessages((m) => [...m, { id: uid(), from: "luna", text: reply, time: nowTime(), status: "sent" }]);
    }, 1100 + Math.random() * 700);
  };

  const send = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value && !pending) return;
    setError(null);
    const id = uid();
    const msg: Msg = {
      id, from: "me",
      text: value || (pending ? `Shared ${pending.kind}` : ""),
      time: nowTime(),
      attachment: pending ?? undefined,
      status: "sending",
    };
    setMessages((m) => [...m, msg]);
    setInput("");
    setPending(null);
    setAttachOpen(false);
    // mark sent quickly
    setTimeout(() => setMessages((m) => m.map((x) => (x.id === id ? { ...x, status: "sent" } : x))), 250);
    respond(value || "(attachment)", id);
  };

  const retryLast = () => {
    setError(null);
    const lastMine = [...messages].reverse().find((m) => m.from === "me");
    if (!lastMine) return;
    setMessages((m) => m.map((x) => (x.id === lastMine.id ? { ...x, status: "sending" } : x)));
    respond(lastMine.text, lastMine.id);
    setTimeout(() => setMessages((m) => m.map((x) => (x.id === lastMine.id ? { ...x, status: "sent" } : x))), 250);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <Shell>
      <ScreenHeader
        title="Luna"
        back
        right={
          <button onClick={clearChat} className="glass flex h-9 w-9 items-center justify-center rounded-full" aria-label="Reset chat">
            <Settings className="h-4 w-4" />
          </button>
        }
      />

      <div className="px-5">
        <div className="glass-strong flex items-center justify-center gap-3 rounded-full px-4 py-2">
          <span className="rounded-full bg-purple/20 px-2 py-0.5 text-[10px] font-semibold text-purple">LV {lunaData.level}</span>
          <span className="text-xs"><Heart className="mr-1 inline h-3 w-3 text-purple" />82% Bond</span>
          <span className="text-xs"><Award className="mr-1 inline h-3 w-3 text-primary" />{lunaData.memories} Memories</span>
        </div>
      </div>

      <div className="space-y-4 px-5 pb-44 pt-5">
        {messages.length === 0 && (
          <EmptyState
            icon={MessageCircle}
            title="Your space with Luna is clear"
            body="Say hi, share what's on your mind, or pick a soft prompt below."
          />
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex items-end gap-2 ${m.from === "me" ? "flex-row-reverse" : ""}`}>
            {m.from === "luna" ? (
              <div className="h-9 w-9 shrink-0 rounded-full bg-purple/20 p-1">
                <img src={luna} alt="" width={28} height={28} className="h-full w-full object-contain" />
              </div>
            ) : <div className="w-9" />}
            <div className="max-w-[78%]">
              <div className={`rounded-3xl px-4 py-3 text-sm leading-relaxed ${m.from === "me" ? "gradient-primary text-white rounded-br-md" : "glass-strong rounded-bl-md"} ${m.status === "error" ? "opacity-70" : ""}`}>
                {m.attachment && (
                  <div className="mb-2 flex items-center gap-2 rounded-2xl bg-black/20 px-3 py-2 text-xs">
                    {m.attachment.kind === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : m.attachment.kind === "audio" ? <Mic className="h-3.5 w-3.5" /> : <Paperclip className="h-3.5 w-3.5" />}
                    <span className="truncate">{m.attachment.name}</span>
                  </div>
                )}
                {m.text}
              </div>
              <p className={`mt-1 flex items-center gap-1 text-[10px] text-muted-foreground ${m.from === "me" ? "justify-end" : ""}`}>
                {m.time}
                {m.status === "sending" && <span className="text-muted-foreground/70">· sending…</span>}
                {m.status === "error" && <span className="text-destructive">· failed</span>}
              </p>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex items-end gap-2">
            <div className="h-9 w-9 shrink-0 rounded-full bg-purple/20 p-1">
              <img src={luna} alt="" width={28} height={28} className="h-full w-full object-contain" />
            </div>
            <div className="glass-strong flex gap-1 rounded-3xl rounded-bl-md px-4 py-3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple [animation-delay:240ms]" />
            </div>
          </div>
        )}

        {error && (
          <ErrorState title="Luna's signal flickered" body={error} onRetry={retryLast} />
        )}

        {/* Suggestions */}
        {!typing && !error && (
          <div className="space-y-2 pl-11">
            {showStarters && (
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Picked for you · based on yesterday's check-in
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {showStarters
                ? contextSuggestions.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => send(s.label)}
                      className="glass flex flex-col items-start gap-0.5 rounded-2xl px-3 py-2 text-left"
                    >
                      <span className="text-[11px] font-semibold text-purple">
                        <Sparkles className="mr-1 inline h-3 w-3" />
                        {s.label}
                      </span>
                      {s.reason && (
                        <span className="text-[9px] text-muted-foreground">{s.reason}</span>
                      )}
                    </button>
                  ))
                : followupSuggestions.map((s) => (
                    <button key={s} onClick={() => send(s)} className="glass rounded-full px-3 py-1.5 text-[11px] font-semibold text-purple">
                      <Sparkles className="mr-1 inline h-3 w-3" />
                      {s}
                    </button>
                  ))}
            </div>
          </div>
        )}

        {/* Breathing card */}
        {showStarters && (
          <div className="relative overflow-hidden rounded-3xl glass-strong">
            <img src={waves} alt="" width={1024} height={512} className="absolute inset-0 h-full w-full object-cover opacity-60" loading="lazy" />
            <div className="relative flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold">Breathe with me</p>
                <p className="text-xs text-muted-foreground">1 min breathing exercise</p>
              </div>
              <button className="flex h-11 w-11 items-center justify-center rounded-full gradient-primary glow-cyan">
                <Play className="ml-0.5 h-5 w-5 text-white" fill="currentColor" />
              </button>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="fixed bottom-24 left-0 right-0 z-30">
        <div className="mx-auto max-w-md px-5">
          {attachOpen && (
            <div className="glass-strong mb-2 flex items-center justify-around rounded-2xl p-3">
              {[
                { kind: "image" as const, icon: ImageIcon, label: "Photo", name: "sunset.jpg" },
                { kind: "image" as const, icon: Camera, label: "Camera", name: "snap.jpg" },
                { kind: "audio" as const, icon: Mic, label: "Voice", name: "voice-note.m4a" },
                { kind: "file" as const, icon: Paperclip, label: "File", name: "journal.pdf" },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => { setPending({ kind: a.kind, name: a.name }); setAttachOpen(false); }}
                  className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] text-muted-foreground hover:bg-white/5"
                >
                  <a.icon className="h-5 w-5 text-purple" />
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {pending && (
            <div className="glass-strong mb-2 flex items-center gap-2 rounded-full px-4 py-2 text-xs">
              {pending.kind === "image" ? <ImageIcon className="h-3.5 w-3.5 text-purple" /> : pending.kind === "audio" ? <Mic className="h-3.5 w-3.5 text-purple" /> : <Paperclip className="h-3.5 w-3.5 text-purple" />}
              <span className="flex-1 truncate">{pending.name}</span>
              <span className="text-[10px] text-muted-foreground">Preview only</span>
              <button onClick={() => setPending(null)} className="rounded-full p-1 hover:bg-white/10" aria-label="Remove attachment">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="glass-strong flex items-center gap-2 rounded-full p-2 pl-2">
            <button
              onClick={() => setAttachOpen((v) => !v)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${attachOpen ? "bg-purple/20 text-purple" : "text-muted-foreground hover:bg-white/5"}`}
              aria-label="Add attachment"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Message Luna…"
              enterKeyHint="send"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {error ? (
              <button onClick={retryLast} className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20 text-destructive" aria-label="Retry">
                <RefreshCw className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => send()}
                disabled={!input.trim() && !pending}
                className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
