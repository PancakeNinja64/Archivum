'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { PreservedRecordsResult } from '@/lib/graveyard/provider';
import type { DelistedRecord, EndState } from '@/lib/graveyard/types';
import type { Platform } from '@/lib/types';
import {
  END_STATE_LABEL,
  END_STATE_NOTE,
  END_STATE_TOKEN,
  END_STATES,
  decodeChecks,
} from '@/lib/graveyard/types';
import {
  COVERAGE_CHECKS,
  COVERAGE_SECTIONS,
  type CoverageSectionKey,
} from '@/lib/coverage/rules';
import { PLATFORM_LABELS, safeSourceUrl } from '@/lib/graveyard/register';
import {
  LEDGER_BATCH,
  buildLedgerUrl,
  buildBrief,
  filterRecords,
  fmtDate,
  formatRows,
  rangeLabel,
  readLedgerUrl,
  requiredVisibleCount,
  resolveSelection,
  spanDays,
  spanLabel,
  stepIndex,
  type LedgerUrlState,
  type StepKey,
} from './helpers';
import { ArchiveField } from './ArchiveField';
import styles from './Chronicle.module.css';

interface ChronicleProps {
  data: PreservedRecordsResult;
  initialQuery: string;
  initialEndState: EndState | '';
  initialPlatform: Platform | '';
  initialSelected: string;
  isDemo: boolean;
}

const PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];
const DOSSIER_ID = 'delisted-dossier';
const LEDGER_ID = 'delisted-ledger';
const STEP_KEYS: StepKey[] = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

const isPhoneLayout = () => window.matchMedia('(max-width: 959px)').matches;

export function ChronicleClient({
  data,
  initialQuery,
  initialEndState,
  initialPlatform,
  initialSelected,
  isDemo,
}: ChronicleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const available = data.status === 'illustrative' || data.status === 'catalog';
  const allRecords = useMemo(
    () => ('records' in data ? data.records : []),
    [data],
  );
  const asOf = 'asOf' in data ? data.asOf : '';
  const mode: 'illustrative' | 'catalog' = data.status === 'catalog' ? 'catalog' : 'illustrative';

  const [query, setQuery] = useState(initialQuery);
  const [endState, setEndState] = useState<EndState | ''>(initialEndState);
  const [platform, setPlatform] = useState<Platform | ''>(initialPlatform);
  const [selectedSlug, setSelectedSlug] = useState(initialSelected);
  /** How many filtered records are rendered in the register. Resets whenever the filters change. */
  const [visibleCount, setVisibleCount] = useState(LEDGER_BATCH);

  const listRef = useRef<HTMLDivElement>(null);
  const dossierRef = useRef<HTMLDivElement>(null);
  const ledgerHeadingRef = useRef<HTMLHeadingElement>(null);
  /** Row to refocus when the dossier closes, so keyboard users land where they left. */
  const returnFocus = useRef('');
  /** Row to focus after the next render (keyboard stepping across a batch boundary, "Show more"). */
  const pendingRowFocus = useRef('');
  /** Set by "Inspect preserved evidence": scroll to and focus the dossier once it has rendered. */
  const pendingInspect = useRef(false);
  const initialScrollDone = useRef(false);

  const filtered = useMemo(
    () => filterRecords(allRecords, query, endState, platform),
    [allRecords, query, endState, platform],
  );

  /*
   * Selection resolves against the whole archive, not the filtered slice, so a
   * direct URL or a field choice outside the current filters still opens the
   * right dossier. `selectedIndex` tells whether it sits in the current view.
   */
  const { record: selected, index: selectedIndex } = useMemo(
    () => resolveSelection(allRecords, filtered, selectedSlug),
    [allRecords, filtered, selectedSlug],
  );
  const selectedInView = selectedIndex >= 0;

  /* The batch always extends far enough to include the selected record. */
  const shownCount = Math.min(
    filtered.length,
    Math.max(visibleCount, requiredVisibleCount(selectedIndex)),
  );
  const visibleRecords = useMemo(() => filtered.slice(0, shownCount), [filtered, shownCount]);
  const remaining = filtered.length - shownCount;

  const hasFilters = query !== '' || endState !== '' || platform !== '';
  const fieldRecords = filtered.length > 0 ? filtered : allRecords;

  /* ---------- URL sync ---------- */

  const urlFor = useCallback(
    (state: LedgerUrlState, hash = '') => buildLedgerUrl(pathname, state, isDemo, hash),
    [pathname, isDemo],
  );

  const syncUrl = useCallback(
    (state: LedgerUrlState, replace: boolean) => {
      const url = urlFor(state);
      if (replace) window.history.replaceState(null, '', url);
      else window.history.pushState(null, '', url);
    },
    [urlFor],
  );

  useEffect(() => {
    function onPop() {
      const state = readLedgerUrl(window.location.search);
      setQuery(state.query);
      setEndState(state.endState);
      setPlatform(state.platform);
      setSelectedSlug(state.selected);
      setVisibleCount(LEDGER_BATCH);
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* ---------- Selection ---------- */

  const selectRecord = useCallback(
    (slug: string, toggle = true) => {
      const next = toggle && slug === selectedSlug ? '' : slug;
      if (!next) {
        returnFocus.current = slug;
        /* Keep the row on screen after the dossier closes, even past the batch. */
        setVisibleCount((c) => Math.max(c, requiredVisibleCount(selectedIndex)));
      }
      setSelectedSlug(next);
      syncUrl({ query, endState, platform, selected: next }, false);
    },
    [selectedSlug, selectedIndex, query, endState, platform, syncUrl],
  );

  const clearSelection = useCallback(() => {
    returnFocus.current = selectedSlug;
    setVisibleCount((c) => Math.max(c, requiredVisibleCount(selectedIndex)));
    setSelectedSlug('');
    syncUrl({ query, endState, platform, selected: '' }, false);
  }, [query, endState, platform, selectedSlug, selectedIndex, syncUrl]);

  /**
   * Choosing from the spatial field keeps the filters when the record is in the
   * filtered view, and only clears them when it is not (the field falls back to
   * the whole archive when nothing matches).
   */
  const selectFromField = useCallback(
    (slug: string) => {
      const inView = filtered.some((r) => r.slug === slug);
      const nextQuery = inView ? query : '';
      const nextEndState = inView ? endState : '';
      const nextPlatform = inView ? platform : '';
      if (!inView) {
        setQuery('');
        setEndState('');
        setPlatform('');
        setVisibleCount(LEDGER_BATCH);
      }
      setSelectedSlug(slug);
      syncUrl({ query: nextQuery, endState: nextEndState, platform: nextPlatform, selected: slug }, false);
    },
    [filtered, query, endState, platform, syncUrl],
  );

  /** Record-specific: select (if needed) and bring the dossier into view with focus. */
  const inspectFromField = useCallback(
    (slug: string) => {
      pendingInspect.current = true;
      if (slug !== selectedSlug) selectFromField(slug);
      else {
        dossierRef.current?.scrollIntoView({ block: 'start' });
        dossierRef.current?.focus({ preventScroll: true });
        pendingInspect.current = false;
      }
    },
    [selectedSlug, selectFromField],
  );

  const inspectHref = useCallback(
    (slug: string) => {
      const inView = filtered.some((r) => r.slug === slug);
      return urlFor(
        inView
          ? { query, endState, platform, selected: slug }
          : { query: '', endState: '', platform: '', selected: slug },
        DOSSIER_ID,
      );
    },
    [filtered, query, endState, platform, urlFor],
  );

  /** General navigation: land on the register heading without touching the selection. */
  const enterLedger = useCallback(() => {
    ledgerHeadingRef.current?.scrollIntoView({ block: 'start' });
    ledgerHeadingRef.current?.focus({ preventScroll: true });
  }, []);

  /* Focus management after selection changes. */
  useEffect(() => {
    if (selected && pendingInspect.current) {
      pendingInspect.current = false;
      dossierRef.current?.scrollIntoView({ block: 'start' });
      dossierRef.current?.focus({ preventScroll: true });
      return;
    }
    if (selected && !initialScrollDone.current && initialSelected) {
      /* A direct record URL lands on the dossier rather than the top of the field. */
      initialScrollDone.current = true;
      dossierRef.current?.scrollIntoView({ block: 'start' });
      dossierRef.current?.focus({ preventScroll: true });
      return;
    }
    initialScrollDone.current = true;
    if (selected && isPhoneLayout()) {
      /* The list is hidden on phones while a dossier is open; move focus with it. */
      dossierRef.current?.focus({ preventScroll: true });
      dossierRef.current?.scrollIntoView({ block: 'start' });
    } else if (!selected && returnFocus.current) {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-slug="${CSS.escape(returnFocus.current)}"]`)
        ?.focus();
      returnFocus.current = '';
    }
  }, [selected, initialSelected]);

  /* Row focus deferred until the row exists (keyboard stepping past the batch, "Show more"). */
  useEffect(() => {
    if (!pendingRowFocus.current) return;
    const row = listRef.current?.querySelector<HTMLElement>(
      `[data-slug="${CSS.escape(pendingRowFocus.current)}"]`,
    );
    if (row) {
      row.focus();
      pendingRowFocus.current = '';
    }
  });

  /* ---------- Filters ---------- */

  const applyFilters = useCallback(
    (next: { query?: string; endState?: EndState | ''; platform?: Platform | '' }, keepSelection = false) => {
      const nextQuery = next.query ?? query;
      const nextEndState = next.endState ?? endState;
      const nextPlatform = next.platform ?? platform;
      setQuery(nextQuery);
      setEndState(nextEndState);
      setPlatform(nextPlatform);
      setVisibleCount(LEDGER_BATCH);
      const nextSelected = keepSelection ? selectedSlug : '';
      if (!keepSelection) setSelectedSlug('');
      syncUrl({ query: nextQuery, endState: nextEndState, platform: nextPlatform, selected: nextSelected }, true);
    },
    [query, endState, platform, selectedSlug, syncUrl],
  );

  const updateQuery = useCallback((v: string) => applyFilters({ query: v }), [applyFilters]);
  const updateEndState = useCallback((v: EndState | '') => applyFilters({ endState: v }), [applyFilters]);
  const updatePlatform = useCallback((v: Platform | '') => applyFilters({ platform: v }), [applyFilters]);
  const clearFilters = useCallback(
    () => applyFilters({ query: '', endState: '', platform: '' }),
    [applyFilters],
  );
  /** From the dossier notice: widen the register so the open record is in it. */
  const showSelectedInRegister = useCallback(
    () => applyFilters({ query: '', endState: '', platform: '' }, true),
    [applyFilters],
  );

  const showMore = useCallback(() => {
    const firstNew = filtered[shownCount]?.slug ?? '';
    pendingRowFocus.current = firstNew;
    setVisibleCount(shownCount + LEDGER_BATCH);
  }, [filtered, shownCount]);

  /* ---------- Keyboard ---------- */

  const onListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selected) clearSelection();
        return;
      }
      if (!STEP_KEYS.includes(e.key as StepKey)) return;
      e.preventDefault();
      if (!filtered.length) return;
      const current = selectedInView ? selectedIndex : -1;
      /* Step across the whole filtered list; the batch grows to reveal the target. */
      const next = stepIndex(current, filtered.length, e.key as StepKey);
      const target = filtered[next];
      if (!target) return;
      const row = listRef.current?.querySelector<HTMLElement>(
        `[data-slug="${CSS.escape(target.slug)}"]`,
      );
      if (row) row.focus();
      else {
        /* The target is past the batch: reveal it and keep it revealed. */
        pendingRowFocus.current = target.slug;
        setVisibleCount((c) => Math.max(c, requiredVisibleCount(next)));
      }
      selectRecord(target.slug, false);
    },
    [filtered, selected, selectedInView, selectedIndex, selectRecord, clearSelection],
  );

  /* ---------- Export ---------- */

  const downloadBrief = useCallback(() => {
    const brief = buildBrief(selected ? [selected] : filtered, mode, asOf);
    const blob = new Blob([JSON.stringify(brief, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archivum-delisted-${mode}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [filtered, selected, mode, asOf]);

  /* ---------- Render ---------- */

  if (!available) {
    return (
      <section className={styles.page}>
        <div className={styles.unavailable}>
          <h1>The archive could not be loaded.</h1>
          <p>{'message' in data ? data.message : 'Preserved records could not be loaded.'}</p>
          <button className={styles.unavailableLink} onClick={() => router.refresh()}>Try again</button>
        </div>
      </section>
    );
  }

  const countLabel = hasFilters
    ? `${filtered.length} of ${allRecords.length} record${allRecords.length !== 1 ? 's' : ''} match`
    : `${allRecords.length} record${allRecords.length !== 1 ? 's' : ''}`;

  return (
    <section className={`${styles.page} ${styles.fadeIn}`}>
      <ArchiveField
        records={fieldRecords}
        totalRecords={allRecords.length}
        filtersMatchNothing={filtered.length === 0}
        selected={selected}
        onSelect={selectFromField}
        onInspect={inspectFromField}
        inspectHref={inspectHref}
        onEnterLedger={enterLedger}
        mode={mode}
        asOf={asOf}
      />

      <div className={styles.archiveBridge} aria-label="From spatial overview to searchable register">
        <span>Spatial overview</span><i aria-hidden="true" /><span>Searchable register</span>
      </div>

      {mode === 'illustrative' && (
        <div className={styles.modeBanner} role="status">
          <span className={styles.modeBannerIcon} aria-hidden="true" />
          <span>
            Illustrative records — these are fictional examples for interface
            demonstration, not real observations.
          </span>
        </div>
      )}

      {/* Filters */}
      <div id={LEDGER_ID} className={styles.ledgerHead}>
        <p>Preserved register</p>
        <h2 ref={ledgerHeadingRef} tabIndex={-1} className={styles.ledgerHeading}>Inspect what remains.</h2>
        <span>Choose a record to open its evidence dossier.</span>
      </div>
      <div className={styles.filters} role="search" aria-label="Filter records">
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3.5 3.5" />
          </svg>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search records…"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            aria-label="Search by name, publisher, or licence"
          />
        </div>

        <select
          className={styles.select}
          value={endState}
          onChange={(e) => updateEndState(e.target.value as EndState | '')}
          aria-label="Filter by observed state"
        >
          <option value="">All states</option>
          {END_STATES.map((s) => (
            <option key={s} value={s}>
              {END_STATE_LABEL[s]}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={platform}
          onChange={(e) => updatePlatform(e.target.value as Platform | '')}
          aria-label="Filter by platform"
        >
          <option value="">All platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={clearFilters}
          >
            Clear
          </button>
        )}

        <span className={styles.recordCount} aria-live="polite">
          {countLabel}
        </span>
      </div>

      {/* Workspace */}
      <div className={styles.workspace}>
        {/* Record list */}
        <div
          className={`${styles.listPanel} ${selected ? styles.listPanelHidden : ''}`}
        >
          {filtered.length === 0 ? (
            <div className={styles.empty} role="status">
              <p>
                No records match the current filters.
                {hasFilters && (
                  <>
                    {' '}
                    <button
                      type="button"
                      className={styles.clearBtn}
                      onClick={clearFilters}
                      style={{ display: 'inline' }}
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </p>
            </div>
          ) : (
            <>
              <div
                ref={listRef}
                className={styles.recordList}
                role="listbox"
                aria-label="Delisted records"
                onKeyDown={onListKeyDown}
              >
                {visibleRecords.map((r) => {
                  const isSelected = r.slug === selectedSlug;
                  return (
                    <div
                      key={r.slug}
                      data-slug={r.slug}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={isSelected || (!selectedInView && r.slug === visibleRecords[0]?.slug) ? 0 : -1}
                      className={`${styles.recordRow} ${isSelected ? styles.recordRowSelected : ''}`}
                      onClick={() => selectRecord(r.slug)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          selectRecord(r.slug);
                        }
                      }}
                    >
                      <span className={styles.recordName}>{r.name}</span>
                      <span
                        className={styles.recordBadge}
                        style={{ background: `var(${END_STATE_TOKEN[r.endState]})` }}
                      >
                        {END_STATE_LABEL[r.endState]}
                      </span>
                      <span className={styles.recordMeta}>
                        {r.publisher} · {PLATFORM_LABELS[r.platform]}
                      </span>
                      {isSelected && <span className={styles.recordOpenTag}>Open in dossier</span>}
                      <span className={styles.recordDates}>Last confirmed {fmtDate(r.lastConfirmed)} · Observed {spanLabel(spanDays(r.firstObserved, r.lastConfirmed))}</span>
                    </div>
                  );
                })}
              </div>
              <div className={styles.ledgerFoot}>
                <p role="status" aria-live="polite" className={styles.ledgerRange}>
                  {rangeLabel(shownCount, filtered.length)}
                </p>
                {remaining > 0 && (
                  <button type="button" className={styles.showMoreBtn} onClick={showMore}>
                    Show {Math.min(LEDGER_BATCH, remaining)} more
                    <span className={styles.showMoreRemaining}>{remaining} remaining</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Dossier */}
        <div
          ref={dossierRef}
          id={DOSSIER_ID}
          className={`${styles.dossierPanel} ${selected ? styles.dossierPanelVisible : ''}`}
          tabIndex={-1}
          aria-label={selected ? `Dossier: ${selected.name}` : undefined}
        >
          {!selected && (
            <div className={styles.dossierEmpty}>
              <span>Preserved evidence</span>
              <h2>Every source<br/>has a history.</h2>
              <p>Select a record to inspect its last observed state, the context that remains, and the documentation behind it.</p>
              <dl className={styles.stateSummary} aria-label="Observed states in the current register">
                {END_STATES.map((state) => {
                  const count = filtered.filter((r) => r.endState === state).length;
                  return (
                    <div key={state}>
                      <dt><span className={styles.stateSwatch} style={{ background: `var(${END_STATE_TOKEN[state]})` }} aria-hidden="true" />{END_STATE_LABEL[state]}<b>{count}</b></dt>
                      <dd>{END_STATE_NOTE[state]}</dd>
                    </div>
                  );
                })}
              </dl>
              <p className={styles.stateSummaryFoot}>{filtered.length} of {allRecords.length} records in this view{asOf ? ` · archive date ${fmtDate(asOf)}` : ''}. Counts follow the filters above.</p>
            </div>
          )}
          {selected && (
            <>
              {!selectedInView && (
                <p className={styles.dossierNotice} role="status">
                  <span>This record is outside the current filters, so it is not listed in the register.</span>
                  <button type="button" className={styles.clearBtn} onClick={showSelectedInRegister}>
                    Show it in the register
                  </button>
                </p>
              )}
              <Dossier
                record={selected}
                mode={mode}
                onClose={clearSelection}
                onExport={downloadBrief}
              />
            </>
          )}
        </div>
      </div>

      {/* Coverage disclaimer */}
      <p className={styles.disclaimer}>
        Documentation Coverage reflects what was present in each record&apos;s
        published metadata when Archivum last checked. A field marked &ldquo;not
        found&rdquo; means it was absent from the source — not that the dataset
        lacks that property. Coverage is not a quality rating, trust score,
        or permission grant.
        {mode === 'illustrative' && (
          <> All records shown are illustrative examples.</>
        )}
      </p>
    </section>
  );
}

/* ========================================================================== */

interface DossierProps {
  record: DelistedRecord;
  mode: 'illustrative' | 'catalog';
  onClose: () => void;
  onExport: () => void;
}

function Dossier({ record, mode, onClose, onExport }: DossierProps) {
  const r = record;
  const detail = decodeChecks(r.checksAtLastCheck);
  const sections = Object.keys(COVERAGE_SECTIONS) as CoverageSectionKey[];
  const srcUrl = safeSourceUrl(r.sourceUrl);
  const succUrl = safeSourceUrl(r.successorUrl);
  const days = spanDays(r.firstObserved, r.lastConfirmed);
  const x1 = 0;
  const x2 = 100;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      /* Escape inside the search box clears the box; it should not also close the dossier. */
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={`${styles.dossierCard} ${styles.dossierReveal}`}>
      {/* Mobile back */}
      <button type="button" className={styles.mobileBack} onClick={onClose}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M10 3L5 8l5 5" />
        </svg>
        Back to list
      </button>

      {/* Desktop close */}
      <button
        type="button"
        className={styles.dossierClose}
        onClick={onClose}
        aria-label="Close dossier"
      >
        ×
      </button>

      <h2 className={styles.dossierName}>{r.name}</h2>
      <p className={styles.dossierPublisher}>
        {r.publisher} · {PLATFORM_LABELS[r.platform]}
      </p>

      {/* State */}
      <span
        className={styles.stateBadgeLarge}
        style={{ background: `var(${END_STATE_TOKEN[r.endState]})` }}
      >
        {END_STATE_LABEL[r.endState]}
      </span>
      <p className={styles.stateNote}>{END_STATE_NOTE[r.endState]}</p>

      <hr className={styles.dossierDivider} />

      {/* Dates & span */}
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>First observed</span>
        <span className={styles.fieldValue}>{fmtDate(r.firstObserved)}</span>
      </div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Last confirmed</span>
        <span className={styles.fieldValue}>{fmtDate(r.lastConfirmed)}</span>
      </div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Observation window</span>
        <span className={styles.fieldValue}>{spanLabel(days)} ({days} days)</span>
      </div>

      {/* Timeline mini */}
      <div
        className={styles.dossierTimeline}
        role="img"
        aria-label={`Observed from ${fmtDate(r.firstObserved)} to ${fmtDate(r.lastConfirmed)}`}
      >
        <div
          className={styles.dossierTimelineBar}
          style={{
            left: `${x1}%`,
            width: `${Math.max(1, x2 - x1)}%`,
            background: `var(${END_STATE_TOKEN[r.endState]})`,
          }}
        />
      </div>
      <div className={styles.dossierTimelineLabels}>
        <span>{fmtDate(r.firstObserved)}</span>
        <span>{fmtDate(r.lastConfirmed)}</span>
      </div>

      <hr className={styles.dossierDivider} />

      {/* Metadata */}
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Licence</span>
        <span className={styles.fieldValue}>{r.license}</span>
      </div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Rows</span>
        <span className={styles.fieldValueMono}>{formatRows(r.sizeRows)}</span>
      </div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Versions</span>
        <span className={styles.fieldValue}>{r.versions}</span>
      </div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Consecutive failures</span>
        <span className={styles.fieldValue}>{r.consecutiveFailures}</span>
      </div>

      <hr className={styles.dossierDivider} />

      {/* Coverage */}
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Documentation coverage</span>
        <span className={styles.fieldValueMono}>{r.coverageTotal}%</span>
      </div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Band</span>
        <span className={styles.fieldValue} style={{ textTransform: 'capitalize' }}>
          {r.coverageBand}
        </span>
      </div>

      {/* 28 checks */}
      {sections.map((sKey) => {
        const sectionChecks = COVERAGE_CHECKS.filter((c) => c.section === sKey);
        return (
          <div key={sKey} className={styles.checksSection}>
            <h3 className={styles.checksSectionTitle}>
              {COVERAGE_SECTIONS[sKey].label}
            </h3>
            <p className={styles.checksSectionQuestion}>
              {COVERAGE_SECTIONS[sKey].question}
            </p>
            {sectionChecks.map((check) => {
              const result = detail[check.id] ?? 'not_found';
              const dotClass =
                result === 'documented'
                  ? styles.checkDotDocumented
                  : result === 'reported'
                    ? styles.checkDotReported
                    : result === 'n/a'
                      ? styles.checkDotNA
                      : styles.checkDotNotFound;
              return (
                <details key={check.id} className={styles.checkDisclosure}><summary className={styles.checkRow}>
                  <span className={`${styles.checkDot} ${dotClass}`} aria-hidden="true" />
                  <span
                    className={
                      result === 'not_found' || result === 'n/a'
                        ? styles.checkLabelDim
                        : styles.checkLabel
                    }
                  >
                    {check.label}
                  </span>
                  <span className={styles.checkMethod}>
                    {result === 'documented'
                      ? 'documented'
                      : result === 'reported'
                        ? 'reported'
                        : result === 'n/a'
                          ? 'n/a'
                          : 'not found'}
                  </span>
                </summary><p className={styles.checkExplanation}>{check.method}</p></details>
              );
            })}
          </div>
        );
      })}

      <hr className={styles.dossierDivider} />

      {/* URLs */}
      {srcUrl && (
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Source</span>
          <a
            href={srcUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            {new URL(srcUrl).hostname}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 3H3v10h10v-3M9 2h5v5M14 2L7 9" />
            </svg>
          </a>
        </div>
      )}
      {r.endState === 'superseded' && r.supersededBy && (
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Superseded by</span>
          <span className={styles.fieldValue}>{r.supersededBy}</span>
        </div>
      )}
      {succUrl && (
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Successor</span>
          <a
            href={succUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.sourceLink}
          >
            {new URL(succUrl).hostname}
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 3H3v10h10v-3M9 2h5v5M14 2L7 9" />
            </svg>
          </a>
        </div>
      )}

      {/* Dependencies */}
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Dependent models</span>
        {r.dependentModels === null ? (
          <span className={styles.unknownValue}>Unknown</span>
        ) : (
          <span className={styles.fieldValue}>{r.dependentModels}</span>
        )}
      </div>
      <div className={styles.fieldRow}>
        <span className={styles.fieldLabel}>Dependent papers</span>
        {r.dependentPapers === null ? (
          <span className={styles.unknownValue}>Unknown</span>
        ) : (
          <span className={styles.fieldValue}>{r.dependentPapers}</span>
        )}
      </div>

      {r.observationEvidence && (
        <>
          <hr className={styles.dossierDivider} />
          <div className={styles.fieldRow}>
            <span className={styles.fieldLabel}>Observation evidence</span>
            <span className={styles.fieldValue}>{r.observationEvidence}</span>
          </div>
        </>
      )}

      <hr className={styles.dossierDivider} />

      {/* Export */}
      <button type="button" className={styles.exportBtn} onClick={onExport}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M8 2v9M4 7l4 4 4-4M2 13h12" />
        </svg>
        Download preserved-record brief
        {mode === 'illustrative' && ' (illustrative)'}
      </button>
    </div>
  );
}
