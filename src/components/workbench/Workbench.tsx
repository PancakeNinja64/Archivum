'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dataMode, getDataset, getDatasets, getFacets } from '@/lib/api/client';
import type { Dataset, DatasetFilters, Facets } from '@/lib/types';
import {
  parseWorkspaceQuery, patchWorkspaceQuery, resultsKey, serializeWorkspaceQuery, toFilters,
  type InspectorTab, type WorkspaceQuery,
} from '@/lib/workbench/query';
import { useShortlist } from '@/lib/workbench/useShortlist';
import { Glyph } from './Glyph';
import { IdleGuide } from './IdleGuide';
import { Inspector, type InspectorState } from './Inspector';
import { ResultsPanel, type ResultsState } from './ResultsPanel';
import { ShortlistTray } from './ShortlistTray';
import styles from './desk.module.css';

type RecordEntry = { state: 'ready'; record: Dataset } | { state: 'absent' } | { state: 'error'; message: string };
const RECORD_CACHE = 32;
const SINGLE_COLUMN = '(max-width: 899px)';

const describeError = (error: unknown) => (error instanceof Error && error.message ? error.message : 'The catalog request failed.');

/** Read the live URL rather than a closure, so a debounced keystroke never resurrects an older state. */
function currentQuery(): WorkspaceQuery {
  return parseWorkspaceQuery(new URLSearchParams(window.location.search));
}

export function Workbench() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const query = useMemo(() => parseWorkspaceQuery(new URLSearchParams(queryString)), [queryString]);
  const shortlist = useShortlist();
  const searchRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const evidenceRef = useRef<HTMLElement>(null);
  const returnSlug = useRef<string | null>(null);

  /* ---------- URL state: pushState for decisions, replaceState for keystrokes ---------- */

  const patch = useCallback((changes: Partial<WorkspaceQuery>, history: 'push' | 'replace') => {
    const next = patchWorkspaceQuery(currentQuery(), changes);
    const serialized = serializeWorkspaceQuery(next);
    const url = `${window.location.pathname}${serialized ? `?${serialized}` : ''}`;
    if (url === `${window.location.pathname}${window.location.search}`) return;
    if (history === 'push') window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
  }, []);

  /* ---------- Facets ---------- */

  const [facets, setFacets] = useState<{ data: Facets | null; failed: boolean; attempt: number }>({ data: null, failed: false, attempt: 0 });
  useEffect(() => {
    let current = true;
    getFacets()
      .then((data) => { if (current) setFacets((prev) => ({ ...prev, data, failed: false })); })
      .catch(() => { if (current) setFacets((prev) => ({ ...prev, failed: true })); });
    return () => { current = false; };
  }, [facets.attempt]);

  /* ---------- Results, keyed by the result-changing part of the URL ---------- */

  const filtersJson = JSON.stringify(toFilters(query));
  const [resultsAttempt, setResultsAttempt] = useState(0);
  const requestKey = `${resultsKey(query)}#${resultsAttempt}`;
  const [results, setResults] = useState<{ key: string; state: ResultsState }>({ key: '', state: { state: 'loading' } });
  useEffect(() => {
    let current = true;
    const filters: DatasetFilters = JSON.parse(filtersJson);
    getDatasets(filters)
      .then((data) => {
        if (!current) return;
        const lastPage = Math.max(1, Math.ceil(data.total / (filters.pageSize ?? 24)));
        if ((filters.page ?? 1) > lastPage) { patch({ page: lastPage }, 'replace'); return; }
        setResults({ key: requestKey, state: { state: 'ready', data } });
      })
      .catch((error: unknown) => { if (current) setResults({ key: requestKey, state: { state: 'error', message: describeError(error) } }); });
    return () => { current = false; };
  }, [filtersJson, requestKey, patch]);
  const resultsState: ResultsState = results.key === requestKey ? results.state : { state: 'loading' };

  /* ---------- Selected record: a small cache, fetched once per slug ---------- */

  const [records, setRecords] = useState<Map<string, RecordEntry>>(() => new Map());
  const inflight = useRef(new Set<string>());
  const slug = query.dataset;
  useEffect(() => {
    if (!slug || records.has(slug) || inflight.current.has(slug)) return;
    inflight.current.add(slug);
    getDataset(slug)
      .then((record): RecordEntry => (record ? { state: 'ready', record } : { state: 'absent' }))
      .catch((error: unknown): RecordEntry => ({ state: 'error', message: describeError(error) }))
      .then((entry) => {
        inflight.current.delete(slug);
        setRecords((prev) => {
          const next = new Map(prev);
          next.delete(slug);
          next.set(slug, entry);
          while (next.size > RECORD_CACHE) { const oldest = next.keys().next().value; if (oldest === undefined) break; next.delete(oldest); }
          return next;
        });
      });
  }, [slug, records]);
  const retryRecord = useCallback(() => { if (slug) setRecords((prev) => { const next = new Map(prev); next.delete(slug); return next; }); }, [slug]);

  const inspector: InspectorState | null = !slug
    ? null
    : (() => {
      const entry = records.get(slug);
      if (!entry) return { state: 'loading', slug };
      if (entry.state === 'ready') return { state: 'ready', record: entry.record };
      if (entry.state === 'absent') return { state: 'absent', slug };
      return { state: 'error', slug, message: entry.message };
    })();
  const readySlug = inspector?.state === 'ready' ? inspector.record.slug : null;
  const readyName = inspector?.state === 'ready' ? inspector.record.name : null;

  /* ---------- Focus, scroll, and title follow the selection ---------- */

  useEffect(() => {
    if (!readySlug) return;
    evidenceRef.current?.scrollTo({ top: 0 });
    if (window.matchMedia(SINGLE_COLUMN).matches) {
      window.scrollTo({ top: 0 });
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [readySlug]);

  useEffect(() => {
    if (slug || !returnSlug.current) return;
    const target = document.querySelector<HTMLButtonElement>(`button[data-row][data-slug="${CSS.escape(returnSlug.current)}"]`);
    returnSlug.current = null;
    target?.focus({ preventScroll: false });
  }, [slug]);

  useEffect(() => {
    const previous = document.title;
    document.title = readyName ? `${readyName} · Research desk · Archivum` : query.q ? `“${query.q}” · Research desk · Archivum` : 'Research desk · Archivum';
    return () => { document.title = previous; };
  }, [readyName, query.q]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return;
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const select = useCallback((next: string) => patch({ dataset: next }, 'push'), [patch]);
  const clearSelection = useCallback(() => { returnSlug.current = currentQuery().dataset; patch({ dataset: null }, 'push'); }, [patch]);
  const setTab = useCallback((tab: InspectorTab) => patch({ tab }, 'replace'), [patch]);
  const savedSlugs = useMemo(() => new Set(shortlist.items.map((item) => item.slug)), [shortlist.items]);

  return (
    <div className={styles.desk} data-mode={slug ? 'record' : 'list'}>
      <div className={styles.body}>
        <ResultsPanel
          query={query}
          results={resultsState}
          facets={facets.data}
          facetsFailed={facets.failed}
          origin={dataMode}
          savedSlugs={savedSlugs}
          onPatch={patch}
          onSelect={select}
          onRetry={() => setResultsAttempt((n) => n + 1)}
          onRetryFacets={() => setFacets((prev) => ({ ...prev, failed: false, attempt: prev.attempt + 1 }))}
          searchRef={searchRef}
        />
        <section ref={evidenceRef} className={styles.evidence} aria-label="Evidence desk">
          {slug && (
            <div className={styles.mobileBar}>
              <button type="button" className={`${styles.buttonQuiet} ${styles.buttonSmall}`} onClick={clearSelection}><Glyph name="back" size={15} />Back to results</button>
              <span className={styles.mono}>{resultsState.state === 'ready' ? `${resultsState.data.total.toLocaleString('en-US')} ${resultsState.data.total === 1 ? 'record' : 'records'}` : ''}</span>
            </div>
          )}
          {inspector ? (
            <Inspector
              state={inspector}
              tab={query.tab}
              origin={dataMode}
              shortlist={shortlist}
              onTab={setTab}
              onRetry={retryRecord}
              onClear={clearSelection}
              headingRef={headingRef}
            />
          ) : (
            <IdleGuide
              results={resultsState}
              facets={facets.data}
              query={query}
              onPatch={patch}
              onSelect={select}
              onFocusSearch={() => { searchRef.current?.focus(); searchRef.current?.select(); }}
            />
          )}
        </section>
      </div>
      <ShortlistTray currentSlug={slug} surface="workspace" />
    </div>
  );
}
