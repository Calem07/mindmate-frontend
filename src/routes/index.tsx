import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Droplet, Brain, ClipboardCheck, Sparkles, MessageCircle } from "lucide-react";
import luna from "@/assets/luna.png";
import tree from "@/assets/tree.jpg";
import { Shell } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindMate — Your wellness companion" },
      { name: "description", content: "MindMate is your AI-powered wellness, productivity and emotional growth companion." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <Shell>
      <header className="flex items-start justify-between px-5 pt-6">
        <div>
          <p className="text-sm text-muted-foreground">Good morning,</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">Calem <span className="text-xl">👋</span></h1>
        </div>
        <button className="glass relative flex h-11 w-11 items-center justify-center rounded-full" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-purple" />
        </button>
      </header>

      {/* Luna Card */}
      <section className="px-5 pt-5">
        <Link to="/luna" className="block">
          <div className="glass-strong relative overflow-hidden rounded-3xl p-5 glow-purple">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-purple/30 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse-glow rounded-full bg-purple/40 blur-xl" />
                <img src={luna} alt="Luna" width={80} height={80} className="relative h-20 w-20 animate-float object-contain" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Luna</h2>
                  <span className="rounded-full bg-purple/20 px-2 py-0.5 text-[10px] font-semibold text-purple">LV 4</span>
                </div>
                <p className="text-xs text-muted-foreground">82% Bond</p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[62%] gradient-primary rounded-full" />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">1,250 / 2,000 XP</p>
              </div>
            </div>
            <p className="relative mt-4 text-sm leading-relaxed text-foreground/90">
              "Luna noticed you've been working hard lately. Let's take today one step at a time 💜"
            </p>
            <div className="relative mt-4 flex gap-2">
              <Link to="/growth" className="flex-1 rounded-2xl gradient-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-purple/30">
                Start Check-In
              </Link>
              <Link to="/luna" className="glass flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-semibold">
                <MessageCircle className="h-4 w-4" />
                Talk
              </Link>
            </div>
          </div>
        </Link>
      </section>

      {/* Today's Focus */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">Today's Focus</h3>
          <span className="text-xs text-muted-foreground">4 of 6 completed</span>
        </div>
        <div className="space-y-2.5">
          <FocusItem icon={ClipboardCheck} title="Check-In" subtitle="Reflect on how you feel" done color="purple" />
          <FocusItem icon={Droplet} title="Drink Water" subtitle="8 glasses" progress={62} color="cyan" />
          <FocusItem icon={Brain} title="Meditate" subtitle="10 minutes" done color="teal" />
        </div>
        <button className="mt-2.5 flex w-full items-center justify-between rounded-2xl glass px-4 py-3 text-sm">
          <span className="text-muted-foreground">View all</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </section>

      {/* Garden Preview */}
      <section className="px-5 pt-6">
        <Link to="/garden" className="block">
          <div className="glass-strong relative overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between px-5 pt-4">
              <div>
                <h3 className="text-base font-semibold">Growth Garden</h3>
                <p className="text-xs text-muted-foreground">Level 4 · Young Sprout</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="relative mt-2 h-44 overflow-hidden">
              <img src={tree} alt="Your tree" width={1024} height={768} className="h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
            </div>
            <div className="px-5 pb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Next unlock</span>
                <span className="font-semibold">First Leaf</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[62%] gradient-primary rounded-full" />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">1,250 / 2,000 XP</p>
            </div>
          </div>
        </Link>
      </section>

      {/* Encouragement */}
      <section className="px-5 pt-6">
        <div className="glass rounded-3xl p-5">
          <div className="flex items-center gap-2 text-xs text-purple">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-semibold uppercase tracking-wider">Daily Encouragement</span>
          </div>
          <p className="mt-3 text-base leading-relaxed">
            "One small step today, one big change tomorrow."
          </p>
          <p className="mt-2 text-xs text-muted-foreground">— Luna 💜</p>
        </div>
      </section>
    </Shell>
  );
}

function FocusItem({ icon: Icon, title, subtitle, done, progress, color }: {
  icon: typeof Droplet; title: string; subtitle: string; done?: boolean; progress?: number; color: "cyan" | "purple" | "teal";
}) {
  const colorMap = { cyan: "text-primary bg-primary/15", purple: "text-purple bg-purple/15", teal: "text-secondary bg-secondary/15" };
  return (
    <div className="glass flex items-center gap-3 rounded-2xl p-3.5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {done ? (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/20">
          <svg className="h-4 w-4 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      ) : (
        <div className="relative h-7 w-7">
          <svg className="h-7 w-7 -rotate-90" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-white/10" />
            <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeDasharray={`${(progress ?? 0) * 0.754} 100`} strokeLinecap="round" className="text-primary" />
          </svg>
        </div>
      )}
    </div>
  );
}
