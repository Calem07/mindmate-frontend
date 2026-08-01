import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, ScreenHeader } from "@/components/Shell";
import {
  CheckCircle2,
  BookOpen,
  Target,
  Brain,
  Clock,
  Trophy,
  BarChart3,
  Sparkles,
  ChevronRight,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { LunaAvatar, useAmbientLunaMood } from "@/components/LunaAvatar";
import { insightsApi, type Reflection } from "@/lib/api/insights";

export const Route = createFileRoute("/growth")({
  head: () => ({
    meta: [
      { title: "Growth — MindMate" },
      { name: "description", content: "Habits, journal, goals, reflections, and Future Me." },
    ],
  }),
  component: Growth,
});

const hub = [
  {
    to: "/habits",
    label: "Habits",
    desc: "Tiny daily rituals",
    icon: CheckCircle2,
    tone: "primary",
  },
  { to: "/journal", label: "Journal", desc: "Soft place to write", icon: BookOpen, tone: "purple" },
  { to: "/goals", label: "Goals", desc: "Dreams, gently tracked", icon: Target, tone: "secondary" },
  {
    to: "/reflections",
    label: "Reflections",
    desc: "Patterns Luna noticed",
    icon: Brain,
    tone: "primary",
  },
  {
    to: "/future-me",
    label: "Future Me",
    desc: "Letters across time",
    icon: Clock,
    tone: "purple",
  },
  {
    to: "/exam-focus",
    label: "Exam Focus",
    desc: "Quiet study sessions",
    icon: BookOpen,
    tone: "secondary",
  },
  { to: "/badges", label: "Badges", desc: "Moments earned", icon: Trophy, tone: "purple" },
  {
    to: "/insights",
    label: "Insights",
    desc: "Your trends, softly",
    icon: BarChart3,
    tone: "primary",
  },
] as const;

const toneMap: Record<string, string> = {
  primary: "bg-primary/15 text-primary",
  purple: "bg-purple/15 text-purple",
  secondary: "bg-secondary/15 text-secondary",
};

const reflectionIcons: Record<string, LucideIcon> = {
  Brain,
  Sparkles,
  Clock,
  Heart,
};

function Growth() {
  const ambientMood = useAmbientLunaMood();
  const [reflections, setReflections] = useState<Reflection[]>([]);

  useEffect(() => {
    insightsApi
      .reflections()
      .then(setReflections)
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Could not load reflections"),
      );
  }, []);
  return (
    <Shell>
      <ScreenHeader title="Growth" back />

      <section className="px-5 pt-2">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-5 glow-purple">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-purple/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <LunaAvatar mood={ambientMood} size="md" bounce />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-purple">
                Your growth hub
              </p>
              <p className="mt-0.5 text-base font-bold leading-tight">
                Everything Luna helps you tend
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 px-5 pt-5">
        {hub.map(({ to, label, desc, icon: Icon, tone }) => (
          <Link
            key={to}
            to={to}
            className="glass group relative flex min-h-[112px] flex-col overflow-hidden rounded-3xl p-4 transition active:scale-[0.98]"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneMap[tone]}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-semibold leading-tight">{label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Luna's recent reflections</h3>
          <Link
            to="/reflections"
            className="flex items-center gap-1 text-[11px] font-medium text-purple transition active:opacity-70"
          >
            See all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {reflections.slice(0, 2).map((r) => {
            const Icon = reflectionIcons[r.icon] ?? Sparkles;
            return (
              <Link
                key={r.id}
                to="/reflections"
                className="glass flex items-center gap-3 rounded-2xl p-3.5 transition active:scale-[0.99]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-purple/15">
                  <Icon className="h-5 w-5 text-purple" />
                </div>
                <p className="flex-1 text-xs leading-relaxed">{r.text}</p>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-5 pt-6">
        <Link to="/check-in" className="block">
          <div className="glass-strong relative overflow-hidden rounded-3xl p-5 transition active:scale-[0.99]">
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
