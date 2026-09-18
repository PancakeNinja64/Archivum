'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { END_STATE_LABEL, END_STATE_NOTE, type DelistedRecord } from '@/lib/graveyard/types';
import { formatDate, formatRows, platformLabel } from './record-facts';
import styles from './PreservationScene.module.css';

type Phase = 'connected' | 'breaking' | 'preserved';

/**
 * Introduces Delisted with one illustrative record: the source connection
 * disappears, the preserved record stays lit. The example is fictional and
 * labelled as such; nothing here describes a live dataset's history.
 */
export function PreservationScene({ record }: { record: DelistedRecord }) {
  const ref = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase>('connected');
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Under reduced motion the CSS already shows the preserved state; the phase just catches up at once.
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timers: number[] = [];
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || played.current) return;
      played.current = true;
      timers = reduced
        ? [window.setTimeout(() => setPhase('preserved'), 0)]
        : [window.setTimeout(() => setPhase('breaking'), 1700), window.setTimeout(() => setPhase('preserved'), 2700)];
      io.disconnect();
    }, { threshold: reduced ? 0.1 : 0.55 });
    io.observe(el);
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
  }, []);

  const lastConfirmed = formatDate(record.lastConfirmed);

  return (
    <section ref={ref} id="delisted" className={styles.scene} data-phase={phase} aria-labelledby="delisted-heading">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.chapter}>05 · Delisted</span>
          <h2 id="delisted-heading">Sources change.<br />Their history should remain.</h2>
          <p>When a source is superseded, gated, withdrawn or stops answering, Archivum keeps the last state it observed: the record, its checks, and the date they were confirmed.</p>
          <Link href="/delisted/?demo=1" className={styles.action}>Open the archive <span aria-hidden="true">↗</span></Link>
          <p className={styles.note}>Illustrative example. This record and its publisher are fictional; the archive is labelled the same way until a live historical reader exists.</p>
        </div>

        <div className={styles.stage} role="img" aria-label={`Illustration: the source connection for ${record.name} is lost, but the preserved record with its last confirmed state remains.`}>
          <div className={styles.source}>
            <span className={styles.sourceRing} aria-hidden="true"><i /></span>
            <span className={styles.sourceLabel}>
              <span className={styles.sourceTitle}>Source · {platformLabel(record.platform)}</span>
              <span className={styles.sourceState}>{phase === 'connected' ? 'responding' : `${END_STATE_LABEL[record.endState]} · ${END_STATE_NOTE[record.endState]}`}</span>
            </span>
          </div>

          <svg className={styles.link} viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true">
            <line className={styles.wire} x1="0" y1="50" x2="400" y2="50" />
            <line className={styles.wireBroken} x1="0" y1="50" x2="400" y2="50" />
            <circle className={styles.pulse} r="3" cy="50" />
          </svg>

          <div className={styles.plate}>
            <div className={styles.plateTop}><span>Preserved record</span><span className={styles.mono}>last confirmed {lastConfirmed}</span></div>
            <h3>{record.name}</h3>
            <p className={styles.publisher}>{record.publisher} · {platformLabel(record.platform)}</p>
            <dl className={styles.facts}>
              <div><dt>Documented at last check</dt><dd>{record.coverageTotal}%</dd></div>
              <div><dt>Declared licence</dt><dd className={styles.mono}>{record.license}</dd></div>
              <div><dt>Records</dt><dd className={styles.mono}>{formatRows(record.sizeRows)}</dd></div>
              <div><dt>Versions observed</dt><dd className={styles.mono}>{record.versions}</dd></div>
            </dl>
            <p className={styles.remains}><i aria-hidden="true" />The record remains.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
