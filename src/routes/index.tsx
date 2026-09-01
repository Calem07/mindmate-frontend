import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Droplet,
  Brain,
  MessageCircle,
  Sparkles,
  BookOpen,
  Moon,
  Sun,
  Sunrise,
  Leaf,
  Lock,
  CheckCircle2,
  Target,
  Heart,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import tree from "@/assets/tree.jpg";
import { Shell } from "@/components/Shell";
import { LunaAvatar, useAmbientLunaMood } from "@/components/LunaAvatar";
import { AnimatedProgress, MotionReveal } from "@/components/Motion";
import { useAuth } from "@/components/AuthProvider";
import { useNotifications } from "@/components/NotificationProvider";
import { checkInsApi } from "@/lib/api/checkIns";
import { focusApi } from "@/lib/api/focus";
import { gardenApi, type Garden as GardenData, type GardenStage } from "@/lib/api/garden";
import { goalsApi } from "@/lib/api/goals";
import { habitsApi, type Habit } from "@/lib/api/habits";
import { profileApi, type Profile } from "@/lib/api/profile";
import { lunaApi } from "@/lib/api/luna";
import { badgesApi } from "@/lib/api/badges";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindMate — Your wellness companion" },
      {
        name: "description",
        content:
          "MindMate is your AI-powered wellness, productivity and emotional growth companion.",
      },
    ],
  }),
  component: Home,
});

function computeTimeContext(h: number) {
  if (h < 5) return { greeting: "Still up,", icon: Moon };
  if (h < 12) return { greeting: "Good morning,", icon: Sunrise };
  if (h < 17) return { greeting: "Good afternoon,", icon: Sun };
  if (h < 21) return { greeting: "Good evening,", icon: Moon };
  return { greeting: "Good night,", icon: Moon };
}

const habitIconMap: Record<string, LucideIcon> = {
  BookOpen,
  Brain,
  CheckCircle2,
  Droplet,
  Heart,
  MessageCircle,
  Sparkles,
  Target,
};

type TodayItem = {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  done?: boolean;
  progress?: number;
  color: "cyan" | "purple" | "teal";
  xp?: number;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function deriveStage(xp: number, gardenStages: GardenStage[]) {
  if (gardenStages.length === 0) return { stage: null, next: null, progress: 0 };
  const idx = gardenStages.reduce((acc, s, i) => (xp >= s.xp ? i : acc), 0);
  const stage = gardenStages[idx];
  const next = gardenStages[idx + 1] ?? stage;
  const progress =
    next === stage
      ? 100
      : Math.min(100, Math.max(0, ((xp - stage.xp) / (next.xp - stage.xp)) * 100));
  return { stage, next, progress };
}

function bondLabel(bondPct: number) {
  if (bondPct >= 80) return "Bonded";
  if (bondPct >= 55) return "Growing";
  if (bondPct >= 25) return "Warming";
  return "New";
}

function lunaMoodLabel(bondPct: number) {
  if (bondPct >= 80) return "purring softly";
  if (bondPct >= 55) return "settling in";
  if (bondPct >= 25) return "curious";
  return "getting to know you";
}

function habitToTodayItem(habit: Habit, index: number): TodayItem {
  const done = habit.status === "done";
  return {
    id: `habit-${habit.id}`,
    icon: habitIconMap[habit.icon] ?? CheckCircle2,
    title: habit.name,
    subtitle: done ? `${habit.streak} day streak` : "Tiny ritual for today",
    done,
    progress: done ? undefined : habit.status === "in_progress" ? 50 : 0,
    color: index % 2 === 0 ? "cyan" : "teal",
    xp: habit.xp,
  };
}

function Home() {
  // Only render the time-dependent icon/greeting after mount to avoid SSR hydration mismatch.
  const [hour, setHour] = useState<number | null>(null);
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [garden, setGarden] = useState<GardenData | null>(null);
  const [todayItems, setTodayItems] = useState<TodayItem[]>([]);
  const [lunaNote, setLunaNote] = useState("");
  const [heroWhisper, setHeroWhisper] = useState("");
  useEffect(() => setHour(new Date().getHours()), []);
  useEffect(() => {
    lunaApi
      .note("home")
      .then((note) => setLunaNote(note.content))
      .catch(() => setLunaNote(""));
    lunaApi
      .note("home-hero")
      .then((note) => setHeroWhisper(note.content))
      .catch(() => setHeroWhisper(""));
  }, []);
  useEffect(() => {
    const today = todayIso();
    void Promise.allSettled([
      profileApi.get().then(setProfile),
      gardenApi.get().then(setGarden),
      Promise.all([
        checkInsApi.today().catch(() => null),
        habitsApi.today().catch(() => []),
        goalsApi.list("ACTIVE", 1).catch(() => []),
        focusApi.sessions({ from: today, to: today, limit: 10 }).catch(() => []),
        gardenApi.get().catch(() => null),
        badgesApi.list().catch(() => []),
      ]).then(([checkIn, habits, goals, focusSessions, gardenSnapshot, badges]) => {
        const reward = (actionId: string) =>
          gardenSnapshot?.careActions.find((action) => action.id === actionId)?.xpByStage[
            gardenSnapshot.currentStage
          ];
        const completedFocus = focusSessions
          .filter((session) => session.completed)
          .reduce((sum, session) => sum + (session.duration ?? 0), 0);
        const items: TodayItem[] = [
          {
            id: "reflection",
            icon: MessageCircle,
            title: "Reflect with Luna",
            subtitle: "A soft moment to notice",
            done: Boolean(checkIn),
            progress: checkIn ? undefined : 0,
            color: "purple",
            xp: reward("checkin"),
          },
          ...habits.slice(0, 2).map(habitToTodayItem),
        ];

        if (goals[0]) {
          items.push({
            id: `goal-${goals[0].id}`,
            icon: Target,
            title: goals[0].name,
            subtitle: goals[0].category || "Goal in progress",
            done: goals[0].status === "COMPLETED" || goals[0].pct >= 100,
            progress: Math.max(0, Math.min(100, goals[0].pct ?? 0)),
            color: "teal",
            xp: reward("goal"),
          });
        }

        items.push({
          id: "focus",
          icon: BookOpen,
          title: "Study with focus",
          subtitle: completedFocus > 0 ? `${completedFocus} min today` : "One quiet block",
          done: completedFocus > 0,
          progress: completedFocus > 0 ? undefined : 0,
          color: "purple",
          xp: reward("focus"),
        });

        const earnedBadges = badges.filter((badge) => badge.earned).length;
        const nextBadge = badges.find((badge) => !badge.earned);
        items.push({
          id: "badges",
          icon: Trophy,
          title: nextBadge ? `Earn ${nextBadge.name}` : "Badges collected",
          subtitle: `${earnedBadges} of ${badges.length} collected`,
          done: badges.length > 0 && earnedBadges === badges.length,
          progress: badges.length ? (earnedBadges / badges.length) * 100 : 0,
          color: "teal",
        });

        setTodayItems(items.slice(0, 5));
      }),
    ]);
  }, []);
  const ctx = hour === null ? { greeting: "Hello,", icon: Moon } : computeTimeContext(hour);
  const { greeting, icon: TimeIcon } = ctx;
  const ambientMood = useAmbientLunaMood();
  const displayName =
    profile?.displayName ||
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Friend";
  const level = garden?.level ?? profile?.level ?? 1;
  const xp = garden?.xp ?? profile?.xp ?? 0;
  const xpToNext = profile?.xpToNext && profile.xpToNext > xp ? profile.xpToNext : undefined;
  const gardenStage = deriveStage(xp, garden?.gardenStages ?? []);
  const nextXp = xpToNext ?? (gardenStage.next?.xp || Math.max(xp, 1));
  const xpProgress =
    nextXp > xp ? Math.min(100, Math.round((xp / nextXp) * 100)) : Math.round(gardenStage.progress);
  const bondPct = profile?.bondPct ?? 0;
  const completedToday = todayItems.filter((item) => item.done).length;
  return (
    <Shell>
      <header className="flex items-start justify-between px-5 pt-6">
        <div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {hour === null ? (
              <span className="h-3.5 w-3.5" />
            ) : (
              <TimeIcon className="h-3.5 w-3.5" />
            )}
            <span>{greeting}</span>
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">
            {displayName} <span className="text-xl">💜</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new Event("mindmate-notifications-open"));
            void navigate({ to: "/notifications" });
          }}
          className="glass relative flex h-11 w-11 items-center justify-center rounded-full"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-purple animate-pulse-glow" />
          )}
        </button>
      </header>

      {/* Luna Card */}
      <section className="px-5 pt-5">
        <div className="glass-strong motion-bond-arrive relative overflow-hidden rounded-3xl p-5 glow-purple">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-purple/30 blur-3xl" />
          <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          {/* tiny floating sparkles */}
          <div className="pointer-events-none absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="absolute h-1 w-1 animate-float rounded-full bg-purple/70"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${10 + (i % 3) * 20}%`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${5 + (i % 3)}s`,
                }}
              />
            ))}
          </div>
          <div className="relative flex items-start gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-glow rounded-full bg-purple/40 blur-xl" />
              <LunaAvatar mood={ambientMood} size="xl" bounce className="relative" />
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Luna</h2>
                <span className="rounded-full bg-purple/20 px-2 py-0.5 text-[10px] font-semibold text-purple">
                  LV {level} · {bondLabel(bondPct)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {bondPct}% Bond · {lunaMoodLabel(bondPct)}
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <AnimatedProgress
                  value={bondPct}
                  label="Luna bond progress"
                  className="h-full rounded-full gradient-primary"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {bondPct}% Bond · grows with each meaningful interaction
              </p>
            </div>
          </div>
          <p className="relative mt-4 text-sm leading-relaxed text-foreground/90 italic">
            "{heroWhisper}"
          </p>
          <div className="relative mt-4 flex gap-2">
            <Link
              to="/check-in"
              className="flex-1 rounded-2xl gradient-primary px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-purple/30"
            >
              Check in with Luna
            </Link>
            <Link
              to="/luna"
              className="glass flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-semibold"
            >
              <MessageCircle className="h-4 w-4" />
              Talk
            </Link>
          </div>
        </div>
      </section>

      {/* Today's Focus */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold">Today with Luna</h3>
            <p className="text-[11px] text-muted-foreground">Each step waters your garden 🌱</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {completedToday} of {todayItems.length} done
          </span>
        </div>
        <div className="space-y-2.5">
          {todayItems.map((item, index) => (
            <MotionReveal key={item.id} delay={index * 45}>
              <FocusItem {...item} />
            </MotionReveal>
          ))}
        </div>
        <Link
          to="/growth"
          className="mt-2.5 flex w-full items-center justify-between rounded-2xl glass px-4 py-3 text-sm"
        >
          <span className="text-muted-foreground">See all today's care</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>

      {/* Garden Preview */}
      <section className="px-5 pt-6">
        <Link to="/garden" className="block">
          <div className="glass-strong relative overflow-hidden rounded-3xl glow-purple">
            <div className="flex items-center justify-between px-5 pt-4">
              <div>
                <h3 className="text-base font-semibold">Growth Garden</h3>
                <p className="text-[11px] text-muted-foreground">
                  Level {level} · {gardenStage.stage?.title ?? "Seed"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="relative mt-2 h-52 overflow-hidden">
              <img
                src={tree}
                alt="Your growing tree"
                width={1024}
                height={768}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
              {/* magical floating particles */}
              <div className="pointer-events-none absolute inset-0">
                {[...Array(14)].map((_, i) => (
                  <span
                    key={i}
                    className="absolute rounded-full bg-primary/70 animate-float"
                    style={{
                      width: `${2 + (i % 3)}px`,
                      height: `${2 + (i % 3)}px`,
                      left: `${((i * 41) % 95) + 2}%`,
                      bottom: `${((i * 23) % 70) + 10}%`,
                      animationDelay: `${i * 0.35}s`,
                      animationDuration: `${4 + (i % 4)}s`,
                      boxShadow: "0 0 8px currentColor",
                      color: i % 2 ? "oklch(0.74 0.14 210)" : "oklch(0.65 0.22 295)",
                    }}
                  />
                ))}
              </div>
              {/* glow under tree */}
              <div className="absolute bottom-0 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-purple/40 blur-3xl" />
            </div>

            {/* delightful next-unlock card */}
            <div className="px-5 pb-5">
              <div className="glass relative overflow-hidden rounded-2xl p-3.5">
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-secondary/30 blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15">
                    <Leaf className="h-6 w-6 text-secondary" />
                    <Lock className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-surface p-0.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-secondary" />
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                        Next unlock
                      </p>
                    </div>
                    <p className="text-sm font-semibold">First Leaf will bloom</p>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <AnimatedProgress
                        value={xpProgress}
                        label="Progress to next garden unlock"
                        className="h-full rounded-full gradient-primary"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {Math.max(0, nextXp - xp).toLocaleString()} XP to go
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Encouragement */}
      <section className="px-5 pt-6">
        <div className="glass relative overflow-hidden rounded-3xl p-5">
          <div className="absolute -top-8 -right-8 h-28 w-28 rounded-full bg-purple/20 blur-3xl" />
          <div className="relative flex items-center gap-2 text-xs text-purple">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-semibold uppercase tracking-wider">A note from Luna</span>
          </div>
          <p className="relative mt-3 text-base leading-relaxed">{lunaNote}</p>
          <p className="relative mt-2 text-xs text-muted-foreground">
            — Luna, curled up beside you 🌙
          </p>
        </div>
      </section>
    </Shell>
  );
}

function FocusItem({
  id,
  icon: Icon,
  title,
  subtitle,
  done,
  progress,
  color,
  xp,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  done?: boolean;
  progress?: number;
  color: "cyan" | "purple" | "teal";
  xp?: number;
}) {
  const colorMap = {
    cyan: "text-primary bg-primary/15",
    purple: "text-purple bg-purple/15",
    teal: "text-secondary bg-secondary/15",
  };
  const route =
    id === "reflection"
      ? "/reflections"
      : id === "focus"
        ? "/exam-focus"
        : id === "badges"
          ? "/badges"
          : undefined;
  const item = (
    <div className="glass flex items-center gap-3 rounded-2xl p-3.5 transition hover:scale-[1.01]">
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        {xp !== undefined && (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-purple/80">
            +{xp} xp
          </span>
        )}
        {done ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/20">
            <svg
              className="h-4 w-4 text-secondary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ) : (
          <div className="relative h-7 w-7">
            <svg className="h-7 w-7 -rotate-90" viewBox="0 0 28 28">
              <circle
                cx="14"
                cy="14"
                r="12"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="14"
                cy="14"
                r="12"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={`${(progress ?? 0) * 0.754} 100`}
                strokeLinecap="round"
                className="text-primary"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
  return route ? (
    <Link to={route} className="block">
      {item}
    </Link>
  ) : (
    item
  );
}
