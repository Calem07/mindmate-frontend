import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Shield } from "lucide-react";

const HIDDEN_ROUTES = ["/signin", "/signup", "/admin-login", "/forgot-password", "/reset-password"];
import luna from "@/assets/luna.png";
import { useAuth } from "@/components/AuthProvider";

export function SplashScreen() {
  const { user, loading } = useAuth();
  const [minElapsed, setMinElapsed] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("mindmate-splash-shown") === "1";
  });

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (dismissed) return;
    if (minElapsed && !loading && user) {
      sessionStorage.setItem("mindmate-splash-shown", "1");
      setDismissed(true);
    }
  }, [minElapsed, loading, user, dismissed]);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sessionShown = typeof window !== "undefined" && sessionStorage.getItem("mindmate-splash-shown") === "1";
  if (dismissed || sessionShown || HIDDEN_ROUTES.includes(pathname)) return null;

  const showAuthCta = minElapsed && !loading && !user;

  const markShown = () => sessionStorage.setItem("mindmate-splash-shown", "1");

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-background px-6 pb-10 pt-14 animate-in fade-in">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple/30 blur-3xl animate-pulse-glow" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative mt-6 flex flex-col items-center gap-5">
        <img
          src={luna}
          alt="Luna"
          width={160}
          height={160}
          className="h-36 w-36 animate-float object-contain drop-shadow-2xl"
        />
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gradient">MindMate</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your companion for growth</p>
        </div>
      </div>

      <div className="relative w-full max-w-sm">
        {showAuthCta ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass rounded-2xl px-4 py-3 text-center">
              <p className="flex items-center justify-center gap-1.5 text-xs text-purple">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-semibold uppercase tracking-wider">Luna is waiting</span>
              </p>
              <p className="mt-1 text-sm text-foreground/90">Start your wellness journey today</p>
            </div>
            <Link
              to="/signup"
              onClick={markShown}
              className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 text-sm font-semibold text-white shadow-lg shadow-purple/30"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/signin"
              onClick={markShown}
              className="glass flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-semibold"
            >
              Sign in
            </Link>
            <Link
              to="/admin-login"
              onClick={markShown}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-2 text-xs font-medium text-muted-foreground"
            >
              <Shield className="h-3.5 w-3.5" />
              Admin login
            </Link>
          </div>
        ) : (
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-pulse-glow rounded-full bg-primary"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
