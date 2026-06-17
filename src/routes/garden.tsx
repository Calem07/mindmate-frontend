import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Settings,
  Leaf,
  ClipboardCheck,
  Droplet,
  BookOpen,
  Heart,
  Target,
  Sparkles,
  Lock,
  Check,
  Sun,
  Moon,
  Cloud,
} from "lucide-react";
import { LivingTree, type TreeStageKey } from "@/components/LivingTree";

import { Shell, ScreenHeader } from "@/components/Shell";

export const Route = createFileRoute("/garden")({
  head: () => ({
    meta: [
      { title: "Growth Garden — MindMate" },
      { name: "description", content: "Watch your magical garden grow with every wellness step." },
    ],
  }),
  component: Garden,
});

type Stage = {
  key: TreeStageKey;
  emoji: string;
  title: string;
  xp: number;
  reward: string;
};

const stages: Stage[] = [
  { key: "seed", emoji: "🌱", title: "Seed", xp: 0, reward: "First spark of light" },
  { key: "sprout", emoji: "🌿", title: "Young Sprout", xp: 1000, reward: "Luna's lullaby unlocked" },
  { key: "tree", emoji: "🌳", title: "Young Tree", xp: 2000, reward: "First Leaf badge" },
  { key: "bloom", emoji: "🌸", title: "Blooming", xp: 3500, reward: "Petal soundscape" },
  { key: "ancient", emoji: "🌟", title: "Ancient", xp: 6000, reward: "Mythic Luna form" },
];

type Collectible = { emoji: string; name: string; owned: boolean };
const collectibles: Collectible[] = [
  { emoji: "🌱", name: "Seed of Calm", owned: true },
  { emoji: "💧", name: "Dew Drop", owned: true },
  { emoji: "🍃", name: "First Leaf", owned: false },
  { emoji: "🌸", name: "Quiet Bloom", owned: false },
  { emoji: "🪷", name: "Lotus", owned: false },
  { emoji: "✨", name: "Stardust", owned: false },
];

const currentXP = 1250;
// Derive current stage from XP — the highest stage whose xp threshold is reached.
const currentStageIndex = stages.reduce(
  (acc, s, i) => (currentXP >= s.xp ? i : acc),
  0,
);
const currentStage = stages[currentStageIndex];
const nextStage = stages[currentStageIndex + 1] ?? stages[stages.length - 1];
const prevStage = currentStage;
const xpProgress = nextStage === currentStage
  ? 1
  : Math.min(1, (currentXP - prevStage.xp) / (nextStage.xp - prevStage.xp));

type Burst = { id: number; x: number; y: number; xp: number };

function Garden() {
  const [hour, setHour] = useState<number | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [previewStage, setPreviewStage] = useState<TreeStageKey>(currentStage.key);

  useEffect(() => setHour(new Date().getHours()), []);

  const timeOfDay = useMemo(() => {
    if (hour === null) return { label: "Day", Icon: Sun, tint: "from-amber-400/10 via-transparent to-primary/20" };
    if (hour < 6 || hour >= 20) return { label: "Night", Icon: Moon, tint: "from-indigo-500/25 via-transparent to-primary/30" };
    if (hour < 11) return { label: "Morning", Icon: Sun, tint: "from-amber-300/20 via-transparent to-cyan-400/15" };
    if (hour < 17) return { label: "Afternoon", Icon: Sun, tint: "from-amber-200/10 via-transparent to-secondary/15" };
    return { label: "Dusk", Icon: Cloud, tint: "from-rose-400/15 via-transparent to-primary/25" };
  }, [hour]);

  const triggerCare = (e: React.MouseEvent<HTMLButtonElement>, xp: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x: rect.left + rect.width / 2, y: rect.top, xp }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1200);
  };

  return (
    <Shell>
      <ScreenHeader
        title="Growth Garden"
        back
        right={
          <button className="glass flex h-9 w-9 items-center justify-center rounded-full">
            <Settings className="h-4 w-4" />
          </button>
        }
      />

      {/* Living tree scene */}
      <section className="px-5">
        <div className="relative overflow-hidden rounded-3xl glass-strong glow-purple">
          <div className="relative h-72 w-full">
            {/* Dynamic SVG tree morphs by stage */}
            <div className="absolute inset-0 flex items-end justify-center animate-sway">
              <LivingTree
                stage={previewStage}
                progress={previewStage === currentStage.key ? xpProgress : 1}
                className="h-full w-full"
              />
            </div>
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${timeOfDay.tint}`} />
            {/* Sun/moon halo */}
            <div className="pointer-events-none absolute right-5 top-4 flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[10px] uppercase tracking-wider">
              <timeOfDay.Icon className="h-3 w-3 text-secondary" />
              <span className="text-muted-foreground">{timeOfDay.label}</span>
            </div>
            {/* Bottom fade into surface */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
            {/* Fireflies — drifting particles */}
            <div className="pointer-events-none absolute inset-0">
              {[...Array(14)].map((_, i) => {
                const left = (i * 53) % 100;
                const top = 30 + ((i * 17) % 55);
                const dx = (i % 2 === 0 ? 1 : -1) * (20 + ((i * 7) % 40));
                const dur = 6 + (i % 5);
                const delay = (i * 0.45) % 5;
                return (
                  <span
                    key={i}
                    className="absolute h-1.5 w-1.5 rounded-full bg-secondary animate-drift"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      boxShadow: "0 0 8px 2px var(--color-secondary, #67e8f9)",
                      animationDuration: `${dur}s`,
                      animationDelay: `${delay}s`,
                      ["--dx" as string]: `${dx}px`,
                    }}
                  />
                );
              })}
            </div>
            {/* Soft pulse halo behind tree */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
          </div>
          {/* Bottom label inside scene */}
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            <p className="text-xs text-muted-foreground">Your tree is breathing softly</p>
          </div>
        </div>
      </section>

      {/* XP card */}
      <section className="px-5 pt-5">
        <div className="glass-strong rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Level 4 · {prevStage.title}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {nextStage.xp - currentXP} XP to {nextStage.title}
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold">
            <span className="text-gradient">{currentXP.toLocaleString()}</span>
            <span className="text-muted-foreground"> / {nextStage.xp.toLocaleString()} XP</span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full gradient-primary rounded-full glow-cyan transition-[width] duration-700"
              style={{ width: `${Math.round(xpProgress * 100)}%` }}
            />
          </div>
        </div>

        {/* Next unlock hero card */}
        <div className="relative mt-3 overflow-hidden glass-strong glow-purple rounded-3xl p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
          <div className="relative flex items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center">
              {/* XP ring */}
              <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="2.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="url(#ring)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${xpProgress * 100} 100`}
                />
                <defs>
                  <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.74 0.14 210)" />
                    <stop offset="100%" stopColor="oklch(0.65 0.22 295)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/15">
                <Leaf className="h-7 w-7 text-secondary" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-wider text-secondary">Next unlock</p>
              <p className="text-base font-semibold">{nextStage.reward}</p>
              <p className="text-xs text-muted-foreground">
                Becomes yours at {nextStage.xp.toLocaleString()} XP
              </p>
            </div>
          </div>
          <div className="relative mt-4 flex gap-2">
            <Link
              to="/check-in"
              className="flex-1 gradient-primary rounded-2xl py-2.5 text-center text-xs font-semibold"
            >
              Earn XP now
            </Link>
            <Link to="/luna" className="glass rounded-2xl px-3 py-2.5 text-center text-xs">
              Ask Luna
            </Link>
          </div>
        </div>
      </section>

      {/* Evolution journey timeline */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-end justify-between">
          <h3 className="text-base font-semibold">Evolution Journey</h3>
          <span className="text-[10px] text-muted-foreground">5 stages</span>
        </div>
        <div className="glass-strong rounded-3xl p-4">
          <div className="relative">
            <span className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-white/10 to-white/5" />
            <ul className="space-y-3">
              {stages.map((s) => {
                const isCurrent = s.current;
                return (
                  <li key={s.key} className="relative flex items-center gap-3">
                    <div
                      className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl ${
                        s.reached ? "gradient-primary" : "bg-white/5"
                      } ${isCurrent ? "glow-purple animate-pulse-glow" : ""}`}
                    >
                      <span>{s.emoji}</span>
                      {s.reached && !isCurrent && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-background">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      )}
                      {!s.reached && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface text-muted-foreground border border-white/10">
                          <Lock className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                    <div className={`flex-1 rounded-2xl px-3 py-2 ${isCurrent ? "glass" : ""}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${s.reached ? "text-foreground" : "text-muted-foreground"}`}>
                          {s.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground">{s.xp.toLocaleString()} XP</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{s.reward}</p>
                      {isCurrent && (
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-secondary">You are here</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Garden Care */}
      <section className="px-5 pt-6">
        <h3 className="text-base font-semibold">Garden Care</h3>
        <p className="text-xs text-muted-foreground">A tiny act helps your tree breathe deeper</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[
            { icon: ClipboardCheck, label: "Check-In", to: "/check-in" as const, xp: 25 },
            { icon: Droplet, label: "Habits", to: "/habits" as const, xp: 15 },
            { icon: BookOpen, label: "Journal", to: "/journal" as const, xp: 20 },
            { icon: Heart, label: "Gratitude", to: "/journal" as const, xp: 10 },
            { icon: Target, label: "Focus", to: "/exam-focus" as const, xp: 30 },
          ].map(({ icon: Icon, label, to, xp }) => (
            <CareTile key={label} to={to} label={label} xp={xp} Icon={Icon} onTap={triggerCare} />
          ))}
        </div>
      </section>

      {/* Collectibles shelf */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-end justify-between">
          <h3 className="text-base font-semibold">Garden Shelf</h3>
          <span className="text-[10px] text-muted-foreground">
            {collectibles.filter((c) => c.owned).length} / {collectibles.length} found
          </span>
        </div>
        <div className="glass-strong rounded-3xl p-4">
          <div className="grid grid-cols-3 gap-2">
            {collectibles.map((c) => (
              <div
                key={c.name}
                className={`relative flex flex-col items-center gap-1 rounded-2xl p-3 ${
                  c.owned ? "glass" : "bg-white/[0.02] border border-dashed border-white/5"
                }`}
              >
                <span className={`text-2xl ${c.owned ? "" : "grayscale opacity-30"}`}>{c.emoji}</span>
                <span
                  className={`text-[10px] text-center ${
                    c.owned ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {c.owned ? c.name : "???"}
                </span>
                {!c.owned && (
                  <Lock className="absolute right-1.5 top-1.5 h-3 w-3 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating +XP bursts */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {bursts.map((b) => (
          <span
            key={b.id}
            className="absolute -translate-x-1/2 animate-rise rounded-full gradient-primary px-2.5 py-1 text-[11px] font-bold text-background shadow-lg"
            style={{ left: b.x, top: b.y }}
          >
            +{b.xp} XP
          </span>
        ))}
      </div>
    </Shell>
  );
}

function CareTile({
  to,
  label,
  xp,
  Icon,
  onTap,
}: {
  to: "/check-in" | "/habits" | "/journal" | "/exam-focus";
  label: string;
  xp: number;
  Icon: React.ComponentType<{ className?: string }>;
  onTap: (e: React.MouseEvent<HTMLButtonElement>, xp: number) => void;
}) {
  const [ripples, setRipples] = useState<number[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = Date.now();
    setRipples((r) => [...r, id]);
    setTimeout(() => setRipples((r) => r.filter((x) => x !== id)), 700);
    onTap(e, xp);
  };

  return (
    <Link to={to} className="block">
      <button
        type="button"
        onClick={handleClick}
        className="relative w-full overflow-hidden glass flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-transform active:scale-95"
      >
        {ripples.map((id) => (
          <span
            key={id}
            className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 animate-ripple"
          />
        ))}
        <Icon className="relative h-5 w-5 text-primary" />
        <span className="relative text-[10px] font-medium">{label}</span>
        <span className="relative text-[9px] text-secondary">+{xp}</span>
      </button>
    </Link>
  );
}
