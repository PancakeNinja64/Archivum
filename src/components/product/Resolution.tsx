import Link from 'next/link';
import { EXAMPLE_QUERIES, SearchForm } from './SearchForm';
import styles from './Resolution.module.css';

/** The last word is practical: search, useful example queries, then the footer. */
export function Resolution({ total, catalogMode }: { total: number | null; catalogMode: 'catalog' | 'illustrative' }) {
  return (
    <section id="search" className={styles.resolution} aria-labelledby="search-heading">
      <div className={styles.inner}>
        <div className={styles.lead}>
          <span className={styles.chapter}>06 · Search</span>
          <h2 id="search-heading">Start with a question.</h2>
          <p>{total === null ? 'The catalog is temporarily unavailable; the workspace will retry.' : `${total.toLocaleString('en-US')} ${catalogMode === 'illustrative' ? 'illustrative' : 'public'} records, each with its source, terms, structure and history.`}</p>
        </div>
        <div className={styles.form}>
          <SearchForm id="resolution-search" examples={EXAMPLE_QUERIES} label="Search the catalog" />
          <p className={styles.paths}>
            <Link href="/workspace/">Browse everything</Link>
            <Link href="/collections/">Saved records</Link>
            <Link href="/docs/#methodology">How coverage is counted</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
