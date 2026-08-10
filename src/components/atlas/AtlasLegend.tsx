/**
 * Legend for the Atlas.
 *
 * The disclaimer line is a positioning requirement, not decoration. The catalog
 * holds no dataset-to-dataset derivation edges, so the most-screenshotted
 * surface on the site must not imply that it does.
 */

const GLYPHS = [
  { label: 'Extensively documented', color: 'var(--tier-verified)', kind: 'filled' },
  { label: 'Partially documented', color: 'var(--tier-inferred)', kind: 'half' },
  { label: 'Minimally documented', color: 'var(--tier-asserted)', kind: 'hollow' },
] as const;

const EDGES = [
  { label: 'Related — declared by the publisher', color: 'var(--accent)', dash: undefined },
  { label: 'Same publisher', color: 'var(--border-strong)', dash: undefined },
  { label: 'Shared subject domain', color: 'var(--border-strong)', dash: '2 5' },
] as const;

export function AtlasLegend() {
  return (
    <div className="pointer-events-none flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {GLYPHS.map((g) => (
          <span key={g.label} className="inline-flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="shrink-0">
              {g.kind === 'filled' && <circle cx="5" cy="5" r="4" fill={g.color} />}
              {g.kind === 'half' && (
                <>
                  <circle cx="5" cy="5" r="3.6" fill="none" stroke={g.color} strokeWidth="1.4" />
                  <path d="M5 1.4 A3.6 3.6 0 0 1 5 8.6 Z" fill={g.color} />
                </>
              )}
              {g.kind === 'hollow' && (
                <circle cx="5" cy="5" r="3.6" fill="none" stroke={g.color} strokeWidth="1.6" />
              )}
            </svg>
            <span className="font-mono text-[10px] text-muted-foreground">{g.label}</span>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {EDGES.map((e) => (
          <span key={e.label} className="inline-flex items-center gap-1.5">
            <svg width="16" height="6" viewBox="0 0 16 6" aria-hidden className="shrink-0">
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
      </div>

      <p className="max-w-md font-mono text-[10px] leading-relaxed text-muted-foreground">
        Lines show declared relations and shared attributes. They do not assert derivation.
      </p>
    </div>
  );
}
