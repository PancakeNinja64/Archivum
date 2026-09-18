import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareDesk } from '@/components/workbench/CompareDesk';
import styles from '@/components/workbench/compare.module.css';

export const metadata: Metadata = {
  title: 'Compare records',
  description: 'Two to four public AI dataset records side by side: published licence, lookup terms, platform, size, recency, and the four documentation sections.',
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className={styles.page} role="status" aria-label="Opening the comparison desk"><div className={styles.main}><p style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Opening the comparison desk…</p></div></div>}>
      <CompareDesk />
    </Suspense>
  );
}
