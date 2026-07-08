import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, ScreenHeader } from "@/components/Shell";
import { EmptyState } from "@/components/StateViews";
import { badges, challenges } from "@/data/mock";
import { Trophy, Target } from "lucide-react";

export const Route = createFileRoute("/badges")({
  head: () => ({ meta: [{ title: "Badges & Challenges — MindMate" }, { name: "description", content: "Earned moments and active challenges." }] }),
  component: Badges,
});

function Badges() {
  const [tab, setTab] = useState<"Badges" | "Challenges">("Badges");
  const earned = badges.filter((b) => b.earned).length;

  return (
    <Shell>
      <ScreenHeader title="Badges & Challenges" back />

      <section className="px-5">
        <div className="glass-strong rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple/15">
              <Trophy className="h-6 w-6 text-purple" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Collected</p>
              <p className="text-xl font-bold"><span className="text-gradient">{earned}</span> / {badges.length} badges</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full gradient-primary rounded-full" style={{ width: `${(earned / badges.length) * 100}%` }} />
          </div>
        </div>
      </section>

      <div className="px-5 pt-5">
        <div className="glass-strong flex rounded-full p-1">
          {(["Badges", "Challenges"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === t ? "gradient-primary text-white" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      {tab === "Badges" ? (
        <section className="grid grid-cols-3 gap-3 px-5 pt-5">
          {badges.map((b) => (
            <div key={b.id} className={`glass flex flex-col items-center gap-1 rounded-2xl p-3 text-center ${b.earned ? "" : "opacity-50 grayscale"}`}>
              <span className="text-3xl">{b.icon}</span>
              <p className="text-[11px] font-semibold">{b.name}</p>
              <p className="text-[9px] leading-tight text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </section>
      ) : (
        <section className="space-y-3 px-5 pt-5">
          {challenges.map((c) => (
            <div key={c.id} className="glass-strong rounded-3xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.reward}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-gradient">{c.progress}/{c.total}</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full gradient-primary rounded-full" style={{ width: `${(c.progress / c.total) * 100}%` }} />
              </div>
            </div>
          ))}
        </section>
      )}
    </Shell>
  );
}
