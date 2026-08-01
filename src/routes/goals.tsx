import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, ScreenHeader } from "@/components/Shell";
import { EmptyState } from "@/components/StateViews";
import { goalsApi, type Goal } from "@/lib/api/goals";
import { Plus, Target, Trophy } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { advanceOnboarding } from "@/lib/onboarding";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Goals — MindMate" },
      { name: "description", content: "Big dreams, gentle steps." },
    ],
  }),
  component: Goals,
});

function Goals() {
  const [tab, setTab] = useState<"Active" | "Completed">("Active");
  const [showAdd, setShowAdd] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    goalsApi
      .list(tab === "Active" ? "ACTIVE" : "COMPLETED")
      .then((rows) => {
        setGoals(rows);
        if (tab === "Active" && rows.length > 0 && advanceOnboarding(user?.id, "goals", "future-me")) {
          navigate({ to: "/future-me" });
        }
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load goals"));
  }, [navigate, tab, user?.id]);

  const addGoal = async () => {
    if (!newGoal.trim()) return;
    try {
      const goal = await goalsApi.create({
        name: newGoal.trim(),
        category: newCategory.trim() || "Personal",
      });
      setGoals((items) => [goal, ...items]);
      setNewGoal("");
      setNewCategory("");
      setShowAdd(false);
      if (advanceOnboarding(user?.id, "goals", "future-me")) navigate({ to: "/future-me" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add goal");
    }
  };

  return (
    <Shell>
      <ScreenHeader
        title="Goals"
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
        <div className="glass-strong relative overflow-hidden rounded-3xl p-5">
          <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-purple/20 blur-3xl" />
          <p className="relative text-xs uppercase tracking-wider text-purple">
            3 dreams in motion
          </p>
          <p className="relative mt-1 text-2xl font-bold leading-tight">
            You're <span className="text-gradient">45%</span> closer than last month
          </p>
          <p className="relative mt-1 text-xs text-muted-foreground">Luna's keeping track 💜</p>
        </div>
      </section>

      <div className="px-5 pt-5">
        <div className="glass-strong flex rounded-full p-1">
          {(["Active", "Completed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === t ? "gradient-primary text-white" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-3 px-5 pt-5">
        {goals.length === 0 ? (
          <EmptyState
            icon={tab === "Completed" ? Trophy : Target}
            title={tab === "Completed" ? "No finished goals yet" : "No active goals"}
            body={
              tab === "Completed"
                ? "Your trophies will land here."
                : "Set one small, kind goal to start."
            }
            action={
              tab === "Active" ? (
                <button
                  onClick={() => setShowAdd(true)}
                  className="rounded-full gradient-primary px-4 py-2 text-xs font-semibold text-white"
                >
                  + New goal
                </button>
              ) : undefined
            }
          />
        ) : (
          goals.map((g) => (
            <div key={g.id} className="glass-strong rounded-3xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-purple">
                    {g.category}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-semibold">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{g.due}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-gradient">{g.pct}%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full gradient-primary rounded-full"
                  style={{ width: `${g.pct}%` }}
                />
              </div>
            </div>
          ))
        )}
      </section>

      {showAdd && (
        <div
          className="fixed inset-0 z-[60] flex items-end bg-black/60 backdrop-blur-sm"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="glass-strong mx-auto w-full max-w-md rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-bold">New goal</p>
            <p className="mt-1 text-xs text-muted-foreground">What are you dreaming toward?</p>
            <input
              autoFocus
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="e.g. Finish my thesis"
              className="mt-4 w-full rounded-2xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category (Study, Health…)"
              className="mt-2 w-full rounded-2xl glass px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={addGoal}
              className="mt-3 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-white"
            >
              Set goal
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}
