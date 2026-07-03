import { createFileRoute } from "@tanstack/react-router";
import {
  Send, Heart, Award, Sparkles, Paperclip, Image as ImageIcon, Mic, Camera, X, RefreshCw, MessageCircle, Trash2, Wind, ClipboardCheck, Droplet, BookOpen, Search,
} from "lucide-react";
import waves from "@/assets/waves.jpg";
import { Shell, ScreenHeader } from "@/components/Shell";
import { luna as lunaData, lastCheckIn, habits, user as userMock } from "@/data/mock";
import { EmptyState, ErrorState } from "@/components/StateViews";
import { LunaAvatar, LunaMoodDot, type LunaMood } from "@/components/LunaAvatar";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  sendLunaMessage,
  loadLunaHistory,
  reactLunaMessage,
  clearLunaHistory,
} from "@/lib/api/luna.functions";

export const Route = createFileRoute("/luna")({
  head: () => ({ meta: [{ title: "Luna — Your companion" }, { name: "description", content: "Chat with Luna, your AI companion who grows alongside you." }] }),
  component: LunaScreen,
});

type Msg = {
  id: string;
  from: "luna" | "me";
  text: string;
  time: string;
  createdAt: Date;
  mood?: LunaMood;
  reacted?: boolean;
  attachment?: { kind: "image" | "audio" | "file"; name: string };
  status?: "sending" | "sent" | "error";
};

type Suggestion = { label: string; prompt: string; reason?: string };

function buildContextSuggestions(): Suggestion[] {
  const out: Suggestion[] = [];
  const mood = lastCheckIn.mood;
  const tags = lastCheckIn.tags;
  const skipped = habits.filter((h) => h.status === "not_started");
  const hour = new Date().getHours();

  if (mood === "low" || mood === "rough") {
    out.push({ label: "Yesterday felt heavy", reason: `Your last check-in was ${mood}`, prompt: "Yesterday felt really heavy. Can we ease into today together?" });
  } else if (mood === "okay") {
    out.push({ label: "Help me lift today", reason: "Yesterday was just okay", prompt: "Yesterday was just okay. Help me find one small bright thing for today?" });
  } else {
    out.push({ label: "Protect this momentum", reason: `Yesterday felt ${mood}`, prompt: `Yesterday felt ${mood}. How do I protect this energy today?` });
  }
  if (lastCheckIn.sleepHours < 7) {
    out.push({ label: "I slept badly", reason: `Only ${lastCheckIn.sleepHours}h of sleep`, prompt: `I only slept ${lastCheckIn.sleepHours} hours. What should today look like?` });
  }
  if (tags.includes("exam-stress") || tags.includes("anxious")) {
    out.push({ label: "Calm my exam nerves", reason: "You mentioned exam stress", prompt: "My exam nerves are climbing. Can you help me ground?" });
  }
  if (skipped.length > 0) {
    out.push({ label: `Nudge me on ${skipped[0].name.toLowerCase()}`, reason: "Not started today", prompt: `I haven't started "${skipped[0].name}" yet. Gently nudge me?` });
  }
  if (hour < 11) out.push({ label: "Set a soft intention", reason: "Morning", prompt: "Help me set one soft intention for today." });
  else if (hour >= 21) out.push({ label: "Help me wind down", reason: "Late evening", prompt: "Help me wind down for the night." });
  return out.slice(0, 4);
}

const followupSuggestions = [
  "Why do I feel this way?",
  "Help me reframe this",
  "Suggest a tiny next step",
  "Just sit with me",
];

function uid() { return Math.random().toString(36).slice(2, 9); }
function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
function dayKey(d: Date) {
  const now = new Date();
  const isSame = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const y = new Date(); y.setDate(now.getDate() - 1);
  if (isSame(d, now)) return "Today";
  if (isSame(d, y)) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

/** Inline action links parsed from Luna markdown: [Label](action:key) */
const ACTION_ROUTES: Record<string, { to: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  breathing: { to: "/luna", icon: Wind, label: "Breathe with Luna" },
  checkin:   { to: "/check-in", icon: ClipboardCheck, label: "Open check-in" },
  habits:    { to: "/habits", icon: Droplet, label: "Tend habits" },
  journal:   { to: "/journal", icon: BookOpen, label: "Write in journal" },
  garden:    { to: "/garden", icon: Sparkles, label: "Visit garden" },
};

function LunaScreen() {
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);
  const [pending, setPending] = useState<{ kind: "image" | "audio" | "file"; name: string } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // Redirect if not authed
  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/signin" });
  }, [authLoading, session, navigate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Load history
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await loadLunaHistory();
        if (cancelled) return;
        if (!rows.length) {
          setMessages([{
            id: uid(), from: "luna",
            text: `Hey ${userMock.name.split(" ")[0]}. I've been thinking about you. How are you, *really*?`,
            time: fmtTime(new Date()), createdAt: new Date(), mood: "warm", status: "sent",
          }]);
        } else {
          setMessages(rows.map((r) => ({
            id: r.id,
            from: r.role === "user" ? "me" : "luna",
            text: r.content,
            time: fmtTime(new Date(r.created_at)),
            createdAt: new Date(r.created_at),
            mood: (r.mood as LunaMood | null) ?? "warm",
            reacted: r.reacted ?? false,
            status: "sent",
          })));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't load history.");
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

  const contextSuggestions = useMemo(() => buildContextSuggestions(), []);
  const showStarters = useMemo(
    () => historyLoaded && messages.filter((m) => m.from === "me").length === 0,
    [historyLoaded, messages],
  );

  // Proactive nudges — computed locally, never persisted, dismissible for the session.
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());
  const nudges = useMemo(() => {
    const items: { id: string; icon: typeof ClipboardCheck; title: string; body: string; prompt: string; cta: string; to?: string }[] = [];
    const today = new Date();
    const checkInDate = new Date(lastCheckIn.date);
    const daysSinceCheckIn = Math.floor((today.getTime() - checkInDate.getTime()) / 86400000);
    const isSameDay = daysSinceCheckIn === 0;

    if (!isSameDay) {
      items.push({
        id: "checkin-today",
        icon: ClipboardCheck,
        title: daysSinceCheckIn === 1 ? "I missed you yesterday" : `It's been ${daysSinceCheckIn} days`,
        body: "A tiny check-in is enough. I'll be right here.",
        prompt: "I haven't checked in yet today. Can we ease into it together?",
        cta: "Open check-in",
        to: "/check-in",
      });
    }
    if (userMock.streakDays >= 3) {
      const hour = today.getHours();
      if (hour >= 18 && !isSameDay) {
        items.push({
          id: "streak-risk",
          icon: Sparkles,
          title: `Your ${userMock.streakDays}-day streak is waiting`,
          body: "One soft moment tonight keeps it alive. No pressure — I'm proud either way.",
          prompt: `My ${userMock.streakDays}-day streak is at risk tonight. Help me protect it in the smallest way possible.`,
          cta: "Protect my streak",
          to: "/check-in",
        });
      } else if (isSameDay) {
        items.push({
          id: "streak-celebrate",
          icon: Sparkles,
          title: `${userMock.streakDays} days in a row 💜`,
          body: "I've noticed. That's real.",
          prompt: `Celebrate my ${userMock.streakDays}-day streak with me in one gentle sentence.`,
          cta: "Say something soft",
        });
      }
    }
    const skipped = habits.filter((h) => h.status === "not_started");
    if (skipped.length > 0 && new Date().getHours() >= 15) {
      items.push({
        id: `skipped-${skipped[0].id}`,
        icon: Droplet,
        title: `${skipped[0].name} hasn't started`,
        body: "Want a tiny version of it? Even 30 seconds counts.",
        prompt: `I haven't started "${skipped[0].name}" today. Give me a 30-second version I can do right now.`,
        cta: "Tend habits",
        to: "/habits",
      });
    }
    return items.filter((n) => !dismissedNudges.has(n.id));
  }, [dismissedNudges]);

  const dismissNudge = (id: string) =>
    setDismissedNudges((s) => new Set(s).add(id));

  // Header mood = last luna message mood, else ambient
  const headerMood: LunaMood = useMemo(() => {
    const lastLuna = [...messages].reverse().find((m) => m.from === "luna");
    return (lastLuna?.mood as LunaMood) ?? "warm";
  }, [messages]);

  const sendPrompt = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value && !pending) return;
    setError(null);
    const localId = uid();
    const now = new Date();
    const userMsg: Msg = {
      id: localId, from: "me",
      text: value || (pending ? `Shared ${pending.kind}` : ""),
      time: fmtTime(now), createdAt: now,
      attachment: pending ?? undefined, status: "sending",
    };
    setMessages((m) => [...m, userMsg]);
    setInput(""); setPending(null); setAttachOpen(false);
    setTyping(true);

    try {
      // Build minimal history from what we have
      const history = messages
        .filter((m) => m.status !== "error")
        .slice(-14)
        .map((m) => ({ role: m.from === "me" ? ("user" as const) : ("assistant" as const), content: m.text }));

      const hour = new Date().getHours();
      const timeOfDay = hour < 11 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";

      const res = await sendLunaMessage({
        data: {
          userMessage: value || `Shared a ${pending?.kind ?? "note"}: ${pending?.name ?? ""}`,
          history,
          context: {
            mood: lastCheckIn.mood,
            sleepHours: lastCheckIn.sleepHours,
            tags: lastCheckIn.tags,
            streakDays: userMock.streakDays,
            skippedHabits: habits.filter((h) => h.status === "not_started").map((h) => h.name),
            timeOfDay,
          },
        },
      });

      setMessages((m) =>
        m.map((x) => (x.id === localId ? { ...x, status: "sent" as const } : x)).concat({
          id: res.id, from: "luna" as const,
          text: res.text, time: fmtTime(new Date(res.createdAt)),
          createdAt: new Date(res.createdAt),
          mood: res.mood as LunaMood, status: "sent" as const,
        }),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Luna's signal flickered.";
      setError(msg);
      setMessages((m) => m.map((x) => (x.id === localId ? { ...x, status: "error" } : x)));
    } finally {
      setTyping(false);
    }
  };

  const retryLast = () => {
    setError(null);
    const lastMine = [...messages].reverse().find((m) => m.from === "me");
    if (!lastMine) return;
    setMessages((m) => m.filter((x) => x.id !== lastMine.id));
    void sendPrompt(lastMine.text);
  };

  const toggleReaction = async (id: string) => {
    let next = false;
    setMessages((m) => m.map((x) => {
      if (x.id !== id) return x;
      next = !x.reacted;
      return { ...x, reacted: next };
    }));
    try {
      // only persist real UUIDs (skip the local greeting)
      if (id.length > 20) await reactLunaMessage({ data: { id, reacted: next } });
    } catch { /* silent */ }
  };

  const wipeChat = async () => {
    try {
      await clearLunaHistory();
      setMessages([{
        id: uid(), from: "luna",
        text: "Fresh page. I'm still here. Tell me anything.",
        time: fmtTime(new Date()), createdAt: new Date(), mood: "warm", status: "sent",
      }]);
      setError(null);
      toast.success("Chat cleared");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't clear chat");
    }
  };

  // Group messages by day for headers
  const groups = useMemo(() => {
    const filtered = search.trim()
      ? messages.filter((m) => m.text.toLowerCase().includes(search.toLowerCase()))
      : messages;
    const map = new Map<string, Msg[]>();
    filtered.forEach((m) => {
      const k = dayKey(m.createdAt);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    });
    return Array.from(map.entries());
  }, [messages, search]);

  return (
    <Shell>
      <ScreenHeader
        title=""
        back
        right={
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen((v) => !v)} className="glass flex h-9 w-9 items-center justify-center rounded-full" aria-label="Search chat">
              <Search className="h-4 w-4" />
            </button>
            <button onClick={wipeChat} className="glass flex h-9 w-9 items-center justify-center rounded-full" aria-label="Clear chat">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {/* Luna presence header */}
      <div className="px-5">
        <div className="glass-strong flex items-center gap-3 rounded-3xl p-3">
          <LunaAvatar mood={headerMood} size="md" bounce />
          <div className="flex-1">
            <p className="text-sm font-semibold">Luna</p>
            <LunaMoodDot mood={headerMood} />
          </div>
          <div className="flex flex-col items-end gap-0.5 text-[10px]">
            <span className="rounded-full bg-purple/20 px-2 py-0.5 font-semibold text-purple">LV {lunaData.level}</span>
            <span><Heart className="mr-1 inline h-3 w-3 text-purple" />{userMock.bondPct}% Bond</span>
            <span><Award className="mr-1 inline h-3 w-3 text-primary" />{lunaData.memories}</span>
          </div>
        </div>

        {searchOpen && (
          <div className="glass mt-2 flex items-center gap-2 rounded-full px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your chats with Luna…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {search && <button onClick={() => setSearch("")} className="text-xs text-muted-foreground">Clear</button>}
          </div>
        )}
      </div>

      <div className="space-y-4 px-5 pb-44 pt-5">
        {!historyLoaded && (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple" />
            Luna is remembering…
          </div>
        )}

        {historyLoaded && messages.length === 0 && (
          <EmptyState icon={MessageCircle} title="Your space with Luna is clear" body="Say hi, share what's on your mind, or pick a soft prompt below." />
        )}

        {groups.map(([day, msgs]) => (
          <div key={day} className="space-y-4">
            <div className="flex items-center justify-center">
              <span className="glass rounded-full px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">{day}</span>
            </div>
            {msgs.map((m) => (
              <MessageBubble key={m.id} m={m} headerMood={headerMood} onReact={() => toggleReaction(m.id)} />
            ))}
          </div>
        ))}

        {typing && (
          <div className="flex items-end gap-2 animate-[rise_0.4s_ease-out]">
            <LunaAvatar mood={headerMood} size="sm" bounce />
            <div className="glass-strong flex gap-1 rounded-3xl rounded-bl-md px-4 py-3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple [animation-delay:240ms]" />
            </div>
          </div>
        )}

        {error && !typing && (
          <ErrorState title="Luna's signal flickered" body={error} onRetry={retryLast} />
        )}

        {/* Suggestions */}
        {!typing && !error && historyLoaded && (
          <div className="space-y-2 pl-11">
            {showStarters && (
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Picked for you · based on yesterday's check-in
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {showStarters
                ? contextSuggestions.map((s) => (
                    <button key={s.label} onClick={() => sendPrompt(s.prompt)} className="glass flex flex-col items-start gap-0.5 rounded-2xl px-3 py-2 text-left">
                      <span className="text-[11px] font-semibold text-purple">
                        <Sparkles className="mr-1 inline h-3 w-3" />
                        {s.label}
                      </span>
                      {s.reason && <span className="text-[9px] text-muted-foreground">{s.reason}</span>}
                    </button>
                  ))
                : followupSuggestions.map((s) => (
                    <button key={s} onClick={() => sendPrompt(s)} className="glass rounded-full px-3 py-1.5 text-[11px] font-semibold text-purple">
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
              <button onClick={() => sendPrompt("Guide me through one slow minute of breathing.")} className="flex h-11 w-11 items-center justify-center rounded-full gradient-primary glow-cyan">
                <Wind className="h-5 w-5 text-white" />
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
              onKeyDown={(e) => { if (e.key === "Enter") void sendPrompt(); }}
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
                onClick={() => void sendPrompt()}
                disabled={(!input.trim() && !pending) || typing}
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

function MessageBubble({ m, headerMood, onReact }: { m: Msg; headerMood: LunaMood; onReact: () => void }) {
  const isMe = m.from === "me";
  return (
    <div className={`flex items-end gap-2 animate-[rise_0.4s_ease-out] ${isMe ? "flex-row-reverse" : ""}`}>
      {m.from === "luna" ? (
        <LunaAvatar mood={m.mood ?? headerMood} size="sm" />
      ) : <div className="w-9" />}
      <div className="max-w-[78%]">
        <div
          className={`group relative rounded-3xl px-4 py-3 text-sm leading-relaxed ${
            isMe ? "gradient-primary text-white rounded-br-md" : "glass-strong rounded-bl-md"
          } ${m.status === "error" ? "opacity-70 ring-1 ring-destructive/40" : ""}`}
        >
          {m.attachment && (
            <div className="mb-2 flex items-center gap-2 rounded-2xl bg-black/20 px-3 py-2 text-xs">
              {m.attachment.kind === "image" ? <ImageIcon className="h-3.5 w-3.5" /> :
                m.attachment.kind === "audio" ? <Mic className="h-3.5 w-3.5" /> :
                <Paperclip className="h-3.5 w-3.5" />}
              <span className="truncate">{m.attachment.name}</span>
            </div>
          )}
          {isMe ? (
            <span className="whitespace-pre-wrap">{m.text}</span>
          ) : (
            <LunaMarkdown text={m.text} />
          )}
          {!isMe && (
            <button
              onClick={onReact}
              className={`absolute -bottom-3 ${isMe ? "-left-3" : "-right-3"} flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-background/80 backdrop-blur transition ${m.reacted ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"}`}
              aria-label={m.reacted ? "Remove heart" : "Send heart"}
            >
              <Heart className={`h-3.5 w-3.5 ${m.reacted ? "fill-purple text-purple" : "text-muted-foreground"}`} />
            </button>
          )}
        </div>
        <p className={`mt-1 flex items-center gap-1 text-[10px] text-muted-foreground ${isMe ? "justify-end" : ""}`}>
          {m.time}
          {m.status === "sending" && <span className="text-muted-foreground/70">· sending…</span>}
          {m.status === "sent" && isMe && <span className="text-muted-foreground/70">· seen by Luna</span>}
          {m.status === "error" && <span className="text-destructive">· failed</span>}
          {m.reacted && !isMe && <Heart className="h-3 w-3 fill-purple text-purple" />}
        </p>
      </div>
    </div>
  );
}

function LunaMarkdown({ text }: { text: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-strong:text-purple">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith("action:")) {
              const key = href.slice("action:".length);
              const action = ACTION_ROUTES[key];
              if (action) {
                const Icon = action.icon;
                return (
                  <Link to={action.to} className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple/20 px-3 py-1.5 text-xs font-semibold text-purple no-underline hover:bg-purple/30">
                    <Icon className="h-3.5 w-3.5" />
                    {children || action.label}
                  </Link>
                );
              }
            }
            return <a href={href} target="_blank" rel="noreferrer" className="text-purple underline">{children}</a>;
          },
          p: ({ children }) => <p className="my-1">{children}</p>,
          ul: ({ children }) => <ul className="my-1 list-disc pl-4">{children}</ul>,
          ol: ({ children }) => <ol className="my-1 list-decimal pl-4">{children}</ol>,
          blockquote: ({ children }) => <blockquote className="my-1 border-l-2 border-purple/40 pl-3 italic opacity-80">{children}</blockquote>,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
