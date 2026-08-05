import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { lunaToast } from "@/lib/lunaToast";
import {
  Award,
  Cog,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  BarChart3,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

import { LunaAvatar, useAmbientLunaMood } from "@/components/LunaAvatar";
import { Shell, ScreenHeader } from "@/components/Shell";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { authApi } from "@/lib/api/auth";
import { profileApi, type Profile as UserProfile } from "@/lib/api/profile";
import { checkInsApi } from "@/lib/api/checkIns";
import { habitsApi } from "@/lib/api/habits";
import { journalApi } from "@/lib/api/journal";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — MindMate" },
      { name: "description", content: "Your achievements, growth analytics, and settings." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activity, setActivity] = useState({ checkIns: 0, habits: 0, journal: 0 });
  const name =
    profile?.displayName ??
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Friend";
  const initial = name.charAt(0).toUpperCase();
  const ambientMood = useAmbientLunaMood();

  useEffect(() => {
    void Promise.allSettled([
      profileApi.get().then(setProfile),
      checkInsApi
        .list()
        .then((rows) => setActivity((current) => ({ ...current, checkIns: rows.length }))),
      habitsApi.today().then((rows) =>
        setActivity((current) => ({
          ...current,
          habits: rows.filter((row) => row.status === "done").length,
        })),
      ),
      journalApi
        .list({ limit: 100 })
        .then((rows) => setActivity((current) => ({ ...current, journal: rows.length }))),
    ]);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    lunaToast("Signed out. See you soon 💜");
    void navigate({ to: "/", replace: true });
  };

  return (
    <Shell>
      <ScreenHeader
        title="Profile"
        back
        right={
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="glass flex h-9 w-9 items-center justify-center rounded-full"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        }
      />

      <section className="px-5">
        <div className="glass-strong rounded-3xl p-5">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 rounded-full gradient-primary p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-xl font-bold text-foreground">
                {initial}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <LunaAvatar mood={ambientMood} size="xs" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{name}</h2>
              <p className="text-xs text-muted-foreground">
                Level {profile?.level ?? "-"} · {profile ? `${profile.bondPct}%` : "-"} Bond
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {profile
                  ? `${profile.xp.toLocaleString()} / ${profile.xpToNext.toLocaleString()} XP`
                  : "- XP"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-5">
        <h3 className="mb-3 text-sm font-semibold">Activity Overview</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: activity.checkIns, l: "Check-Ins", s: "Recorded" },
            { v: activity.habits, l: "Habits", s: "Completed" },
            { v: profile?.streakDays ?? 0, l: "Streak", s: "Days" },
            { v: activity.journal, l: "Journal", s: "Entries" },
          ].map((s) => (
            <div key={s.l} className="glass rounded-2xl p-3 text-center">
              <p className="text-lg font-bold text-gradient">{s.v}</p>
              <p className="text-[10px] font-semibold">{s.l}</p>
              <p className="text-[9px] text-muted-foreground">{s.s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-5">
        <div className="space-y-2">
          <Row to="/badges" icon={Award} label="Badges & Challenges" />
          <Row to="/insights" icon={BarChart3} label="Insights" />
          <Row to="/settings" icon={Cog} label="Settings" />
          <Row to="/settings" icon={Bell} label="Notifications" />
          <Row to="/settings" icon={Shield} label="Privacy" />
          <Row to="/settings" icon={HelpCircle} label="Help & Support" />
        </div>
      </section>

      <section className="px-5 pt-5">
        <button
          onClick={handleLogout}
          className="glass flex w-full items-center justify-center gap-2 rounded-2xl p-3.5 text-sm font-semibold text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </section>
    </Shell>
  );
}

function Row({ icon: Icon, label, to }: { icon: typeof Award; label: string; to: string }) {
  return (
    <Link to={to} className="glass flex w-full items-center gap-3 rounded-2xl p-3.5 text-left">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
