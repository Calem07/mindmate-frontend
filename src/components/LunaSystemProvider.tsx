import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { LunaMood } from "@/components/LunaAvatar";

type Ctx = {
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  transientMood: LunaMood | null;
  bumpMood: (mood: LunaMood, ttlMs?: number) => void;
};

const LunaSystemCtx = createContext<Ctx>({
  reducedMotion: false,
  setReducedMotion: () => {},
  transientMood: null,
  bumpMood: () => {},
});

const STORAGE_KEY = "mindmate-reduced-motion";

export function LunaSystemProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [transientMood, setTransientMood] = useState<LunaMood | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from storage + system preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored != null) {
      setReducedMotionState(stored === "1");
    } else if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotionState(true);
    }
  }, []);

  const setReducedMotion = useCallback((v: boolean) => {
    setReducedMotionState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {}
    // Reflect on the root so CSS can respond if needed
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("reduce-motion", v);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("reduce-motion", reducedMotion);
    }
  }, [reducedMotion]);

  const bumpMood = useCallback((mood: LunaMood, ttlMs = 8000) => {
    setTransientMood(mood);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTransientMood(null), ttlMs);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <LunaSystemCtx.Provider value={{ reducedMotion, setReducedMotion, transientMood, bumpMood }}>
      {children}
    </LunaSystemCtx.Provider>
  );
}

export const useLunaSystem = () => useContext(LunaSystemCtx);
export const useReducedMotion = () => useContext(LunaSystemCtx).reducedMotion;
export const useLunaMoodTrigger = () => useContext(LunaSystemCtx).bumpMood;
