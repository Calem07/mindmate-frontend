import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, ScreenHeader } from "@/components/Shell";
import { focusApi, type FocusPreset, type FocusSession } from "@/lib/api/focus";
import { EmptyState } from "@/components/StateViews";
import { Play, Pause, RotateCcw, BookOpen, Clock } from "lucide-react";

export const Route = createFileRoute("/exam-focus")({
  head: () => ({
    meta: [
      { title: "Exam Focus — MindMate" },
      { name: "description", content: "Quiet, focused study sessions with Luna by your side." },
    ],
  }),
  component: ExamFocus,
});

function ExamFocus() {
  const [examPresets, setExamPresets] = useState<FocusPreset[]>([]);
  const [examSessions, setExamSessions] = useState<FocusSession[]>([]);
  const [preset, setPreset] = useState<FocusPreset>({
    id: "default",
    label: "Classic",
    focus: 25,
    brk: 5,
  });
  const [secondsLeft, setSecondsLeft] = useState(preset.focus * 60);
  const [running, setRunning] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([focusApi.presets(), focusApi.sessions({ limit: 10 })])
      .then(([presets, sessions]) => {
        setExamPresets(presets);
        setExamSessions(sessions);
        if (presets[0]) setPreset(presets[0]);
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Could not load focus sessions"),
      );
  }, []);
  useEffect(() => setSecondsLeft(preset.focus * 60), [preset]);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!running || secondsLeft !== 0 || !activeSessionId) return;
    focusApi
      .completeSession(activeSessionId)
      .then((session) => {
        setExamSessions((sessions) => sessions.map((s) => (s.id === session.id ? session : s)));
        setActiveSessionId(null);
        setRunning(false);
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "Could not complete focus session"),
      );
  }, [activeSessionId, running, secondsLeft]);

  const toggleRunning = async () => {
    if (running) {
      setRunning(false);
      return;
    }
    try {
      if (!activeSessionId) {
        const session = await focusApi.createSession({
          subject: preset.label,
          duration: preset.focus,
          completed: false,
        });
        setExamSessions((sessions) => [session, ...sessions]);
        setActiveSessionId(session.id);
      }
      setRunning(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start focus session");
    }
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const pct = (secondsLeft / (preset.focus * 60)) * 100;

  return (
    <Shell>
      <ScreenHeader title="Exam Focus" back />

      <section className="px-5">
        <div className="glass-strong relative flex flex-col items-center overflow-hidden rounded-3xl p-8 glow-purple">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-purple/30 blur-3xl" />
          <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />

          <div className={`relative rounded-full ${running ? "motion-focus-live" : ""}`}>
            <svg className="h-56 w-56 -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="88"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-white/10"
              />
              <circle
                cx="100"
                cy="100"
                r="88"
                stroke="url(#g)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${pct * 5.52} 1000`}
                style={{ transition: "stroke-dasharray 300ms linear" }}
              />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.65 0.22 295)" />
                  <stop offset="100%" stopColor="oklch(0.74 0.14 210)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-5xl font-bold tabular-nums">
                {mm}:{ss}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {preset.label}
              </p>
            </div>
          </div>

          <div className="relative mt-6 flex gap-3">
            <button
              onClick={() => {
                setRunning(false);
                setSecondsLeft(preset.focus * 60);
              }}
              className="glass motion-press flex h-12 w-12 items-center justify-center rounded-full"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={toggleRunning}
              className="motion-press flex h-14 w-14 items-center justify-center rounded-full gradient-primary glow-cyan"
            >
              {running ? (
                <Pause className="h-6 w-6 text-white" fill="currentColor" />
              ) : (
                <Play className="ml-1 h-6 w-6 text-white" fill="currentColor" />
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="px-5 pt-5">
        <h3 className="mb-3 text-sm font-semibold">Pick a rhythm</h3>
        <div className="grid grid-cols-3 gap-2">
          {examPresets.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p)}
              className={`glass motion-press rounded-2xl p-3 text-center ${preset.id === p.id ? "ring-2 ring-purple" : ""}`}
            >
              <p className="text-sm font-bold">
                {p.focus}/{p.brk}
              </p>
              <p className="text-[10px] text-muted-foreground">{p.label}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <h3 className="mb-3 text-sm font-semibold">Today's sessions</h3>
        {examSessions.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No sessions today"
            body="Press play above to start your first quiet focus block."
          />
        ) : (
          <div className="space-y-2.5">
            {examSessions.map((s) => (
              <div key={s.id} className="glass flex items-center gap-3 rounded-2xl p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.subject}</p>
                  <p className="text-[11px] text-muted-foreground">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {s.duration} min · {s.date}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${s.completed ? "bg-secondary/20 text-secondary" : "bg-purple/20 text-purple"}`}
                >
                  {s.completed ? "Done" : "Active"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
