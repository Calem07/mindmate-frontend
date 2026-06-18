import { useMemo } from "react";

export type TreeStageKey = "seed" | "sprout" | "tree" | "bloom" | "ancient";

const ORDER: TreeStageKey[] = ["seed", "sprout", "tree", "bloom", "ancient"];

type Props = {
  stage: TreeStageKey;
  /** 0-1 progress toward next stage; subtly grows the current form */
  progress?: number;
  className?: string;
};

/**
 * Dynamic SVG tree that morphs by evolution stage with smooth cross-fade
 * transitions. All five forms are rendered stacked; opacity and scale
 * interpolate so growth feels continuous as XP / stage change.
 */
export function LivingTree({ stage, progress = 0, className }: Props) {
  const cfg = useMemo(() => stageConfig(stage, progress), [stage, progress]);

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      preserveAspectRatio="xMidYMax meet"
      aria-label={`Tree stage: ${stage}`}
    >
      <defs>
        <radialGradient id="lt-halo" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor={cfg.haloColor} stopOpacity="0.55">
            <animate attributeName="stop-color" to={cfg.haloColor} dur="1200ms" fill="freeze" />
          </stop>
          <stop offset="100%" stopColor={cfg.haloColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lt-trunk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7a4a2b" />
          <stop offset="100%" stopColor="#4a2a17" />
        </linearGradient>
        <radialGradient id="lt-canopy" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={cfg.canopyLight} />
          <stop offset="100%" stopColor={cfg.canopyDark} />
        </radialGradient>
      </defs>

      {/* Soft halo */}
      <circle
        cx="100"
        cy="115"
        r="85"
        fill="url(#lt-halo)"
        style={{ transition: "fill 1200ms ease" }}
      />

      {/* Soil mound */}
      <ellipse cx="100" cy="178" rx="70" ry="10" fill="#2a1a10" opacity="0.6" />
      <ellipse cx="100" cy="176" rx="55" ry="6" fill="#3a2418" opacity="0.8" />

      {/* All stages stacked — cross-fade + scale morph */}
      <g
        style={{
          transformOrigin: "100px 176px",
          transform: `scale(${cfg.scale})`,
          transition: "transform 1200ms cubic-bezier(.22,1,.36,1)",
        }}
      >
        {ORDER.map((key) => {
          const active = key === stage;
          return (
            <g
              key={key}
              style={{
                opacity: active ? 1 : 0,
                transition: "opacity 900ms ease",
              }}
            >
              {key === "seed" && <Seed />}
              {key === "sprout" && <Sprout />}
              {key === "tree" && <Tree withBlossoms={false} ancient={false} />}
              {key === "bloom" && <Tree withBlossoms ancient={false} />}
              {key === "ancient" && <Tree withBlossoms ancient />}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function stageConfig(stage: TreeStageKey, progress: number) {
  // Continuous scale: interpolate between this stage's base and the next
  // stage's base using `progress`, so the tree grows smoothly with XP.
  const p = Math.min(1, Math.max(0, progress));
  const bases: Record<TreeStageKey, number> = {
    seed: 0.5, sprout: 0.7, tree: 0.88, bloom: 0.95, ancient: 1.05,
  };
  const idx = ORDER.indexOf(stage);
  const next = ORDER[Math.min(ORDER.length - 1, idx + 1)];
  const scale = bases[stage] + (bases[next] - bases[stage]) * p;

  switch (stage) {
    case "seed":    return { scale, haloColor: "#67e8f9", canopyLight: "#7be8a8", canopyDark: "#1f6b4a" };
    case "sprout":  return { scale, haloColor: "#86efac", canopyLight: "#8af0a8", canopyDark: "#1f6b4a" };
    case "tree":    return { scale, haloColor: "#a78bfa", canopyLight: "#86efac", canopyDark: "#176043" };
    case "bloom":   return { scale, haloColor: "#f5a3d6", canopyLight: "#b6f0c4", canopyDark: "#1f6b4a" };
    case "ancient": return { scale, haloColor: "#fcd34d", canopyLight: "#d6f5c1", canopyDark: "#1f6b4a" };
  }
}

function Seed() {
  return (
    <g>
      <path d="M100 176 C 100 168, 100 162, 100 156" stroke="#4ea674" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M100 160 C 90 156, 84 150, 86 142 C 94 144, 100 150, 100 158 Z" fill="#7be8a8" />
      <path d="M100 160 C 110 156, 116 150, 114 142 C 106 144, 100 150, 100 158 Z" fill="#5dd190" />
    </g>
  );
}

function Sprout() {
  return (
    <g>
      <path d="M100 176 C 100 160, 100 145, 100 130" stroke="#4ea674" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M100 150 C 86 146, 76 138, 76 126 C 90 128, 100 138, 100 150 Z" fill="url(#lt-canopy)" />
      <path d="M100 138 C 114 134, 124 126, 124 114 C 110 116, 100 126, 100 138 Z" fill="url(#lt-canopy)" />
      <path d="M100 130 C 95 122, 95 112, 100 104 C 105 112, 105 122, 100 130 Z" fill="#a4f0bd" />
    </g>
  );
}

function Tree({ withBlossoms, ancient }: { withBlossoms: boolean; ancient: boolean }) {
  return (
    <g>
      <path
        d="M92 176 C 92 150, 96 130, 95 108 L 105 108 C 104 130, 108 150, 108 176 Z"
        fill="url(#lt-trunk)"
      />
      <path d="M98 130 C 86 122, 78 118, 70 116" stroke="#5a3320" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M102 124 C 116 118, 124 116, 132 116" stroke="#5a3320" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="92" r={ancient ? 42 : 34} fill="url(#lt-canopy)" />
      <circle cx="70" cy="104" r={ancient ? 26 : 20} fill="url(#lt-canopy)" />
      <circle cx="130" cy="104" r={ancient ? 26 : 20} fill="url(#lt-canopy)" />
      <circle cx="84" cy="78" r={ancient ? 22 : 16} fill="url(#lt-canopy)" />
      <circle cx="118" cy="78" r={ancient ? 22 : 16} fill="url(#lt-canopy)" />

      {withBlossoms && (
        <g>
          {blossomPositions(ancient).map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={ancient ? 2.6 : 2.2} fill={ancient ? "#fde68a" : "#f9a8d4"} />
          ))}
        </g>
      )}

      {ancient && (
        <g opacity="0.85">
          {[
            [60, 70], [140, 70], [100, 50], [78, 96], [122, 96], [90, 110], [110, 60],
          ].map((p, i) => (
            <g key={i} transform={`translate(${p[0]} ${p[1]})`}>
              <path d="M0 -3 L0.8 -0.8 L3 0 L0.8 0.8 L0 3 L-0.8 0.8 L-3 0 L-0.8 -0.8 Z" fill="#fde68a" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

function blossomPositions(ancient: boolean): [number, number][] {
  const base: [number, number][] = [
    [88, 80], [110, 76], [100, 92], [76, 96], [124, 96], [92, 104], [116, 104],
    [82, 88], [120, 88], [104, 60], [70, 110], [130, 110],
  ];
  if (!ancient) return base;
  return [...base, [60, 88], [140, 88], [100, 46], [86, 116], [118, 116]];
}
