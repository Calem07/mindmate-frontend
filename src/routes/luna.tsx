import { createFileRoute } from "@tanstack/react-router";
import { Settings, Play, Send, Heart, Award, Sparkles } from "lucide-react";
import luna from "@/assets/luna.png";
import waves from "@/assets/waves.jpg";
import { Shell, ScreenHeader } from "@/components/Shell";
import { luna as lunaData } from "@/data/mock";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/luna")({
  head: () => ({ meta: [{ title: "Luna — Your companion" }, { name: "description", content: "Chat with Luna, your AI companion who grows alongside you." }] }),
  component: LunaScreen,
});

type Msg = { from: "luna" | "me"; text: string; time: string };

const suggestions = [
  "I'm feeling anxious",
  "Help me focus",
  "I need a breath",
  "Tell me something kind",
];

function LunaScreen() {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "luna", text: "Hey you. I've been thinking about you. How are you, really?", time: "9:30 AM" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setMessages((m) => [...m, { from: "me", text: value, time: now }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = lunaData.whispers[Math.floor(Math.random() * lunaData.whispers.length)];
      setMessages((m) => [...m, { from: "luna", text: reply, time: now }]);
      setTyping(false);
    }, 1200);
  };

  return (
    <Shell>
      <ScreenHeader title="Luna" back right={<button className="glass flex h-9 w-9 items-center justify-center rounded-full"><Settings className="h-4 w-4" /></button>} />

      <div className="px-5">
        <div className="glass-strong flex items-center justify-center gap-3 rounded-full px-4 py-2">
          <span className="rounded-full bg-purple/20 px-2 py-0.5 text-[10px] font-semibold text-purple">LV {lunaData.level}</span>
          <span className="text-xs"><Heart className="mr-1 inline h-3 w-3 text-purple" />82% Bond</span>
          <span className="text-xs"><Award className="mr-1 inline h-3 w-3 text-primary" />{lunaData.memories} Memories</span>
        </div>
      </div>

      <div className="space-y-4 px-5 pb-4 pt-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.from === "me" ? "flex-row-reverse" : ""}`}>
            {m.from === "luna" ? (
              <div className="h-9 w-9 shrink-0 rounded-full bg-purple/20 p-1">
                <img src={luna} alt="" width={28} height={28} className="h-full w-full object-contain" />
              </div>
            ) : <div className="w-9" />}
            <div className="max-w-[78%]">
              <div className={`rounded-3xl px-4 py-3 text-sm leading-relaxed ${m.from === "me" ? "gradient-primary text-white rounded-br-md" : "glass-strong rounded-bl-md"}`}>
                {m.text}
              </div>
              <p className={`mt-1 text-[10px] text-muted-foreground ${m.from === "me" ? "text-right" : ""}`}>{m.time}</p>
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

        {/* Suggestions */}
        {messages.length < 3 && (
          <div className="flex flex-wrap gap-2 pl-11">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="glass rounded-full px-3 py-1.5 text-[11px] font-semibold text-purple">
                <Sparkles className="mr-1 inline h-3 w-3" />{s}
              </button>
            ))}
          </div>
        )}

        {/* Breathing card */}
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
        <div ref={endRef} />
      </div>


      {/* Composer */}
      <div className="fixed bottom-24 left-0 right-0 z-30">
        <div className="mx-auto max-w-md px-5">
          <div className="glass-strong flex items-center gap-2 rounded-full p-2 pl-5">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Message Luna…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button onClick={() => send()} className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary">
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
