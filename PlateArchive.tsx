'use client';

import { useEffect, useRef } from 'react';
import { Plate } from './Plate';
import { daysSince, type DelistedRecord } from '@/lib/graveyard/types';

/** The plate archive. Freshest light first; the grid fades as it goes back. */
export function PlateArchive({
  records,
  focusSlug,
  onSelect,
}: {
  records: DelistedRecord[];
  focusSlug: string | null;
  onSelect?: (slug: string) => void;
}) {
  const scrolledFor = useRef<string | null>(null);

  useEffect(() => {
    if (!focusSlug || scrolledFor.current === focusSlug) return;
    const el = document.getElementById(`record-${focusSlug}`);
    if (!el) return;
    scrolledFor.current = focusSlug;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusSlug]);

  if (records.length === 0) {
    return (
      <p className="py-16 font-mono text-[12px] text-muted-foreground">
        No records match. The field is flat.
      </p>
    );
  }

  const ordered = [...records].sort(
    (a, b) => daysSince(a.lastConfirmed) - daysSince(b.lastConfirmed),
  );

  return (
    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
      {ordered.map((r) => (
        <Plate key={r.slug} record={r} focused={focusSlug === r.slug} onSelect={onSelect} />
      ))}
    </div>
  );
}
