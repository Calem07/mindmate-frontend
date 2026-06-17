import { useMemo } from "react";

export type TreeStageKey = "seed" | "sprout" | "tree" | "bloom" | "ancient";

type Props = {
  stage: TreeStageKey;
  /** 0-1 progress toward next stage; subtly grows the current form */
  progress?: number;
  className?: string;
};

/**
 * Dynamic SVG tree that morphs by evolution stage.
 * - seed: a tiny sprout breaking from soil
 * - sprout: young plant with first leaves
 * - tree: small trunk with full canopy
 * - bloom: tree with pink blossoms
 * - ancient: large mythic tree with golden glow + blossoms
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
          <stop offset="0%" stopColor={cfg.haloColor} stopOpacity="0.55" />
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
      <circle cx="100" cy="115" r="85" fill="url(#lt-halo)" />

      {/* Soil mound */}
      <ellipse cx="100" cy="178" rx="70" ry="10" fill="#2a1a10" opacity="0.6" />
      <ellipse cx="100" cy="176" rx="55" ry="6" fill="#3a2418" opacity="0.8" />

      {/* Stage-specific body */}
      <g
        style={{
          transformOrigin: "100px 176px",
          transform: `scale(${cfg.scale})`,
        }}
        className="origin-bottom"
      >
        {stage === "seed" && <Seed />}
        {stage === "sprout" && <Sprout />}
        {stage === "tree" && <Tree withBlossoms={false} ancient={false} />}
        {stage === "bloom" && <Tree withBlossoms ancient={false} />}
        {stage === "ancient" && <Tree withBlossoms ancient />}
      </g>
    </svg>
  );
}

function stageConfig(stage: TreeStageKey, progress: number) {
  const growth = 0.92 + Math.min(1, Math.max(0, progress)) * 0.08;
  switch (stage) {
    case "seed":
      return { scale: 0.55 * growth, haloColor: "#67e8f9", canopyLight: "#7be8a8", canopyDark: "#1f6b4a" };
    case "sprout":
      return { scale: 0.75 * growth, haloColor: "#86efac", canopyLight: "#8af0a8", canopyDark: "#1f6b4a" };
    case "tree":
      return { scale: 0.9 * growth, haloColor: "#a78bfa", canopyLight: "#86efac", canopyDark: "#176043" };
    case "bloom":
      return { scale: 0.95 * growth, haloColor: "#f5a3d6", canopyLight: "#b6f0c4", canopyDark: "#1f6b4a" };
    case "ancient":
      return { scale: 1 * growth, haloColor: "#fcd34d", canopyLight: "#d6f5c1", canopyDark: "#1f6b4a" };
  }
}

function Seed() {
  return (
    <g>
      {/* Stem */}
      <path d="M100 176 C 100 168, 100 162, 100 156" stroke="#4ea674" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Two cotyledons */}
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
      {/* Trunk */}
      <path
        d="M92 176 C 92 150, 96 130, 95 108 L 105 108 C 104 130, 108 150, 108 176 Z"
        fill="url(#lt-trunk)"
      />
      {/* Branches */}
      <path d="M98 130 C 86 122, 78 118, 70 116" stroke="#5a3320" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M102 124 C 116 118, 124 116, 132 116" stroke="#5a3320" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Canopy clusters */}
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
          {/* Golden sparkles */}
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
