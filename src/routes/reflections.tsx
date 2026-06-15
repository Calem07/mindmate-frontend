import { createFileRoute } from "@tanstack/react-router";
import { Shell, ScreenHeader } from "@/components/Shell";
import { reflections } from "@/data/mock";
import { Brain, Sparkles, Clock, Heart, ChevronRight } from "lucide-react";
import lunaImg from "@/assets/luna.png";

const iconMap = { Brain, Sparkles, Clock, Heart };
const colorMap: Record<string, string> = {
  primary: "text-primary bg-primary/15",
  purple: "text-purple bg-purple/15",
  secondary: "text-secondary bg-secondary/15",
};

export const Route = createFileRoute("/reflections")({
  head: () => ({ meta: [{ title: "AI Reflections — MindMate" }, { name: "description", content: "Patterns Luna noticed about you." }] }),
  component: Reflections,
});

function Reflections() {
  return (
    <Shell>
      <ScreenHeader title="AI Reflections" back />

      <section className="px-5">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-5 glow-purple">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple/30 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <img src={lunaImg} alt="" width={64} height={64} className="h-16 w-16 animate-float object-contain" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Luna's reflection</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                You've shown so much strength this week. Progress isn't always visible — but it's always happening. 🌙
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-6">
        <h3 className="mb-3 text-sm font-semibold">Patterns I've noticed</h3>
        <div className="space-y-2.5">
          {reflections.map((r) => {
            const Icon = (iconMap as Record<string, typeof Brain>)[r.icon] ?? Brain;
            return (
              <button key={r.id} className="glass flex w-full items-center gap-3 rounded-2xl p-3.5 text-left">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${colorMap[r.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{r.text}</p>
                  <p className="text-[10px] text-muted-foreground">{r.date}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wider text-purple">This week's theme</p>
          <p className="mt-2 text-lg font-bold">Returning to yourself</p>
          <p className="mt-1 text-xs text-muted-foreground">You're choosing softness more often. That's growth.</p>
        </div>
      </section>
    </Shell>
  );
}
