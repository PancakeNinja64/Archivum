'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react';
import type { Dataset, DatasetSummary } from '@/lib/types';
import { mix, smooth } from './atlas/geometry';
import { buildLayers, formatDate, platformLabel, type Fact, type Layer } from './record-facts';
import type { StageMode } from './useStageMode';
import styles from './RecordPlate.module.css';

/** Geometry shared with the stage: where the marker sits and how far the plate grows. */
export const PLATE = { dockWidth: 300, resolvedWidth: 372, markerY: 38, rowHeight: 56, climb: 8, stepZ: 22 } as const;

export const recordHref = (slug: string, tab?: string) => `/workspace/?dataset=${encodeURIComponent(slug)}${tab ? `&tab=${tab}` : ''}`;

interface RecordPlateProps {
  summary: DatasetSummary;
  full: Dataset | null;
  mode: StageMode | null;
  catalogMode: 'catalog' | 'illustrative';
  resolve: MotionValue<number>;
  spread: MotionValue<number>;
  stageW: MotionValue<number>;
  stageH: MotionValue<number>;
  target: (w: number, h: number) => { x: number; y: number };
  /** The marker element, so the canvas can draw the leader line to it. */
  markerRef: RefObject<HTMLSpanElement | null>;
}

const STATE_LABEL: Record<Fact['state'], string> = { documented: 'retrieved', reported: 'stated', unresolved: 'not stated', pending: 'loading' };

function FactRow({ fact }: { fact: Fact }) {
  return (
    <li className={styles.fact} data-state={fact.state}>
      <span className={styles.factLabel}>{fact.label}</span>
      <span className={`${styles.factValue} ${fact.mono ? styles.mono : ''}`}>{fact.value}</span>
      <i className={styles.factMark} aria-hidden="true" />
      <span className={styles.srOnly}>, {STATE_LABEL[fact.state]}</span>
    </li>
  );
}

function LayerRow({ layer, slug, spread, stepX, plateWidth, choreo }: { layer: Layer; slug: string; spread: MotionValue<number>; stepX: MotionValue<number>; plateWidth: MotionValue<number>; choreo: boolean }) {
  // Cards overlap the one behind by a fixed 30px, whatever the stage width.
  const cardWidth = useTransform(stepX, (sx) => sx + 30);
  const cardRef = useRef<HTMLDivElement>(null);
  const expanded = useMotionValue(220);
  const q = useTransform(spread, smooth);
  const i = layer.index;
  // Fan: each layer leaves its slot, lines up beside the first and steps toward the viewer.
  const x = useTransform([q, stepX], ([v, sx]) => (v as number) * i * (sx as number));
  const y = useTransform(q, (v) => -v * i * (PLATE.rowHeight + PLATE.climb));
  // Lifted clear of the plate's own plane, so a tilted card never intersects it.
  const z = useTransform(q, (v) => v * (36 + i * PLATE.stepZ));
  // Positive turn: each card's left edge comes forward, so it always reads over the card behind it.
  const rotateY = useTransform(q, (v) => v * 8);
  const rotateX = useTransform(q, (v) => v * 4);
  const width = useTransform([q, plateWidth, cardWidth], ([v, pw, cw]) => mix(pw as number, cw as number, v as number));
  const height = useTransform([q, expanded], ([v, h]) => mix(PLATE.rowHeight, h as number, v as number));
  const detail = useTransform(q, [0.3, 0.75], [0, 1]);
  // Folded rows keep their seed on one line; once a card leaves the stack it may wrap freely.
  const [open, setOpen] = useState(false);
  useMotionValueEvent(q, 'change', (v) => setOpen((was) => (v > 0.04) !== was ? v > 0.04 : was));

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => expanded.set(el.scrollHeight));
    ro.observe(el);
    expanded.set(el.scrollHeight);
    return () => ro.disconnect();
  }, [expanded]);

  return (
    <motion.li className={styles.row} data-open={choreo ? open : true} style={choreo ? ({ x, y, z, rotateY, rotateX, '--lift': q, zIndex: i + 1 } as never) : undefined}>
      <Link href={recordHref(slug, layer.tab)} className={styles.rowLink} aria-label={`${layer.title}: ${layer.seed}. Open in the workspace.`}>
        <motion.div className={styles.card} style={choreo ? { height, width } : undefined}>
          <div ref={cardRef} className={styles.cardInner}>
            <div className={styles.seedLine}>
              <span className={styles.rowIndex}>0{i + 1}</span>
              <span className={styles.rowTitle}>{layer.title}</span>
              <span className={styles.seed}>{layer.seed}</span>
            </div>
            <motion.ul className={styles.facts} style={choreo ? { opacity: detail } : undefined}>
              {layer.facts.map((fact) => <FactRow key={fact.label} fact={fact} />)}
            </motion.ul>
            <motion.span className={styles.rowAction} aria-hidden="true" style={choreo ? { opacity: detail } : undefined}>Open {layer.title.toLowerCase()} ↗</motion.span>
          </div>
        </motion.div>
      </Link>
    </motion.li>
  );
}

export function RecordPlate({ summary, full, mode, catalogMode, resolve, spread, stageW, stageH, target, markerRef }: RecordPlateProps) {
  const plateRef = useRef<HTMLDivElement>(null);
  const choreo = mode === 'choreography';
  const layers = buildLayers(summary, full);
  const [dock, setDock] = useState({ x: 0, y: 0 });
  const dockX = useMotionValue(0);
  const dockY = useMotionValue(0);
  useEffect(() => { dockX.set(dock.x); dockY.set(dock.y); }, [dock, dockX, dockY]);

  // Dock position measured without transforms, so the travel is exact at every size.
  useEffect(() => {
    const el = plateRef.current;
    if (!el || !choreo) return;
    const measure = () => setDock({ x: el.offsetLeft, y: el.offsetTop });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.offsetParent) ro.observe(el.offsetParent as Element);
    return () => ro.disconnect();
  }, [choreo]);

  const t = useTransform(resolve, smooth);
  const x = useTransform([t, stageW, stageH, dockX], ([v, w, h, dx]) => (target(w as number, h as number).x - (dx as number)) * (v as number));
  const y = useTransform([t, stageW, stageH, dockY], ([v, w, h, dy]) => (target(w as number, h as number).y - PLATE.markerY - (dy as number)) * (v as number));
  const width = useTransform(t, (v) => mix(PLATE.dockWidth, PLATE.resolvedWidth, v));
  const q = useTransform(spread, smooth);
  const actionOpacity = useTransform(q, [0, 0.3], [1, 0]);
  // Room to the right of the resolved plate decides how far the layers can fan.
  const stepX = useTransform([stageW, stageH], ([w, h]) => Math.max(170, Math.min(210, ((w as number) - target(w as number, h as number).x - 110) / 4)));

  const checked = summary.coverageCheckedAt ? formatDate(summary.coverageCheckedAt) : null;

  return (
    <motion.div
      ref={plateRef}
      className={styles.plate}
      data-mode={mode ?? 'flow'}
      style={choreo ? ({ x, y, width, '--spread': q } as never) : undefined}
      aria-label="Selected record"
      role="group"
    >
      <span ref={markerRef} className={styles.marker} aria-hidden="true" />
      <div className={styles.head}>
        <div className={styles.eyebrow}>
          <span>{catalogMode === 'illustrative' ? 'Illustrative record' : 'Catalog record'}</span>
        </div>
        <h2 className={styles.name}>{summary.name}</h2>
        <p className={styles.publisher}>{summary.publisher} · {platformLabel(summary.platform)}</p>
        <p className={styles.coverage}>
          <strong>{summary.coverageTotal}<small>%</small></strong>
          <span>of provenance fields documented at the source{checked ? <><br /><span className={styles.mono}>checked {checked}</span></> : null}</span>
        </p>
      </div>
      <ol className={styles.rows} aria-label="Evidence layers">
        {layers.map((layer) => <LayerRow key={layer.key} layer={layer} slug={summary.slug} spread={spread} stepX={stepX} plateWidth={width} choreo={choreo} />)}
      </ol>
      <motion.div className={styles.actionWrap} style={choreo ? { opacity: actionOpacity } : undefined}>
        <Link href={recordHref(summary.slug)} className={styles.action}>Inspect record <span aria-hidden="true">↗</span></Link>
      </motion.div>
    </motion.div>
  );
}
