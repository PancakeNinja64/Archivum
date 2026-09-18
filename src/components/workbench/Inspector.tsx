'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { COVERAGE_CHECKS, COVERAGE_SECTIONS, type CheckResult, type CoverageSectionKey } from '@/lib/coverage/rules';
import type { Dataset } from '@/lib/types';
import { commercialUseLabel, evidenceLabel, fmtBytes, fmtDate, fmtInt, platformLabel, safeExternalUrl } from '@/lib/utils';
import { compareHref, INSPECTOR_TABS, type InspectorTab } from '@/lib/workbench/query';
import { SHORTLIST_LIMIT } from '@/lib/workbench/shortlist';
import type { useShortlist } from '@/lib/workbench/useShortlist';
import { useBriefExport } from '@/lib/workbench/useBriefExport';
import { EvidenceMark, Glyph } from './Glyph';
import { platformName, publisherName } from './recordMeta';
import desk from './desk.module.css';
import styles from './inspector.module.css';

export type InspectorState =
  | { state: 'loading'; slug: string }
  | { state: 'absent'; slug: string }
  | { state: 'error'; slug: string; message: string }
  | { state: 'ready'; record: Dataset };

interface InspectorProps {
  state: InspectorState;
  tab: InspectorTab;
  origin: 'catalog' | 'illustrative';
  shortlist: ReturnType<typeof useShortlist>;
  onTab: (tab: InspectorTab) => void;
  onRetry: () => void;
  onClear: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}

const TAB_LABEL: Record<InspectorTab, string> = { overview: 'Overview', evidence: 'Evidence', history: 'History', structure: 'Structure' };
const RESULT_LABEL: Record<CheckResult | 'unavailable', string> = { documented: 'Documented', reported: 'Reported', not_found: 'Not found', 'n/a': 'Not applicable', unavailable: 'Unavailable' };

const Unknown = ({ text = 'Not stated' }: { text?: string }) => <span className={styles.unknown}>{text}</span>;

/* ---------- Header ---------- */

function RecordHeader({ record, origin, shortlist, headingRef }: { record: Dataset; origin: InspectorProps['origin']; shortlist: InspectorProps['shortlist']; headingRef: InspectorProps['headingRef'] }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const exporter = useBriefExport();
  const saved = shortlist.has(record.slug);
  const others = shortlist.items.filter((item) => item.slug !== record.slug).map((item) => item.slug);
  const compareTarget = others.length ? compareHref([...others.slice(0, SHORTLIST_LIMIT - 1), record.slug]) : null;
  const sourceUrl = origin === 'catalog' ? safeExternalUrl(record.platformUrl) : null;
  const longDescription = (record.description ?? '').length > 220;

  const toggleSave = () => {
    if (saved) { shortlist.remove(record.slug); setStatus('Removed from the records saved on this device.'); return; }
    const result = shortlist.add(record);
    if (result.ok) setStatus(`Saved on this device · ${shortlist.items.length + 1} of ${SHORTLIST_LIMIT}.`);
    else if (result.reason === 'full') setStatus(`The shortlist holds ${SHORTLIST_LIMIT} records on this device. Remove one to add this record.`);
    else setStatus('This record is already saved on this device.');
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setStatus('Link copied. It carries the search, the record, and the open tab — nothing from this device\'s shortlist.'); }
    catch { setStatus('The link could not be copied automatically. Copy it from the address bar.'); }
  };

  return (
    <header className={styles.head}>
      <div className={styles.headTop}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className={styles.eyebrowRow}>
            <strong>{publisherName(record.publisher)}</strong>
            <span>{platformName(record.platform)}</span>
            {record.version && <span className={styles.eyebrowId}>{record.version}</span>}
            {origin === 'illustrative' && <span className={`${desk.pill} ${desk.pillDemo}`}>Illustrative record · fictional publisher</span>}
            {saved && <span className={`${desk.pill} ${desk.pillSaved}`}>Saved on this device</span>}
          </p>
          <h2 ref={headingRef} tabIndex={-1} className={styles.name}>{record.name}</h2>
          <div className={styles.description} data-expanded={expanded}>
            <p>{record.description || 'A source description is not available for this record.'}</p>
            {longDescription && <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>{expanded ? 'Show less' : 'Read the full description'}</button>}
          </div>
        </div>
        <div className={styles.coverageBig} aria-label={`Documentation coverage ${record.coverageTotal} percent, ${record.coverageBand}`}>
          <strong>{record.coverageTotal}<small>%</small></strong>
          <span>Documentation · {record.coverageBand}</span>
        </div>
      </div>

      <dl className={styles.facts}>
        <div><dt>Published licence</dt><dd>{record.license.spdx && record.license.spdx !== 'Not stated' ? record.license.spdx : <Unknown />}<small>{evidenceLabel[record.license.label]}</small></dd></div>
        <div><dt>Records</dt><dd>{record.sizeRows === null ? <Unknown /> : fmtInt(record.sizeRows)}<small>{record.sizeBytes === null ? 'size not stated' : fmtBytes(record.sizeBytes)}</small></dd></div>
        <div><dt>Source updated</dt><dd>{record.lastUpdated ? fmtDate(record.lastUpdated) : <Unknown />}<small>{record.firstPublished ? `first published ${fmtDate(record.firstPublished)}` : 'first publication not stated'}</small></dd></div>
        <div><dt>Archivum checked</dt><dd>{record.coverageCheckedAt ? fmtDate(record.coverageCheckedAt) : <Unknown />}<small>method v{record.coverageVersion}</small></dd></div>
      </dl>

      <div className={styles.actions}>
        <div className={styles.actionsPrimary}>
          <button type="button" className={saved ? desk.button : desk.buttonPrimary} onClick={toggleSave} aria-pressed={saved}>
            <Glyph name={saved ? 'check' : 'bookmark'} size={15} />{saved ? 'Saved on this device' : 'Save on this device'}
          </button>
          {compareTarget
            ? <Link className={desk.button} href={compareTarget}><Glyph name="compare" size={15} />Compare with saved</Link>
            : <button type="button" className={desk.button} disabled title="Save another record to compare"><Glyph name="compare" size={15} />Compare</button>}
        </div>
        <div className={styles.actionsSecondary}>
          <div className={styles.actionGroup} role="group" aria-label="Export research brief">
            <span>Brief</span>
            <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} disabled={exporter.busy !== null} onClick={() => exporter.run([{ slug: record.slug, name: record.name, record }], 'record', 'md')}><Glyph name="download" size={14} />Markdown</button>
            <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} disabled={exporter.busy !== null} onClick={() => exporter.run([{ slug: record.slug, name: record.name, record }], 'record', 'json')}><Glyph name="download" size={14} />JSON</button>
          </div>
          <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} onClick={copyLink}><Glyph name="link" size={14} />Copy link</button>
          {sourceUrl && <a className={`${desk.buttonQuiet} ${desk.buttonSmall}`} href={sourceUrl} target="_blank" rel="noopener noreferrer"><Glyph name="external" size={14} />Open at source</a>}
        </div>
        {(status || exporter.notice) && <p className={styles.status} role="status" aria-live="polite">{exporter.notice?.text ?? status}</p>}
      </div>
    </header>
  );
}

/* ---------- Tabs ---------- */

function Tabs({ tab, onTab, record, base }: { tab: InspectorTab; onTab: (tab: InspectorTab) => void; record: Dataset; base: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const gaps = Object.values(record.coverageDetail ?? {}).filter((r) => r === 'not_found').length;
  const counts: Partial<Record<InspectorTab, string>> = {
    evidence: gaps ? `${gaps} not found` : 'complete',
    history: `${record.versions.length}`,
    structure: record.schema.length ? `${record.schema.length} fields` : undefined,
  };
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = INSPECTOR_TABS.indexOf(tab);
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % INSPECTOR_TABS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + INSPECTOR_TABS.length) % INSPECTOR_TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = INSPECTOR_TABS.length - 1;
    else return;
    event.preventDefault();
    onTab(INSPECTOR_TABS[next]);
    refs.current[next]?.focus();
  };
  return (
    <div className={styles.tabs} role="tablist" aria-label="Record sections" onKeyDown={onKey}>
      {INSPECTOR_TABS.map((key, index) => (
        <button
          key={key}
          ref={(el) => { refs.current[index] = el; }}
          type="button"
          role="tab"
          id={`${base}-tab-${key}`}
          aria-selected={tab === key}
          aria-controls={`${base}-panel-${key}`}
          tabIndex={tab === key ? 0 : -1}
          className={styles.tab}
          onClick={() => onTab(key)}
        >
          {TAB_LABEL[key]}{counts[key] && <small>{counts[key]}</small>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Overview ---------- */

function OverviewPanel({ record, origin, onTab }: { record: Dataset; origin: InspectorProps['origin']; onTab: (tab: InspectorTab) => void }) {
  const gaps = COVERAGE_CHECKS.filter((check) => record.coverageDetail?.[check.id] === 'not_found');
  return (
    <>
      <div className={styles.block}>
        <div className={styles.blockHead}><h3>The record at a glance.</h3><p>Source metadata, organised for inspection. Unstated fields stay visible.</p></div>
        <dl className={styles.facts} style={{ borderTop: 0, marginTop: 0 }}>
          <div><dt>Modality</dt><dd>{record.modality}</dd></div>
          <div><dt>Languages</dt><dd>{record.languages.length ? record.languages.join(', ') : <Unknown />}</dd></div>
          <div><dt>Domain</dt><dd>{record.domain.length ? record.domain.join(', ') : <Unknown />}</dd></div>
          <div><dt>Download size</dt><dd>{record.sizeBytes === null ? <Unknown /> : fmtBytes(record.sizeBytes)}</dd></div>
          <div><dt>First published at source</dt><dd>{record.firstPublished ? fmtDate(record.firstPublished) : <Unknown />}</dd></div>
          <div><dt>Content hash</dt><dd>{record.contentHash ? <code className={desk.mono} style={{ color: 'inherit' }}>{record.contentHash}</code> : <Unknown />}</dd></div>
          <div><dt>Commercial use (lookup)</dt><dd>{record.license.commercialUse === 'not_stated' ? <Unknown text="Terms not stated" /> : commercialUseLabel[record.license.commercialUse]}<small>static SPDX lookup, not source text</small></dd></div>
          <div><dt>Source</dt><dd>{origin === 'catalog' ? (safeExternalUrl(record.platformUrl) ? platformLabel[record.platform] : <Unknown text="No valid source link" />) : <Unknown text="Illustrative · no external link" />}</dd></div>
        </dl>
      </div>
      <div className={styles.block}>
        <div className={styles.blockHead}><h3>Documentation, by section.</h3><p>Checked {record.coverageCheckedAt ? fmtDate(record.coverageCheckedAt) : 'on an unstated date'}</p></div>
        <dl className={styles.sections}>
          {record.coverageSections.map((section) => {
            const docShare = section.applicable ? (section.documented / section.applicable) * 100 : 0;
            const repShare = section.applicable ? (section.reported / section.applicable) * 100 : 0;
            return (
              <div key={section.key} className={styles.sectionCard}>
                <dt>{section.label}</dt>
                <dd>
                  <span className={styles.sectionScore}>{section.applicable ? <>{section.score}<small>%</small></> : <small>not applicable</small>}</span>
                  <span className={styles.sectionBar} aria-hidden="true"><i style={{ width: `${docShare}%` }} /><i style={{ width: `${repShare}%` }} /></span>
                  <span className={styles.sectionCounts}><span>{section.documented} documented</span><span>{section.reported} reported</span><span>{section.notFound} not found</span></span>
                </dd>
              </div>
            );
          })}
        </dl>
        <p className={styles.caption} style={{ marginTop: 16 }}>
          {gaps.length ? <><strong style={{ color: 'var(--foreground)', fontWeight: 500 }}>{gaps.length} of 28 checks not found at the source.</strong> These are gaps in the published documentation, not defects in the data. </> : 'Every applicable check was found at the source. '}
          <button type="button" className={desk.linkButton} onClick={() => onTab('evidence')}>Open Evidence for each check.</button>
        </p>
      </div>
    </>
  );
}

/* ---------- Evidence ---------- */

function EvidencePanel({ record, origin }: { record: Dataset; origin: InspectorProps['origin'] }) {
  const sourceUrl = origin === 'catalog' ? safeExternalUrl(record.platformUrl) : null;
  const sections = (Object.keys(COVERAGE_SECTIONS) as CoverageSectionKey[]).map((key) => ({ key, result: record.coverageSections.find((s) => s.key === key) }));
  return (
    <>
      <div className={styles.block}>
        <div className={styles.blockHead}><h3>Twenty-eight questions, four sections.</h3><p>Open a section, then a check, to read what was looked for.</p></div>
        {sections.map(({ key, result }, index) => (
          <details key={key} className={styles.drawer} open={index === 0}>
            <summary>
              <span className={styles.drawerIndex}>0{index + 1}</span>
              <span className={styles.drawerTitle}>{COVERAGE_SECTIONS[key].label}<small>{result ? `${result.documented} documented · ${result.reported} reported · ${result.notFound} not found${result.applicable < 7 ? ` · ${7 - result.applicable} not applicable` : ''}` : 'section result unavailable'}</small></span>
              <span className={styles.drawerScore}>{result && result.applicable ? <>{result.score}<small>%</small></> : <small>n/a</small>}</span>
              <span className={styles.drawerToggle} aria-hidden="true"><Glyph name="plus" size={16} /></span>
            </summary>
            <div className={styles.drawerBody}>
              <p>{COVERAGE_SECTIONS[key].question}</p>
              <ul className={styles.checks}>
                {COVERAGE_CHECKS.filter((check) => check.section === key).map((check) => {
                  const outcome = (record.coverageDetail?.[check.id] ?? 'unavailable') as CheckResult | 'unavailable';
                  return (
                    <li key={check.id}>
                      <details className={styles.check}>
                        <summary><EvidenceMark result={outcome} /><span>{check.label}</span><span className={styles.checkResult} data-result={outcome}>{RESULT_LABEL[outcome]}</span></summary>
                        <div className={styles.checkMethod}>
                          <p>{check.method}</p>
                          {outcome === 'n/a' && <p>Excluded from the section score: this check cannot apply on this platform.</p>}
                          {outcome === 'unavailable' && <p>This record did not carry an outcome for this check.</p>}
                          <p>Observed {record.coverageCheckedAt ? fmtDate(record.coverageCheckedAt) : 'on an unstated date'}. Individual artifact links are not supplied with this record.{sourceUrl && <> <a className={desk.link} href={sourceUrl} target="_blank" rel="noopener noreferrer">General source record ↗</a></>}</p>
                        </div>
                      </details>
                    </li>
                  );
                })}
              </ul>
            </div>
          </details>
        ))}
        <div className={styles.legend} aria-label="Evidence legend">
          <span><EvidenceMark result="documented" /> Documented · artifact retrieved</span>
          <span><EvidenceMark result="reported" /> Reported · stated by the publisher</span>
          <span><EvidenceMark result="not_found" /> Not found · absent when checked</span>
          <span><EvidenceMark result="n/a" /> Not applicable</span>
        </div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockHead}><h3>Licence, in context.</h3><p>The identifier keeps the source spelling.</p></div>
        <div className={styles.licenceGrid}>
          <div>
            <h4>Published identifier</h4>
            <p className={styles.licenceValue}>{record.license.spdx && record.license.spdx !== 'Not stated' ? record.license.spdx : <Unknown />}</p>
            <p className={styles.licenceMeta}><span><EvidenceMark result={record.license.label} />{evidenceLabel[record.license.label]}</span></p>
          </div>
          <div>
            <h4>Static licence lookup</h4>
            <p className={styles.licenceValue}>{record.license.commercialUse === 'not_stated' ? <Unknown text="Terms not stated" /> : commercialUseLabel[record.license.commercialUse]}</p>
            <p className={styles.licenceMeta}>
              <span>attribution: {record.license.attribution === null ? 'not established' : record.license.attribution ? 'required' : 'not required'}</span>
              <span>share-alike: {record.license.shareAlike === null ? 'not established' : record.license.shareAlike ? 'required' : 'not required'}</span>
            </p>
            <p className={styles.caption} style={{ marginTop: 10 }}>A lookup of the declared identifier, not a reading of the source text. Review the terms and any upstream restrictions before use.</p>
          </div>
        </div>
        {record.license.notes.length > 0 && <ul className={styles.notesList}>{record.license.notes.map((note) => <li key={note}>{note}</li>)}</ul>}
      </div>

      <div className={styles.block}>
        <div className={styles.blockHead}><h3>Recorded lineage.</h3><p>{record.lineage?.nodes?.length ? `${record.lineage.completeness}% of stages documented` : 'Not recorded'}</p></div>
        {record.lineage?.nodes?.length ? (
          <>
            <ol className={styles.lineage}>
              {record.lineage.nodes.map((node, index) => (
                <li key={node.id} className={styles.stage} data-evidence={node.evidence}>
                  <span className={styles.stageMark} aria-hidden="true">{index + 1}</span>
                  <span className={styles.stageTitle}>{node.label}<small>{node.description}</small></span>
                  <span className={styles.stageEvidence}><EvidenceMark result={node.evidence} />{evidenceLabel[node.evidence]}</span>
                  <span className={styles.stageMeta}><span className={styles.stageActor}>{node.actor}</span><span className={styles.stageId}>{node.stage}</span><span className={styles.stageId}>{node.timestamp ? fmtDate(node.timestamp) : 'date not stated'}</span><span className={styles.stageId}>{node.hash}</span></span>
                </li>
              ))}
            </ol>
            {record.lineage.undocumentedStages.length > 0 && <p className={styles.caption} style={{ marginTop: 12 }}>Undocumented stages: {record.lineage.undocumentedStages.join(', ')}. Missing documentation is named, not hidden.</p>}
          </>
        ) : <p className={styles.caption}>This record supplies no lineage nodes. That is a fact about the documentation, not about the data.</p>}
      </div>

      <p className={styles.caption} style={{ marginTop: 22 }}>Documentation Coverage reflects what was present in the {platformLabel[record.platform] ?? record.platform} record on {record.coverageCheckedAt ? fmtDate(record.coverageCheckedAt) : 'an unstated date'}. Documented counts fully, Reported counts halfway, Not applicable is excluded. A field marked “not found” means Archivum did not locate it in the published metadata — not that the dataset lacks that property. <Link href="/docs/#methodology">Read the methodology ↗</Link></p>
    </>
  );
}

/* ---------- History ---------- */

function HistoryPanel({ record }: { record: Dataset }) {
  const delta = (value: number | null, sign: '+' | '−') => (value === null ? <span className={styles.unknown}>not measured</span> : <strong>{sign}{fmtInt(value)}</strong>);
  return (
    <>
      <div className={styles.block}>
        <div className={styles.blockHead}><h3>A record through time.</h3><p>Most recent observation first</p></div>
        {record.versions.length ? (
          <ol className={styles.versions}>
            {record.versions.map((version, index) => (
              <li key={`${version.version}-${index}`} className={styles.version}>
                <span className={styles.versionTag}>{version.version}<small>{version.date ? fmtDate(version.date) : 'date not stated'}</small></span>
                <span className={styles.versionNote}>{version.note || <span className={styles.unknown}>No note recorded</span>}<small>{version.author || 'author not stated'}</small></span>
                <span className={styles.versionNumbers}>
                  <span>rows {delta(version.rowsAdded, '+')} / {delta(version.rowsRemoved, '−')}</span>
                  <span>coverage then {version.coverageTotal === null ? <span className={styles.unknown}>not recorded</span> : <strong>{version.coverageTotal}%</strong>}</span>
                </span>
              </li>
            ))}
          </ol>
        ) : <p className={styles.caption}>No version observations are recorded for this dataset. The source may not publish a revision history, or Archivum has checked it only once.</p>}
        <p className={styles.caption} style={{ marginTop: 14 }}>Row changes appear only when measured; “not measured” is not zero. Licence and schema comparisons across versions require historical snapshots that this record does not carry.</p>
      </div>
      <div className={styles.block}>
        <div className={styles.blockHead}><h3>Fixed points.</h3></div>
        <dl className={styles.facts} style={{ borderTop: 0, marginTop: 0 }}>
          <div><dt>First published at source</dt><dd>{record.firstPublished ? fmtDate(record.firstPublished) : <Unknown />}</dd></div>
          <div><dt>Source updated</dt><dd>{record.lastUpdated ? fmtDate(record.lastUpdated) : <Unknown />}</dd></div>
          <div><dt>Archivum checked</dt><dd>{record.coverageCheckedAt ? fmtDate(record.coverageCheckedAt) : <Unknown />}</dd></div>
          <div><dt>Content hash</dt><dd>{record.contentHash ? <code className={desk.mono} style={{ color: 'inherit' }}>{record.contentHash}</code> : <Unknown />}</dd></div>
        </dl>
      </div>
    </>
  );
}

/* ---------- Structure ---------- */

function cellText(value: unknown): { text: string; unknown: boolean } {
  if (value === null || value === undefined) return { text: 'null', unknown: true };
  if (typeof value === 'string') return { text: value, unknown: false };
  if (typeof value === 'number' || typeof value === 'boolean') return { text: String(value), unknown: false };
  try { return { text: JSON.stringify(value), unknown: false }; } catch { return { text: '[unserialisable]', unknown: true }; }
}

function StructurePanel({ record, origin }: { record: Dataset; origin: InspectorProps['origin'] }) {
  const columns = useMemo(() => {
    const keys: string[] = [];
    for (const row of record.sampleRecords) for (const key of Object.keys(row)) if (!keys.includes(key)) keys.push(key);
    return keys;
  }, [record.sampleRecords]);
  return (
    <>
      <div className={styles.block}>
        <div className={styles.blockHead}><h3>Schema.</h3><p>{record.schema.length ? `${record.schema.length} documented ${record.schema.length === 1 ? 'field' : 'fields'}` : 'Not available'}</p></div>
        {record.schema.length ? (
          <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Schema fields, scrollable sideways">
            <table className={styles.table}>
              <thead><tr><th scope="col">Field</th><th scope="col">Type</th><th scope="col">Nullable</th><th scope="col">Description</th></tr></thead>
              <tbody>{record.schema.map((field) => <tr key={field.name}><td><code>{field.name}</code></td><td><code>{field.type}</code></td><td>{field.nullable ? 'yes' : 'no'}</td><td><span className={styles.cellText}>{field.description || <Unknown text="No description" />}</span></td></tr>)}</tbody>
            </table>
          </div>
        ) : <p className={styles.caption}>No schema fields are available in this record. Column names and types were not retrievable from the source when checked.</p>}
        <p className={styles.scrollHint}>Scroll the table sideways to see every column.</p>
      </div>
      <div className={styles.block}>
        <div className={styles.blockHead}><h3>Preview rows.</h3><p>{record.sampleRecords.length ? `${record.sampleRecords.length} supplied with the record` : 'Not available'}</p></div>
        {record.sampleRecords.length ? (
          <>
            <p className={styles.caption} style={{ marginBottom: 12 }}>{origin === 'illustrative' ? 'Illustrative example rows. ' : ''}A preview does not describe the distribution of the full dataset. Values shown as <em>null</em> were null in the source preview.</p>
            <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Preview rows, scrollable sideways">
              <table className={styles.table}>
                <thead><tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
                <tbody>{record.sampleRecords.map((row, index) => <tr key={index}>{columns.map((column) => { const cell = cellText(row[column]); return <td key={column}><span className={styles.cellText}>{cell.unknown ? <span className={styles.unknown}>{cell.text}</span> : cell.text}</span></td>; })}</tr>)}</tbody>
              </table>
            </div>
            <p className={styles.scrollHint}>Scroll the table sideways to see every column.</p>
          </>
        ) : <p className={styles.caption}>Preview rows are not available. Check the original source for supported previews and access terms.</p>}
      </div>
    </>
  );
}

/* ---------- Shell ---------- */

export function Inspector({ state, tab, origin, shortlist, onTab, onRetry, onClear, headingRef }: InspectorProps) {
  const reduced = useReducedMotion();
  const panelId = useId();

  if (state.state === 'loading') {
    return (
      <div className={styles.inspector} role="status" aria-label="Loading the record">
        <div className={styles.loadingHead}>
          <span className={desk.skeleton} style={{ display: 'block', width: 180, height: 12 }} />
          <span className={desk.skeleton} style={{ display: 'block', width: '70%', height: 40, marginTop: 16 }} />
          <span className={desk.skeleton} style={{ display: 'block', width: '52%', height: 14, marginTop: 14 }} />
          <span className={desk.skeleton} style={{ display: 'block', width: '46%', height: 14, marginTop: 8 }} />
        </div>
        <p className={styles.caption} style={{ marginTop: 20 }}>Retrieving <code className={desk.mono}>{state.slug}</code> from the catalog…</p>
      </div>
    );
  }

  if (state.state === 'absent') {
    return (
      <div className={styles.state}>
        <p className={desk.eyebrow}>No record</p>
        <h2>Nothing in this catalog is filed under “{state.slug}”.</h2>
        <p>The link may point at a record that was delisted, renamed, or never published here{origin === 'illustrative' ? ' — this illustrative catalog holds only its sample records' : ''}. Results on the left are unaffected.</p>
        <div className={styles.stateRow}>
          <button type="button" className={desk.buttonPrimary} onClick={onClear}>Clear the selection</button>
          <Link className={desk.button} href="/delisted/?demo=1">Look in Delisted <Glyph name="arrow" size={14} /></Link>
        </div>
      </div>
    );
  }

  if (state.state === 'error') {
    return (
      <div className={styles.state} role="alert">
        <p className={desk.eyebrow}>Connection interrupted</p>
        <h2>The record could not be retrieved.</h2>
        <p>{state.message} The selection stays in the link, so you can try again or come back later.</p>
        <div className={styles.stateRow}>
          <button type="button" className={desk.buttonPrimary} onClick={onRetry}>Try again <Glyph name="arrow" size={14} /></button>
          <button type="button" className={desk.button} onClick={onClear}>Clear the selection</button>
        </div>
      </div>
    );
  }

  const { record } = state;
  return (
    <motion.article
      key={record.slug}
      className={styles.inspector}
      aria-label={`Record: ${record.name}`}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <RecordHeader record={record} origin={origin} shortlist={shortlist} headingRef={headingRef} />
      <Tabs tab={tab} onTab={onTab} record={record} base={panelId} />
      <section role="tabpanel" id={`${panelId}-panel-${tab}`} aria-labelledby={`${panelId}-tab-${tab}`} className={styles.panel}>
        {tab === 'overview' && <OverviewPanel record={record} origin={origin} onTab={onTab} />}
        {tab === 'evidence' && <EvidencePanel record={record} origin={origin} />}
        {tab === 'history' && <HistoryPanel record={record} />}
        {tab === 'structure' && <StructurePanel record={record} origin={origin} />}
      </section>
    </motion.article>
  );
}
