import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, ScreenHeader } from "@/components/Shell";
import { useTheme } from "@/components/ThemeProvider";
import { useLunaSystem } from "@/components/LunaSystemProvider";
import { Bell, Shield, Sparkles, Moon, Sun, ChevronRight, HelpCircle, Mail } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — MindMate" }, { name: "description", content: "Customize how Luna shows up for you." }] }),
  component: Settings,
});

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`relative h-6 w-11 rounded-full transition ${on ? "gradient-primary" : "bg-white/10"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${on ? "right-0.5" : "left-0.5"}`} />
    </button>
  );
}

function Settings() {
  const { theme, toggle } = useTheme();
  const { reducedMotion, setReducedMotion } = useLunaSystem();
  const [notifs, setNotifs] = useState({ daily: true, streaks: true, whispers: true, recap: false });
  const [privacy, setPrivacy] = useState({ biometric: true, analytics: false, share: false });

  return (
    <Shell>
      <ScreenHeader title="Settings" back />

      <section className="px-5">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h3>
        <div className="glass-strong rounded-3xl">
          <button onClick={toggle} className="flex w-full items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple/15">
              {theme === "dark" ? <Moon className="h-5 w-5 text-purple" /> : <Sun className="h-5 w-5 text-purple" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Theme</p>
              <p className="text-xs text-muted-foreground capitalize">{theme}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="border-t border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15"><Sparkles className="h-5 w-5 text-primary" /></div>
              <div className="flex-1"><p className="text-sm font-semibold">Reduce motion</p><p className="text-xs text-muted-foreground">Calmer animations</p></div>
              <Toggle on={reduceMotion} onChange={setReduceMotion} />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-5">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notifications</h3>
        <div className="glass-strong divide-y divide-white/5 rounded-3xl">
          {[
            { key: "daily" as const, label: "Daily check-in reminder", icon: Bell },
            { key: "streaks" as const, label: "Streak nudges", icon: Sparkles },
            { key: "whispers" as const, label: "Luna's whispers", icon: Sparkles },
            { key: "recap" as const, label: "Weekly recap", icon: Mail },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple/15"><Icon className="h-5 w-5 text-purple" /></div>
              <p className="flex-1 text-sm font-semibold">{label}</p>
              <Toggle on={notifs[key]} onChange={(v) => setNotifs((n) => ({ ...n, [key]: v }))} />
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-5">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Privacy</h3>
        <div className="glass-strong divide-y divide-white/5 rounded-3xl">
          {[
            { key: "biometric" as const, label: "Biometric unlock", sub: "Face ID / fingerprint" },
            { key: "analytics" as const, label: "Anonymous analytics", sub: "Help improve MindMate" },
            { key: "share" as const, label: "Share progress", sub: "Allow social sharing" },
          ].map((row) => (
            <div key={row.key} className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/15"><Shield className="h-5 w-5 text-secondary" /></div>
              <div className="flex-1"><p className="text-sm font-semibold">{row.label}</p><p className="text-xs text-muted-foreground">{row.sub}</p></div>
              <Toggle on={privacy[row.key]} onChange={(v) => setPrivacy((p) => ({ ...p, [row.key]: v }))} />
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-5">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Support</h3>
        <div className="glass-strong divide-y divide-white/5 rounded-3xl">
          {[{ label: "Help center", icon: HelpCircle }, { label: "Contact us", icon: Mail }].map((row) => (
            <button key={row.label} className="flex w-full items-center gap-3 p-4 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15"><row.icon className="h-5 w-5 text-primary" /></div>
              <p className="flex-1 text-sm font-semibold">{row.label}</p>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-[10px] text-muted-foreground">MindMate · v1.0 · Made with 💜 by Luna</p>
      </section>
    </Shell>
  );
}
