import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Home, Cat, TreePine, Sprout, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/luna", label: "Luna", icon: Cat },
  { to: "/garden", label: "Garden", icon: TreePine },
  { to: "/growth", label: "Growth", icon: Sprout },
  { to: "/profile", label: "Profile", icon: User },
] as const;

type NavState = "hidden" | "peek" | "expanded";

export function BottomNav() {
  const { pathname } = useLocation();
  const [navState, setNavState] = useState<NavState>("hidden");
  const navRef = useRef<HTMLElement>(null);
  const expanded = navState === "expanded";
  const visible = navState !== "hidden";

  useEffect(() => {
    if (!visible) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (
        navRef.current &&
        event.target instanceof Node &&
        !navRef.current.contains(event.target)
      ) {
        setNavState("hidden");
      }
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [visible]);

  const toggleNav = () => {
    setNavState((current) => {
      if (current === "hidden") return "peek";
      if (current === "peek") return "expanded";
      return "peek";
    });
  };

  return (
    <nav
      ref={navRef}
      data-nav-state={navState}
      className={`fixed left-3 top-1/2 z-50 -translate-y-1/2 transition-transform duration-300 ease-out ${
        visible ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div
        className={`${
          visible
            ? "glass-strong"
            : "bg-transparent border-transparent shadow-none backdrop-blur-none"
        } relative flex flex-col gap-1 rounded-3xl border p-2 pb-12 transition-[width] duration-300 ${
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
              {active && (
                <span className="absolute inset-0 rounded-2xl gradient-primary opacity-20" />
              )}
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
          onClick={toggleNav}
          aria-label={
            expanded
              ? "Collapse navigation"
              : visible
                ? "Expand navigation fully"
                : "Show navigation"
          }
          aria-expanded={expanded}
          className={`${
            visible ? "left-1/2 -translate-x-1/2" : "-right-[2.5rem]"
          } absolute bottom-2 flex h-8 w-8 items-center justify-center rounded-full glass border border-purple/30 glow-purple transition duration-200 active:scale-90`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-3 rounded-full bg-purple/35 blur-xl animate-pulse-glow"
          />
          {expanded ? (
            <ChevronLeft className="relative z-10 h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="relative z-10 h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </nav>
  );
}
