'use client';

import Link from 'next/link';
import type { Dataset, DatasetSummary } from '@/lib/types';
import { coverageSections, formatDate, platformLabel } from './record-facts';
import { recordHref } from './RecordPlate';
import styles from './RecordSurface.module.css';

interface RecordSurfaceProps {
  summary: DatasetSummary | null;
  full: Dataset | null;
  catalogMode: 'catalog' | 'illustrative';
  unavailable: boolean;
}

/**
 * The inspectable record after the choreography: the same record, read as a
 * document. It carries what the plate does not — the description, coverage by
 * section, and the recorded versions — and the way into the workspace.
 */
export function RecordSurface({ summary, full, catalogMode, unavailable }: RecordSurfaceProps) {
  if (!summary) {
    return (
      <section id="record" className={styles.surface} aria-labelledby="record-heading">
        <div className={styles.inner}>
          <div className={styles.lead}>
            <span className={styles.chapter}>04 · Record</span>
            <h2 id="record-heading">Inspect the record.</h2>
            <p>{unavailable ? 'The catalog is temporarily unavailable, so there is no record to show here yet.' : 'No record is available to show here yet.'}</p>
            <Link href="/workspace/" className={styles.primary}>Open the workspace <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>
    );
  }

  const sections = coverageSections(full);
  const versions = full?.versions.slice(0, 3) ?? [];
  const compareHref = `/compare/?datasets=${encodeURIComponent(summary.slug)}`;

  return (
    <section id="record" className={styles.surface} aria-labelledby="record-heading">
      <div className={styles.inner}>
        <div className={styles.lead}>
          <span className={styles.chapter}>04 · Record</span>
          <h2 id="record-heading">Inspect the record.</h2>
          <p>Everything above is one record. Open it in the workspace to read each check, follow the lineage, and keep a shortlist on this device.</p>
          <div className={styles.actions}>
            <Link href={recordHref(summary.slug)} className={styles.primary}>Open in workspace <span aria-hidden="true">↗</span></Link>
            <Link href={compareHref} className={styles.secondary}>Compare with another record</Link>
          </div>
          <p className={styles.caveat}>Documentation Coverage counts provenance fields present at the source. It is not a quality, trust or permission score.</p>
        </div>

        <article className={styles.sheet} aria-label={`${summary.name} record`}>
          <header className={styles.sheetHead}>
            <div className={styles.sheetMeta}>
              <span>{catalogMode === 'illustrative' ? 'Illustrative record' : 'Catalog record'}</span>
              <span className={styles.mono}>{summary.slug}</span>
            </div>
            <h3>{summary.name}</h3>
            <p className={styles.publisher}>{summary.publisher} · {platformLabel(summary.platform)}{summary.domain.length ? ` · ${summary.domain.join(', ')}` : ''}</p>
            <p className={styles.description}>{summary.description}</p>
          </header>

          <div className={styles.coverage}>
            <div className={styles.coverageHead}>
              <strong>{summary.coverageTotal}<small>%</small></strong>
              <span>Documentation Coverage<br /><span className={styles.mono}>{summary.coverageCheckedAt ? `checked ${formatDate(summary.coverageCheckedAt)}` : 'check date not stated'}</span></span>
            </div>
            {sections.length > 0 ? (
              <ul className={styles.sections} aria-label="Coverage by section">
                {sections.map((s) => (
                  <li key={s.key}>
                    <div className={styles.sectionLine}><span>{s.label}</span><span className={styles.mono}>{s.score}%</span></div>
                    <div className={styles.meter} aria-hidden="true"><span style={{ width: `${Math.min(100, Math.max(0, s.score))}%` }} /></div>
                    <p className={styles.counts}><span>{s.documented} retrieved</span><span>{s.reported} stated</span><span>{s.notFound} not found</span>{s.applicable < 7 ? <span>{7 - s.applicable} n/a</span> : null}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.loading} role="status">Loading the section breakdown…</p>
            )}
          </div>

          <div className={styles.history}>
            <div className={styles.sectionLine}><span>Recorded versions</span><span className={styles.mono}>{full ? `${full.versions.length} total` : '…'}</span></div>
            {versions.length > 0 ? (
              <ol className={styles.versions}>
                {versions.map((v) => (
                  <li key={`${v.version}-${v.date ?? ''}`}>
                    <span className={styles.mono}>{v.version}</span>
                    <span className={styles.mono}>{v.date ? formatDate(v.date) : 'date not stated'}</span>
                    <span className={styles.note}>{v.note || 'No release note'}</span>
                    <span className={styles.mono}>{v.coverageTotal == null ? 'coverage not stated' : `${v.coverageTotal}% documented`}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className={styles.loading}>{full ? 'No version history was published at the source.' : 'Loading version history…'}</p>
            )}
          </div>

          <footer className={styles.sheetFoot}>
            <span>Files stay with the publisher. Archivum indexes the metadata.</span>
            <Link href={recordHref(summary.slug, 'evidence')}>Read every check <span aria-hidden="true">↗</span></Link>
          </footer>
        </article>
      </div>
    </section>
  );
}
