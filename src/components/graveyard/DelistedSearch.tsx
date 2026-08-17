'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { decayIndex } from '@/lib/graveyard/decay';
import {
  END_STATE_LABEL,
  END_STATE_TOKEN,
  type DelistedRecord,
} from '@/lib/graveyard/types';

/**
 * Find a record.
 *
 * Bottom-ruled rather than boxed: the board is the loud thing on this page and
 * the search should sit under it like a caption, not compete with it.
 */
export function DelistedSearch({
  query,
  matched,
  total,
  results,
  onQuery,
  onSelect,
}: {
  query: string;
  matched: number;
  total: number;
  /** Already filtered and ordered by the client. */
  results: DelistedRecord[];
  onQuery: (next: string) => void;
  onSelect: (slug: string) => void;
}) {
  const [draft, setDraft] = useState(query);
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setDraft(query);
  }
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (draft !== query) onQuery(draft);
    }, 180);
    return () => clearTimeout(t);
  }, [draft, query, onQuery]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const shown = useMemo(() => results.slice(0, 8), [results]);
  const decays = useMemo(
    () => new Map(shown.map((r) => [r.slug, decayIndex(r).index])),
    [shown],
  );

  const commit = (slug: string) => {
    setOpen(false);
    onSelect(slug);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-lg">
      <div className="flex items-center gap-3 border-b border-border-strong pb-2">
        <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden className="shrink-0 text-muted-foreground">
          <circle cx="5.5" cy="5.5" r="4.5" fill="none" stroke="currentColor" strokeWidth="1" />
          <line x1="9" y1="9" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1" />
        </svg>
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(shown.length - 1, i + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((i) => Math.max(0, i - 1));
            } else if (e.key === 'Enter' && open && shown[active]) {
              e.preventDefault();
              commit(shown[active].slug);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Find a record"
          aria-label="Find a delisted record"
          aria-expanded={open}
          aria-controls="delisted-results"
          role="combobox"
          className="w-full bg-transparent font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <span className="tnum shrink-0 font-mono text-[10px] text-muted-foreground">
          {matched} of {total}
        </span>
      </div>

      {open && draft.trim() !== '' && (
        <div
          id="delisted-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 border border-border-strong bg-surface-elevated shadow-sm"
        >
          {shown.length === 0 ? (
            <p className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
              No delisted records match. Clear the search to see the full board.
            </p>
          ) : (
            shown.map((r, i) => (
              <button
                key={r.slug}
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => commit(r.slug)}
                className={`flex w-full items-baseline gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === active ? 'bg-muted' : ''
                }`}
              >
                <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{r.name}</span>
                <span className="hidden shrink-0 truncate font-mono text-[10px] text-muted-foreground sm:block">
                  {r.publisher}
                </span>
                <span
                  className="shrink-0 font-mono text-[10px]"
                  style={{ color: `var(${END_STATE_TOKEN[r.endState]})` }}
                >
                  {END_STATE_LABEL[r.endState]}
                </span>
                <span className="tnum shrink-0 font-mono text-[11px] text-foreground">
                  {(decays.get(r.slug) ?? 0).toFixed(0)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
