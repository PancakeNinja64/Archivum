import type { COVERAGE_FLOORS, Sort } from '@/lib/workbench/query';

/** Human labels for the desk's URL vocabulary, shared by the filters and the idle guide. */
export const SORT_LABEL: Record<Sort, string> = {
  coverage: 'Documentation coverage',
  recent: 'Recently updated at source',
  size: 'Record count',
  name: 'Name',
};

/** How the list is ordered, phrased for a sentence. Coverage is named as what it is: a documentation measure. */
export const SORT_SENTENCE: Record<Sort, string> = {
  coverage: 'documentation coverage, highest first',
  recent: 'source update date, newest first',
  size: 'record count, largest first',
  name: 'name, A to Z',
};

export const FLOOR_LABEL: Record<(typeof COVERAGE_FLOORS)[number], string> = { 0: 'Any', 40: '≥ 40%', 75: '≥ 75%' };
