import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, ScreenHeader } from "@/components/Shell";
import { EmptyState } from "@/components/StateViews";
import { habitsApi, type Habit, type HabitTemplate } from "@/lib/api/habits";
import { Plus, CheckCircle2, Circle, Flame, Sprout } from "lucide-react";
import { useLunaMoodTrigger } from "@/components/LunaSystemProvider";
import { useAuth } from "@/components/AuthProvider";
import { advanceOnboarding } from "@/lib/onboarding";

export const Route = createFileRoute("/habits")({
  head: () => ({
    meta: [
      { title: "Habits — MindMate" },
      { name: "description", content: "Small daily rituals that grow your garden." },
    ],
  }),
  component: Habits,
});

function Habits() {
  const [tab, setTab] = useState<"Today" | "Week" | "Month">("Today");
  const [list, setList] = useState<Habit[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState("");
  const [templates, setTemplates] = useState<HabitTemplate[]>([]);
  const bumpMood = useLunaMoodTrigger();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    habitsApi
      .today()
      .then(setList)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load habits"));
    habitsApi.templates().then(setTemplates).catch(() => undefined);
  }, []);

  const toggle = async (id: string) => {
    const current = list.find((h) => h.id === id);
    if (!current) return;
    const nextStatus: Habit["status"] = current.status === "done" ? "not_started" : "done";
    setList((l) =>
      l.map((h) => {
        if (h.id !== id) return h;
        // Luna reacts: celebrate when a ritual is marked done, focused when reopened.
        bumpMood(nextStatus === "done" ? "celebrate" : "focused", 9000);
        return { ...h, status: nextStatus };
      }),
    );
    try {
      await habitsApi.log(id, { status: nextStatus, progress: nextStatus === "done" ? 100 : 0 });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update habit");
      habitsApi
        .today()
        .then(setList)
        .catch(() => undefined);
    }
  };

  const add = async () => {
    if (!newHabit.trim()) return;
    try {
      await habitsApi.create({ name: newHabit.trim(), icon: "Sprout", xpReward: 10 });
      setList(await habitsApi.today());
      const onboarding = advanceOnboarding(user?.id, "habits", "goals");
      setNewHabit("");
      setShowAdd(false);
      if (onboarding) navigate({ to: "/goals" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add habit");
    }
  };

  const doneCount = list.filter((h) => h.status === "done").length;

  return (
    <Shell>
      <ScreenHeader
        title="Habits"
        back
        right={
          <button
            onClick={() => setShowAdd(true)}
            className="glass flex h-9 w-9 items-center justify-center rounded-full"
          >
            <Plus className="h-4 w-4" />
          </button>
        }
      />

      <section className="px-5">
        <div className="glass-strong rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Today's rituals</p>
          <p className="mt-1 text-2xl font-bold">
            <span className="text-gradient">{doneCount}</span> / {list.length} tended
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full gradient-primary rounded-full glow-cyan"
              style={{ width: `${list.length ? (doneCount / list.length) * 100 : 0}%` }}
            />
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
          <EmptyState
            icon={Sprout}
            title="No rituals yet"
            body="Plant your first habit — even one tiny one counts."
            action={
              <button
                onClick={() => setShowAdd(true)}
                className="rounded-full gradient-primary px-4 py-2 text-xs font-semibold text-white"
              >
                + Add habit
              </button>
            }
          />
        ) : (
          list.map((h) => {
            const done = h.status === "done";
            const inProg = h.status === "in_progress";
            return (
              <div
                key={h.id}
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  if (!(event.target instanceof HTMLButtonElement)) void toggle(h.id);
                }}
                onKeyDown={(event) => {
                  if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
                    event.preventDefault();
                    void toggle(h.id);
                  }
                }}
                className="glass flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition active:scale-[0.99]"
              >
                {done ? (
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-secondary" />
                ) : (
                  <Circle
                    className={`h-6 w-6 shrink-0 ${inProg ? "text-primary" : "text-muted-foreground"}`}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{h.name}</p>
                  <p className="text-[11px] text-muted-foreground">+{h.xp} XP · waters garden</p>
                </div>
                {h.streak > 0 && (
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-purple/15 px-2 py-1 text-[10px] font-bold text-purple">
                    <Flame className="h-3 w-3" />
                    {h.streak}
                  </div>
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void toggle(h.id);
                  }}
                  className="shrink-0 rounded-xl bg-secondary/10 px-2.5 py-1.5 text-[10px] font-semibold text-secondary"
                >
                  {done ? "Completed" : "Mark complete"}
                </button>
              </div>
            );
          })
        )}
      </section>

      {showAdd && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="glass-strong w-full max-w-md rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-bold">New habit</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Make it small. Small is sustainable.
            </p>
            <input
              autoFocus
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="e.g. Drink water with breakfast"
              className="mt-4 w-full rounded-2xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            {templates.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">A few gentle ideas from Luna</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {templates.slice(0, 5).map((template) => (
                    <button key={template.id} onClick={async () => { try { await habitsApi.createFromTemplate(template.id); setList(await habitsApi.today()); const onboarding = advanceOnboarding(user?.id, "habits", "goals"); setShowAdd(false); if (onboarding) navigate({ to: "/goals" }); } catch (err) { toast.error(err instanceof Error ? err.message : "Could not plant habit"); } }} className="glass min-w-36 rounded-2xl p-3 text-left">
                      <p className="text-xs font-semibold">{template.name}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={add}
              className="mt-3 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-white"
            >
              Plant it
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}
