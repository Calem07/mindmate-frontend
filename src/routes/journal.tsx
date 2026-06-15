import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, ScreenHeader } from "@/components/Shell";
import { EmptyState, SuccessState } from "@/components/StateViews";
import { journalEntries, journalPrompts, gratitudeEntries, moods } from "@/data/mock";
import { Plus, Sparkles, Heart, BookOpen } from "lucide-react";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Journal & Gratitude — MindMate" }, { name: "description", content: "A safe place for your thoughts and what you're thankful for." }] }),
  component: Journal,
});

function Journal() {
  const [tab, setTab] = useState<"Journal" | "Gratitude">("Journal");
  const [text, setText] = useState("");
  const [gratitude, setGratitude] = useState(["", "", ""]);
  const [saved, setSaved] = useState<null | string>(null);
  const prompt = journalPrompts[new Date().getDate() % journalPrompts.length];

  const save = () => {
    setSaved(tab === "Journal" ? "Entry sealed for today" : "Gratitude noted 💜");
    setText("");
    setGratitude(["", "", ""]);
    setTimeout(() => setSaved(null), 2400);
  };

  return (
    <Shell>
      <ScreenHeader title="Journal" back right={<button className="glass flex h-9 w-9 items-center justify-center rounded-full"><Plus className="h-4 w-4" /></button>} />

      <div className="px-5">
        <div className="glass-strong flex rounded-full p-1">
          {(["Journal", "Gratitude"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === t ? "gradient-primary text-white" : "text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-4 px-5 pt-5">
        {saved && <SuccessState title={saved} />}

        {tab === "Journal" ? (
          <>
            <div className="glass relative overflow-hidden rounded-3xl p-4">
              <div className="flex items-center gap-2 text-xs text-purple">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-semibold uppercase tracking-wider">Today's prompt</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{prompt}</p>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write what's on your mind…"
              className="h-48 w-full resize-none rounded-3xl glass-strong p-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button onClick={save} disabled={!text.trim()} className="w-full rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple/30 disabled:opacity-40">
              Save entry
            </button>

            <h3 className="pt-2 text-sm font-semibold">Recent entries</h3>
            {journalEntries.length === 0 ? (
              <EmptyState icon={BookOpen} title="Your journal is quiet" body="Start with one sentence. That's enough." />
            ) : (
              journalEntries.map((e) => {
                const m = moods.find((x) => x.id === e.mood);
                return (
                  <div key={e.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{e.title}</p>
                      <span className="text-lg">{m?.emoji}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{e.date}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{e.excerpt}</p>
                  </div>
                );
              })
            )}
          </>
        ) : (
          <>
            <div className="glass relative overflow-hidden rounded-3xl p-5">
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-purple/20 blur-3xl" />
              <div className="relative flex items-center gap-2 text-xs text-purple">
                <Heart className="h-3.5 w-3.5" />
                <span className="font-semibold uppercase tracking-wider">Three good things</span>
              </div>
              <p className="relative mt-2 text-xs text-muted-foreground">Name three things — tiny is perfect.</p>
              <div className="relative mt-4 space-y-2">
                {gratitude.map((g, i) => (
                  <input
                    key={i}
                    value={g}
                    onChange={(e) => setGratitude((arr) => arr.map((x, ix) => (ix === i ? e.target.value : x)))}
                    placeholder={`${i + 1}. Something good…`}
                    className="w-full rounded-2xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
                  />
                ))}
              </div>
            </div>
            <button onClick={save} disabled={!gratitude.some((g) => g.trim())} className="w-full rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple/30 disabled:opacity-40">
              Save gratitude
            </button>

            <h3 className="pt-2 text-sm font-semibold">Past gratitude</h3>
            {gratitudeEntries.map((g) => (
              <div key={g.id} className="glass rounded-2xl p-4">
                <p className="text-[11px] text-muted-foreground">{g.date}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {g.items.map((it, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Heart className="mt-0.5 h-3 w-3 shrink-0 text-purple" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}
      </section>
    </Shell>
  );
}
