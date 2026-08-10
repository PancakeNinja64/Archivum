'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DELISTED_FIXTURE } from '@/lib/graveyard/fixture';
import { metricAvailable } from '@/lib/graveyard/terrain';
import type { DelistedFilters, EndState, MassMetric } from '@/lib/graveyard/types';
import type { Platform } from '@/lib/types';
import { DelistedControls } from './DelistedControls';
import { PlateArchive } from './PlateArchive';
import { RecordDetail } from './RecordDetail';
import { RecordList } from './RecordList';
import { TerrainField } from './TerrainField';
import { TerrainReadout } from './TerrainReadout';

type Mode = 'split' | 'cards';

/**
 * Delisted.
 *
 * Layout rule: nothing essential is below the fold. The terrain and the record
 * list share one viewport-height row, and the list scrolls inside itself. The
 * card opens in that same panel rather than on another page, so moving between
 * browsing and reading never costs a navigation or a scroll position.
 *
 * The page is scoped `dark`. The site does not put `.dark` on the document, so
 * without this the canvas reads the light palette from :root and draws a mesh
 * that is invisible against the dark panel.
 */
export function DelistedClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const [isNarrow, setIsNarrow] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const field = DELISTED_FIXTURE;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const mode: Mode = (sp.get('view') as Mode | null) === 'cards' ? 'cards' : 'split';
  const selected = sp.get('record');

  const filters: DelistedFilters = useMemo(
    () => ({
      query: sp.get('q') ?? '',
      endStates: (sp.get('end')?.split(',').filter(Boolean) ?? []) as EndState[],
      platforms: (sp.get('platform')?.split(',').filter(Boolean) ?? []) as Platform[],
      mass: (sp.get('mass') as MassMetric | null) ?? 'rows',
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
      const qs = next.toString();
      const url = qs ? `/delisted/?${qs}` : '/delisted/';
      if (push) router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [router, sp],
  );

  const onFilterChange = useCallback(
    (patch: Partial<DelistedFilters>) => {
      setParams({
        ...(patch.query !== undefined ? { q: patch.query || null } : {}),
        ...(patch.endStates !== undefined ? { end: patch.endStates.join(',') || null } : {}),
        ...(patch.platforms !== undefined ? { platform: patch.platforms.join(',') || null } : {}),
        ...(patch.mass !== undefined ? { mass: patch.mass } : {}),
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

  const visible = useMemo(() => new Set(matched.map((r) => r.slug)), [matched]);
  const dependentsAvailable = useMemo(
    () => metricAvailable(field.records, 'dependents'),
    [field.records],
  );

  const selectedRecord = useMemo(
    () => field.records.find((r) => r.slug === selected) ?? null,
    [field.records, selected],
  );
  const readoutRecord = useMemo(
    () => field.records.find((r) => r.slug === hovered) ?? null,
    [field.records, hovered],
  );

  const select = useCallback((slug: string) => setParams({ record: slug }, true), [setParams]);
  const clearSelection = useCallback(() => setParams({ record: null }, true), [setParams]);
  const setMode = useCallback(
    (m: Mode) => setParams({ view: m === 'split' ? null : m }),
    [setParams],
  );

  return (
    <div className="dark flex min-h-[calc(100svh-4rem)] flex-col bg-background text-foreground">
      {/* One control bar. Count, search, filters and the view switch all live
          here, so the working area starts immediately below it. */}
      <div className="sticky top-16 z-20 border-y border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-5 gap-y-3 px-6 py-3 md:px-8">
          <span className="tnum shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {matched.length === field.total
              ? `${field.total} delisted`
              : `${matched.length} of ${field.total}`}
          </span>

          <DelistedControls
            filters={filters}
            platforms={platforms}
            dependentsAvailable={dependentsAvailable}
            onChange={onFilterChange}
          />

          <div className="ml-auto flex shrink-0 items-center border border-border-strong">
            {(['split', 'cards'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                  mode === m
                    ? 'bg-surface-elevated text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'split' ? 'Field' : 'Cards'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === 'cards' ? (
        <div className="mx-auto w-full max-w-[1800px] flex-1 px-6 py-8 md:px-8">
          <PlateArchive records={matched} focusSlug={selected} onSelect={select} />
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-[1800px] flex-1 flex-col lg:h-[calc(100svh-8rem)] lg:flex-row">
          <div className="relative min-h-[46svh] flex-1 border-b border-border lg:min-h-0 lg:border-b-0 lg:border-r">
            <TerrainField
              records={field.records}
              visible={visible}
              mass={filters.mass}
              hovered={hovered ?? selected}
              onHover={setHovered}
              onSelect={select}
              interactive={!isNarrow}
            />
            {readoutRecord && !isNarrow && (
              <div className="pointer-events-none absolute bottom-5 left-5 z-10">
                <TerrainReadout record={readoutRecord} mass={filters.mass} />
              </div>
            )}
            {matched.length === 0 && (
              <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center font-mono text-[11px] text-muted-foreground">
                No records match. The field is flat.
              </p>
            )}
          </div>

          <aside className="flex w-full shrink-0 flex-col overflow-hidden lg:w-[26rem]">
            {selectedRecord ? (
              <RecordDetail record={selectedRecord} onBack={clearSelection} />
            ) : (
              <div className="flex-1 overflow-y-auto">
                <RecordList
                  records={matched}
                  mass={filters.mass}
                  hovered={hovered}
                  selected={selected}
                  onHover={setHovered}
                  onSelect={select}
                />
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
