import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, ScreenHeader } from "@/components/Shell";
import { EmptyState } from "@/components/StateViews";
import { habits as initialHabits } from "@/data/mock";
import { Plus, CheckCircle2, Circle, Flame, Sprout } from "lucide-react";
import { useLunaMoodTrigger } from "@/components/LunaSystemProvider";

export const Route = createFileRoute("/habits")({
  head: () => ({ meta: [{ title: "Habits — MindMate" }, { name: "description", content: "Small daily rituals that grow your garden." }] }),
  component: Habits,
});

function Habits() {
  const [tab, setTab] = useState<"Today" | "Week" | "Month">("Today");
  const [list, setList] = useState(initialHabits);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState("");

  const toggle = (id: string) =>
    setList((l) => l.map((h) => (h.id === id ? { ...h, status: h.status === "done" ? "not_started" : "done" } : h)));

  const add = () => {
    if (!newHabit.trim()) return;
    setList((l) => [...l, { id: `h${l.length + 1}`, name: newHabit, icon: "Sprout", status: "not_started", streak: 0, xp: 10 }]);
    setNewHabit("");
    setShowAdd(false);
  };

  const doneCount = list.filter((h) => h.status === "done").length;

  return (
    <Shell>
      <ScreenHeader title="Habits" back right={<button onClick={() => setShowAdd(true)} className="glass flex h-9 w-9 items-center justify-center rounded-full"><Plus className="h-4 w-4" /></button>} />

      <section className="px-5">
        <div className="glass-strong rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Today's rituals</p>
          <p className="mt-1 text-2xl font-bold"><span className="text-gradient">{doneCount}</span> / {list.length} tended</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full gradient-primary rounded-full glow-cyan" style={{ width: `${(doneCount / list.length) * 100}%` }} />
          </div>
        </div>
      </section>

      <div className="px-5 pt-5">
        <div className="glass-strong flex rounded-full p-1">
          {(["Today", "Week", "Month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setTab(p)}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === p ? "gradient-primary text-white" : "text-muted-foreground"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-2.5 px-5 pt-5">
        {list.length === 0 ? (
          <EmptyState icon={Sprout} title="No rituals yet" body="Plant your first habit — even one tiny one counts." action={<button onClick={() => setShowAdd(true)} className="rounded-full gradient-primary px-4 py-2 text-xs font-semibold text-white">+ Add habit</button>} />
        ) : (
          list.map((h) => {
            const done = h.status === "done";
            const inProg = h.status === "in_progress";
            return (
              <button
                key={h.id}
                onClick={() => toggle(h.id)}
                className="glass flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition active:scale-[0.99]"
              >
                {done ? <CheckCircle2 className="h-6 w-6 shrink-0 text-secondary" /> : <Circle className={`h-6 w-6 shrink-0 ${inProg ? "text-primary" : "text-muted-foreground"}`} />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{h.name}</p>
                  <p className="text-[11px] text-muted-foreground">+{h.xp} XP · waters garden</p>
                </div>
                {h.streak > 0 && (
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-purple/15 px-2 py-1 text-[10px] font-bold text-purple">
                    <Flame className="h-3 w-3" />{h.streak}
                  </div>
                )}
              </button>
            );
          })
        )}
      </section>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}>
          <div className="glass-strong w-full max-w-md rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]" onClick={(e) => e.stopPropagation()}>
            <p className="text-base font-bold">New habit</p>
            <p className="mt-1 text-xs text-muted-foreground">Make it small. Small is sustainable.</p>
            <input
              autoFocus
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="e.g. Drink water with breakfast"
              className="mt-4 w-full rounded-2xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button onClick={add} className="mt-3 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-white">Plant it</button>
          </div>
        </div>
      )}
    </Shell>
  );
}
