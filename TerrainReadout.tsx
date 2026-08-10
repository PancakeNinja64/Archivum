'use client';

import {
  END_STATE_LABEL,
  END_STATE_TOKEN,
  goneFor,
  type DelistedRecord,
  type MassMetric,
} from '@/lib/graveyard/types';
import { massLabel } from './RecordList';

/**
 * Hover readout, pinned to a corner of the terrain.
 *
 * Deliberately small: the full record is one click away in the panel beside it,
 * so this only has to answer "which well is that". A large card here would
 * cover the terrain it is describing.
 */
export function TerrainReadout({
  record,
  mass,
}: {
  record: DelistedRecord;
  mass: MassMetric;
}) {
  return (
    <div className="border border-border-strong bg-surface/95 px-4 py-3">
      <p className="font-mono text-[12px] text-foreground">{record.name}</p>
      <p className="mt-1 flex items-center gap-2.5 font-mono text-[10px] text-muted-foreground">
        <span style={{ color: `var(${END_STATE_TOKEN[record.endState]})` }}>
          {END_STATE_LABEL[record.endState]}
        </span>
        <span>·</span>
        <span>{record.publisher}</span>
      </p>
      <p className="tnum mt-2 font-mono text-[10px] text-muted-foreground">
        {massLabel(record, mass)} · gone {goneFor(record.lastConfirmed)}
      </p>
    </div>
  );
}
