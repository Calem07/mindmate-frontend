import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, ScreenHeader } from "@/components/Shell";
import { SuccessState } from "@/components/StateViews";
import { checkInsApi, moods, type Mood } from "@/lib/api/checkIns";
import lunaImg from "@/assets/luna.png";
import { Sparkles, ArrowRight } from "lucide-react";
import { useLunaMoodTrigger } from "@/components/LunaSystemProvider";
import { lunaApi } from "@/lib/api/luna";
import { useAuth } from "@/components/AuthProvider";
import { advanceOnboarding } from "@/lib/onboarding";

export const Route = createFileRoute("/check-in")({
  head: () => ({
    meta: [
      { title: "Daily Check-In — MindMate" },
      { name: "description", content: "Pause, breathe, and share how you feel with Luna." },
    ],
  }),
  component: CheckIn,
});

const energyLabels = ["Drained", "Low", "Steady", "Bright", "Sparkling"];
const tags = [
  "Anxious",
  "Hopeful",
  "Tired",
  "Focused",
  "Lonely",
  "Grateful",
  "Stressed",
  "Calm",
  "Excited",
];
function CheckIn() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const bumpMood = useLunaMoodTrigger();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState(2);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lunaWhisper, setLunaWhisper] = useState("");

  useEffect(() => {
    let active = true;
    lunaApi.note("check-in").then((note) => {
      if (active) setLunaWhisper(note.content);
    }).catch(() => {
      if (active) setLunaWhisper("");
    });
    return () => { active = false; };
  }, [step]);

  const toggleTag = (t: string) =>
    setSelectedTags((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  const next = async () => {
    if (step < 4) return setStep((step + 1) as 1 | 2 | 3 | 4);
    if (!mood || saving) return;
    setSaving(true);
    try {
      await checkInsApi.save({
        mood,
        energy: energy + 1,
        sleepHours: sleepHours ?? undefined,
        tags: selectedTags.map((tag) => tag.toLowerCase()),
        note: note.trim() || undefined,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed");
      setSaving(false);
      return;
    }
    setDone(true);
    const onboarding = advanceOnboarding(user?.id, "check-in", "habits");
    // Luna reacts to the completed check-in — caring if the mood was low, celebrating otherwise.
    const low = mood ? /sad|anx|tired|stress|lonely|drain/i.test(mood) : false;
    bumpMood(low ? "caring" : "celebrate", 12000);
    setTimeout(() => navigate({ to: onboarding ? "/habits" : "/" }), 1400);
  };

  return (
    <Shell>
      <ScreenHeader title="Daily Check-In" back />

      {/* progress */}
      <div className="px-5">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "gradient-primary" : "bg-white/10"}`}
            />
          ))}
        </div>
      </div>

      <section className="px-5 pt-6">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-5 glow-purple">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-purple/30 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <img
              src={lunaImg}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 animate-float object-contain"
            />
            <div>
              <p className="text-xs uppercase tracking-wider text-purple">Luna asks</p>
              <p className="text-sm font-semibold">{prompts[step - 1]}</p>
            </div>
          </div>
        </div>
      </section>

      {done && (
        <section className="px-5 pt-5">
          <SuccessState
            title="Check-in saved 💜"
            body="Luna noted this. Your garden grew a little."
          />
        </section>
      )}

      {/* step content */}
      <section className="px-5 pt-6">
        {step === 1 && (
          <div className="grid grid-cols-5 gap-2">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`glass flex flex-col items-center gap-1 rounded-2xl p-3 transition ${mood === m.id ? "ring-2 ring-purple gradient-primary text-white" : ""}`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] font-semibold">{m.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="glass-strong rounded-3xl p-5">
            <p className="text-center text-4xl">{["🪫", "🔋", "⚡", "✨", "🌟"][energy]}</p>
            <p className="mt-2 text-center text-sm font-semibold">{energyLabels[energy]}</p>
            <input
              type="range"
              min={0}
              max={4}
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="mt-4 w-full accent-purple"
            />
            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">How long did you sleep?</p>
                  <p className="text-xs text-muted-foreground">A gentle way to notice your rest.</p>
                </div>
                <span className="text-sm font-semibold text-purple">
                  {sleepHours == null ? "Not tracked" : `${sleepHours}h`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={sleepHours ?? 7}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="mt-4 w-full accent-purple"
                aria-label="Hours slept"
              />
              <button
                type="button"
                onClick={() => setSleepHours(null)}
                className="mt-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Skip for today
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${selectedTags.includes(t) ? "gradient-primary text-white" : "glass text-muted-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything else on your mind? Luna's listening…"
            className="h-40 w-full resize-none rounded-3xl glass-strong p-4 text-sm outline-none placeholder:text-muted-foreground"
          />
        )}
      </section>

      <section className="px-5 pt-6">
        <div className="glass relative overflow-hidden rounded-3xl p-4">
          <div className="flex items-center gap-2 text-xs text-purple">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-semibold uppercase tracking-wider">Luna whispers</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed">{lunaWhisper}</p>
        </div>
      </section>

      <div className="fixed bottom-24 left-0 right-0 z-30 px-5">
        <div className="mx-auto max-w-md">
          <button
            onClick={next}
            disabled={(step === 1 && !mood) || saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple/30 disabled:opacity-50"
          >
            {step === 4 ? "Send to Luna" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Shell>
  );
}

const prompts = [
  "How are you feeling right now?",
  "Where's your energy today?",
  "Which of these are showing up?",
  "Want to tell me anything else?",
];
