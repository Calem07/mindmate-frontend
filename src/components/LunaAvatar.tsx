import { useEffect, useState } from "react";
import luna from "@/assets/luna.png";
import { useLunaSystem } from "@/components/LunaSystemProvider";

export type LunaMood =
  | "warm"
  | "happy"
  | "calm"
  | "curious"
  | "caring"
  | "sleepy"
  | "focused"
  | "celebrate";

const MOOD_STYLES: Record<LunaMood, { ring: string; glow: string; overlay?: string; tint?: string }> = {
  warm:     { ring: "from-purple/50 to-cyan/40",   glow: "shadow-[0_0_24px_rgba(155,120,255,0.35)]" },
  happy:    { ring: "from-amber-300/70 to-pink-400/60", glow: "shadow-[0_0_32px_rgba(255,180,90,0.5)]", overlay: "✨" },
  calm:     { ring: "from-cyan/50 to-teal-400/40", glow: "shadow-[0_0_28px_rgba(80,200,220,0.45)]", tint: "hue-rotate-[10deg]" },
  curious:  { ring: "from-purple/60 to-fuchsia-400/50", glow: "shadow-[0_0_26px_rgba(200,120,255,0.4)]", overlay: "?" },
  caring:   { ring: "from-rose-400/60 to-purple/50", glow: "shadow-[0_0_28px_rgba(255,120,160,0.45)]", overlay: "💜" },
  sleepy:   { ring: "from-indigo-400/40 to-purple/30", glow: "shadow-[0_0_20px_rgba(120,120,220,0.3)]", overlay: "z", tint: "brightness-90" },
  focused:  { ring: "from-teal-400/60 to-cyan/50",  glow: "shadow-[0_0_26px_rgba(80,220,200,0.45)]" },
  celebrate:{ ring: "from-amber-400/70 to-rose-400/60", glow: "shadow-[0_0_36px_rgba(255,180,90,0.6)]", overlay: "🎉" },
};

const SIZE_MAP = { xs: 28, sm: 40, md: 56, lg: 80, xl: 120 } as const;

/**
 * Time-of-day derived default mood — used across the app so Luna feels alive
 * even on screens without conversation context.
 */
export function useAmbientLunaMood(): LunaMood {
  const [mood, setMood] = useState<LunaMood>("warm");
  const { transientMood } = useLunaSystem();
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 6) setMood("sleepy");
    else if (h < 11) setMood("happy");
    else if (h < 17) setMood("focused");
    else if (h < 21) setMood("calm");
    else setMood("caring");
  }, []);
  return transientMood ?? mood;
}

export function LunaAvatar({
  mood = "warm",
  size = "md",
  bounce = false,
  className = "",
}: {
  mood?: LunaMood;
  size?: keyof typeof SIZE_MAP;
  bounce?: boolean;
  className?: string;
}) {
  const px = SIZE_MAP[size];
  const style = MOOD_STYLES[mood];
  const { reducedMotion } = useLunaSystem();

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ width: px, height: px }}
    >
      {/* Animated aura ring */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${style.ring} blur-md opacity-80 ${reducedMotion ? "" : "animate-pulse"}`}
        style={reducedMotion ? undefined : { animationDuration: "3.2s" }}
        aria-hidden
      />
      {/* Solid ring */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${style.ring} ${style.glow}`} aria-hidden />
      {/* Cat */}
      <div
        className={`relative z-10 rounded-full bg-background/40 backdrop-blur-sm p-[8%] ${bounce && !reducedMotion ? "animate-float" : ""}`}
        style={{ width: "100%", height: "100%" }}
      >
        <img
          src={luna}
          alt="Luna"
          width={px}
          height={px}
          className={`h-full w-full object-contain drop-shadow ${style.tint ?? ""} ${!reducedMotion && moodAnim ? moodAnim : ""}`}
        />
      </div>

      {/* Expression overlay */}
      {style.overlay && (
        <span
          className="absolute -right-1 -top-1 z-20 flex h-[38%] min-h-4 min-w-4 items-center justify-center rounded-full bg-background/80 text-[10px] font-bold shadow ring-1 ring-white/10 backdrop-blur"
          style={{ width: "38%" }}
          aria-hidden
        >
          {style.overlay}
        </span>
      )}
    </div>
  );
}

export function LunaMoodDot({ mood }: { mood: LunaMood }) {
  const label: Record<LunaMood, string> = {
    warm: "purring softly",
    happy: "beaming",
    calm: "breathing slow",
    curious: "listening close",
    caring: "holding space",
    sleepy: "curled up",
    focused: "watching quietly",
    celebrate: "celebrating you",
  };
  const { reducedMotion } = useLunaSystem();
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full bg-purple ${reducedMotion ? "" : "animate-pulse"}`} />
      {label[mood]}
    </span>
  );
}
