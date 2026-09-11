'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import type { PreservedRecordsResult } from '@/lib/graveyard/provider';
import { END_STATES, END_STATE_LABEL } from '@/lib/graveyard/types';
import { PLATFORM_LABELS, readRegisterState, selectRecordPage, type RegisterState } from '@/lib/graveyard/register';
import { PlateField, PlatePreview } from './PlateField';
import { PreservedRegister } from './PreservedRegister';
import { PreservedInspector } from './PreservedInspector';
import styles from './PreservedArchive.module.css';

const subscribeViewport = (notify: () => void) => { window.addEventListener('resize', notify); return () => window.removeEventListener('resize', notify); };
const mobileSnapshot = () => window.innerWidth < 768;
const compactSnapshot = () => window.innerWidth < 1200;
const serverSnapshot = () => false;

export function DelistedClient({ data, initialState }: { data: PreservedRecordsResult; initialState: RegisterState }) {
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [notice, setNotice] = useState('');
  const triggerRef = useRef<HTMLElement | null>(null);
  const mobile = useSyncExternalStore(subscribeViewport, mobileSnapshot, serverSnapshot);
  const compact = useSyncExternalStore(subscribeViewport, compactSnapshot, serverSnapshot);
  const view = state.view || (mobile ? 'register' : 'field');
  const available = data.status === 'illustrative' || data.status === 'catalog';
  const records = useMemo(() => available ? data.records : [], [available, data]);
  const result = useMemo(() => selectRecordPage(records, state), [records, state]);
  const illustrative = data.status === 'illustrative';

  useEffect(() => {
    const restore = () => { setState(readRegisterState(new URLSearchParams(window.location.search))); setNotice(''); };
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  function update(change: Partial<RegisterState>, replace = false) {
    const next = { ...state, ...change };
    const filtered = selectRecordPage(records, next);
    if (next.selected && !filtered.selected) { next.selected = ''; setNotice('The previous selection is not on this page.'); }
    else setNotice('');
    next.page = filtered.page;
    setState(next);
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries({ q: next.query, state: next.state, platform: next.platform, page: next.page === 1 ? '' : String(next.page), view: next.view, record: next.selected })) {
      if (value) params.set(key, value); else params.delete(key);
    }
    params.delete('endState');
    if (illustrative) params.set('demo', '1');
    const url = `/delisted/${params.size ? `?${params}` : ''}`;
    if (replace) window.history.replaceState(null, '', url); else window.history.pushState(null, '', url);
  }
  function select(slug: string, trigger: HTMLElement) { triggerRef.current = trigger; update({ selected: slug }); }
  function close() { update({ selected: '' }, true); requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true })); }
  const reset = () => update({ query: '', state: '', platform: '', page: 1, selected: '' });

  return <div className={styles.archive}>
    <header className={styles.intro}>
      <div className={styles.eyebrow}><span>Delisted</span><span>A record of what remained</span></div>
      <div className={styles.introGrid}><h1>The record<br />outlives the source.</h1><p>Inspect the last recorded state of datasets whose sources were superseded, gated, withdrawn, or could no longer be reached.</p></div>
    </header>
    {!available ? <section className={styles.unavailable} aria-labelledby="history-availability">
      <PlatePreview />
      <div><span className={styles.demoBadge}>Illustrative composition</span><h2 id="history-availability">{data.status === 'error' ? 'The archive could not be loaded.' : 'message' in data ? data.message : 'The archive is unavailable.'}</h2><p>{data.status === 'error' ? data.message : 'The live catalog does not supply preserved historical records yet. Explore an example of how those records will be presented.'}</p>
      {data.status === 'error' ? <button type="button" className={styles.action} onClick={() => router.refresh()}>Try again</button> : <Link className={styles.action} href="/delisted/?demo=1">View an example <span aria-hidden="true">↗</span></Link>}
      <Link className={styles.quietLink} href="/explore/">Explore the current catalog →</Link></div>
    </section> : <section className={styles.workspace} aria-label="Preserved record browser">
      {illustrative && <div className={styles.demoNotice}><span className={styles.demoBadge}>Illustrative records</span><p>Fictional datasets and publishers. Dates, states and checks demonstrate the interface.</p></div>}
      <div className={styles.controls}>
        <form className={styles.search} action="/delisted/" onSubmit={event => { event.preventDefault(); update({ page: 1 }, true); }}>
          <label htmlFor="preserved-query">Find a preserved record</label><div><svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.3" /><path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.3" /></svg><input id="preserved-query" name="q" value={state.query} placeholder="Dataset or publisher" onChange={event => update({ query: event.target.value, page: 1 }, true)} /><button type="submit" aria-label="Search preserved records">↵</button></div>
        </form>
        <label className={styles.select}>Observed state<select value={state.state} onChange={event => update({ state: event.target.value as RegisterState['state'], page: 1 })}><option value="">All states</option>{END_STATES.map(value => <option key={value} value={value}>{END_STATE_LABEL[value]}</option>)}</select></label>
        <label className={styles.select}>Platform<select value={state.platform} onChange={event => update({ platform: event.target.value as RegisterState['platform'], page: 1 })}><option value="">All platforms</option>{Object.entries(PLATFORM_LABELS).filter(([value]) => records.some(record => record.platform === value)).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <div className={styles.toolbar}><div role="group" aria-label="Record view" className={styles.viewToggle}><button type="button" aria-pressed={view === 'field'} onClick={() => update({ view: 'field' })}><span aria-hidden="true">▥</span> Field</button><button type="button" aria-pressed={view === 'register'} onClick={() => update({ view: 'register' })}><span aria-hidden="true">☰</span> Register</button></div><p>Last confirmed · newest first</p><span className={styles.resultCount} aria-live="polite">{result.records.length} of {result.total} {illustrative ? 'examples' : 'records'} · Page {result.page}</span></div>
      {(state.query || state.state || state.platform) && <div className={styles.activeFilters}><span>Filtered results</span><button type="button" onClick={reset}>Clear filters ×</button></div>}
      <p className={styles.srOnly} role="status">{notice}{result.total === 0 ? ' No matching records.' : ''}</p>
      <div className={styles.browserGrid}>
        <div className={styles.resultRegion}>
          {result.total ? view === 'field' ? <PlateField records={result.records} selected={result.selected?.slug ?? ''} onSelect={select} /> : <PreservedRegister records={result.records} selected={result.selected?.slug ?? ''} onSelect={select} /> : <div className={styles.empty}><span aria-hidden="true">∅</span><h2>{records.length ? 'No records match these filters.' : 'No preserved records yet.'}</h2><p>{records.length ? 'Try another name, observed state, or platform.' : 'The archive is connected. A record will appear here when a preserved observation is available.'}</p>{records.length > 0 && <button type="button" className={styles.action} onClick={reset}>Clear filters</button>}</div>}
          {result.total > 0 && <div className={styles.pagination}><p>{(result.page - 1) * 24 + 1}–{(result.page - 1) * 24 + result.records.length} of {result.total}{illustrative ? ' illustrative records' : ' records'}</p><div><button type="button" disabled={result.page === 1} onClick={() => update({ page: result.page - 1, selected: '' })}>← Previous</button><span>{result.page} / {result.pages}</span><button type="button" disabled={result.page === result.pages} onClick={() => update({ page: result.page + 1, selected: '' })}>Next →</button></div></div>}
        </div>
        <PreservedInspector record={result.selected} illustrative={illustrative} asOf={data.asOf} compact={compact} onClose={close} />
      </div>
      <div className={styles.archiveFootnote}><span>Observation, preserved.</span><p>States describe source availability at an observation. They do not assess a dataset, its publisher, or the right to use its contents. <Link href="/docs/#methodology">Read the methodology ↗</Link></p></div>
    </section>}
  </div>;
}
