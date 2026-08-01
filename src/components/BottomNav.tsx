import { Link, useLocation } from "@tanstack/react-router";
import { Home, Cat, TreePine, Sprout, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/luna", label: "Luna", icon: Cat },
  { to: "/garden", label: "Garden", icon: TreePine },
  { to: "/growth", label: "Growth", icon: Sprout },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-3 pb-4 pt-2">
        <div className="glass-strong flex items-center justify-around rounded-3xl px-1.5 py-2">
          {items.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                className="relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition duration-200 active:scale-95"
              >
                {active && (
                  <span className="absolute inset-0 rounded-2xl gradient-primary opacity-20" />
                )}
                <Icon
                  className={`relative h-5 w-5 transition ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={`relative text-[10px] font-medium ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
