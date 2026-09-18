'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Dataset, DatasetSummary } from '@/lib/types';
import { SHORTLIST_LIMIT, shortlistStore, type AddResult, type ShortlistState } from './shortlist';

/**
 * One hook, one store. Server render and the hydrating client render both
 * see the empty server snapshot, so markup never disagrees; the stored list
 * arrives in the first post-hydration pass.
 */
export function useShortlist(): ShortlistState & {
  add: (record: DatasetSummary | Dataset) => AddResult;
  remove: (slug: string) => void;
  clear: () => void;
  has: (slug: string) => boolean;
  full: boolean;
} {
  const state = useSyncExternalStore(shortlistStore.subscribe, shortlistStore.getSnapshot, shortlistStore.getServerSnapshot);
  const has = useCallback((slug: string) => state.items.some((item) => item.slug === slug), [state.items]);
  return {
    ...state,
    add: shortlistStore.add,
    remove: shortlistStore.remove,
    clear: shortlistStore.clear,
    has,
    full: state.items.length >= SHORTLIST_LIMIT,
  };
}
