import Link from 'next/link';
import styles from './SearchForm.module.css';

export interface ExampleQuery { label: string; href: string }

/** Queries the desk understands today: free text, a licence filter, a commercial-use floor. */
export const EXAMPLE_QUERIES: ExampleQuery[] = [
  { label: 'clinical notes', href: '/workspace/?q=clinical' },
  { label: 'speech audio', href: '/workspace/?q=speech' },
  { label: 'code review', href: '/workspace/?q=code%20review' },
  { label: 'licensed CC-BY-4.0', href: '/workspace/?license=CC-BY-4.0' },
  { label: 'commercial use, 75%+ documented', href: '/workspace/?commercial=1&min=75' },
  { label: 'legal question answering', href: '/workspace/?q=legal' },
];

export function SearchForm({ id, examples, size = 'large', label }: { id: string; examples: ExampleQuery[]; size?: 'large' | 'compact'; label?: string }) {
  return (
    <div className={`${styles.wrap} ${size === 'compact' ? styles.compact : ''}`}>
      <form action="/workspace/" method="get" role="search" className={styles.form}>
        <label htmlFor={id} className={styles.srOnly}>{label ?? 'Search datasets'}</label>
        <span className={styles.glyph} aria-hidden="true">⌕</span>
        <input id={id} name="q" type="search" className={styles.input} placeholder="Search datasets…" autoComplete="off" maxLength={200} />
        <button type="submit" className={styles.submit}>Search <span aria-hidden="true">↗</span></button>
      </form>
      <ul className={styles.examples} aria-label="Example searches">
        {examples.map((q) => <li key={q.href}><Link href={q.href}>{q.label}</Link></li>)}
      </ul>
    </div>
  );
}
