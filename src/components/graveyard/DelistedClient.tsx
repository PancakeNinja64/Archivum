'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DELISTED_FIXTURE } from '@/lib/graveyard/fixture';
import { decayIndex } from '@/lib/graveyard/decay';
import type { CohortSize } from '@/lib/graveyard/board';
import {
  type DelistedFilters,
  type EndState,
} from '@/lib/graveyard/types';
import type { Platform } from '@/lib/types';
import { BoardLegend } from './BoardLegend';
import { DecayBoard } from './DecayBoard';
import { DecayPanel } from './DecayPanel';
import { DelistedControls } from './DelistedControls';
import { DelistedRegister } from './DelistedRegister';
import { DelistedSearch } from './DelistedSearch';

type View = 'board' | 'register';

const BAND = 'h-[52dvh] min-h-[340px] md:h-[62dvh]';

export function DelistedClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [isMobile, setIsMobile] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const bandRef = useRef<HTMLDivElement | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  const field = DELISTED_FIXTURE;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /* Small screens open on the register — a board you cannot hover is harder to
     read than a table. The board stays one tap away rather than being removed. */
  const requested = (sp.get('view') as View | null) ?? null;
  const view: View = requested ?? (isMobile ? 'register' : 'board');
  const focusSlug = sp.get('record');

  const filters: DelistedFilters = useMemo(
    () => ({
      query: sp.get('q') ?? '',
      endStates: (sp.get('end')?.split(',').filter(Boolean) ?? []) as EndState[],
      platforms: (sp.get('platform')?.split(',').filter(Boolean) ?? []) as Platform[],
    }),
    [sp],
  );

  const setParams = useCallback(
    (patch: Record<string, string | null>, push = false) => {
      const next = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === '') next.delete(k);
        else next.set(k, v);
      });
      const url = `${pathname}?${next.toString()}`;
      if (push) router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [router, pathname, sp],
  );

  const onFilterChange = useCallback(
    (patch: Partial<DelistedFilters>) => {
      setParams({
        ...(patch.query !== undefined ? { q: patch.query || null } : {}),
        ...(patch.endStates !== undefined ? { end: patch.endStates.join(',') || null } : {}),
        ...(patch.platforms !== undefined ? { platform: patch.platforms.join(',') || null } : {}),
      });
    },
    [setParams],
  );

  const platforms = useMemo(
    () => Array.from(new Set(field.records.map((r) => r.platform))).sort(),
    [field.records],
  );

  const matched = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return field.records.filter((r) => {
      if (q && !`${r.name} ${r.publisher}`.toLowerCase().includes(q)) return false;
      if (filters.endStates.length && !filters.endStates.includes(r.endState)) return false;
      if (filters.platforms.length && !filters.platforms.includes(r.platform)) return false;
      return true;
    });
  }, [field.records, filters]);

  /* Search results lead with the highest decay: if two records match, the one
     further from retrievable is the one more likely to be looked for. */
  const results = useMemo(
    () =>
      matched
        .map((r) => ({ r, d: decayIndex(r).index }))
        .sort((a, b) => b.d - a.d)
        .map((x) => x.r),
    [matched],
  );

  const visible = useMemo(() => new Set(matched.map((r) => r.slug)), [matched]);
  const focusRecord = useMemo(
    () => field.records.find((r) => r.slug === focusSlug) ?? null,
    [field.records, focusSlug],
  );

  const cohortSize: CohortSize = isMobile ? 'year' : 'half';

  /* Where the leader line terminates: the top-left corner of the panel. */
  useEffect(() => {
    const el = bandRef.current;
    if (!el || isMobile) return;
    const set = () => {
      const r = el.getBoundingClientRect();
      setAnchor({ x: r.width - 420, y: 24 });
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  const onSelect = useCallback(
    (slug: string | null) => {
      setParams({ record: slug, view: 'board' }, slug !== null);
    },
    [setParams],
  );

  const onSelectFromRegister = useCallback(
    (slug: string) => {
      setParams({ record: slug, view: 'board' }, true);
    },
    [setParams],
  );

  const closePanel = useCallback(() => setParams({ record: null }), [setParams]);

  const tabHref = (v: View) => {
    const next = new URLSearchParams(sp.toString());
    next.set('view', v);
    next.delete('record');
    return `${pathname}?${next.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
      <nav aria-label="Delisted views" className="mt-9 flex gap-7 border-b border-border">
        {(['board', 'register'] as View[]).map((v) => (
          <Link
            key={v}
            href={tabHref(v)}
            scroll={false}
            aria-current={view === v ? 'page' : undefined}
            className={`-mb-px border-b pb-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
              view === v
                ? 'border-accent-strong text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {v === 'board' ? 'Board' : 'Register'}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <DelistedSearch
          query={filters.query}
          matched={matched.length}
          total={field.total}
          results={results}
          onQuery={(q) => onFilterChange({ query: q })}
          onSelect={onSelectFromRegister}
        />
      </div>

      <div className="mt-7">
        <DelistedControls filters={filters} platforms={platforms} onChange={onFilterChange} />
      </div>

      {view === 'board' ? (
        <>
          <div ref={bandRef} className={`relative mt-10 w-full ${BAND}`}>
            <DecayBoard
              records={field.records}
              visible={visible}
              hovered={hovered}
              focused={focusSlug}
              cohortSize={cohortSize}
              interactive={!isMobile}
              panelAnchor={anchor}
              onHover={setHovered}
              onSelect={onSelect}
            />

            {hovered && !focusSlug && !isMobile && <HoverCard slug={hovered} />}

            {focusRecord && !isMobile && (
              <div className="absolute right-0 top-6 z-10 h-[calc(100%-1.5rem)] w-[420px]">
                <DecayPanel record={focusRecord} onClose={closePanel} />
              </div>
            )}

            {matched.length === 0 && (
              <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center font-mono text-[12px] text-muted-foreground">
                No delisted records match. Clear the search to see the full board.
              </p>
            )}
          </div>

          <div className="mt-10">
            <BoardLegend />
          </div>

          <div className="mt-14">
            <DelistedRegister
              records={matched}
              focusSlug={focusSlug}
              hovered={hovered}
              onHover={setHovered}
              onSelect={onSelectFromRegister}
            />
          </div>
        </>
      ) : (
        <div className="mt-10">
          <DelistedRegister
            records={matched}
            focusSlug={focusSlug}
            hovered={hovered}
            onHover={setHovered}
            onSelect={onSelectFromRegister}
          />
        </div>
      )}

      {focusRecord && isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-40 h-[72dvh] border-t border-border-strong bg-surface-elevated">
          <DecayPanel record={focusRecord} onClose={closePanel} />
        </div>
      )}
    </div>
  );
}

/** Minimal hover readout. The panel is where detail lives; this only identifies. */
function HoverCard({ slug }: { slug: string }) {
  const record = DELISTED_FIXTURE.records.find((r) => r.slug === slug);
  if (!record) return null;
  const result = decayIndex(record);
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-10 border border-border-strong bg-surface-elevated px-4 py-3">
      <p className="text-[13px] text-foreground">{record.name}</p>
      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{record.publisher}</p>
      <p className="tnum mt-2 font-mono text-[11px] text-foreground">
        Decay {result.index.toFixed(1)}
        <span className="ml-2 text-muted-foreground">
          {result.signalsUsed} of {result.signalsTotal} signals
        </span>
      </p>
    </div>
  );
}
