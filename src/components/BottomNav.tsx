import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Home, Cat, TreePine, Sprout, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/luna", label: "Luna", icon: Cat },
  { to: "/garden", label: "Garden", icon: TreePine },
  { to: "/growth", label: "Growth", icon: Sprout },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      className={`fixed left-3 top-1/2 z-50 -translate-y-1/2 transition-transform duration-300 ease-out ${
        expanded ? "translate-x-0" : "-translate-x-[calc(100%-2.75rem)]"
      }`}
    >
      <div
        className={`glass-strong relative flex flex-col gap-1 rounded-3xl p-2 shadow-2xl transition-[width] duration-300 ${
          expanded ? "w-28" : "w-14"
        }`}
      >
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              title={!expanded ? label : undefined}
              className={`relative flex min-h-11 items-center rounded-2xl px-3 py-2 transition duration-200 active:scale-95 ${
                expanded ? "gap-3" : "justify-center"
              }`}
            >
              {active && <span className="absolute inset-0 rounded-2xl gradient-primary opacity-20" />}
              <Icon
                className={`relative h-5 w-5 shrink-0 transition ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              {expanded && (
                <span
                  className={`relative text-[10px] font-medium ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-label={expanded ? "Collapse navigation" : "Expand navigation"}
          aria-expanded={expanded}
          className="absolute -right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full glass"
        >
          {expanded ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
      </div>
    </nav>
  );
}
