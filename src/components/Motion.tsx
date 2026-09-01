import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/components/LunaSystemProvider";

type MotionStyle = CSSProperties & {
  "--motion-delay"?: string;
  "--motion-progress"?: number;
};

export function MotionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      data-motion-visible={visible || undefined}
      className={`motion-reveal ${className}`}
      style={{ "--motion-delay": `${delay}ms` } as MotionStyle}
    >
      {children}
    </div>
  );
}

export function AnimatedProgress({
  value,
  className = "",
  label,
}: {
  value: number;
  className?: string;
  label?: string;
}) {
  const reducedMotion = useReducedMotion();
  const bounded = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(bounded)}
      className={`motion-progress origin-left ${className}`}
      style={
        {
          "--motion-progress": bounded / 100,
          transform: reducedMotion ? `scaleX(${bounded / 100})` : undefined,
        } as MotionStyle
      }
    />
  );
}

export function AnimatedNumber({
  value,
  className = "",
  suffix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);
  const previous = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      previous.current = value;
      setDisplay(value);
      return;
    }
    const from = previous.current;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - startedAt) / 650);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (elapsed < 1) frame = requestAnimationFrame(tick);
      else previous.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, value]);

  return (
    <span className={className}>
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
