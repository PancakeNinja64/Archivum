'use client';

import { END_STATE_LABEL, type DelistedRecord } from '@/lib/graveyard/types';
import { formatRecordDate, PLATFORM_LABELS } from '@/lib/graveyard/register';
import styles from './PreservedArchive.module.css';

export function PreservedRegister({ records, selected, onSelect }: {
  records: DelistedRecord[];
  selected: string;
  onSelect: (slug: string, trigger: HTMLElement) => void;
}) {
  return <div className={styles.register}><table>
    <caption className={styles.srOnly}>Preserved records. Licence and documentation coverage reflect the last recorded check.</caption>
    <thead><tr><th scope="col">Dataset / publisher</th><th scope="col">Observed state</th><th scope="col">Last confirmed</th><th scope="col">Declared licence</th><th scope="col">Coverage</th></tr></thead>
    <tbody>{records.map(record => <tr key={record.slug} className={selected === record.slug ? styles.selectedRow : ''}>
      <th scope="row"><button type="button" aria-pressed={selected === record.slug} onClick={event => onSelect(record.slug, event.currentTarget)}><strong>{record.name}</strong><span>{record.publisher} · {PLATFORM_LABELS[record.platform]}</span></button></th>
      <td data-label="Observed state"><span className={styles.stateTag}>{END_STATE_LABEL[record.endState]}</span></td>
      <td data-label="Last confirmed"><time dateTime={record.lastConfirmed}>{formatRecordDate(record.lastConfirmed)}</time></td>
      <td data-label="Declared licence">{record.license}</td>
      <td data-label="Coverage"><span className={styles.coverageValue}>{record.coverageTotal}%</span><span className={styles.coverageHint}>at last check</span></td>
    </tr>)}</tbody>
  </table></div>;
}
