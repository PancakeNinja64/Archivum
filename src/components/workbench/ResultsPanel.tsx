'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { DatasetSummary, Facets, Modality, Paginated, Platform } from '@/lib/types';
import { platformLabel } from '@/lib/utils';
import { COVERAGE_FLOORS, MODALITIES, PLATFORMS, SORTS, WORKSPACE_PAGE_SIZE, type Sort, type WorkspaceQuery } from '@/lib/workbench/query';
import { Glyph } from './Glyph';
import { FLOOR_LABEL, SORT_LABEL } from './labels';
import { splitRecordMeta } from './recordMeta';
import styles from './desk.module.css';

export type ResultsState =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; data: Paginated<DatasetSummary> };

interface ResultsPanelProps {
  query: WorkspaceQuery;
  results: ResultsState;
  facets: Facets | null;
  facetsFailed: boolean;
  origin: 'catalog' | 'illustrative';
  savedSlugs: ReadonlySet<string>;
  onPatch: (patch: Partial<WorkspaceQuery>, history: 'push' | 'replace') => void;
  onSelect: (slug: string) => void;
  onRetry: () => void;
  onRetryFacets: () => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

const PREVIEW = 8;
const SINGLE_COLUMN = '(max-width: 899px)';

interface ChipGroupProps {
  label: string;
  /** Facet values with counts; null while facets load. */
  facets: { value: string; count: number }[] | null;
  /** Fixed vocabulary shown even when facets have no count for it (platform, modality). */
  vocabulary?: readonly string[];
  selected: readonly string[];
  labels?: Record<string, string>;
  loading: boolean;
  onToggle: (value: string) => void;
}

/** One filter vocabulary as toggle chips: selected values always stay visible, long lists fold behind "more". */
function ChipGroup({ label, facets, vocabulary, selected, labels, loading, onToggle }: ChipGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const known = facets ?? [];
  const ordered = vocabulary
    ? vocabulary.map((value) => ({ value, count: known.find((item) => item.value === value)?.count })).filter((item) => !facets || item.count || selected.includes(item.value))
    : known.map((item) => ({ value: item.value, count: item.count as number | undefined }));
  const visible = expanded || vocabulary ? ordered : ordered.filter((item, index) => index < PREVIEW || selected.includes(item.value));
  const hidden = ordered.length - visible.length;
  const orphans = selected.filter((value) => !ordered.some((item) => item.value === value));
  return (
    <div className={styles.filterRow}>
      <span className={styles.eyebrow}>{label}</span>
      <div className={styles.chips} role="group" aria-label={label}>
        {loading && !vocabulary && Array.from({ length: 5 }, (_, i) => <span key={i} className={styles.skeleton} style={{ width: 64 + (i % 3) * 18, height: 32, borderRadius: 999 }} aria-hidden="true" />)}
        {visible.map((item) => <button key={item.value} type="button" className={styles.chip} aria-pressed={selected.includes(item.value)} onClick={() => onToggle(item.value)}>{labels?.[item.value] ?? item.value}{typeof item.count === 'number' && <small>{item.count}</small>}</button>)}
        {orphans.map((value) => <button key={value} type="button" className={styles.chip} aria-pressed onClick={() => onToggle(value)}>{labels?.[value] ?? value}<small>0</small></button>)}
        {hidden > 0 && <button type="button" className={`${styles.chip} ${styles.chipMore}`} onClick={() => setExpanded(true)}>{hidden} more</button>}
        {expanded && !vocabulary && ordered.length > PREVIEW && <button type="button" className={`${styles.chip} ${styles.chipMore}`} onClick={() => setExpanded(false)}>Fewer</button>}
      </div>
    </div>
  );
}

function SearchField({ value, onChange, inputRef }: { value: string; onChange: (value: string, immediate: boolean) => void; inputRef: React.RefObject<HTMLInputElement | null> }) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  // Back/forward or a shared link changed the URL: adopt it without a stale keystroke overwriting it.
  if (value !== seen) { setSeen(value); setDraft(value); }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const id = useId();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (timer.current) clearTimeout(timer.current);
    onChange(draft.trim(), true);
  };
  return (
    <form role="search" className={styles.search} onSubmit={submit}>
      <label htmlFor={id} className={styles.srOnly}>Search datasets, publishers, domains, or licences</label>
      <span className={styles.searchGlyph}><Glyph name="search" size={17} /></span>
      <input
        id={id}
        ref={inputRef}
        type="search"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        placeholder="Search records"
        value={draft}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => onChange(next.trim(), false), 300);
        }}
        onKeyDown={(event) => { if (event.key === 'Escape' && draft) { event.preventDefault(); setDraft(''); onChange('', true); } }}
      />
      {draft
        ? <button type="button" className={styles.searchClear} onClick={() => { if (timer.current) clearTimeout(timer.current); setDraft(''); onChange('', true); inputRef.current?.focus(); }} aria-label="Clear search">×</button>
        : <span className={styles.searchHint} aria-hidden="true">/</span>}
    </form>
  );
}

function CoverageCell({ record }: { record: DatasetSummary }) {
  const value = Math.min(100, Math.max(0, record.coverageTotal));
  return (
    <span className={styles.rowCoverage}>
      <strong aria-label={`Documentation coverage ${value} percent`}>{value}<small>%</small></strong>
      <span className={styles.meter} aria-hidden="true"><span style={{ width: `${value}%` }} /></span>
    </span>
  );
}

export function ResultsPanel({ query, results, facets, facetsFailed, origin, savedSlugs, onPatch, onSelect, onRetry, onRetryFacets, searchRef }: ResultsPanelProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const filtersRef = useRef<HTMLDetailsElement>(null);
  // Server markup ships the filters open; a phone folds them before first paint so results come first.
  useLayoutEffect(() => {
    if (filtersRef.current && window.matchMedia(SINGLE_COLUMN).matches) filtersRef.current.open = false;
  }, []);
  const activeFilters = query.platform.length + query.modality.length + query.domain.length + query.license.length + (query.commercial ? 1 : 0) + (query.min > 0 ? 1 : 0);
  const facetsLoading = !facets && !facetsFailed;

  const toggleIn = <T extends string>(current: readonly T[], value: T): T[] => (current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  const clearFilters = () => onPatch({ platform: [], modality: [], domain: [], license: [], commercial: false, min: 0 }, 'push');

  const onListKey = (event: KeyboardEvent<HTMLOListElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button[data-row]') ?? []);
    if (!buttons.length) return;
    const index = buttons.findIndex((button) => button === document.activeElement);
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : event.key === 'ArrowDown' ? Math.min(buttons.length - 1, index + 1) : Math.max(0, index - 1);
    buttons[next]?.focus();
  };

  const total = results.state === 'ready' ? results.data.total : 0;
  const pageCount = Math.max(1, Math.ceil(total / WORKSPACE_PAGE_SIZE));
  const rangeStart = (query.page - 1) * WORKSPACE_PAGE_SIZE + 1;
  const rangeEnd = results.state === 'ready' ? rangeStart + results.data.items.length - 1 : 0;

  return (
    <aside className={styles.results} aria-label="Catalog search and results">
      <div className={styles.resultsHead}>
        <div className={styles.resultsTitle}>
          <h1>Research desk</h1>
          <span className={`${styles.pill} ${origin === 'illustrative' ? styles.pillDemo : styles.pillLive}`}>{origin === 'illustrative' ? 'Illustrative catalog' : 'Live catalog'}</span>
        </div>
        <SearchField value={query.q} inputRef={searchRef} onChange={(value, immediate) => onPatch({ q: value }, immediate ? 'push' : 'replace')} />
      </div>

      <details ref={filtersRef} className={styles.filtersDetails}>
        <summary>Filters{activeFilters ? ` · ${activeFilters} active` : ''}<span aria-hidden="true"><span className={styles.foldOpen}>fold</span><span className={styles.foldClosed}>unfold</span> <Glyph name="chevron" size={12} /></span></summary>
        <div className={styles.filters}>
          {facetsFailed && <div className={styles.filterError}><span>Filter counts are unavailable.</span><button type="button" className={`${styles.buttonQuiet} ${styles.buttonSmall}`} onClick={onRetryFacets}>Retry</button></div>}
          {activeFilters > 0 && <div className={styles.filterHead}><span className={styles.mono}>{activeFilters} active</span><button type="button" onClick={clearFilters}>Reset filters</button></div>}
          <ChipGroup label="Published licence" facets={facets?.licenses ?? null} selected={query.license} loading={facetsLoading} onToggle={(value) => onPatch({ license: toggleIn(query.license, value) }, 'push')} />
          <div className={styles.filterRow}>
            <button type="button" className={`${styles.chip} ${styles.chipWide}`} aria-pressed={query.commercial} onClick={() => onPatch({ commercial: !query.commercial }, 'push')}>
              <Glyph name={query.commercial ? 'check' : 'plus'} size={12} />Commercial use permitted by lookup
            </button>
            <p className={styles.filterCaption}>Keeps records whose published identifier maps to permitted commercial use in a static SPDX table. A lookup, not a grant of permission: review the source terms.</p>
          </div>
          <ChipGroup label="Platform" facets={facets?.platforms ?? null} vocabulary={PLATFORMS} labels={platformLabel} selected={query.platform} loading={facetsLoading} onToggle={(value) => onPatch({ platform: toggleIn(query.platform, value as Platform) }, 'push')} />
          <ChipGroup label="Modality" facets={facets?.modalities ?? null} vocabulary={MODALITIES} selected={query.modality} loading={facetsLoading} onToggle={(value) => onPatch({ modality: toggleIn(query.modality, value as Modality) }, 'push')} />
          <ChipGroup label="Domain" facets={facets?.domains ?? null} selected={query.domain} loading={facetsLoading} onToggle={(value) => onPatch({ domain: toggleIn(query.domain, value) }, 'push')} />
          <div className={styles.filterRow}>
            <span className={styles.eyebrow}>Documentation coverage</span>
            <div className={styles.segmented} role="group" aria-label="Minimum documentation coverage">
              {COVERAGE_FLOORS.map((floor) => <button key={floor} type="button" aria-pressed={query.min === floor || (floor === 0 && !COVERAGE_FLOORS.includes(query.min as 0 | 40 | 75))} onClick={() => onPatch({ min: floor }, 'push')}>{FLOOR_LABEL[floor]}</button>)}
            </div>
            <p className={styles.filterCaption}>Share of provenance fields present at the source when checked. A documentation measure — not quality, safety, or permission to use.</p>
          </div>
          <div className={styles.sortRow}>
            <label className={styles.eyebrow} htmlFor="wb-sort">Order</label>
            <select id="wb-sort" className={styles.select} value={query.sort} onChange={(event) => onPatch({ sort: event.target.value as Sort }, 'push')}>
              {SORTS.map((sort) => <option key={sort} value={sort}>{SORT_LABEL[sort]}</option>)}
            </select>
          </div>
        </div>
      </details>

      <div className={styles.resultsMeta}>
        <p className={styles.mono} role="status" aria-live="polite" aria-atomic="true">
          {results.state === 'loading' && 'Searching the catalog…'}
          {results.state === 'error' && 'Results unavailable'}
          {results.state === 'ready' && (total ? `${total.toLocaleString('en-US')} ${total === 1 ? 'record' : 'records'}${pageCount > 1 ? ` · ${rangeStart}–${rangeEnd}` : ''}` : 'No matching records')}
        </p>
        {facets?.total ? <span className={styles.mono}>of {facets.total.toLocaleString('en-US')}</span> : null}
      </div>

      <div className={styles.list} aria-busy={results.state === 'loading'}>
        {results.state === 'loading' && (
          <div className={styles.listSkeleton} role="status" aria-label="Loading records">
            {Array.from({ length: 7 }, (_, i) => <div key={i}><span className={styles.skeleton} /><span className={styles.skeleton} /><span className={styles.skeleton} /></div>)}
          </div>
        )}
        {results.state === 'error' && (
          <div className={styles.listState} role="alert">
            <h2>The catalog did not answer.</h2>
            <p>{results.message} Your search and filters are kept in the link.</p>
            <button type="button" className={styles.buttonPrimary} onClick={onRetry}>Try again <Glyph name="arrow" /></button>
          </div>
        )}
        {results.state === 'ready' && results.data.items.length === 0 && (
          <div className={styles.listState}>
            <h2>No records match.</h2>
            <p>{query.q ? `Nothing in the catalog mentions “${query.q}” with these filters.` : 'Nothing matches these filters.'} Widen the search or clear a filter.</p>
            {(activeFilters > 0 || query.q) && <button type="button" className={styles.button} onClick={() => onPatch({ q: '', platform: [], modality: [], domain: [], license: [], commercial: false, min: 0 }, 'push')}>Clear search and filters</button>}
          </div>
        )}
        {results.state === 'ready' && results.data.items.length > 0 && (
          <ol ref={listRef} onKeyDown={onListKey} aria-label="Matching records">
            {results.data.items.map((record) => {
              const selected = query.dataset === record.slug;
              const meta = splitRecordMeta(record, { updated: true });
              return (
                <li key={record.slug} className={styles.row}>
                  <button type="button" data-row data-slug={record.slug} className={styles.rowButton} aria-current={selected ? 'true' : undefined} onClick={() => onSelect(record.slug)}>
                    <span className={styles.rowName}>{record.name}</span>
                    <span className={styles.rowMeta}>
                      <span className={styles.rowWho}>{meta.names.join(' · ')}</span>
                      <span className={styles.rowIds}>
                        {meta.identifiers.map((id) => <span key={id}>{id}</span>)}
                        {savedSlugs.has(record.slug) && <span className={styles.rowSaved}>saved</span>}
                      </span>
                    </span>
                    <CoverageCell record={record} />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {results.state === 'ready' && pageCount > 1 && (
        <nav className={styles.pager} aria-label="Result pages">
          <button type="button" className={`${styles.button} ${styles.buttonSmall}`} disabled={query.page <= 1} onClick={() => onPatch({ page: query.page - 1 }, 'push')}><Glyph name="back" size={14} /> Previous</button>
          <span className={styles.mono}>Page {query.page} of {pageCount}</span>
          <button type="button" className={`${styles.button} ${styles.buttonSmall}`} disabled={query.page >= pageCount} onClick={() => onPatch({ page: query.page + 1 }, 'push')}>Next <Glyph name="arrow" size={14} /></button>
        </nav>
      )}
    </aside>
  );
}
