import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, ScreenHeader } from "@/components/Shell";
import { SuccessState } from "@/components/StateViews";
import { futureMeLetters } from "@/data/mock";
import { BookOpen, Target, Heart, Lock, Sparkles } from "lucide-react";

const iconMap = { BookOpen, Target, Heart };

export const Route = createFileRoute("/future-me")({
  head: () => ({ meta: [{ title: "Future Me — MindMate" }, { name: "description", content: "Write letters to your future self." }] }),
  component: FutureMe,
});

function FutureMe() {
  const [writing, setWriting] = useState(false);
  const [letter, setLetter] = useState("");
  const [sealed, setSealed] = useState(false);

  const seal = () => {
    setSealed(true);
    setLetter("");
    setWriting(false);
    setTimeout(() => setSealed(false), 2400);
  };

  return (
    <Shell>
      <ScreenHeader title="Future Me" back />

      <section className="px-5">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-5 glow-purple">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <p className="relative text-xs uppercase tracking-wider text-primary">Time capsule</p>
          <h2 className="relative mt-1 text-xl font-bold leading-tight">Write a letter to your future self</h2>
          <p className="relative mt-2 text-xs text-muted-foreground">Seal it today. Open it when the moment is right.</p>
          <button onClick={() => setWriting(true)} className="relative mt-4 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-white">+ New letter</button>
        </div>
      </section>

      {sealed && <section className="px-5 pt-4"><SuccessState title="Letter sealed 💜" body="Luna will hand it back when it's time." /></section>}

      <section className="space-y-3 px-5 pt-5">
        <h3 className="text-sm font-semibold">Your capsules</h3>
        {futureMeLetters.length === 0 && (
          <div className="glass-strong flex flex-col items-center gap-2 rounded-3xl px-5 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple/15"><Lock className="h-5 w-5 text-purple" /></div>
            <p className="text-sm font-semibold">No capsules yet</p>
            <p className="text-[11px] text-muted-foreground">Seal your first letter — Luna will guard it until it's time.</p>
          </div>
        )}
        {futureMeLetters.map((l) => {
          const Icon = (iconMap as Record<string, typeof BookOpen>)[l.icon] ?? BookOpen;
          const unlocked = l.status === "unlocked";
          return (
            <div key={l.id} className="glass flex items-center gap-3 rounded-2xl p-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${unlocked ? "bg-secondary/15 text-secondary" : "bg-purple/15 text-purple"}`}>
                {unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug line-clamp-2">{l.title}</p>
                <p className="text-[11px] text-muted-foreground">{unlocked ? "Unlocked" : `Unlocks ${l.unlocksAt}`}</p>
              </div>
              <button className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold ${unlocked ? "gradient-primary text-white" : "bg-white/5 text-muted-foreground"}`}>
                {unlocked ? "Open" : "Sealed"}
              </button>
            </div>
          );
        })}
      </section>

      {writing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm" onClick={() => setWriting(false)}>
          <div className="glass-strong mx-auto w-full max-w-md rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-xs text-purple">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-semibold uppercase tracking-wider">Dear future me…</span>
            </div>
            <textarea
              autoFocus
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Tell yourself what matters today…"
              className="mt-3 h-48 w-full resize-none rounded-2xl glass p-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button onClick={seal} disabled={!letter.trim()} className="mt-3 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-white disabled:opacity-40">Seal & save</button>
          </div>
        </div>
      )}
    </Shell>
  );
}
