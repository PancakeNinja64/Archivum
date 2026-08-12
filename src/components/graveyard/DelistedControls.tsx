'use client';

import {
  END_STATES,
  END_STATE_LABEL,
  END_STATE_NOTE,
  END_STATE_TOKEN,
  type DelistedFilters,
} from '@/lib/graveyard/types';
import type { Platform } from '@/lib/types';

/**
 * Facets. Markup mirrors ExploreClient's fieldset/legend convention — there is
 * no shared Facets component in this codebase.
 *
 * Search lives in DelistedSearch, above the board, because it drives the camera
 * as well as the filter and belongs next to the thing it moves.
 */
export function DelistedControls({
  filters,
  platforms,
  onChange,
}: {
  filters: DelistedFilters;
  platforms: Platform[];
  onChange: (next: Partial<DelistedFilters>) => void;
}) {
  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <div className="flex flex-wrap gap-x-10 gap-y-4">
      <fieldset>
        <legend className="pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          End state
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {END_STATES.map((s) => (
            <label
              key={s}
              title={END_STATE_NOTE[s]}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={filters.endStates.includes(s)}
                onChange={() => onChange({ endStates: toggle(filters.endStates, s) })}
                className="h-3.5 w-3.5 accent-[var(--accent-strong)]"
              />
              <span
                className="font-mono text-[11px]"
                style={{ color: `var(${END_STATE_TOKEN[s]})` }}
              >
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
  );
}
