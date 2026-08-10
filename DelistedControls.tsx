'use client';

import { useEffect, useState } from 'react';
import {
  END_STATE_LABEL,
  END_STATE_TOKEN,
  type DelistedFilters,
  type EndState,
  type MassMetric,
} from '@/lib/graveyard/types';
import type { Platform } from '@/lib/types';

const END_STATES: EndState[] = ['superseded', 'gated', 'withdrawn', 'unreachable'];

const MASS_OPTIONS: { value: MassMetric; label: string }[] = [
  { value: 'rows', label: 'Rows at last check' },
  { value: 'coverage', label: 'Documentation coverage' },
  { value: 'dependents', label: 'Downstream dependents' },
];

/**
 * Controls. Markup mirrors ExploreClient's fieldset/legend convention — there
 * is no shared Facets component in this codebase.
 */
export function DelistedControls({
  filters,
  platforms,
  matched,
  total,
  dependentsAvailable,
  onChange,
}: {
  filters: DelistedFilters;
  platforms: Platform[];
  matched: number;
  total: number;
  /** False while dependent counts are null. The option is disabled, never faked. */
  dependentsAvailable: boolean;
  onChange: (next: Partial<DelistedFilters>) => void;
}) {
  const [q, setQ] = useState(filters.query);

  useEffect(() => {
    const t = setTimeout(() => {
      if (q !== filters.query) onChange({ query: q });
    }, 200);
    return () => clearTimeout(t);
  }, [q, filters.query, onChange]);

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex h-10 w-full max-w-md items-center border border-border-strong bg-surface px-4 sm:w-96">
          <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden className="shrink-0 text-muted-foreground">
            <circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1" />
            <line x1="9" y1="9" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search delisted records"
            aria-label="Search delisted records"
            className="ml-3 w-full bg-transparent font-mono text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <span className="tnum ml-3 shrink-0 font-mono text-[10px] text-muted-foreground">
            {matched} of {total}
          </span>
        </div>

        <label className="flex h-10 items-center gap-2 border border-border-strong bg-surface px-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Mass
          </span>
          <select
            value={filters.mass}
            onChange={(e) => onChange({ mass: e.target.value as MassMetric })}
            className="bg-transparent font-mono text-[11px] text-accent focus:outline-none"
          >
            {MASS_OPTIONS.map((o) => (
              <option
                key={o.value}
                value={o.value}
                disabled={o.value === 'dependents' && !dependentsAvailable}
              >
                {o.label}
                {o.value === 'dependents' && !dependentsAvailable ? ' — coming soon' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <fieldset>
          <legend className="pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            End state
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {END_STATES.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.endStates.includes(s)}
                  onChange={() => onChange({ endStates: toggle(filters.endStates, s) })}
                  className="h-3.5 w-3.5 accent-[var(--accent-strong)]"
                />
                <span className="font-mono text-[11px]" style={{ color: `var(${END_STATE_TOKEN[s]})` }}>
                  {END_STATE_LABEL[s]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Platform
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {platforms.map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.platforms.includes(p)}
                  onChange={() => onChange({ platforms: toggle(filters.platforms, p) })}
                  className="h-3.5 w-3.5 accent-[var(--accent-strong)]"
                />
                <span className="font-mono text-[11px] text-muted-foreground">{p}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
