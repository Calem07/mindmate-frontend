import { useEffect, useState } from "react";
import luna from "@/assets/luna.png";

export function SplashScreen() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("mindmate-splash-shown");
  });

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      sessionStorage.setItem("mindmate-splash-shown", "1");
      setShow(false);
    }, 1800);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background animate-in fade-in">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/30 blur-3xl animate-pulse-glow" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
      </div>
      <div className="relative flex flex-col items-center gap-6">
        <img src={luna} alt="Luna" width={160} height={160} className="h-40 w-40 animate-float object-contain drop-shadow-2xl" />
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gradient">MindMate</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your companion for growth</p>
        </div>
        <div className="mt-4 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-2 w-2 animate-pulse-glow rounded-full bg-primary" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
