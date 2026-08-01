import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, ScreenHeader } from "@/components/Shell";
import { LoadingState } from "@/components/StateViews";
import { insightsApi, type InsightBars } from "@/lib/api/insights";
import { TrendingUp, Heart, Brain, Moon } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights — MindMate" },
      { name: "description", content: "Your patterns, gently visualized." },
    ],
  }),
  component: Insights,
});

function Bars({
  data,
  labels,
  max,
  color,
}: {
  data: number[];
  labels: string[];
  max: number;
  color: string;
}) {
  return (
    <div className="flex h-24 items-end gap-1.5">
      {data.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex w-full flex-1 items-end">
            <div
              className={`w-full rounded-t-md ${color}`}
              style={{ height: `${(v / Math.max(max, 1)) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground">{labels[i] ?? ""}</span>
        </div>
      ))}
    </div>
  );
}

function Insights() {
  const [insights, setInsights] = useState<InsightBars | null>(null);

  useEffect(() => {
    insightsApi
      .bars()
      .then(setInsights)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load insights"));
  }, []);

  if (!insights) {
    return (
      <Shell>
        <ScreenHeader title="Insights" back />
        <section className="px-5">
          <LoadingState label="Reading your patterns…" />
        </section>
      </Shell>
    );
  }

  const focusTotal = insights.focusMinutes.reduce((sum, value) => sum + value, 0);
  const sleepAvg = insights.sleepHours.length
    ? insights.sleepHours.reduce((sum, value) => sum + value, 0) / insights.sleepHours.length
    : 0;
  const habitsTotal = insights.habitsCompleted.reduce((sum, value) => sum + value, 0);
  const moodStart = insights.moodTrend.find((value) => value > 0) ?? 0;
  const moodEnd = [...insights.moodTrend].reverse().find((value) => value > 0) ?? moodStart;
  const moodDelta = moodStart > 0 ? Math.round(((moodEnd - moodStart) / moodStart) * 100) : 0;

  return (
    <Shell>
      <ScreenHeader title="Insights" back />

      <section className="px-5">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-5 glow-purple">
          <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-purple/20 blur-3xl" />
          <p className="relative text-xs uppercase tracking-wider text-purple">This week</p>
          <p className="relative mt-1 text-2xl font-bold leading-tight">
            A softer, steadier week 💜
          </p>
          <p className="relative mt-1 text-xs text-muted-foreground">
            Mood {moodDelta >= 0 ? "is trending up" : "is shifting"}. Sleep is based on your logged nights.
          </p>
        </div>
      </section>

      <section className="px-5 pt-5">
        <div className="glass-strong rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-purple" />
            <p className="text-sm font-semibold">Mood trend</p>
            <span className="ml-auto flex items-center gap-1 text-xs text-secondary">
              <TrendingUp className="h-3 w-3" />
              {moodDelta >= 0 ? "+" : ""}{moodDelta}%
            </span>
          </div>
          <div className="mt-4">
            <Bars
              data={insights.moodTrend}
              labels={insights.weekLabels}
              max={5}
              color="bg-purple/70"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 px-5 pt-3">
        <div className="glass rounded-3xl p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold">Focus</p>
          </div>
          <p className="mt-2 text-xl font-bold text-gradient">{focusTotal}m</p>
          <p className="text-[10px] text-muted-foreground">this week</p>
          <div className="mt-3">
            <Bars
              data={insights.focusMinutes}
              labels={insights.weekLabels}
              max={Math.max(...insights.focusMinutes, 1)}
              color="bg-primary/70"
            />
          </div>
        </div>
        <div className="glass rounded-3xl p-4">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-secondary" />
            <p className="text-xs font-semibold">Sleep</p>
          </div>
          <p className="mt-2 text-xl font-bold text-gradient">{sleepAvg.toFixed(1)}h</p>
          <p className="text-[10px] text-muted-foreground">avg / night</p>
          <div className="mt-3">
            <Bars
              data={insights.sleepHours}
              labels={insights.weekLabels}
              max={10}
              color="bg-secondary/70"
            />
          </div>
        </div>
      </section>

      <section className="px-5 pt-5">
        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Habits completed</p>
          <p className="mt-1 text-xl font-bold">{habitsTotal}</p>
          <div className="mt-3">
            <Bars
              data={insights.habitsCompleted}
              labels={insights.weekLabels}
              max={5}
              color="bg-secondary/60"
            />
          </div>
        </div>
      </section>
    </Shell>
  );
}
