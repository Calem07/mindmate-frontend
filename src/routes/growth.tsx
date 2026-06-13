import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, CheckCircle2, Circle, Sparkles, BookOpen, Target, Brain, Clock, ChevronRight } from "lucide-react";
import luna from "@/assets/luna.png";
import { Shell, ScreenHeader } from "@/components/Shell";

export const Route = createFileRoute("/growth")({
  head: () => ({ meta: [{ title: "Growth — MindMate" }, { name: "description", content: "Build habits, journal, set goals, and reflect with Luna." }] }),
  component: Growth,
});

const tabs = ["Habits", "Journal", "Goals", "Reflections", "Future Me"] as const;

function Growth() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Habits");
  return (
    <Shell>
      <ScreenHeader title="Growth" back right={<button className="glass flex h-9 w-9 items-center justify-center rounded-full"><Plus className="h-4 w-4" /></button>} />

      <div className="px-5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${tab === t ? "gradient-primary text-white" : "glass text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-5">
        {tab === "Habits" && <Habits />}
        {tab === "Journal" && <Journal />}
        {tab === "Goals" && <Goals />}
        {tab === "Reflections" && <Reflections />}
        {tab === "Future Me" && <FutureMe />}
      </div>
    </Shell>
  );
}

function Habits() {
  const habits = [
    { name: "Drink 2L of water", status: "Done" as const },
    { name: "Meditate 10 min", status: "Done" as const },
    { name: "Study 30 min", status: "In progress" as const },
    { name: "Sleep 8 hours", status: "Done" as const },
    { name: "Workout 30 min", status: "Not started" as const },
  ];
  return (
    <div className="space-y-3 px-5">
      <div>
        <h2 className="text-lg font-bold">Your Habits</h2>
        <p className="text-xs text-muted-foreground">Consistency builds growth.</p>
      </div>
      <div className="glass-strong flex rounded-full p-1">
        {["Today", "Week", "Month"].map((p, i) => (
          <button key={p} className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${i === 0 ? "gradient-primary text-white" : "text-muted-foreground"}`}>{p}</button>
        ))}
      </div>
      <div className="space-y-2.5">
        {habits.map((h) => {
          const done = h.status === "Done";
          const inProg = h.status === "In progress";
          return (
            <div key={h.name} className="glass flex items-center gap-3 rounded-2xl p-3.5">
              {done ? <CheckCircle2 className="h-6 w-6 text-secondary" /> : inProg ? <Circle className="h-6 w-6 text-primary" /> : <Circle className="h-6 w-6 text-muted-foreground" />}
              <span className="flex-1 text-sm font-semibold">{h.name}</span>
              <span className={`text-xs ${done ? "text-secondary" : inProg ? "text-primary" : "text-muted-foreground"}`}>{h.status}</span>
            </div>
          );
        })}
      </div>
      <button className="mt-2 w-full rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple/30">
        + Add Habit
      </button>
    </div>
  );
}

function Journal() {
  return (
    <div className="space-y-4 px-5">
      <div>
        <h2 className="text-lg font-bold">Your Journal</h2>
        <p className="text-xs text-muted-foreground">A safe place for your thoughts.</p>
      </div>
      <textarea
        placeholder="Write what's on your mind…"
        className="h-48 w-full resize-none rounded-3xl glass-strong p-4 text-sm outline-none placeholder:text-muted-foreground"
      />
      <div className="glass rounded-3xl p-4">
        <div className="flex items-center gap-2 text-xs text-purple">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="font-semibold uppercase tracking-wider">Daily Prompt</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed">What's one thing you're proud of yourself for today?</p>
      </div>
      <button className="w-full rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple/30">Save Entry</button>
    </div>
  );
}

function Goals() {
  const goals = [
    { name: "Ace my exams", due: "Due in 45 days", pct: 70 },
    { name: "Build a morning routine", due: "Due in 20 days", pct: 40 },
    { name: "Read 12 books this year", due: "Due in 180 days", pct: 25 },
  ];
  return (
    <div className="space-y-3 px-5">
      <div className="glass-strong flex rounded-full p-1">
        <button className="flex-1 rounded-full gradient-primary px-3 py-1.5 text-xs font-semibold text-white">Active</button>
        <button className="flex-1 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground">Completed</button>
      </div>
      {goals.map((g) => (
        <div key={g.name} className="glass-strong rounded-3xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">{g.name}</p>
              <p className="text-xs text-muted-foreground">{g.due}</p>
            </div>
            <span className="text-sm font-bold text-gradient">{g.pct}%</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full gradient-primary rounded-full" style={{ width: `${g.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Reflections() {
  const insights = [
    { icon: Brain, color: "text-primary bg-primary/15", text: "You've been more consistent with check-ins this week." },
    { icon: Sparkles, color: "text-purple bg-purple/15", text: "Your stress levels are decreasing. Proud of you!" },
    { icon: Clock, color: "text-secondary bg-secondary/15", text: "You sleep better on days you meditate." },
  ];
  return (
    <div className="space-y-4 px-5">
      <div className="glass-strong relative overflow-hidden rounded-3xl p-4">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-purple/30 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <img src={luna} alt="" width={64} height={64} className="h-16 w-16 animate-float object-contain" />
          <div>
            <p className="text-sm font-semibold">Luna's Reflection</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">You've shown so much strength this week. Remember, progress isn't always visible, but it's always happening. Keep going! 🌙</p>
          </div>
        </div>
      </div>
      <h3 className="text-sm font-semibold">Insights</h3>
      {insights.map((it, i) => (
        <button key={i} className="glass flex w-full items-center gap-3 rounded-2xl p-3.5 text-left">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${it.color}`}>
            <it.icon className="h-5 w-5" />
          </div>
          <p className="flex-1 text-sm">{it.text}</p>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}

function FutureMe() {
  const letters = [
    { title: "To my future self in 30 days", date: "Unlocks Jul 13", icon: BookOpen },
    { title: "Letter from before exams", date: "Unlocks Aug 1", icon: Target },
  ];
  return (
    <div className="space-y-4 px-5">
      <div className="glass-strong relative overflow-hidden rounded-3xl p-5">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
        <p className="text-xs uppercase tracking-wider text-primary">Time Capsule</p>
        <h2 className="mt-1 text-xl font-bold leading-tight">Write a letter to your future self</h2>
        <p className="mt-2 text-xs text-muted-foreground">Seal it today. Open it when the moment is right.</p>
        <button className="mt-4 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-white">+ New Letter</button>
      </div>
      <h3 className="text-sm font-semibold">Your Capsules</h3>
      {letters.map((l) => (
        <div key={l.title} className="glass flex items-center gap-3 rounded-2xl p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple/15">
            <l.icon className="h-5 w-5 text-purple" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{l.title}</p>
            <p className="text-[11px] text-muted-foreground">{l.date}</p>
          </div>
          <div className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-semibold text-muted-foreground">Sealed</div>
        </div>
      ))}
    </div>
  );
}
