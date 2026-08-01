import type { ReactNode } from "react";
import { Loader2, Inbox, CheckCircle2, AlertTriangle, WifiOff } from "lucide-react";

export function LoadingState({ label = "Luna is loading…" }: { label?: string }) {
  return (
    <div className="glass flex items-center justify-center gap-3 rounded-3xl px-5 py-8">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, body, action }: {
  icon?: typeof Inbox; title: string; body?: string; action?: ReactNode;
}) {
  return (
    <div className="glass-strong flex flex-col items-center gap-3 rounded-3xl px-5 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple/15">
        <Icon className="h-6 w-6 text-purple" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {body && <p className="mt-1 text-xs text-muted-foreground">{body}</p>}
      </div>
      {action}
    </div>
  );
}

export function SuccessState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl border border-secondary/30 px-4 py-3">
      <CheckCircle2 className="h-5 w-5 text-secondary" />
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {body && <p className="text-xs text-muted-foreground">{body}</p>}
      </div>
    </div>
  );
}

export function ErrorState({ title = "Something went sideways", body, onRetry }: {
  title?: string; body?: string; onRetry?: () => void;
}) {
  return (
    <div className="glass flex flex-col gap-3 rounded-3xl border border-destructive/30 px-5 py-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15">
        <AlertTriangle className="h-5 w-5 text-destructive" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {body && <p className="mt-1 text-xs text-muted-foreground">{body}</p>}
      </div>
      {onRetry && (
        <button onClick={onRetry} className="mx-auto min-h-11 rounded-full glass px-5 py-2 text-xs font-semibold transition duration-200 active:scale-95">
          Try again
        </button>
      )}
    </div>
  );
}

export function OfflineState() {
  return (
    <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
      <WifiOff className="h-4 w-4 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">You're offline — Luna will sync when you're back.</p>
    </div>
  );
}
