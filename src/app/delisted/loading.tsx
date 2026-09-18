import styles from '@/components/chronicle/Chronicle.module.css';

export default function DelistedLoading() {
  return (
    <section className={styles.loadingPage} aria-busy="true">
      <p>Delisted</p>
      <h1>The record outlives the source.</h1>
      <p role="status">Loading preserved records…</p>
      <div className={styles.loadingBar} />
    </section>
  );
}
