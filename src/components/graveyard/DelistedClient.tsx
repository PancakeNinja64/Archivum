'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DELISTED_FIXTURE } from '@/lib/graveyard/fixture';
import { metricAvailable } from '@/lib/graveyard/terrain';
import {
  type DelistedFilters,
  type EndState,
  type MassMetric,
} from '@/lib/graveyard/types';
import type { Platform } from '@/lib/types';
import { DelistedControls } from './DelistedControls';
import { DelistedRegister } from './DelistedRegister';
import { PlateArchive } from './PlateArchive';
import { TerrainCard } from './TerrainCard';
import { TerrainField } from './TerrainField';

type View = 'field' | 'records';

const BAND = 'h-[40dvh] md:h-[54dvh]';

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
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /* A terrain you cannot hover is decoration, so small screens open on the
     plates instead. */
  const requested = (sp.get('view') as View | null) ?? null;
  const view: View = requested ?? (isMobile ? 'records' : 'field');
  const focusSlug = sp.get('record');

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
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === '') next.delete(k);
        else next.set(k, v);
      });
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, sp],
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
  const hoveredRecord = useMemo(
    () => field.records.find((r) => r.slug === hovered) ?? null,
    [field.records, hovered],
  );
  const dependentsAvailable = useMemo(
    () => metricAvailable(field.records, 'dependents'),
    [field.records],
  );

  /* Where the leader line terminates: the top-left corner of the pinned card. */
  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const set = () => {
      const r = el.getBoundingClientRect();
      setAnchor({ x: r.width - 24 - 336, y: 40 });
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onSelect = useCallback(
    (slug: string) => {
      const next = new URLSearchParams(sp.toString());
      next.set('view', 'records');
      next.set('record', slug);
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, sp],
  );

  const tabHref = (v: View) => {
    const next = new URLSearchParams(sp.toString());
    next.set('view', v);
    next.delete('record');
    return `${pathname}?${next.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 md:px-8">

      <nav aria-label="Delisted views" className="mt-9 flex gap-7 border-b border-border">
        {(['field', 'records'] as View[]).map((v) => (
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
            {v === 'field' ? 'Field' : 'Records'}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <DelistedControls
          filters={filters}
          platforms={platforms}
          matched={matched.length}
          total={field.total}
          dependentsAvailable={dependentsAvailable}
          onChange={onFilterChange}
        />
      </div>

      {view === 'field' ? (
        <>
          <div ref={bandRef} className={`relative mt-10 w-full ${BAND}`}>
            <TerrainField
              records={field.records}
              visible={visible}
              mass={filters.mass}
              hovered={hovered}
              onHover={setHovered}
              onSelect={onSelect}
              cardAnchor={anchor}
              interactive={!isMobile}
            />
            {hoveredRecord && !isMobile && (
              <div className="pointer-events-none absolute right-6 top-10 z-10">
                <TerrainCard record={hoveredRecord} />
              </div>
            )}
            {matched.length === 0 && (
              <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center font-mono text-[12px] text-muted-foreground">
                No delisted records match. Flat space.
              </p>
            )}
          </div>

          <div className="mt-12">
            <DelistedRegister
              records={matched}
              mass={filters.mass}
              hovered={hovered}
              onHover={setHovered}
            />
          </div>
        </>
      ) : (
        <div className="mt-10">
          <PlateArchive records={matched} focusSlug={focusSlug} />
        </div>
      )}
    </div>
  );
}
