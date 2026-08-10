/**
 * Legend for the Atlas.
 *
 * The disclaimer line is a positioning requirement, not decoration. The catalog
 * holds no dataset-to-dataset derivation edges, so the most-screenshotted
 * surface on the site must not imply that it does.
 */

const PLATFORMS = [
  'Hugging Face',
  'GitHub',
  'Kaggle',
  'Academic',
  'Direct',
] as const;

const COVERAGE = [
  { label: 'Extensive', color: 'var(--tier-verified)', fraction: 0.92 },
  { label: 'Partial', color: 'var(--tier-inferred)', fraction: 0.52 },
  { label: 'Minimal', color: 'var(--tier-asserted)', fraction: 0.18 },
] as const;

const EDGES = [
  { label: 'Declared', color: 'var(--accent)', dash: undefined },
  { label: 'Same publisher', color: 'var(--border-strong)', dash: undefined },
  { label: 'Shared domain', color: 'var(--border-strong)', dash: '2 5' },
] as const;

function PlatformIcon({ index }: { index: number }) {
  const stroke = 'var(--muted-foreground)';
  const sw = 1;
  switch (index) {
    case 0:
      return (
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden className="shrink-0 opacity-80">
          <path d="M6 1 L10 6 L6 11 L2 6 Z" fill="none" stroke={stroke} strokeWidth={sw} />
          <line x1="6" y1="1" x2="6" y2="11" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case 1:
      return (
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden className="shrink-0 opacity-80">
          <path d="M3 5 L6 2 L10 2 L10 6 L6 6 L3 5 Z" fill="none" stroke={stroke} strokeWidth={sw} />
          <path d="M3 5 L3 9 L6 12 L10 6" fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case 2:
      return (
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden className="shrink-0 opacity-80">
          <path d="M6 1.5 L10.5 10 L1.5 10 Z" fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case 3:
      return (
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden className="shrink-0 opacity-80">
          <polygon points="6,1 10.5,4 9,9 3,9 1.5,4" fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    default:
      return (
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden className="shrink-0 opacity-80">
          <line x1="6" y1="1" x2="3" y2="5.5" stroke={stroke} strokeWidth={sw} />
          <line x1="6" y1="1" x2="9" y2="5.5" stroke={stroke} strokeWidth={sw} />
          <line x1="3" y1="5.5" x2="9" y2="5.5" stroke={stroke} strokeWidth={sw} />
          <line x1="3" y1="5.5" x2="6" y2="11" stroke={stroke} strokeWidth={sw} />
          <line x1="9" y1="5.5" x2="6" y2="11" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
  }
}

function CoverageWireframe({ color, fraction }: { color: string; fraction: number }) {
  const edges: [number, number, number, number][] = [
    [3, 5, 6, 2],
    [6, 2, 10, 2],
    [10, 2, 10, 6],
    [10, 6, 6, 6],
    [6, 6, 3, 5],
    [3, 5, 3, 9],
    [3, 9, 6, 12],
    [6, 12, 10, 6],
  ];
  const count = Math.floor(fraction * edges.length);
  const frac = fraction * edges.length - count;

  return (
    <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden className="shrink-0">
      {edges.slice(0, count).map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1" />
      ))}
      {frac > 0.01 && count < edges.length && (
        <line
          x1={edges[count][0]}
          y1={edges[count][1]}
          x2={edges[count][0] + (edges[count][2] - edges[count][0]) * frac}
          y2={edges[count][1] + (edges[count][3] - edges[count][1]) * frac}
          stroke={color}
          strokeWidth="1"
        />
      )}
    </svg>
  );
}

export function AtlasLegend() {
  return (
    <div className="pointer-events-none flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="font-mono text-[10px] text-muted-foreground/70">Shape</span>
        {PLATFORMS.map((label, i) => (
          <span key={label} className="inline-flex items-center gap-1">
            <PlatformIcon index={i} />
            <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="font-mono text-[10px] text-muted-foreground/70">Coverage</span>
        {COVERAGE.map((c) => (
          <span key={c.label} className="inline-flex items-center gap-1">
            <CoverageWireframe color={c.color} fraction={c.fraction} />
            <span className="font-mono text-[10px] text-muted-foreground">{c.label}</span>
          </span>
        ))}
        <span className="font-mono text-[10px] text-muted-foreground/60">edges drawn</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {EDGES.map((e) => (
          <span key={e.label} className="inline-flex items-center gap-1">
            <svg width="14" height="5" viewBox="0 0 16 6" aria-hidden className="shrink-0 opacity-80">
              <line
                x1="0"
                y1="3"
                x2="16"
                y2="3"
                stroke={e.color}
                strokeWidth="1"
                strokeDasharray={e.dash}
              />
            </svg>
            <span className="font-mono text-[10px] text-muted-foreground">{e.label}</span>
          </span>
        ))}
        <span className="font-mono text-[10px] text-muted-foreground/60">
          · not derivation
        </span>
      </div>
    </div>
  );
}
