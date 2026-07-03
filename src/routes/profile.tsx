import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Award, Cog, Bell, Shield, HelpCircle, ChevronRight, BarChart3, LogOut, Sun, Moon } from "lucide-react";

import { LunaAvatar, useAmbientLunaMood } from "@/components/LunaAvatar";
import { Shell, ScreenHeader } from "@/components/Shell";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — MindMate" }, { name: "description", content: "Your achievements, growth analytics, and settings." }] }),
  component: Profile,
});

function Profile() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const name = (user?.user_metadata?.display_name as string | undefined) ?? user?.email?.split("@")[0] ?? "Calem";
  const initial = name.charAt(0).toUpperCase();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    sessionStorage.removeItem("mindmate-splash-shown");
    toast.success("Signed out. See you soon 💜");
    navigate({ to: "/signin" });
  };

  return (
    <Shell>
      <ScreenHeader
        title="Profile"
        back
        right={
          <button onClick={toggle} aria-label="Toggle theme" className="glass flex h-9 w-9 items-center justify-center rounded-full">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        }
      />

      <section className="px-5">
        <div className="glass-strong rounded-3xl p-5">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 rounded-full gradient-primary p-0.5">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-card text-xl font-bold text-foreground">{initial}</div>
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-purple/30 p-1">
                <img src={luna} alt="Luna" width={20} height={20} className="h-full w-full object-contain" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">{name}</h2>
              <p className="text-xs text-muted-foreground">Level 4 · 82% Bond</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{user?.email ?? "1,250 / 2,000 XP"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-5">
        <h3 className="mb-3 text-sm font-semibold">Activity Overview</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: "12", l: "Check-Ins", s: "This week" },
            { v: "8", l: "Habits", s: "Completed" },
            { v: "7", l: "Streak", s: "Days" },
            { v: "5", l: "Journal", s: "Entries" },
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

