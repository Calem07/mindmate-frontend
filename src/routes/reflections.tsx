import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, ScreenHeader } from "@/components/Shell";
import { EmptyState } from "@/components/StateViews";
import { insightsApi, type Reflection } from "@/lib/api/insights";
import { Brain, Sparkles, Clock, Heart, ChevronRight } from "lucide-react";
import { LunaAvatar, useAmbientLunaMood } from "@/components/LunaAvatar";
import { lunaApi } from "@/lib/api/luna";

const iconMap = { Brain, Sparkles, Clock, Heart };
const colorMap: Record<string, string> = {
  primary: "text-primary bg-primary/15",
  purple: "text-purple bg-purple/15",
  secondary: "text-secondary bg-secondary/15",
};

export const Route = createFileRoute("/reflections")({
  head: () => ({
    meta: [
      { title: "AI Reflections — MindMate" },
      { name: "description", content: "Patterns Luna noticed about you." },
    ],
  }),
  component: Reflections,
});

function Reflections() {
  const ambientMood = useAmbientLunaMood();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [lunaNote, setLunaNote] = useState("");
  const [themeNote, setThemeNote] = useState("");

  useEffect(() => {
    insightsApi
      .reflections()
      .then(setReflections)
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Could not load reflections"),
      );
  }, []);
  useEffect(() => {
    lunaApi.note("reflections").then((note) => setLunaNote(note.content)).catch(() => setLunaNote(""));
    lunaApi.note("reflections-theme").then((note) => setThemeNote(note.content)).catch(() => setThemeNote(""));
  }, []);
  return (
    <Shell>
      <ScreenHeader title="AI Reflections" back />

      <section className="px-5">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-5 glow-purple">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple/30 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <LunaAvatar mood={ambientMood} size="lg" bounce />
            <div className="min-w-0">
              <p className="text-sm font-semibold">Luna's reflection</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{lunaNote}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-6">
        <h3 className="mb-3 text-sm font-semibold">Patterns I've noticed</h3>
        {reflections.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No patterns yet"
            body="Check in a few more times — Luna will start noticing the shape of your days."
          />
        ) : (
          <div className="space-y-2.5">
            {reflections.map((r) => {
              const Icon = (iconMap as Record<string, typeof Brain>)[r.icon] ?? Brain;
              return (
                <button
                  key={r.id}
                  className="glass flex w-full items-center gap-3 rounded-2xl p-3.5 text-left"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${colorMap[r.color]}`}
                  >
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
        )}
      </section>

      <section className="px-5 pt-6">
        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-wider text-purple">This week's theme</p>
          <p className="mt-2 text-lg font-bold">{themeNote}</p>
        </div>
      </section>
    </Shell>
  );
}
