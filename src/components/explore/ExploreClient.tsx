'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { dataMode, getDatasets, getFacets } from '@/lib/api/client';
import type { DatasetFilters, DatasetSummary, Facets, Paginated } from '@/lib/types';
import { platformLabel } from '@/lib/utils';
import { BrandMark } from '@/components/brand/Brand';
import { NetworkField } from '@/components/spatial/NetworkField';
import { CATALOG_PAGE_SIZE, readCatalogQuery, updateCatalogQuery } from './query';
import styles from './explore.module.css';

function dateLabel(value: string | null | undefined) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Not stated';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SearchForm({ query, onSearch }: { query: string; onSearch: (value: string) => void }) {
  const [value, setValue] = useState(query);
  const [previousQuery, setPreviousQuery] = useState(query);
  if (query !== previousQuery) {
    setPreviousQuery(query);
    setValue(query);
  }
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (timer.current) clearTimeout(timer.current);
    onSearch(value.trim());
  };
  return (
    <form className={styles.search} role="search" onSubmit={submit}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      <label className="sr-only" htmlFor="catalog-search">Search datasets or publishers</label>
      <input id="catalog-search" name="q" value={value} onChange={(event) => {
        const next = event.target.value;
        setValue(next);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onSearch(next.trim()), 350);
      }} placeholder="Search datasets or publishers" autoComplete="off" />
      {value && <button type="button" className={styles.clearSearch} onClick={() => { if (timer.current) clearTimeout(timer.current); setValue(''); onSearch(''); }} aria-label="Clear search">×</button>}
      <button type="submit" className={styles.searchSubmit} aria-label="Search datasets"><Arrow /></button>
    </form>
  );
}

function Coverage({ record }: { record: DatasetSummary }) {
  return <div className={styles.coverage}><span className={styles.coverageNumber} aria-label={`Documentation coverage: ${record.coverageTotal} percent`}>{record.coverageTotal}<span>%</span></span><span className={styles.meter} aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, record.coverageTotal))}%` }} /></span><span className={styles.checkDate}>{dateLabel(record.coverageCheckedAt) === 'Not stated' ? 'Check date not stated' : `Checked ${dateLabel(record.coverageCheckedAt)}`}</span></div>;
}

function Inspector({ record, selectionMissing }: { record: DatasetSummary | null; selectionMissing: boolean }) {
  return <aside className={styles.inspector} aria-label="Selected dataset" aria-live="polite" aria-atomic="true">
    {record ? <>
      <p className={styles.overline}>Selected record</p>
      <div className={styles.inspectorMark}><BrandMark signal /></div>
      <p className={styles.platformTag}>{platformLabel[record.platform] ?? record.platform}</p>
      <h2>{record.name}</h2><p className={styles.publisher}>{record.publisher}</p>
      <p className={styles.inspectorDescription}>{record.description}</p>
      <dl><div><dt>Declared licence</dt><dd>{record.license.spdx || 'Not stated'}</dd></div><div><dt>Documentation coverage</dt><dd>{record.coverageTotal}%</dd></div><div><dt>Archivum check</dt><dd>{dateLabel(record.coverageCheckedAt)}</dd></div></dl>
      <Link className={styles.openRecord} href={`/datasets/${record.slug}/`}>Open record <Arrow /></Link>
      <p className={styles.inspectorFootnote}>Coverage describes available documentation. Inspect the record for evidence and gaps.</p>
    </> : <div className={styles.inspectorEmpty}><div className={styles.selectionMark} aria-hidden="true">+</div><h2>Select a point of view.</h2><p>{selectionMissing ? 'Your selected record is outside these results. Select another dataset to inspect its record.' : 'Select a node in the Atlas or a dataset below to bring its record into focus.'}</p></div>}
  </aside>;
}

type ResponseState = { key: string; data?: Paginated<DatasetSummary>; error?: string };

export function ExploreClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const { filters, view } = useMemo(() => readCatalogQuery(new URLSearchParams(queryString)), [queryString]);
  const serializedFilters = JSON.stringify(filters);
  const [retry, setRetry] = useState(0);
  const requestKey = `${serializedFilters}:${retry}`;
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [facetsFailed, setFacetsFailed] = useState(false);
  const [facetsRetry, setFacetsRetry] = useState(0);
  const [drawer, setDrawer] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const filtersTrigger = useRef<HTMLButtonElement>(null);

  const setParam = useCallback((patch: Record<string, string | null>, preservePage = false) => {
    const next = updateCatalogQuery(new URLSearchParams(window.location.search), patch, preservePage);
    router.replace(`${pathname}${next ? `?${next}` : ''}`, { scroll: false });
  }, [router, pathname]);

  useEffect(() => {
    let current = true;
    getFacets().then((result) => { if (current) { setFacets(result); setFacetsFailed(false); } }).catch(() => { if (current) setFacetsFailed(true); });
    return () => { current = false; };
  }, [facetsRetry]);

  useEffect(() => {
    let current = true;
    const requestFilters: DatasetFilters = JSON.parse(serializedFilters);
    getDatasets(requestFilters).then((result) => {
      if (!current) return;
      const lastPage = Math.max(1, Math.ceil(result.total / CATALOG_PAGE_SIZE));
      if ((requestFilters.page ?? 1) > lastPage) {
        setParam({ page: lastPage === 1 ? null : String(lastPage) }, true);
        return;
      }
      setResponse({ key: requestKey, data: result });
    }).catch(() => { if (current) setResponse({ key: requestKey, error: 'The catalog could not be loaded. Your search and filters are saved.' }); });
    return () => { current = false; };
  }, [serializedFilters, requestKey, setParam]);

  useEffect(() => {
    if (!drawer || !dialog.current) return;
    const element = dialog.current;
    const trigger = filtersTrigger.current;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = previousOverflow; trigger?.focus(); };
  }, [drawer]);

  const data = response?.key === requestKey ? response.data : undefined;
  const error = response?.key === requestKey ? response.error : undefined;
  const loading = !data && !error;
  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = filters.page ?? 1;
  const pageCount = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const selected = rows.find((record) => record.slug === selectedSlug) ?? null;
  const toggle = (key: string, value: string, current: string[]) => {
    const values = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    setParam({ [key]: values.join(',') || null });
  };
  const clearAll = () => setParam({ q: null, platform: null, modality: null, domain: null, language: null, license: null, commercial: null, min: null });
  const chips: { key: string; text: string; remove: () => void }[] = [
    ...(filters.query ? [{ key: 'query', text: `“${filters.query}”`, remove: () => setParam({ q: null }) }] : []),
    ...(filters.platform ?? []).map((value) => ({ key: `platform:${value}`, text: platformLabel[value], remove: () => toggle('platform', value, filters.platform ?? []) })),
    ...(filters.modality ?? []).map((value) => ({ key: `modality:${value}`, text: value, remove: () => toggle('modality', value, filters.modality ?? []) })),
    ...(filters.domain ?? []).map((value) => ({ key: `domain:${value}`, text: value, remove: () => toggle('domain', value, filters.domain ?? []) })),
    ...(filters.languages ?? []).map((value) => ({ key: `language:${value}`, text: value, remove: () => toggle('language', value, filters.languages ?? []) })),
    ...(filters.license ?? []).map((value) => ({ key: `license:${value}`, text: value, remove: () => toggle('license', value, filters.license ?? []) })),
    ...(filters.commercialOnly ? [{ key: 'commercial', text: 'Commercial terms permitted', remove: () => setParam({ commercial: null }) }] : []),
    ...(filters.minCoverage ? [{ key: 'min', text: `Coverage ≥ ${filters.minCoverage}%`, remove: () => setParam({ min: null }) }] : []),
  ];

  const facetGroup = (title: string, key: string, values: { value: string; count: number }[] | undefined, selectedValues: string[], labels?: Record<string, string>) => (
    <details className={styles.facetGroup} open={key === 'platform' || key === 'modality'}>
      <summary>{title}<span aria-hidden="true">+</span></summary>
      <fieldset><legend className="sr-only">{title}</legend>{!values && !facetsFailed && <div className={styles.facetSkeleton} aria-label={`Loading ${title.toLowerCase()} filters`} />}
        {values?.filter((item) => item.count > 0 || selectedValues.includes(item.value)).map((item) => <label key={item.value} className={styles.checkbox}><input type="checkbox" checked={selectedValues.includes(item.value)} onChange={() => toggle(key, item.value, selectedValues)} /><span>{labels?.[item.value] ?? item.value}</span><small>{item.count}</small></label>)}
      </fieldset>
    </details>
  );
  const filterContent = <>
    {facetsFailed && <div className={styles.filterError}><p>Filter options are unavailable.</p><button type="button" onClick={() => setFacetsRetry((value) => value + 1)}>Try again</button></div>}
    {facetGroup('Platform', 'platform', facets?.platforms, filters.platform ?? [], platformLabel)}
    {facetGroup('Modality', 'modality', facets?.modalities, filters.modality ?? [])}
    {facetGroup('Domain', 'domain', facets?.domains, filters.domain ?? [])}
    {facetGroup('Language', 'language', facets?.languages, filters.languages ?? [])}
    {facetGroup('Declared licence', 'license', facets?.licenses, filters.license ?? [])}
    <details className={styles.facetGroup}><summary>Documentation<span aria-hidden="true">+</span></summary><div className={styles.documentationFilter}>
      <label className={styles.checkbox}><input type="checkbox" checked={!!filters.commercialOnly} onChange={() => setParam({ commercial: filters.commercialOnly ? null : '1' })} /><span>Commercial use permitted by declared licence</span></label>
      <label className={styles.minimum}>Minimum coverage <span>{filters.minCoverage ?? 0}%</span><input type="range" min="0" max="100" step="5" value={filters.minCoverage ?? 0} onChange={(event) => setParam({ min: event.target.value === '0' ? null : event.target.value })} /></label>
      <p>Documentation completeness, not a quality or safety rating.</p>
    </div></details>
  </>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><p className={styles.overline}>Public dataset index</p><h1>A world of data.<br /><span>A clearer perspective.</span></h1></div>
        <div className={styles.headerNote}><p>Origin, licensing, lineage, and documentation.<br />Find the record behind the dataset.</p><Link href="/docs/#methodology">How to read a record <Arrow diagonal /></Link></div>
      </header>
      {dataMode === 'illustrative' && <p className={styles.demoNote}><span aria-hidden="true" />Illustrative catalog · Sample records for exploring the interface.</p>}
      <div className={styles.workspace}>
        <aside className={styles.sidebar} aria-label="Dataset filters"><div className={styles.filterTitle}><h2>Refine the index</h2>{chips.length > 0 && <button type="button" onClick={clearAll}>Reset</button>}</div>{filterContent}<Link href="/delisted/" className={styles.archiveLink}>Looking for a former source?<br /><span>Explore Delisted <Arrow diagonal /></span></Link></aside>
        <dialog ref={dialog} className={styles.filterDialog} aria-labelledby="filter-dialog-title" onCancel={() => setDrawer(false)} onClick={(event) => { if (event.target === event.currentTarget) setDrawer(false); }}>
          <div className={styles.dialogInner}><div className={styles.dialogHeader}><h2 id="filter-dialog-title">Refine the index</h2><button type="button" onClick={() => setDrawer(false)} aria-label="Close filters">×</button></div>{filterContent}<div className={styles.dialogFooter}><button type="button" onClick={clearAll}>Reset filters</button><button type="button" className={styles.primaryButton} onClick={() => setDrawer(false)}>Show results</button></div></div>
        </dialog>
        <div className={styles.results}>
          <div className={styles.toolbar}><SearchForm query={filters.query ?? ''} onSearch={(value) => setParam({ q: value || null })} /><button ref={filtersTrigger} className={styles.mobileFilters} type="button" onClick={() => setDrawer(true)} aria-haspopup="dialog">Filters{chips.length ? ` (${chips.length})` : ''}</button><div className={styles.viewToggle} role="group" aria-label="Catalog view"><button type="button" aria-pressed={view === 'list'} onClick={() => setParam({ view: 'list' }, true)}><svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" /></svg>List</button><button type="button" aria-pressed={view === 'atlas'} onClick={() => setParam({ view: 'atlas' }, true)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" /><ellipse cx="8" cy="8" rx="2.5" ry="6" stroke="currentColor" /><path d="M2 8h12" stroke="currentColor" /></svg>Atlas</button></div></div>
          {chips.length > 0 && <div className={styles.chips} aria-label="Active filters">{chips.map((chip) => <button key={chip.key} type="button" onClick={chip.remove} aria-label={`Remove ${chip.text} filter`}>{chip.text}<span aria-hidden="true">×</span></button>)}<button type="button" className={styles.clearFilters} onClick={clearAll}>Clear all</button></div>}
          <div className={styles.resultsMeta}><p aria-live="polite" aria-atomic="true">{loading ? 'Searching the index…' : error ? 'Results unavailable' : total ? <><strong>{total.toLocaleString('en-US')}</strong> dataset{total === 1 ? '' : 's'}{view === 'atlas' ? ` · ${rows.length} shown · Page ${page}` : ` · Showing ${(page - 1) * CATALOG_PAGE_SIZE + 1}–${(page - 1) * CATALOG_PAGE_SIZE + rows.length}`}</> : 'No matching datasets'}</p><label className={styles.sort}><span>Sort by</span><select value={filters.sort} onChange={(event) => setParam({ sort: event.target.value })} aria-label="Sort datasets"><option value="coverage">Coverage</option><option value="recent">Recently updated</option><option value="size">Row count</option><option value="name">Name</option></select></label></div>
          <div aria-busy={loading}>
            {loading && <div className={styles.loading} role="status" aria-label="Loading datasets">{Array.from({ length: 6 }, (_, index) => <div key={index}><span /><span /><span /></div>)}</div>}
            {error && <div className={styles.empty} role="alert"><p className={styles.overline}>Connection interrupted</p><h2>The index is out of reach.</h2><p>{error}</p><button className={styles.primaryButton} type="button" onClick={() => setRetry((value) => value + 1)}>Try again <Arrow /></button></div>}
            {data && !rows.length && <div className={styles.empty}><div className={styles.emptyOrb} aria-hidden="true" /><h2>No records in this view.</h2><p>Try another search or remove a filter to widen the index.</p>{chips.length > 0 && <button className={styles.primaryButton} type="button" onClick={clearAll}>Clear filters <Arrow /></button>}<Link href="/publish/">Suggest a dataset</Link></div>}
            {data && rows.length > 0 && view === 'list' && <div className={styles.recordList}>
              <div className={styles.columnLabels} aria-hidden="true"><span>Dataset / publisher</span><span>Declared licence</span><span>Documentation</span><span /></div>
              <ul>{rows.map((record) => <li key={record.slug} className={styles.recordRow}><div className={styles.recordIdentity}><span className={styles.recordGlyph} aria-hidden="true"><span /><span /></span><div><Link href={`/datasets/${record.slug}/`}>{record.name}</Link><p>{record.publisher}<span> / </span>{platformLabel[record.platform]}</p><p className={styles.recordDescription}>{record.description}</p><span className={styles.mobileLicence}>{record.license.spdx || 'Not stated'}</span></div></div><div className={styles.recordLicence}>{record.license.spdx || 'Not stated'}</div><Coverage record={record} /><Link className={styles.recordArrow} href={`/datasets/${record.slug}/`} aria-label={`Open ${record.name}`} tabIndex={-1}><Arrow diagonal /></Link></li>)}</ul>
              <p className={styles.coverageExplanation}>Coverage measures documentation completeness. <Link href="/docs/#methodology">Read the methodology <span aria-hidden="true">↗</span></Link></p>
            </div>}
            {data && rows.length > 0 && view === 'atlas' && <div className={styles.atlas}>
              <div className={styles.atlasGrid}><div className={styles.atlasScene}><NetworkField className={styles.network} records={rows} selectedSlug={selected?.slug ?? null} onSelect={setSelectedSlug} mode="explore" active={!drawer} /><p className={styles.sceneLegend}>Connections show shared metadata; they do not establish derivation. Displayed connections are a subset.</p></div><Inspector record={selected} selectionMissing={!!selectedSlug && !selected} /></div>
              <div className={styles.atlasListHeading}><h2>Records in this view</h2><p>Select a record to inspect it.</p></div><ul className={styles.atlasList} aria-label="Select an Atlas record">{rows.map((record, index) => <li key={record.slug}><button type="button" aria-pressed={selected?.slug === record.slug} onClick={() => setSelectedSlug(record.slug)}><span className={styles.recordIndex}>{String((page - 1) * CATALOG_PAGE_SIZE + index + 1).padStart(2, '0')}</span><span><strong>{record.name}</strong><small>{record.publisher}</small></span><span className={styles.selectionDot} aria-hidden="true" /></button></li>)}</ul>
            </div>}
          </div>
          {data && total > CATALOG_PAGE_SIZE && <nav className={styles.pagination} aria-label="Catalog pages"><button type="button" disabled={page <= 1} onClick={() => setParam({ page: page <= 2 ? null : String(page - 1) }, true)}><span aria-hidden="true">←</span> Previous</button><p>Page <strong>{page}</strong> of {pageCount}</p><button type="button" disabled={page >= pageCount} onClick={() => setParam({ page: String(page + 1) }, true)}>Next <span aria-hidden="true">→</span></button></nav>}
        </div>
      </div>
    </div>
  );
}
