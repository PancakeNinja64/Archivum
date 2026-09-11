'use client';

import { useEffect, useRef } from 'react';
import { COVERAGE_CHECKS, COVERAGE_SECTIONS, type CheckResult, type CoverageSectionKey } from '@/lib/coverage/rules';
import { decodeChecks, END_STATE_LABEL, type DelistedRecord } from '@/lib/graveyard/types';
import { formatRecordDate, observationAge, PLATFORM_LABELS, safeSourceUrl } from '@/lib/graveyard/register';
import styles from './PreservedArchive.module.css';

const RESULT: Record<CheckResult, [string, string]> = { documented: ['●', 'Documented'], reported: ['◐', 'Reported'], not_found: ['○', 'Not found'], 'n/a': ['—', 'Not applicable'] };

function InspectorContents({ record, illustrative, asOf, onClose }: { record: DelistedRecord; illustrative: boolean; asOf: string; onClose: () => void }) {
  const age = observationAge(record.lastConfirmed, asOf);
  const checks = decodeChecks(record.checksAtLastCheck);
  const source = safeSourceUrl(record.sourceUrl);
  const successor = safeSourceUrl(record.successorUrl);
  return <>
    <div className={styles.inspectorTop}><p>{illustrative ? 'Illustrative record' : 'Preserved record'}</p><button type="button" onClick={onClose} aria-label="Close record inspector">×</button></div>
    <span className={styles.stateTag}>{END_STATE_LABEL[record.endState]}</span>
    <h2 id="preserved-record-title" tabIndex={-1}>{record.name}</h2>
    <p className={styles.publisher}>{record.publisher} · {PLATFORM_LABELS[record.platform]}</p>
    {illustrative && <p className={styles.illustrationNote}>A fictional record for exploring this interface. This is not a report about a real publisher.</p>}
    <dl className={styles.facts}><div><dt>Last confirmed</dt><dd><time dateTime={record.lastConfirmed}>{formatRecordDate(record.lastConfirmed)}</time></dd></div>
      <div><dt>{illustrative ? 'Age on example date' : 'Age of observation'}</dt><dd>{age === null ? 'Not available' : `${age.toLocaleString('en-US')} days`}</dd></div>
      {illustrative && <div><dt>Example date</dt><dd>{formatRecordDate(asOf)}</dd></div>}
      <div><dt>Declared licence</dt><dd>{record.license}</dd></div>
      <div><dt>First observed</dt><dd><time dateTime={record.firstObserved}>{formatRecordDate(record.firstObserved)}</time></dd></div>
    </dl>
    <div className={styles.coveragePanel}><span>{record.coverageTotal}<small>%</small></span><div><strong>Documentation coverage</strong><p>Frozen at the last check. Measures documented provenance, not quality or permission.</p></div></div>
    <section className={styles.observation}><h3>What was recorded</h3><p>{record.observationEvidence ?? (illustrative ? `This example demonstrates the ${END_STATE_LABEL[record.endState].toLowerCase()} state. Source evidence and individual check events are not supplied.` : 'The state is recorded, but supporting source evidence has not been supplied.')}</p>
    {record.endState === 'unreachable' && <p>Unreachable means access failed; it does not establish publisher withdrawal.</p>}</section>
    <details className={styles.checks}><summary>Frozen coverage checks <span>{COVERAGE_CHECKS.length}</span></summary><p className={styles.checkNotice}>These are the stored outcomes of the final check, not a current verification.</p>
      {(Object.keys(COVERAGE_SECTIONS) as CoverageSectionKey[]).map(section => <section key={section}><h3>{COVERAGE_SECTIONS[section].label}</h3><ul>{COVERAGE_CHECKS.filter(check => check.section === section).map(check => <li key={check.id}><span>{check.label}</span><span><i aria-hidden="true">{RESULT[checks[check.id]][0]}</i>{RESULT[checks[check.id]][1]}</span></li>)}</ul></section>)}
    </details>
    <div className={styles.inspectorLinks}>{successor && <a href={successor} target="_blank" rel="noopener noreferrer">Open known successor ↗</a>}{source && <a href={source} target="_blank" rel="noopener noreferrer">Original source · possibly unavailable ↗</a>}{!source && <p>Original source link not supplied.</p>}</div>
  </>;
}

export function PreservedInspector({ record, illustrative, asOf, compact, onClose }: { record: DelistedRecord | null; illustrative: boolean; asOf: string; compact: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!compact || !record || !dialog) return;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = overflow; };
  }, [compact, record]);
  if (compact) return record && <dialog ref={dialogRef} className={styles.sheet} aria-labelledby="preserved-record-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className={styles.sheetInner}><InspectorContents record={record} illustrative={illustrative} asOf={asOf} onClose={onClose} /></div></dialog>;
  return <aside className={styles.inspector} aria-label="Record inspector">{record ? <InspectorContents record={record} illustrative={illustrative} asOf={asOf} onClose={onClose} /> : <div className={styles.inspectorEmpty}><span className={styles.emptyIcon} aria-hidden="true">▤</span><p>Open a preserved record.</p><span>Select a plate or a register entry to inspect its final recorded state.</span><div><span>01</span> Identity & observation</div><div><span>02</span> Last recorded terms</div><div><span>03</span> Frozen documentation</div></div>}</aside>;
}
