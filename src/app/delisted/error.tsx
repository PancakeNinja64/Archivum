'use client';

import styles from '@/components/chronicle/Chronicle.module.css';

export default function DelistedError({ reset }: { reset: () => void }) {
  return (
    <section className={styles.errorPage}>
      <p>Delisted</p>
      <h1>The archive could not be loaded.</h1>
      <p>
        Your browser could not complete this request. Try again to load
        preserved records.
      </p>
      <button type="button" className={styles.errorAction} onClick={reset}>
        Try again
      </button>
      <a href="/explore" className={styles.errorSecondary}>
        Explore the current catalog →
      </a>
    </section>
  );
}
