'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useScroll, useTransform } from 'motion/react';
import type { Dataset, DatasetSummary } from '@/lib/types';
import { AtlasCanvas, BLOCK_COMPOSITION, STAGE_COMPOSITION } from './atlas/AtlasCanvas';
import { span } from './atlas/geometry';
import { RecordPlate, recordHref } from './RecordPlate';
import { EXAMPLE_QUERIES, SearchForm } from './SearchForm';
import type { StageMode } from './useStageMode';
import styles from './AtlasStage.module.css';

interface AtlasStageProps {
  records: DatasetSummary[];
  selected: DatasetSummary | null;
  full: Dataset | null;
  onSelect: (slug: string) => void;
  mode: StageMode | null;
  catalogMode: 'catalog' | 'illustrative';
  total: number | null;
  unavailable: boolean;
}

export function AtlasStage({ records, selected, full, onSelect, mode, catalogMode, total, unavailable }: AtlasStageProps) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const choreo = mode === 'choreography';
  // The assembly plays once, and only when the visitor actually starts at the top.
  const [entrance] = useState(() => typeof window === 'undefined' || window.scrollY < 40);

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  /* One JS-observed progress value drives every scroll-linked transform (see the note in git history: the
     native scroll-timeline promotion disagreed with this observer on tall pinned sections). */
  const { scrollYProgress: raw } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const progress = useTransform(raw, (v) => v);
  const resolve = useTransform(progress, (v) => span(v, 0.14, 0.5));
  const spread = useTransform(progress, (v) => span(v, 0.56, 0.88));

  const stageW = useMotionValue(1440);
  const stageH = useMotionValue(836);
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { stageW.set(el.clientWidth); stageH.set(el.clientHeight); });
    ro.observe(el);
    stageW.set(el.clientWidth); stageH.set(el.clientHeight);
    return () => ro.disconnect();
  }, [stageW, stageH, mode]);

  const recordCopyOpacity = useTransform(progress, [0.2, 0.3, 0.48, 0.54], [0, 1, 1, 0]);
  const recordCopyY = useTransform(progress, [0.2, 0.3], [22, 0]);
  const evidenceCopyOpacity = useTransform(progress, [0.56, 0.66], [0, 1]);
  const evidenceCopyY = useTransform(progress, [0.56, 0.66], [22, 0]);
  const entranceFade = useTransform(progress, [0, 0.12], [1, 0]);

  const getAnchor = useCallback(() => {
    const m = markerRef.current, c = canvasWrapRef.current;
    if (!m || !c || mode !== 'choreography') return null;
    const mr = m.getBoundingClientRect(), cr = c.getBoundingClientRect();
    return { x: mr.left + mr.width / 2 - cr.left, y: mr.top + mr.height / 2 - cr.top };
  }, [mode]);

  const countLabel = total === null ? 'catalog unavailable' : `${total.toLocaleString('en-US')} ${catalogMode === 'illustrative' ? 'illustrative' : 'catalog'} records`;
  const ariaLabel = useMemo(() => `Atlas of ${Math.min(records.length, 80)} dataset records drawn as a globe. Connections show a shared publisher; positions are illustrative. ${selected ? `Selected: ${selected.name}.` : ''} Select a point on the globe to change the record.`, [records.length, selected]);

  return (
    <section ref={trackRef} className={styles.track} data-mode={mode ?? 'flow'} aria-labelledby="atlas-heading">
      <motion.div className={styles.entrance} style={choreo ? { opacity: entranceFade } : undefined}>
        <div className={styles.entranceColumn}>
          <p className={styles.eyebrow}><i aria-hidden="true" /> Atlas · {countLabel}</p>
          <h1 id="atlas-heading" className={styles.title}>See beyond<br />the dataset.</h1>
          <p className={styles.support}>Explore public datasets through their sources, documentation, and history.</p>
          <SearchForm id="atlas-search" examples={EXAMPLE_QUERIES.slice(0, 4)} />
        </div>
      </motion.div>

      <div ref={stageRef} className={styles.stage}>
        <div ref={canvasWrapRef} className={styles.canvasWrap}>
          {records.length > 0 ? (
            <AtlasCanvas
              records={records}
              selected={selected?.slug ?? ''}
              onSelect={onSelect}
              composition={choreo ? STAGE_COMPOSITION : BLOCK_COMPOSITION}
              resolve={choreo ? resolve : null}
              layers={choreo ? spread : null}
              getAnchor={getAnchor}
              paused={paused}
              entrance={entrance}
              ariaLabel={ariaLabel}
            />
          ) : (
            <div className={styles.emptyField} role="status">
              <p>{unavailable ? 'The catalog is temporarily unavailable.' : 'The catalog has no records to draw yet.'}</p>
              <Link href="/workspace/">Open the workspace to retry ↗</Link>
            </div>
          )}
        </div>

        <div className={styles.flowCopy}>
          <span className={styles.chapter}>02 · Record</span>
          <h2>Every point is a record.</h2>
          <p>Select any point and the Atlas resolves it into that dataset’s record: four layers of evidence, each read from the source. Anything the source leaves out stays visibly open.</p>
        </div>

        {choreo && (
          <div className={styles.copyColumn}>
            <motion.div className={styles.copy} style={{ opacity: recordCopyOpacity, y: recordCopyY }}>
              <span className={styles.chapter}>02 · Record</span>
              <h2>Every point is a record.</h2>
              <p>Select any point and the Atlas resolves it into that dataset’s record: what its source documents, and what it doesn’t.</p>
            </motion.div>
            <motion.div className={styles.copy} style={{ opacity: evidenceCopyOpacity, y: evidenceCopyY }}>
              <span className={styles.chapter}>03 · Evidence</span>
              <h2>One record, four layers.</h2>
              <p>Source, licence, structure and history — each fact read from the source. Anything the source leaves out stays visibly open.</p>
            </motion.div>
          </div>
        )}

        {selected && (
          <RecordPlate
            summary={selected}
            full={full}
            mode={mode}
            catalogMode={catalogMode}
            resolve={resolve}
            spread={spread}
            stageW={stageW}
            stageH={stageH}
            target={STAGE_COMPOSITION.target}
            markerRef={markerRef}
          />
        )}

        <div className={styles.foot}>
          <span className={styles.footNote}>{catalogMode === 'illustrative' ? 'Illustrative catalog · publishers are fictional' : 'Public metadata · files stay with their publishers'}</span>
          <div className={styles.controls}>
            <button type="button" onClick={() => setPaused((v) => !v)} disabled={reduced} aria-pressed={paused}>
              {reduced ? 'Rotation off (reduced motion)' : paused ? 'Resume rotation' : 'Pause rotation'}
            </button>
            <span className={styles.hint}>Drag to orbit · select a point · lines join a shared publisher · positions are a composition</span>
          </div>
          <a href="#record" className={styles.continue}>Continue <span aria-hidden="true">↓</span></a>
        </div>
      </div>

      {/* Screen-reader summary of the composition; the canvas itself is one image. */}
      <div className={styles.srOnly}>
        <h2>Selected record</h2>
        {selected ? <p>{selected.name}, published by {selected.publisher}. {selected.coverageTotal}% of provenance fields documented at the source. <Link href={recordHref(selected.slug)}>Open the full record in the workspace.</Link></p> : <p>No record selected.</p>}
      </div>
    </section>
  );
}
