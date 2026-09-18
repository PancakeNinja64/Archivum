'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { dataMode, getDataset } from '@/lib/api/client';
import type { Dataset } from '@/lib/types';
import { buildCompareRows, groupRows, type CompareColumn } from '@/lib/workbench/compare';
import { compareHref, COMPARE_MAX, COMPARE_MIN, parseCompareSlugs, recordHref } from '@/lib/workbench/query';
import { useShortlist } from '@/lib/workbench/useShortlist';
import { useBriefExport } from '@/lib/workbench/useBriefExport';
import { EvidenceMark, Glyph } from './Glyph';
import { licenceIdentifier, platformName, publisherName } from './recordMeta';
import { ShortlistTray } from './ShortlistTray';
import desk from './desk.module.css';
import styles from './compare.module.css';

type Entry = { state: 'ready'; record: Dataset } | { state: 'absent' } | { state: 'error'; message: string };
const describeError = (error: unknown) => (error instanceof Error && error.message ? error.message : 'The catalog request failed.');

function navigate(slugs: readonly string[], diff: boolean, history: 'push' | 'replace') {
  const href = compareHref(slugs);
  const url = diff ? `${href}${href.includes('?') ? '&' : '?'}diff=1` : href;
  if (history === 'push') window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
}

/* ---------- Column header ---------- */

function ColumnHeader({ column, onRemove, onRetry, shortlist }: { column: CompareColumn; onRemove: () => void; onRetry: () => void; shortlist: ReturnType<typeof useShortlist> }) {
  const remove = <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} onClick={onRemove} aria-label={`Remove ${column.state === 'ready' ? column.record.name : column.slug} from the comparison`}><Glyph name="close" size={13} />Remove</button>;
  if (column.state === 'loading') {
    return <div className={styles.column} role="status" aria-label={`Loading ${column.slug}`}><span className={styles.skeleton} style={{ width: '80%', height: 20 }} /><span className={styles.skeleton} style={{ width: '55%' }} /><span className={styles.skeleton} style={{ width: '40%' }} /></div>;
  }
  if (column.state === 'absent') {
    return <div className={styles.column}><p className={styles.columnState}>Not in this catalog: <code>{column.slug}</code>. It may have been delisted or renamed.</p><div className={styles.columnActions}>{remove}<Link className={`${desk.buttonQuiet} ${desk.buttonSmall}`} href="/delisted/?demo=1">Delisted <Glyph name="arrow" size={13} /></Link></div></div>;
  }
  if (column.state === 'error') {
    return <div className={styles.column}><p className={styles.columnState} role="alert"><code>{column.slug}</code> could not be retrieved. {column.message}</p><div className={styles.columnActions}><button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} onClick={onRetry}><Glyph name="arrow" size={13} />Retry</button>{remove}</div></div>;
  }
  const { record } = column;
  const saved = shortlist.has(record.slug);
  return (
    <div className={styles.column}>
      <Link className={styles.name} href={recordHref(record.slug)}>{record.name}</Link>
      <span className={styles.meta}>{publisherName(record.publisher)} · {platformName(record.platform)}{record.version && <code>{record.version}</code>}</span>
      <div className={styles.columnActions}>
        <Link className={`${desk.buttonQuiet} ${desk.buttonSmall}`} href={recordHref(record.slug)}><Glyph name="arrow" size={13} />Open in workspace</Link>
        <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} aria-pressed={saved} onClick={() => { if (saved) shortlist.remove(record.slug); else shortlist.add(record); }} disabled={!saved && shortlist.full} title={!saved && shortlist.full ? 'The shortlist on this device is full' : undefined}><Glyph name={saved ? 'check' : 'bookmark'} size={13} />{saved ? 'Saved' : 'Save'}</button>
        {remove}
      </div>
    </div>
  );
}

/* ---------- Picker ---------- */

function Picker({ slugs, shortlist }: { slugs: string[]; shortlist: ReturnType<typeof useShortlist> }) {
  const [chosen, setChosen] = useState<string[]>(slugs);
  const toggle = (slug: string) => setChosen((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length >= COMPARE_MAX ? prev : [...prev, slug]));
  const candidates = shortlist.items;
  return (
    <section className={styles.picker} aria-labelledby="compare-picker-title">
      <h2 id="compare-picker-title">{slugs.length === 1 ? 'One record is not a comparison yet.' : 'Choose two to four records.'}</h2>
      <p>Pick two to four saved records to compare their evidence side by side. You can share the comparison with a link, or add a candidate from the workspace using “Compare with saved”.</p>
      {!shortlist.hydrated && <p className={desk.mono} role="status">Reading records saved on this device…</p>}
      {shortlist.hydrated && candidates.length === 0 && <div className={styles.pickActions}><Link className={desk.buttonPrimary} href="/workspace/"><Glyph name="search" size={15} />Find records in the workspace</Link><p>Nothing is saved on this device yet.</p></div>}
      {candidates.length > 0 && (
        <>
          <ul className={styles.pickList}>
            {candidates.map((item) => (
              <li key={item.slug}>
                <label>
                  <input type="checkbox" checked={chosen.includes(item.slug)} onChange={() => toggle(item.slug)} disabled={!chosen.includes(item.slug) && chosen.length >= COMPARE_MAX} />
                  <span><strong>{item.name}</strong><small>{publisherName(item.publisher)} · {platformName(item.platform)} <code>{licenceIdentifier(item.license)}</code></small></span>
                </label>
              </li>
            ))}
          </ul>
          <div className={styles.pickActions}>
            <button type="button" className={desk.buttonPrimary} disabled={chosen.length < COMPARE_MIN} onClick={() => navigate(chosen, false, 'push')}><Glyph name="compare" size={15} />Compare {chosen.length >= COMPARE_MIN ? chosen.length : ''}</button>
            <p>{chosen.length < COMPARE_MIN ? `Select ${COMPARE_MIN - chosen.length} more.` : `${chosen.length} of ${COMPARE_MAX} selected.`}</p>
          </div>
        </>
      )}
    </section>
  );
}

/* ---------- Desk ---------- */

export function CompareDesk() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const { slugs, invalid, overflow, diff } = useMemo(() => {
    const params = new URLSearchParams(queryString);
    return { ...parseCompareSlugs(params), diff: params.get('diff') === '1' };
  }, [queryString]);
  const shortlist = useShortlist();
  const exporter = useBriefExport();

  const [entries, setEntries] = useState<Map<string, Entry>>(() => new Map());
  const inflight = useRef(new Set<string>());
  useEffect(() => {
    for (const slug of slugs) {
      if (entries.has(slug) || inflight.current.has(slug)) continue;
      inflight.current.add(slug);
      getDataset(slug)
        .then((record): Entry => (record ? { state: 'ready', record } : { state: 'absent' }))
        .catch((error: unknown): Entry => ({ state: 'error', message: describeError(error) }))
        .then((entry) => { inflight.current.delete(slug); setEntries((prev) => new Map(prev).set(slug, entry)); });
    }
  }, [slugs, entries]);

  const retry = useCallback((slug: string) => setEntries((prev) => { const next = new Map(prev); next.delete(slug); return next; }), []);
  const remove = useCallback((slug: string) => navigate(slugs.filter((s) => s !== slug), diff, 'push'), [slugs, diff]);
  const setDiff = useCallback((value: boolean) => navigate(slugs, value, 'replace'), [slugs]);

  const columns = useMemo((): CompareColumn[] => slugs.map((slug) => {
    const entry = entries.get(slug);
    if (!entry) return { slug, state: 'loading' };
    if (entry.state === 'ready') return { slug, state: 'ready', record: entry.record };
    if (entry.state === 'absent') return { slug, state: 'absent' };
    return { slug, state: 'error', message: entry.message };
  }), [slugs, entries]);
  const loaded = columns.filter((c): c is Extract<CompareColumn, { state: 'ready' }> => c.state === 'ready');
  const rows = useMemo(() => buildCompareRows(columns), [columns]);
  const visibleRows = diff ? rows.filter((row) => row.differs) : rows;
  const groups = groupRows(visibleRows);
  const differing = rows.filter((row) => row.differs).length;
  const addable = shortlist.items.filter((item) => !slugs.includes(item.slug));

  const loadedNames = loaded.map((c) => c.record.name).join(' · ');
  useEffect(() => {
    const previous = document.title;
    document.title = loadedNames ? `Compare ${loadedNames} · Archivum` : 'Compare records · Archivum';
    return () => { document.title = previous; };
  }, [loadedNames]);

  const exportTargets = loaded.map((c) => ({ slug: c.slug, name: c.record.name, record: c.record }));

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <header className={styles.head}>
          <div>
            <p className={desk.eyebrow}>Comparison desk · <span className={`${desk.pill} ${dataMode === 'illustrative' ? desk.pillDemo : desk.pillLive}`}>{dataMode === 'illustrative' ? 'Illustrative catalog' : 'Live catalog'}</span></p>
            <h1>{slugs.length >= COMPARE_MIN ? `${slugs.length} records, side by side.` : 'Compare records side by side.'}</h1>
            <p>One fact per row, aligned across columns. A blank is a blank: “not stated” is never counted as zero, and no column is ranked or recommended.</p>
          </div>
          {slugs.length >= COMPARE_MIN && (
            <div className={styles.controls}>
              <button type="button" className={styles.switch} aria-pressed={diff} onClick={() => setDiff(!diff)}><i aria-hidden="true" />Differences only{loaded.length >= 2 ? ` · ${differing}` : ''}</button>
              <div className={styles.controlGroup} role="group" aria-label="Export comparison brief">
                <span>Brief</span>
                <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} disabled={loaded.length < COMPARE_MIN || exporter.busy !== null} onClick={() => exporter.run(exportTargets, 'comparison', 'md')}><Glyph name="download" size={14} />Markdown</button>
                <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} disabled={loaded.length < COMPARE_MIN || exporter.busy !== null} onClick={() => exporter.run(exportTargets, 'comparison', 'json')}><Glyph name="download" size={14} />JSON</button>
              </div>
            </div>
          )}
        </header>

        {(invalid.length > 0 || overflow > 0 || exporter.notice) && (
          <div className={styles.notices}>
            {invalid.length > 0 && <p className={desk.notice}><strong>Ignored:</strong> {invalid.length === 1 ? 'one value in the link is not a record slug' : `${invalid.length} values in the link are not record slugs`} ({invalid.join(', ')}).</p>}
            {overflow > 0 && <p className={desk.notice}><strong>Trimmed:</strong> the desk compares at most {COMPARE_MAX} records; {overflow} more in the link {overflow === 1 ? 'was' : 'were'} left out.</p>}
            {exporter.notice && <p className={`${desk.notice} ${exporter.notice.tone === 'error' ? '' : desk.noticeInfo}`} role="status">{exporter.notice.text}</p>}
          </div>
        )}

        {slugs.length < COMPARE_MIN ? <Picker key={slugs.join(',')} slugs={slugs} shortlist={shortlist} /> : (
          <>
            {slugs.length < COMPARE_MAX && addable.length > 0 && (
              <div className={styles.addRow}>
                <span>Add from saved on this device:</span>
                {addable.map((item) => <Link key={item.slug} href={compareHref([...slugs, item.slug]) + (diff ? '&diff=1' : '')}><Glyph name="plus" size={12} />{item.name}</Link>)}
              </div>
            )}
            <div className={styles.scroller} tabIndex={0} role="region" aria-label="Comparison table, scrollable sideways">
              <table className={styles.table}>
                <caption>{slugs.length} records · {visibleRows.length} of {rows.length} rows shown{diff ? ' · differences only' : ''}</caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <div className={styles.corner}>
                        <strong>{rows.length} facts, one per row</strong>
                        <span>{loaded.length >= 2 ? `${differing} ${differing === 1 ? 'row differs' : 'rows differ'} across the loaded records` : 'Differences appear once two records have loaded'}</span>
                        <ul className={styles.legend} aria-label="How to read the cells">
                          <li><EvidenceMark result="documented" /> Documented at the source</li>
                          <li><EvidenceMark result="reported" /> Reported by the publisher</li>
                          <li><EvidenceMark result="not_found" /> Not found when checked</li>
                          <li><i className={styles.differsMark} aria-hidden="true" /> Row differs between records</li>
                          <li><i>Not stated</i> is unknown, never zero</li>
                        </ul>
                      </div>
                    </th>
                    {columns.map((column) => <th key={column.slug} scope="col"><ColumnHeader column={column} shortlist={shortlist} onRemove={() => remove(column.slug)} onRetry={() => retry(column.slug)} /></th>)}
                  </tr>
                </thead>
                {groups.map((group) => (
                  <tbody key={group.group}>
                    <tr className={styles.groupRow}><th scope="rowgroup">{group.group}</th>{columns.map((column) => <td key={column.slug} aria-hidden="true" />)}</tr>
                    {group.rows.map((row) => (
                      <tr key={row.key} className={row.differs ? styles.differs : undefined}>
                        <th scope="row"><span className={styles.rowLabel}>{row.label}{row.differs && <span className={desk.srOnly}> (differs)</span>}{row.note && <small>{row.note}</small>}</span></th>
                        {row.cells.map((cell, index) => {
                          const column = columns[index];
                          return (
                            <td key={column.slug}>
                              {column.state !== 'ready'
                                ? <span className={styles.placeholder} aria-label={column.state === 'loading' ? 'Loading' : 'Unavailable'}>—</span>
                                : <span className={styles.cell}>
                                  {cell.evidence ? <span className={styles.evidence}><EvidenceMark result={cell.evidence} />{cell.text}</span> : cell.known ? <span>{cell.text}</span> : <span className={styles.unknown}>{cell.text}</span>}
                                  {cell.detail && <small>{cell.detail}</small>}
                                </span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                ))}
                {visibleRows.length === 0 && (
                  <tbody><tr><th scope="row">No differences</th><td colSpan={columns.length}><span className={styles.columnState}>{loaded.length < 2 ? 'Differences can be shown once at least two records have loaded.' : 'Every compared row reads the same across the loaded records.'}</span></td></tr></tbody>
                )}
              </table>
            </div>
            <p className={styles.scrollHint}>Scroll the table sideways to see every record. The field column stays in place.</p>
            <ul className={styles.legendBelow} aria-label="How to read the cells">
              <li><EvidenceMark result="documented" /> Documented</li>
              <li><EvidenceMark result="reported" /> Reported</li>
              <li><EvidenceMark result="not_found" /> Not found</li>
              <li><i className={styles.differsMark} aria-hidden="true" /> Differs</li>
              <li><i>Not stated</i> ≠ zero</li>
            </ul>
            <p className={styles.foot}>Documentation coverage is the share of provenance fields present at the source when checked. It is a completeness measure, not a quality rating, and this desk draws no verdict from it. Licence terms marked “lookup” come from a static SPDX table for the published identifier. <Link href="/docs/#methodology">Read the methodology ↗</Link></p>
          </>
        )}
      </div>
      <ShortlistTray surface="compare" />
    </div>
  );
}
