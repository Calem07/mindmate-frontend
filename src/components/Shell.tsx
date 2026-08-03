import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { OfflineBanner } from "./OfflineBanner";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto min-h-[100dvh] max-w-md pb-8"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <OfflineBanner />
      {children}
      <BottomNav />
    </div>
  );
}

export function ScreenHeader({ title, back, right }: { title: string; back?: boolean; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 -mx-px flex items-center justify-between border-b border-white/5 bg-background/70 px-5 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="w-9">
        {back && (
          <button
            onClick={() => window.history.back()}
            className="glass flex h-11 w-11 items-center justify-center rounded-full transition duration-200 active:scale-95"
            aria-label="Back"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
      </div>
      <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
      <div className="flex w-9 justify-end">{right}</div>
    </header>
  );
}
