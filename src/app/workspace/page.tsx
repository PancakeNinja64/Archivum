import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Workbench } from '@/components/workbench/Workbench';
import styles from '@/components/workbench/desk.module.css';

export const metadata: Metadata = {
  title: 'Research desk',
  description: 'Search public AI datasets, inspect the evidence behind each record, keep a shortlist on this device, and export a research brief.',
};

/** The desk reads its whole state from the query string, so it renders inside a Suspense boundary. */
function DeskFallback() {
  return (
    <div className={styles.desk} data-mode="list" role="status" aria-label="Opening the research desk">
      <div className={styles.body}>
        <div className={styles.results}><div className={styles.resultsHead}><p className={styles.mono}>Opening the research desk…</p></div></div>
        <div className={styles.evidence} />
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={<DeskFallback />}>
      <Workbench />
    </Suspense>
  );
}
