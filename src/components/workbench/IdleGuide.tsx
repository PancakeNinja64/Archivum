'use client';

import type { Facets } from '@/lib/types';
import { SHORTLIST_LIMIT } from '@/lib/workbench/shortlist';
import type { WorkspaceQuery } from '@/lib/workbench/query';
import { Glyph } from './Glyph';
import { startingPoints, type GuideResults } from './guide';
import desk from './desk.module.css';
import styles from './inspector.module.css';

interface IdleGuideProps {
  results: GuideResults;
  facets: Facets | null;
  query: WorkspaceQuery;
  onPatch: (patch: Partial<WorkspaceQuery>, history: 'push' | 'replace') => void;
  onSelect: (slug: string) => void;
  onFocusSearch: () => void;
}

/**
 * The evidence desk before a record is chosen. It explains the desk with what
 * is actually beside it — the count and order of the list, real domain
 * facets, the record listed first — and never ranks or recommends.
 */
export function IdleGuide({ results, facets, query, onPatch, onSelect, onFocusSearch }: IdleGuideProps) {
  const points = startingPoints(results, facets, query);
  const total = points.total;
  const first = points.first;

  return (
    <div className={styles.state} data-guide>
      <p className={desk.eyebrow}>Evidence desk</p>
      <h2>Open a record to read its evidence.</h2>
      <p>Everything Archivum retrieved about a record — licence evidence, twenty-eight documentation checks, observed history and structure — opens here, beside the list.</p>

      <ol className={styles.steps}>
        <li>
          <span className={styles.stepIndex} aria-hidden="true">1</span>
          <div>
            <strong>Find records</strong>
            <p role="status" aria-live="polite">
              {results.state === 'loading' && 'The list on the left is loading.'}
              {results.state === 'error' && 'The list on the left could not be loaded; it offers a retry.'}
              {results.state === 'ready' && total === 0 && (points.narrowed ? 'Nothing matches the current search and filters.' : 'The catalog has no records to list.')}
              {results.state === 'ready' && total !== null && total > 0 && <>{total.toLocaleString('en-US')} {total === 1 ? 'record is' : 'records are'} listed on the left{points.narrowed ? ' under the current search and filters' : ''}, ordered by {points.order}.</>}
            </p>
            <div className={styles.stepRow}>
              <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} onClick={onFocusSearch}><Glyph name="search" size={14} />Search</button>
              {points.domains.length > 0 && (
                <span className={styles.stepChips} role="group" aria-label="Narrow the list by domain">
                  <span>Narrow by domain</span>
                  {points.domains.map((domain) => (
                    <button key={domain.value} type="button" className={desk.chip} onClick={() => onPatch({ domain: [...query.domain, domain.value] }, 'push')}>{domain.value}<small>{domain.count}</small></button>
                  ))}
                </span>
              )}
            </div>
          </div>
        </li>
        <li>
          <span className={styles.stepIndex} aria-hidden="true">2</span>
          <div>
            <strong>Open one</strong>
            <p>Choose any row, or move through the list with <span className={styles.kbd}>↑</span> <span className={styles.kbd}>↓</span> and open with <span className={styles.kbd}>↵</span>.</p>
            {first && (
              <div className={styles.stepRow}>
                <button type="button" className={`${desk.button} ${desk.buttonSmall}`} onClick={() => onSelect(first.slug)}>Open the first listed record <Glyph name="arrow" size={14} /></button>
                <span className={styles.stepNote}>{first.name} — first under the current order, which is an ordering, not a recommendation.</span>
              </div>
            )}
            {results.state === 'ready' && total === 0 && points.narrowed && (
              <div className={styles.stepRow}>
                <button type="button" className={`${desk.button} ${desk.buttonSmall}`} onClick={() => onPatch({ q: '', platform: [], modality: [], domain: [], license: [], commercial: false, min: 0 }, 'push')}>Clear search and filters</button>
              </div>
            )}
          </div>
        </li>
        <li>
          <span className={styles.stepIndex} aria-hidden="true">3</span>
          <div>
            <strong>Save, compare, export</strong>
            <p>Save up to {SHORTLIST_LIMIT} records on this device. The tray at the foot of the desk keeps them for a side-by-side comparison and a Markdown or JSON research brief.</p>
          </div>
        </li>
      </ol>

      <dl className={styles.idleTabs} aria-label="What each record section holds">
        <div><dt>Overview</dt><dd>Publisher, licence, size, dates, and the four documentation sections.</dd></div>
        <div><dt>Evidence</dt><dd>Twenty-eight checks with method and outcome, licence context, recorded lineage.</dd></div>
        <div><dt>History</dt><dd>Observed versions with row changes and coverage at the time.</dd></div>
        <div><dt>Structure</dt><dd>Documented schema and the preview rows supplied with the record.</dd></div>
      </dl>
      <p className={styles.stepNote}><span className={styles.kbd}>/</span> focuses search from anywhere on the desk.</p>
    </div>
  );
}
