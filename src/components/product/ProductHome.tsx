'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getDataset } from '@/lib/api/client';
import type { Dataset, DatasetSummary } from '@/lib/types';
import type { DelistedRecord } from '@/lib/graveyard/types';
import { AtlasStage } from './AtlasStage';
import { PreservationScene } from './PreservationScene';
import { RecordSurface } from './RecordSurface';
import { Resolution } from './Resolution';
import { useStageMode } from './useStageMode';

interface ProductHomeProps {
  records: DatasetSummary[];
  /** Chosen on the server so the first paint already carries a complete record. */
  featured: Dataset | null;
  featuredSummary: DatasetSummary | null;
  preserved: DelistedRecord | null;
  total: number | null;
  mode: 'catalog' | 'illustrative';
  unavailable: boolean;
}

/**
 * The homepage: a living atlas of evidence. One selected record flows through
 * every chapter; choosing another point re-resolves the whole page to it.
 */
export function ProductHome({ records, featured, featuredSummary, preserved, total, mode, unavailable }: ProductHomeProps) {
  const stageMode = useStageMode();
  const [selectedSlug, setSelectedSlug] = useState(featuredSummary?.slug ?? records[0]?.slug ?? '');
  const cache = useRef(new Map<string, Dataset>(featured ? [[featured.slug, featured]] : []));
  const [full, setFull] = useState<Dataset | null>(featured);
  const selected = records.find((r) => r.slug === selectedSlug) ?? featuredSummary ?? records[0] ?? null;

  const select = useCallback((slug: string) => setSelectedSlug(slug), []);

  // Full records load lazily once a point is chosen; the summary carries the plate until they arrive.
  useEffect(() => {
    const hit = cache.current.get(selectedSlug);
    if (hit) { setFull(hit); return; }
    setFull(null);
    let current = true;
    getDataset(selectedSlug)
      .then((record) => {
        if (!current || !record) return;
        cache.current.set(record.slug, record);
        setFull(record);
      })
      .catch(() => { /* The plate keeps the summary facts; deep facts stay pending. */ });
    return () => { current = false; };
  }, [selectedSlug]);

  return (
    <div>
      <AtlasStage records={records} selected={selected} full={full} onSelect={select} mode={stageMode} catalogMode={mode} total={total} unavailable={unavailable} />
      <RecordSurface summary={selected} full={full} catalogMode={mode} unavailable={unavailable} />
      {preserved && <PreservationScene record={preserved} />}
      <Resolution total={total} catalogMode={mode} />
    </div>
  );
}
