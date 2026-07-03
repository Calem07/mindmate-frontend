import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, ScreenHeader } from "@/components/Shell";
import { CheckCircle2, BookOpen, Target, Brain, Clock, Trophy, BarChart3, Sparkles, ChevronRight, Heart } from "lucide-react";
import { LunaAvatar, useAmbientLunaMood } from "@/components/LunaAvatar";
import { reflections } from "@/data/mock";

export const Route = createFileRoute("/growth")({
  head: () => ({ meta: [{ title: "Growth — MindMate" }, { name: "description", content: "Habits, journal, goals, reflections, and Future Me." }] }),
  component: Growth,
});

const hub = [
  { to: "/habits", label: "Habits", desc: "Tiny daily rituals", icon: CheckCircle2, tone: "primary" },
  { to: "/journal", label: "Journal & Gratitude", desc: "Soft place to write", icon: BookOpen, tone: "purple" },
  { to: "/goals", label: "Goals", desc: "Dreams, gently tracked", icon: Target, tone: "secondary" },
  { to: "/reflections", label: "AI Reflections", desc: "Patterns Luna noticed", icon: Brain, tone: "primary" },
  { to: "/future-me", label: "Future Me", desc: "Letters across time", icon: Clock, tone: "purple" },
  { to: "/exam-focus", label: "Exam Focus", desc: "Quiet study sessions", icon: BookOpen, tone: "secondary" },
  { to: "/badges", label: "Badges & Challenges", desc: "Moments earned", icon: Trophy, tone: "purple" },
  { to: "/insights", label: "Insights", desc: "Your trends, softly", icon: BarChart3, tone: "primary" },
] as const;

const toneMap: Record<string, string> = {
  primary: "bg-primary/15 text-primary",
  purple: "bg-purple/15 text-purple",
  secondary: "bg-secondary/15 text-secondary",
};

function Growth() {
  const ambientMood = useAmbientLunaMood();
  return (
    <Shell>
      <ScreenHeader title="Growth" back />

      <section className="px-5">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-5 glow-purple">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-purple/30 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <LunaAvatar mood={ambientMood} size="md" bounce />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-purple">Your growth hub</p>
              <p className="text-base font-bold leading-tight">Everything Luna helps you tend</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 px-5 pt-5">
        {hub.map(({ to, label, desc, icon: Icon, tone }) => (
          <Link key={to} to={to} className="glass relative overflow-hidden rounded-3xl p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneMap[tone]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-semibold">{label}</p>
            <p className="text-[11px] text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Luna's recent reflections</h3>
          <Link to="/reflections" className="flex items-center gap-1 text-[11px] text-purple">See all <ChevronRight className="h-3 w-3" /></Link>
        </div>
        <div className="space-y-2.5">
          {reflections.slice(0, 2).map((r) => (
            <div key={r.id} className="glass flex items-center gap-3 rounded-2xl p-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple/15">
                {r.icon === "Heart" ? <Heart className="h-5 w-5 text-purple" /> : <Sparkles className="h-5 w-5 text-purple" />}
              </div>
              <p className="flex-1 text-xs leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <Link to="/check-in" className="block">
          <div className="glass-strong relative overflow-hidden rounded-3xl p-5">
            <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-purple/20 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple/15">
                <Heart className="h-6 w-6 text-purple" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Daily check-in</p>
                <p className="text-xs text-muted-foreground">A soft minute with Luna</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Link>
      </section>
    </Shell>
  );
}
