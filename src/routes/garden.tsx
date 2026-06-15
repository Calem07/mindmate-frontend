import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings, Leaf, ClipboardCheck, Droplet, BookOpen, Heart, Target } from "lucide-react";
import tree from "@/assets/tree.jpg";

import { Shell, ScreenHeader } from "@/components/Shell";

export const Route = createFileRoute("/garden")({
  head: () => ({ meta: [{ title: "Growth Garden — MindMate" }, { name: "description", content: "Watch your magical garden grow with every wellness step." }] }),
  component: Garden,
});

const stages = ["Seed", "Sprout", "Young Tree", "Blooming", "Ancient"];

function Garden() {
  return (
    <Shell>
      <ScreenHeader title="Growth Garden" back right={<button className="glass flex h-9 w-9 items-center justify-center rounded-full"><Settings className="h-4 w-4" /></button>} />

      <section className="px-5">
        <div className="relative overflow-hidden rounded-3xl glass-strong glow-purple">
          <img src={tree} alt="Your tree" width={1024} height={768} className="h-72 w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface to-transparent" />
          {/* particles */}
          <div className="pointer-events-none absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="absolute h-1 w-1 animate-float rounded-full bg-primary/60" style={{
                left: `${(i * 37) % 100}%`, top: `${(i * 53) % 80}%`, animationDelay: `${i * 0.3}s`, animationDuration: `${4 + (i % 4)}s`,
              }} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pt-5">
        <div className="glass-strong rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Level 4 · Young Sprout</p>
          <p className="mt-1 text-2xl font-bold"><span className="text-gradient">1,250</span> / 2,000 XP</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[62%] gradient-primary rounded-full glow-cyan" />
          </div>
        </div>

        <div className="mt-3 glass rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Next Unlock</p>
              <p className="text-sm font-semibold">First Leaf</p>
              <p className="text-[11px] text-muted-foreground">at 2,000 XP</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15">
              <Leaf className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </div>
      </section>

      {/* Evolution stages */}
      <section className="px-5 pt-6">
        <h3 className="mb-3 text-base font-semibold">Evolution</h3>
        <div className="glass-strong flex justify-between rounded-3xl p-4">
          {stages.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-base ${i <= 1 ? "gradient-primary" : "bg-white/5"}`}>
                {["🌱","🌿","🌳","🌸","🌟"][i]}
              </div>
              <span className={`text-[9px] ${i <= 1 ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{s}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h3 className="text-base font-semibold">Garden Care</h3>
        <p className="text-xs text-muted-foreground">Your actions help your garden grow</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {[
            { icon: ClipboardCheck, label: "Check-In", to: "/check-in" as const },
            { icon: Droplet, label: "Habits", to: "/habits" as const },
            { icon: BookOpen, label: "Journal", to: "/journal" as const },
            { icon: Heart, label: "Gratitude", to: "/journal" as const },
            { icon: Target, label: "Focus", to: "/exam-focus" as const },
          ].map(({ icon: Icon, label, to }) => (
            <Link key={label} to={to} className="glass flex flex-col items-center gap-1.5 rounded-2xl p-3">
              <Icon className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>

      </section>
    </Shell>
  );
}
