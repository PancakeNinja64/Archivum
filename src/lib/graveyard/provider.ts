import { DELISTED_FIXTURE } from './fixture';
import type { DelistedRecord } from './types';

export type PreservedRecordsResult =
  | { status: 'illustrative' | 'catalog'; records: DelistedRecord[]; asOf: string }
  | { status: 'unavailable' | 'error'; message: string };

/** Stable demonstration clock, not a fresh verification timestamp. */
export const DELISTED_EXAMPLE_AS_OF = '2026-09-10T00:00:00.000Z';

/** Explicit availability boundary. A live historical reader is not implemented. */
export async function getPreservedRecords(
  source = process.env.NEXT_PUBLIC_DATA_SOURCE,
  demo = false,
): Promise<PreservedRecordsResult> {
  if (source === 'supabase' && !demo) {
    return { status: 'unavailable', message: 'Preserved records are not available in this catalog yet.' };
  }
  return { status: 'illustrative', records: DELISTED_FIXTURE.records, asOf: DELISTED_EXAMPLE_AS_OF };
}
