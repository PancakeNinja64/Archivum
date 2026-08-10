'use client';

import { useEffect, useRef } from 'react';
import {
  END_STATE_LABEL,
  END_STATE_TOKEN,
  goneFor,
  type DelistedRecord,
  type MassMetric,
} from '@/lib/graveyard/types';

export function massLabel(rec: DelistedRecord, metric: MassMetric): string {
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
 * The record list — always on screen beside the terrain.
 *
 * This is also the DOM the canvas cannot provide: the keyboard path and the
 * screen-reader path. Every row is a real button, and focusing one raises its
 * well, so the terrain is fully operable without a pointer.
 */
export function RecordList({
  records,
  mass,
  hovered,
  selected,
  onHover,
  onSelect,
}: {
  records: DelistedRecord[];
  mass: MassMetric;
  hovered: string | null;
  selected: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  const listRef = useRef<HTMLUListElement | null>(null);

  /* Keep the hovered well's row in view when the pointer drives the highlight. */
  useEffect(() => {
    if (!hovered || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-slug="${hovered}"]`);
    if (el instanceof HTMLElement) {
      const box = listRef.current.getBoundingClientRect();
      const row = el.getBoundingClientRect();
      if (row.top < box.top || row.bottom > box.bottom) {
        el.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [hovered]);

  if (records.length === 0) {
    return (
      <p className="px-5 py-10 font-mono text-[11px] leading-relaxed text-muted-foreground">
        No records match. The field is flat.
      </p>
    );
  }

  return (
    <ul ref={listRef} className="divide-y divide-border">
      {records.map((r) => {
        const on = hovered === r.slug || selected === r.slug;
        return (
          <li key={r.slug} data-slug={r.slug}>
            <button
              type="button"
              onMouseEnter={() => onHover(r.slug)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(r.slug)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(r.slug)}
              aria-current={selected === r.slug ? 'true' : undefined}
              className={`w-full px-5 py-3.5 text-left transition-colors ${
                on ? 'bg-surface-elevated' : 'hover:bg-surface'
              }`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="truncate font-mono text-[12px] text-foreground/90">{r.name}</span>
                <span className="tnum shrink-0 font-mono text-[10px] text-tier-asserted">
                  {massLabel(r, mass)}
                </span>
              </span>
              <span className="mt-1.5 flex items-center gap-2.5">
                <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden className="shrink-0">
                  <circle cx="4" cy="4" r="3.5" fill={`var(${END_STATE_TOKEN[r.endState]})`} />
                </svg>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: `var(${END_STATE_TOKEN[r.endState]})` }}
                >
                  {END_STATE_LABEL[r.endState]}
                </span>
                <span className="truncate font-mono text-[10px] text-muted-foreground">
                  {r.publisher}
                </span>
                <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                  {goneFor(r.lastConfirmed)}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
