import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, ScreenHeader } from "@/components/Shell";
import { SuccessState } from "@/components/StateViews";
import { futureLettersApi, type FutureLetter } from "@/lib/api/futureLetters";
import { BookOpen, Target, Heart, Lock, Sparkles, CalendarDays, X } from "lucide-react";

const iconMap = { BookOpen, Target, Heart };

function futureDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export const Route = createFileRoute("/future-me")({
  head: () => ({
    meta: [
      { title: "Future Me — MindMate" },
      { name: "description", content: "Write letters to your future self." },
    ],
  }),
  component: FutureMe,
});

function FutureMe() {
  const [writing, setWriting] = useState(false);
  const [letter, setLetter] = useState("");
  const [letters, setLetters] = useState<FutureLetter[]>([]);
  const [sealed, setSealed] = useState(false);
  const [unlocksAt, setUnlocksAt] = useState(() => futureDate(30));
  const [openedLetter, setOpenedLetter] = useState<FutureLetter | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    futureLettersApi
      .list()
      .then(setLetters)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load letters"));
  }, []);

  const seal = async () => {
    if (!letter.trim() || !unlocksAt) return;
    setSaving(true);
    try {
      const saved = await futureLettersApi.create({
        title: "Letter to my future self",
        body: letter.trim(),
        unlocksAt,
        icon: "BookOpen",
      });
      setLetters((items) => [saved, ...items]);
      setSealed(true);
      setLetter("");
      setUnlocksAt(futureDate(30));
      setWriting(false);
      setTimeout(() => setSealed(false), 2400);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not seal letter");
    } finally {
      setSaving(false);
    }
  };

  const openLetter = async (id: string) => {
    try {
      const opened = await futureLettersApi.open(id);
      setLetters((items) => items.map((item) => (item.id === id ? opened : item)));
      setOpenedLetter(opened);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Letter is still sealed");
    }
  };

  return (
    <Shell>
      <ScreenHeader title="Future Me" back />

      <section className="px-5">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-5 glow-purple">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <p className="relative text-xs uppercase tracking-wider text-primary">Time capsule</p>
          <h2 className="relative mt-1 text-xl font-bold leading-tight">
            Write a letter to your future self
          </h2>
          <p className="relative mt-2 text-xs text-muted-foreground">
            Seal it today. Open it when the moment is right.
          </p>
          <button
            onClick={() => setWriting(true)}
            className="relative mt-4 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-white"
          >
            + New letter
          </button>
        </div>
      </section>

      {sealed && (
        <section className="px-5 pt-4">
          <SuccessState title="Letter sealed 💜" body="Luna will hand it back when it's time." />
        </section>
      )}

      <section className="space-y-3 px-5 pt-5">
        <h3 className="text-sm font-semibold">Your capsules</h3>
        {letters.length === 0 && (
          <div className="glass-strong flex flex-col items-center gap-2 rounded-3xl px-5 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple/15">
              <Lock className="h-5 w-5 text-purple" />
            </div>
            <p className="text-sm font-semibold">No capsules yet</p>
            <p className="text-[11px] text-muted-foreground">
              Seal your first letter — Luna will guard it until it's time.
            </p>
          </div>
        )}
        {letters.map((l) => {
          const Icon = (iconMap as Record<string, typeof BookOpen>)[l.icon] ?? BookOpen;
          const unlocked = l.canOpen || l.status === "unlocked";
          return (
            <div key={l.id} className="glass flex items-center gap-3 rounded-2xl p-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${unlocked ? "bg-secondary/15 text-secondary" : "bg-purple/15 text-purple"}`}
              >
                {unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug line-clamp-2">{l.title}</p>
                <p className="text-[11px] text-muted-foreground">
                  {unlocked
                    ? l.openedAt
                      ? "Opened"
                      : "Ready to open"
                    : `Unlocks ${l.unlocksAt} · ${l.daysRemaining} ${l.daysRemaining === 1 ? "day" : "days"} left`}
                </p>
              </div>
              <button
                onClick={() => unlocked && openLetter(l.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold ${unlocked ? "gradient-primary text-white" : "bg-white/5 text-muted-foreground"}`}
              >
                {unlocked ? "Open" : "Sealed"}
              </button>
            </div>
          );
        })}
      </section>

      {writing && (
        <div
          className="fixed inset-0 z-[60] flex items-end bg-black/70 backdrop-blur-sm"
          onClick={() => setWriting(false)}
        >
          <div
            className="glass-strong mx-auto w-full max-w-md rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-xs text-purple">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-semibold uppercase tracking-wider">Dear future me…</span>
            </div>
            <textarea
              autoFocus
              value={letter}
              onChange={(e) => setLetter(e.target.value)}
              placeholder="Tell yourself what matters today…"
              className="mt-3 h-48 w-full resize-none rounded-2xl glass p-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-3 rounded-2xl glass p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-secondary" />
                <span>Keep sealed until</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { label: "1 month", days: 30 },
                  { label: "3 months", days: 90 },
                  { label: "1 year", days: 365 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setUnlocksAt(futureDate(preset.days))}
                    className="rounded-xl bg-white/5 px-2 py-2 text-[10px] font-semibold text-muted-foreground"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="date"
                value={unlocksAt}
                min={futureDate(1)}
                onChange={(e) => setUnlocksAt(e.target.value)}
                className="mt-2 w-full rounded-xl bg-white/5 px-3 py-2 text-xs text-foreground outline-none"
              />
            </div>
            <button
              onClick={seal}
              disabled={!letter.trim() || !unlocksAt || saving}
              className="mt-3 w-full rounded-2xl gradient-primary py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              {saving ? "Sealing…" : "Seal & save"}
            </button>
          </div>
        </div>
      )}

      {openedLetter?.body && (
        <div
          className="fixed inset-0 z-[60] flex items-end bg-black/70 backdrop-blur-sm"
          onClick={() => setOpenedLetter(null)}
        >
          <div
            className="glass-strong mx-auto w-full max-w-md rounded-t-3xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 text-xs text-secondary">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="truncate font-semibold uppercase tracking-wider">From your past self</span>
              </div>
              <button
                type="button"
                aria-label="Close letter"
                onClick={() => setOpenedLetter(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-4 text-lg font-bold">{openedLetter.title}</h3>
            <p className="mt-3 whitespace-pre-wrap rounded-2xl glass p-4 text-sm leading-relaxed">
              {openedLetter.body}
            </p>
          </div>
        </div>
      )}
    </Shell>
  );
}
