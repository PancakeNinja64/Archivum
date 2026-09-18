import { compareHref } from '@/lib/workbench/query';
import { SHORTLIST_LIMIT } from '@/lib/workbench/shortlist';

export type TraySurface = 'workspace' | 'compare' | 'collections';

/**
 * The tray has three shapes. While the store is being read it says so; with
 * nothing saved it folds to one compact line; with records it expands to the
 * chips and the controls that make a shortlist useful.
 */
export type TrayMode = 'reading' | 'empty' | 'filled';

export function trayMode(state: { hydrated: boolean; items: readonly unknown[] }): TrayMode {
  if (!state.hydrated) return 'reading';
  return state.items.length === 0 ? 'empty' : 'filled';
}

export type TrayCompare =
  | { kind: 'hidden' }
  | { kind: 'disabled'; reason: string }
  | { kind: 'link'; href: string; count: number };

/** The comparison desk never links to itself; elsewhere Compare needs two records. */
export function trayCompare(slugs: readonly string[], surface: TraySurface): TrayCompare {
  if (surface === 'compare') return { kind: 'hidden' };
  if (slugs.length < 2) return { kind: 'disabled', reason: slugs.length === 0 ? 'Save two records to compare them' : 'Save one more record to compare' };
  return { kind: 'link', href: compareHref(slugs), count: slugs.length };
}

export function trayCountLabel(mode: TrayMode, count: number, limit = SHORTLIST_LIMIT): string {
  return mode === 'reading' ? 'reading…' : `${count} of ${limit}`;
}

/** One sentence for the compact empty line: how to fill the tray, and what it is for. */
export function trayEmptyHint(surface: TraySurface): string {
  return surface === 'workspace'
    ? 'Nothing saved yet. Open a record and choose “Save on this device” to compare or export it.'
    : 'Nothing saved yet. Save records from the workspace to compare or export them.';
}
