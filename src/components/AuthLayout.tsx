import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import luna from "@/assets/luna.png";
import { useTheme } from "@/components/ThemeProvider";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { theme, toggle } = useTheme();
  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-purple/20 blur-3xl" />
      </div>

      <div className="relative flex items-center justify-between">
        <Link to="/" className="text-xs text-muted-foreground">← Back</Link>
        <button
          onClick={toggle}
          className="glass flex h-9 w-9 items-center justify-center rounded-full"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative mt-8 flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-purple/40 blur-2xl" />
          <img
            src={luna}
            alt="Luna"
            width={96}
            height={96}
            className="relative h-24 w-24 animate-float object-contain"
          />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="relative mt-8">{children}</div>

      {footer && <div className="relative mt-6 text-center text-xs text-muted-foreground">{footer}</div>}
    </div>
  );
}

export function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="glass flex items-center gap-2.5 rounded-2xl px-4 py-3">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {children}
      </div>
    </label>
  );
}

export function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
