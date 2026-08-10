'use client';

import Link from 'next/link';
import {
  END_STATE_LABEL,
  END_STATE_TOKEN,
  lightAge,
  type DelistedRecord,
  type MassMetric,
} from '@/lib/graveyard/types';

function massLabel(rec: DelistedRecord, metric: MassMetric): string {
  if (metric === 'coverage') return `${rec.coverageTotal}% documented`;
  if (metric === 'dependents') {
    if (rec.dependentModels === null) return '—';
    return `${rec.dependentModels} models`;
  }
  const r = rec.sizeRows;
  if (r >= 1e9) return `${(r / 1e9).toFixed(1)}B rows`;
  if (r >= 1e6) return `${Math.round(r / 1e6)}M rows`;
  if (r >= 1e3) return `${Math.round(r / 1e3)}K rows`;
  return `${r} rows`;
}

/**
 * The register.
 *
 * Not a supplement to the terrain. This is the DOM the canvas cannot provide:
 * the SEO surface, the keyboard path and the screen-reader path, exactly as
 * AtlasA11y is for the Atlas. Rows and wells highlight each other.
 */
export function DelistedRegister({
  records,
  mass,
  hovered,
  onHover,
}: {
  records: DelistedRecord[];
  mass: MassMetric;
  hovered: string | null;
  onHover: (slug: string | null) => void;
}) {
  if (records.length === 0) {
    return (
      <p className="border-t border-border-strong py-10 font-mono text-[12px] text-muted-foreground">
        No delisted records match. Flat space.
      </p>
    );
  }

  return (
    <table className="w-full border-collapse text-left">
      <caption className="sr-only">
        Delisted records, with the state observed at the final successful check.
      </caption>
      <thead>
        <tr className="border-t border-border-strong">
          {['Dataset', 'Publisher', 'End state', 'Mass', 'Last confirmed', 'Light age'].map((h) => (
            <th
              key={h}
              scope="col"
              className="py-3 font-mono text-[8px] font-normal uppercase tracking-[0.16em] text-muted-foreground"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {records.map((r) => {
          const on = hovered === r.slug;
          return (
            <tr
              key={r.slug}
              onMouseEnter={() => onHover(r.slug)}
              onMouseLeave={() => onHover(null)}
              className={`border-b border-border transition-colors ${on ? 'bg-surface-elevated' : ''}`}
            >
              <td className="py-3">
                <Link
                  href={`/delisted/?view=records&record=${r.slug}`}
                  onFocus={() => onHover(r.slug)}
                  onBlur={() => onHover(null)}
                  className="link-underline font-mono text-[12px] text-foreground/90"
                >
                  {r.name}
                </Link>
              </td>
              <td className="py-3 font-mono text-[10px] text-muted-foreground">{r.publisher}</td>
              <td className="py-3">
                <span className="inline-flex items-center gap-2">
                  <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden>
                    <circle cx="4" cy="4" r="3.5" fill={`var(${END_STATE_TOKEN[r.endState]})`} />
                  </svg>
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: `var(${END_STATE_TOKEN[r.endState]})` }}
                  >
                    {END_STATE_LABEL[r.endState]}
                  </span>
                </span>
              </td>
              <td className="tnum py-3 font-mono text-[10px] text-tier-asserted">
                {massLabel(r, mass)}
              </td>
              <td className="tnum py-3 font-mono text-[10px] text-muted-foreground">
                {r.lastConfirmed}
              </td>
              <td className="tnum py-3 font-mono text-[10px] text-muted-foreground">
                {lightAge(r.lastConfirmed).toLocaleString()} d
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
