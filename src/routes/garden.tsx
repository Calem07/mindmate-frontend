import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { LunaAvatar, type LunaMood } from "@/components/LunaAvatar";
import {
  gardenApi,
  type CareAction,
  type Garden as GardenData,
  type GardenStage,
  type GardenStageKey,
} from "@/lib/api/garden";
import { lunaApi } from "@/lib/api/luna";

import { Shell, ScreenHeader } from "@/components/Shell";
import { AnimatedNumber, AnimatedProgress, MotionReveal } from "@/components/Motion";

export const Route = createFileRoute("/garden")({
  head: () => ({
    meta: [
      { title: "Growth Garden — MindMate" },
      { name: "description", content: "Watch your magical garden grow with every wellness step." },
    ],
  }),
  component: Garden,
});

/* Legacy shelf seed removed from runtime; collectibles now come from Garden API.
type Collectible = { emoji: string; name: string; owned: boolean };
const collectibles: Collectible[] = [
  { emoji: "🌱", name: "Seed of Calm", owned: true },
  { emoji: "💧", name: "Dew Drop", owned: true },
  { emoji: "🍃", name: "First Leaf", owned: false },
  { emoji: "🌸", name: "Quiet Bloom", owned: false },
  { emoji: "🪷", name: "Lotus", owned: false },
  { emoji: "✨", name: "Stardust", owned: false },
];
*/

const ICON_MAP = {
  ClipboardCheck,
  Droplet,
  BookOpen,
  Heart,
  Target,
} as const;

const STAGE_MOOD: Record<GardenStageKey, LunaMood> = {
  seed: "sleepy",
  sprout: "happy",
  tree: "focused",
  bloom: "celebrate",
  ancient: "calm",
};
const luna = { name: "Luna" };

/** Derive the active stage from any XP value via configured thresholds. */
function deriveStage(xp: number, gardenStages: GardenStage[]) {
  if (gardenStages.length === 0) {
    const stage: GardenStage = {
      key: "seed",
      emoji: "🌱",
      title: "Seed",
      xp: 0,
      reward: "Begin growth",
      lunaWhisper: "",
    };
    return { idx: 0, stage, next: stage, progress: 0 };
  }
  const idx = gardenStages.reduce((acc, s, i) => (xp >= s.xp ? i : acc), 0);
  const stage = gardenStages[idx];
  const next = gardenStages[idx + 1] ?? stage;
  const prev = stage;
  const progress = next === stage ? 1 : Math.min(1, (xp - prev.xp) / (next.xp - prev.xp));
  return { idx, stage, next, progress };
}

type Burst = { id: number; x: number; y: number; xp: number; label: string };

function Garden() {
  const [hour, setHour] = useState<number | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [garden, setGarden] = useState<GardenData | null>(null);
  const [lunaNote, setLunaNote] = useState("");

  useEffect(() => {
    gardenApi
      .get()
      .then(setGarden)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load garden"));
  }, []);
  useEffect(() => {
    lunaApi
      .note("garden")
      .then((note) => setLunaNote(note.content))
      .catch(() => setLunaNote(""));
  }, []);

  const gardenStages = useMemo(() => garden?.gardenStages ?? [], [garden]);
  const careActions = useMemo(() => garden?.careActions ?? [], [garden]);
  const growthTimeline = useMemo(() => garden?.growthTimeline ?? [], [garden]);
  const collectibles = useMemo(() => garden?.collectibles ?? [], [garden]);
  const user = { xp: garden?.xp ?? 0, level: garden?.level ?? 1 };

  const {
    idx: currentStageIndex,
    stage: currentStage,
    next: nextStage,
    progress: xpProgress,
  } = useMemo(() => deriveStage(user.xp, gardenStages), [gardenStages, user.xp]);

  const [previewStage, setPreviewStage] = useState<GardenStageKey>("seed");

  useEffect(() => setHour(new Date().getHours()), []);
  useEffect(() => setPreviewStage(currentStage.key), [currentStage.key]);

  const timeOfDay = useMemo(() => {
    if (hour === null)
      return { label: "Day", Icon: Sun, tint: "from-amber-400/10 via-transparent to-primary/20" };
    if (hour < 6 || hour >= 20)
      return {
        label: "Night",
        Icon: Moon,
        tint: "from-indigo-500/25 via-transparent to-primary/30",
      };
    if (hour < 11)
      return {
        label: "Morning",
        Icon: Sun,
        tint: "from-amber-300/20 via-transparent to-cyan-400/15",
      };
    if (hour < 17)
      return {
        label: "Afternoon",
        Icon: Sun,
        tint: "from-amber-200/10 via-transparent to-secondary/15",
      };
    return { label: "Dusk", Icon: Cloud, tint: "from-rose-400/15 via-transparent to-primary/25" };
  }, [hour]);

  const triggerCare = (
    e: React.MouseEvent<HTMLAnchorElement>,
    xp: number,
    label: string,
    actionId: string,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x: rect.left + rect.width / 2, y: rect.top, xp, label }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1300);
    gardenApi
      .care(actionId)
      .then(setGarden)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not tend garden"));
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
            <div className="absolute inset-0 flex items-end justify-center animate-sway">
              <LivingTree
                stage={previewStage as TreeStageKey}
                progress={previewStage === currentStage.key ? xpProgress : 1}
                className="h-full w-full"
              />
            </div>
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${timeOfDay.tint}`}
            />
            <div className="pointer-events-none absolute right-5 top-4 flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-[10px] uppercase tracking-wider">
              <timeOfDay.Icon className="h-3 w-3 text-secondary" />
              <span className="text-muted-foreground">{timeOfDay.label}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface via-surface/60 to-transparent" />
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
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
          </div>
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 px-4">
            <Sparkles className="h-3.5 w-3.5 text-secondary shrink-0" />
            <p className="text-xs text-muted-foreground text-center italic line-clamp-1">
              "{lunaNote}"
            </p>
          </div>
        </div>
      </section>

      {/* XP card */}
      <section className="px-5 pt-5">
        <div className="glass-strong rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Level {user.level} · {currentStage.title}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {(nextStage.xp - user.xp).toLocaleString()} XP to {nextStage.title}
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold">
            <AnimatedNumber value={user.xp} className="text-gradient" />
            <span className="text-muted-foreground"> / {nextStage.xp.toLocaleString()} XP</span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <AnimatedProgress
              value={Math.round(xpProgress * 100)}
              label="Garden XP progress"
              className="h-full rounded-full gradient-primary glow-cyan"
            />
          </div>
        </div>

        {/* Next unlock hero card */}
        <div className="relative mt-3 overflow-hidden glass-strong glow-purple rounded-3xl p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
          <div className="relative flex items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="oklch(1 0 0 / 0.08)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="url(#ring)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${xpProgress * 100} 100`}
                  style={{ transition: "stroke-dasharray 900ms ease" }}
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
          <span className="text-[10px] text-muted-foreground">{gardenStages.length} stages</span>
        </div>
        <div className="glass-strong rounded-3xl p-4">
          <div className="relative">
            <span className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-white/10 to-white/5" />
            <ul className="space-y-3">
              {gardenStages.map((s, i) => {
                const reached = i <= currentStageIndex;
                const isCurrent = i === currentStageIndex;
                const isPreview = s.key === previewStage;
                return (
                  <li
                    key={s.key}
                    className="motion-badge-reveal relative flex items-center gap-3"
                    style={{ "--motion-delay": `${i * 45}ms` } as React.CSSProperties}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewStage(s.key)}
                      className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl transition-transform active:scale-95 ${
                        reached ? "gradient-primary" : "bg-white/5"
                      } ${isCurrent ? "glow-purple animate-pulse-glow" : ""} ${
                        isPreview && !isCurrent ? "ring-2 ring-secondary/70" : ""
                      }`}
                      aria-label={`Preview ${s.title}`}
                    >
                      <span>{s.emoji}</span>
                      {reached && !isCurrent && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-background">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      )}
                      {!reached && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface text-muted-foreground border border-white/10">
                          <Lock className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </button>
                    <div className={`flex-1 rounded-2xl px-3 py-2 ${isCurrent ? "glass" : ""}`}>
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-semibold ${reached ? "text-foreground" : "text-muted-foreground"}`}
                        >
                          {s.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {s.xp.toLocaleString()} XP
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{s.reward}</p>
                      {isCurrent && (
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-secondary">
                          You are here · tap any stage to preview
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Growth Timeline — when the tree advanced + Luna whispers */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-end justify-between">
          <h3 className="text-base font-semibold">Growth Timeline</h3>
          <span className="text-[10px] text-muted-foreground">
            {growthTimeline.length} milestones
          </span>
        </div>
        <div className="glass-strong rounded-3xl p-4">
          <ol className="relative space-y-4 pl-5">
            <span className="absolute left-1.5 top-1 bottom-1 w-px bg-gradient-to-b from-secondary/70 via-primary/40 to-white/5" />
            {growthTimeline.map((m) => {
              const s = gardenStages.find((g) => g.key === m.stage);
              if (!s) return null;
              return (
                <li key={m.id} className="motion-badge-reveal relative">
                  <span className="absolute -left-[18px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-secondary ring-4 ring-secondary/20" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      <span className="mr-1.5">{s.emoji}</span>
                      Reached {s.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground">{m.daysAgo}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{m.date}</p>
                  <div className="mt-2 flex min-w-0 gap-2 rounded-2xl glass p-2.5">
                    <LunaAvatar mood={STAGE_MOOD[m.stage]} size="sm" />
                    <p className="min-w-0 text-[12px] italic text-foreground/90">
                      <span className="text-secondary not-italic">{luna.name}:</span> "
                      {m.lunaMessage}"
                    </p>
                  </div>
                </li>
              );
            })}
            {/* Upcoming */}
            {gardenStages.slice(currentStageIndex + 1).map((s) => (
              <li key={`up-${s.key}`} className="relative opacity-60">
                <span className="absolute -left-[18px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-white/10 ring-4 ring-white/5" />
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    <span className="mr-1.5">{s.emoji}</span>
                    {s.title} · coming
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {s.xp.toLocaleString()} XP
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground/80 italic">"{s.lunaWhisper}"</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Garden Care — stage-aware effects + XP */}
      <section className="px-5 pt-6">
        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold">Garden Care</h3>
            <p className="text-xs text-muted-foreground">
              Effects tuned for your {currentStage.title}
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-secondary">
            {currentStage.emoji} {currentStage.title}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {careActions.map((a, index) => (
            <MotionReveal key={a.id} delay={index * 40}>
              <CareTile action={a} stage={currentStage.key} onTap={triggerCare} />
            </MotionReveal>
          ))}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground text-center">
          Tap a care to see its effect on the {currentStage.title} form
        </p>
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
                <span className={`text-2xl ${c.owned ? "" : "grayscale opacity-30"}`}>
                  {c.emoji}
                </span>
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
          <div
            key={b.id}
            className="absolute -translate-x-1/2 animate-rise"
            style={{ left: b.x, top: b.y }}
          >
            <span className="block rounded-full gradient-primary px-2.5 py-1 text-[11px] font-bold text-background shadow-lg">
              +{b.xp} XP
            </span>
            <span className="mt-1 block rounded-full glass px-2 py-0.5 text-center text-[9px] text-foreground/90">
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function CareTile({
  action,
  stage,
  onTap,
}: {
  action: CareAction;
  stage: GardenStageKey;
  onTap: (
    e: React.MouseEvent<HTMLAnchorElement>,
    xp: number,
    label: string,
    actionId: string,
  ) => void;
}) {
  const [ripples, setRipples] = useState<number[]>([]);
  const Icon = ICON_MAP[action.icon];
  const xp = action.xpByStage[stage];
  const effect = action.effectByStage[stage];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const id = Date.now();
    setRipples((r) => [...r, id]);
    setTimeout(() => setRipples((r) => r.filter((x) => x !== id)), 700);
    onTap(e, xp, effect, action.id);
  };

  return (
    <Link
      to={action.to}
      onClick={handleClick}
      title={effect}
      className="relative flex min-w-0 w-full flex-col items-center gap-1.5 overflow-hidden rounded-2xl glass p-3 transition-transform active:scale-95"
    >
      {ripples.map((id) => (
        <span
          key={id}
          className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 animate-ripple"
        />
      ))}
      <Icon className="relative h-5 w-5 text-primary" />
      <span className="relative text-[10px] font-medium">{action.label}</span>
      <span className="relative text-[9px] text-secondary">+{xp}</span>
    </Link>
  );
}
