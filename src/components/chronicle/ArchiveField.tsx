'use client';

import { useMemo, useRef, type CSSProperties, type MouseEvent, type PointerEvent } from 'react';
import type { DelistedRecord } from '@/lib/graveyard/types';
import { END_STATE_LABEL, END_STATE_TOKEN } from '@/lib/graveyard/types';
import { fmtDate } from './helpers';
import styles from './ArchiveField.module.css';

interface ArchiveFieldProps {
  /** Records surfaced in the field — the filtered register, or the whole archive when nothing matches. */
  records: DelistedRecord[];
  /** Size of the whole archive, so the summary stays honest while filters are active. */
  totalRecords: number;
  /** True when `records` is a fallback because the current filters matched nothing. */
  filtersMatchNothing: boolean;
  /** The chosen record. It need not be one of the nine surfaced planes. */
  selected: DelistedRecord | null;
  onSelect: (slug: string) => void;
  /** Record-specific: opens this record's dossier in the register. */
  onInspect: (slug: string) => void;
  /** Plain URL for the same dossier, so the link works before hydration. */
  inspectHref: (slug: string) => string;
  /** General navigation into the register: no selection change. */
  onEnterLedger: () => void;
  mode: 'illustrative' | 'catalog';
  asOf: string;
}

const PLACEMENTS = [
  [-38, -25, -190, -9], [-20, -34, -85, -5], [0, -28, -160, 1],
  [21, -32, -55, 5], [39, -19, -205, 9], [-31, 5, -45, -7],
  [-11, 8, -135, -2], [11, 10, -25, 2], [31, 7, -120, 7],
  [-24, 34, -180, -5], [-2, 37, -65, 0], [23, 32, -145, 5],
  [-42, 24, -245, -10], [42, 20, -230, 10],
] as const;

type FieldStyle = CSSProperties & {
  '--x': string;
  '--y': string;
  '--z': string;
  '--r': string;
  '--i': number;
  '--state-color': string;
};

export function ArchiveField({
  records,
  totalRecords,
  filtersMatchNothing,
  selected,
  onSelect,
  onInspect,
  inspectHref,
  onEnterLedger,
  mode,
  asOf,
}: ArchiveFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const visible = records.slice(0, 9);
  const selectedOnPlane = selected ? visible.some((record) => record.slug === selected.slug) : false;

  const stateCounts = useMemo(() => {
    const counts = new Map<string, number>();
    records.forEach((record) => counts.set(record.endState, (counts.get(record.endState) ?? 0) + 1));
    return counts;
  }, [records]);

  function moveField(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    event.currentTarget.style.setProperty('--field-rx', `${(-y * 3).toFixed(2)}deg`);
    event.currentTarget.style.setProperty('--field-ry', `${(x * 5).toFixed(2)}deg`);
  }

  function resetField() {
    fieldRef.current?.style.setProperty('--field-rx', '0deg');
    fieldRef.current?.style.setProperty('--field-ry', '0deg');
  }

  function enterLedger(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    onEnterLedger();
  }

  const summaryCount = filtersMatchNothing ? 0 : records.length;

  return (
    <section className={styles.hero} aria-labelledby="delisted-heading">
      <div className={styles.heroGrid}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}><span /> Delisted / Preserved record</p>
          <h1 id="delisted-heading">The source disappears.<br/><em>The record remains.</em></h1>
          <p className={styles.intro}>A spatial archive of public datasets that were removed, gated, superseded, or became unreachable. Enter the field, choose a preserved record, then inspect the evidence that remains.</p>
          <div className={styles.stats} aria-label="Archive summary">
            <span>
              <strong>{summaryCount === totalRecords ? totalRecords : `${summaryCount} of ${totalRecords}`}</strong>
              {summaryCount === totalRecords ? 'records in register' : 'records match the filters'}
            </span>
            <span><strong>{stateCounts.size}</strong> observed states</span>
            <span><strong>{asOf ? fmtDate(asOf) : '—'}</strong> archive date</span>
          </div>
          <a className={styles.enter} href="#delisted-ledger" onClick={enterLedger}>Enter the ledger <span aria-hidden="true">↓</span></a>
          {mode === 'illustrative' && <p className={styles.demoNote}>The current field uses fictional examples to demonstrate the interface.</p>}
        </div>

        <div
          ref={fieldRef}
          className={styles.field}
          onPointerMove={moveField}
          onPointerLeave={resetField}
          aria-label="Selectable spatial field of preserved records"
        >
          <div className={styles.atmosphere} aria-hidden="true" />
          <div className={styles.ringA} aria-hidden="true" />
          <div className={styles.ringB} aria-hidden="true" />
          <div className={styles.floor} aria-hidden="true" />
          <div className={styles.planes}>
            {visible.map((record, index) => {
              const [x, y, z, r] = PLACEMENTS[index];
              const isSelected = record.slug === selected?.slug;
              const planeStyle: FieldStyle = {
                '--x': `${x * 5.2}px`, '--y': `${y * 4.6}px`, '--z': `${z}px`, '--r': `${r}deg`, '--i': index,
                '--state-color': `var(${END_STATE_TOKEN[record.endState]})`,
              };
              return (
                <button
                  key={record.slug}
                  type="button"
                  className={`${styles.plane} ${isSelected ? styles.planeSelected : ''}`}
                  style={planeStyle}
                  onClick={() => onSelect(record.slug)}
                  aria-pressed={isSelected}
                  aria-label={`${record.name}, ${END_STATE_LABEL[record.endState]}, last confirmed ${fmtDate(record.lastConfirmed)}`}
                >
                  <span className={styles.planeTop}>
                    <span className={styles.planeCode}>{String(index + 1).padStart(2, '0')}</span>
                    {isSelected && <span className={styles.planeTag}>Selected</span>}
                  </span>
                  <span className={styles.planeName}>{record.name}</span>
                  <span className={styles.planeState}>{END_STATE_LABEL[record.endState]}</span>
                </button>
              );
            })}
          </div>

          {selected ? (
            <article className={styles.focus} aria-label={`Selected record: ${selected.name}`}>
              <div className={styles.focusTop}>
                <span>{selectedOnPlane ? 'Selected' : 'Selected · not surfaced'}</span>
                <span style={{ color: `var(${END_STATE_TOKEN[selected.endState]})` }}>{END_STATE_LABEL[selected.endState]}</span>
              </div>
              <h2>{selected.name}</h2>
              <p>{selected.publisher}</p>
              <dl>
                <div><dt>Last confirmed</dt><dd>{fmtDate(selected.lastConfirmed)}</dd></div>
                <div><dt>Declared licence</dt><dd>{selected.license}</dd></div>
              </dl>
              <a
                href={inspectHref(selected.slug)}
                onClick={(event) => { event.preventDefault(); onInspect(selected.slug); }}
              >
                Inspect preserved evidence <span aria-hidden="true">↓</span>
              </a>
            </article>
          ) : (
            <article className={`${styles.focus} ${styles.focusIdle}`} aria-label="No record selected">
              <div className={styles.focusTop}><span>No record selected</span><span>{visible.length} surfaced</span></div>
              <h2>Choose a record.</h2>
              <p className={styles.focusIdleNote}>
                Select a card to bring it into focus. Hovering only previews a card; a selected record is marked and stays selected in the register below.
              </p>
              <a href="#delisted-ledger" onClick={enterLedger}>Browse the full register <span aria-hidden="true">↓</span></a>
            </article>
          )}
          <p className={styles.fieldHint}><span>Move to shift perspective · Select a record</span><span>{visible.length} records surfaced · Full register below</span></p>
          <p className={styles.mobileFieldHint}>{Math.min(5, visible.length)} records surfaced here · Full register below</p>
        </div>
      </div>
    </section>
  );
}
