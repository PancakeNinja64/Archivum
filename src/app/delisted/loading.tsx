import styles from '@/components/graveyard/PreservedArchive.module.css';

export default function DelistedLoading() {
  return <section className={styles.errorPage} aria-busy="true"><p>Delisted</p><h1>The record outlives the source.</h1><p role="status">Loading preserved records…</p><div className={styles.loadingSurface} /></section>;
}
