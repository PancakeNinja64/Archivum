'use client';

import type { CSSProperties, MouseEvent } from 'react';
import { END_STATES, END_STATE_LABEL, type DelistedRecord } from '@/lib/graveyard/types';
import styles from './PreservedArchive.module.css';

export function PlateField({ records, selected, onSelect }: {
  records: DelistedRecord[];
  selected: string;
  onSelect: (slug: string, trigger: HTMLElement) => void;
}) {
  return (
    <div className={styles.field} aria-label="Preserved records, arranged by observed state">
      <div className={styles.fieldLight} aria-hidden="true" />
      <div className={styles.fieldHeading}><span>Chronological field</span><span>Newest record in front</span></div>
      <div className={styles.lanes}>
        {END_STATES.map((state, lane) => {
          const group = records.filter(record => record.endState === state);
          return (
            <section key={state} className={styles.lane} aria-label={END_STATE_LABEL[state]}>
              <div className={styles.rail} aria-hidden="true" />
              <div className={styles.plates}>
                {group.map((record, index) => (
                  <button type="button" key={record.slug}
                    tabIndex={-1}
                    className={`${styles.plate} ${selected === record.slug ? styles.plateSelected : ''}`}
                    aria-label={`Inspect ${record.name}, ${END_STATE_LABEL[state]}, last confirmed ${record.lastConfirmed}`}
                    aria-pressed={selected === record.slug}
                    style={{ '--index': index, '--count': group.length, '--lane': lane, zIndex: selected === record.slug ? 30 : group.length - index } as CSSProperties}
                    onClick={(event: MouseEvent<HTMLButtonElement>) => onSelect(record.slug, event.currentTarget)}>
                    <span className={styles.plateDate}>{record.lastConfirmed.slice(0, 4)}</span>
                    <span className={styles.plateRule} aria-hidden="true" />
                    <span className={styles.plateName}>{record.name}</span>
                    <span className={styles.plateMeta}>{String(index + 1).padStart(2, '0')} / {record.platform}</span>
                    <span className={styles.plateMark} aria-hidden="true">↗</span>
                  </button>
                ))}
                {!group.length && <p className={styles.emptyLane}>No records<br />on this page</p>}
              </div>
              <div className={styles.laneLabel}><span>{String(lane + 1).padStart(2, '0')}</span><h3>{END_STATE_LABEL[state]}</h3><span>{group.length}</span></div>
            </section>
          );
        })}
      </div>
      <label className={styles.fieldPicker}>Inspect a record<select value={selected} onChange={event => { if (event.target.value) onSelect(event.target.value, event.currentTarget); }}><option value="">Choose from this page</option>{records.map(record => <option key={record.slug} value={record.slug}>{record.name} · {END_STATE_LABEL[record.endState]}</option>)}</select></label>
      <p className={styles.fieldCaption}>Each plate preserves one record. Positions show state and chronology, never a risk ranking.</p>
    </div>
  );
}

/** Decorative, explicitly illustrative preview for the unavailable historical catalog. */
export function PlatePreview() {
  return <div className={styles.preview} aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <div key={index} className={styles.previewPlate} style={{ '--index': index } as CSSProperties}><span>ARCHIVUM</span><i /><strong>The record<br />remains.</strong><small>Illustrative record</small></div>)}</div>;
}
