'use client';

import { useEffect, useMemo, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import type { MotionValue } from 'motion/react';
import type { DatasetSummary } from '@/lib/types';
import {
  type AtlasNode, type Camera, type Projected,
  clamp01, easeOut, fog, lambert, layoutNodes, mix, project, publisherEdges, smooth, span,
} from './geometry';
import styles from './AtlasCanvas.module.css';

/** Where the globe sits inside its canvas, as fractions, plus the radius rule. */
export interface Composition {
  cx: number;
  cy: number;
  radius: (w: number, h: number) => number;
  /** Where the selected node lands once the record has resolved, in canvas pixels. */
  target: (w: number, h: number) => { x: number; y: number };
  /** Draw names beside the nearest nodes at rest. */
  labels: boolean;
  /** Labels must end before this fraction of the width (the record plate docks beyond it). */
  labelLimit: number;
}

export const STAGE_COMPOSITION: Composition = {
  cx: 0.575, cy: 0.5,
  radius: (w, h) => Math.min(w * 0.205, (h - 120) * 0.43, 300),
  // The resolved plate (about 430px with its rows) centres vertically; its marker sits 38px below its top.
  target: (w, h) => ({ x: w * 0.31, y: Math.max(60, (h - 430) / 2) + 38 }),
  labels: true,
  labelLimit: 0.76,
};

export const BLOCK_COMPOSITION: Composition = {
  cx: 0.5, cy: 0.5,
  radius: (w, h) => Math.min(w * 0.4, h * 0.43),
  target: (w, h) => ({ x: w * 0.5, y: h * 0.5 }),
  labels: false,
  labelLimit: 1,
};

interface AtlasCanvasProps {
  records: DatasetSummary[];
  selected: string;
  onSelect: (slug: string) => void;
  onHover?: (slug: string | null) => void;
  composition: Composition;
  /** Chapter progress values. Null in flow mode. */
  resolve: MotionValue<number> | null;
  layers: MotionValue<number> | null;
  /** Reads the plate marker in canvas coordinates for the leader line. */
  getAnchor: () => { x: number; y: number } | null;
  /** Ambient rotation and pulses. Reduced motion, hidden tabs and offscreen pause it regardless. */
  paused: boolean;
  /** Play the assembly once on mount. Skipped when the page is already scrolled. */
  entrance: boolean;
  ariaLabel: string;
}

const MINERAL = '243,243,240';
const SILVER = '168,173,180';
const BLUE = '77,163,255';
const SPIN_RATE = 0.000062; // radians per ms ≈ one revolution every 100 s
const ENTRANCE_MS = 1400;

type Frame = { p: Projected; node: AtlasNode; index: number; r: number };

export function AtlasCanvas({ records, selected, onSelect, onHover, composition, resolve, layers, getAnchor, paused, entrance, ariaLabel }: AtlasCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodes = useMemo(() => layoutNodes(records), [records]);
  const edges = useMemo(() => publisherEdges(nodes), [nodes]);
  const selectedIndex = nodes.findIndex((n) => n.slug === selected);

  // Frame state lives in refs: nothing here should re-render React.
  const state = useRef({
    spin: 0.4, tilt: -0.24, hover: -1, drag: null as null | { x: number; y: number; moved: boolean; spin: number },
    frame: 0, visible: true, reduced: false, entranceStart: -1, entranceDone: !entrance, last: 0,
    hits: [] as { x: number; y: number; r: number; index: number }[], font: 'system-ui, sans-serif', monoFont: 'ui-monospace, monospace',
  });
  const props = useRef({ selectedIndex, paused, composition, resolve, layers, getAnchor, onHover, nodes, edges });
  useEffect(() => { props.current = { selectedIndex, paused, composition, resolve, layers, getAnchor, onHover, nodes, edges }; });
  /** The running loop, so React handlers can ask for a frame without owning the closure. */
  const loop = useRef<{ wake: () => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = state.current;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    s.reduced = media.matches;
    const computed = getComputedStyle(canvas);
    s.font = computed.fontFamily || s.font;
    s.monoFont = computed.getPropertyValue('--font-geist-mono') ? `${computed.getPropertyValue('--font-geist-mono')}, ui-monospace, monospace` : s.monoFont;
    if (s.reduced || !entrance) s.entranceDone = true;

    const draw = (time: number) => {
      s.frame = 0;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const { selectedIndex: sel, composition: comp, nodes, edges } = props.current;
      const p = props.current.resolve?.get() ?? 0;
      const q = props.current.layers?.get() ?? 0;
      const resolveT = smooth(p);
      const ambient = s.visible && !document.hidden && !s.reduced && !props.current.paused && !s.drag;

      // Entrance clock. Text and actions are already on the page; only the atlas assembles.
      let e = 1;
      if (!s.entranceDone) {
        if (s.entranceStart < 0) s.entranceStart = time;
        e = clamp01((time - s.entranceStart) / ENTRANCE_MS);
        if (e >= 1) s.entranceDone = true;
      }

      // Ambient rotation slows to a stop as the record comes forward.
      const dt = s.last ? Math.min(48, time - s.last) : 0;
      s.last = time;
      if (ambient && dt) s.spin += dt * SPIN_RATE * (1 - smooth(span(p, 0, 0.3)));

      const radius0 = comp.radius(w, h);
      const radius = radius0 * mix(1, 1.45, resolveT);
      const cam: Camera = { spin: s.spin, tilt: s.tilt, radius, cx: w * comp.cx, cy: h * comp.cy };
      if (sel >= 0 && p > 0) {
        // Camera glide: the selected node travels to its resting target while the rest follows rigidly.
        const at = project(nodes[sel], cam);
        const goal = comp.target(w, h);
        cam.cx += (goal.x - at.x) * resolveT;
        cam.cy += (goal.y - at.y) * resolveT;
      }
      const receded = mix(1, 0.34, resolveT) * mix(1, 0.6, smooth(q));
      const gratAlpha = mix(1, 0.4, resolveT) * mix(1, 0.5, smooth(q));

      // Floor cue and key light: the globe rests on a surface and is lit from the upper left.
      if (comp.labels) {
        const fy = cam.cy + radius * 1.12;
        const floor = ctx.createRadialGradient(cam.cx, fy, 0, cam.cx, fy, radius * 1.15);
        floor.addColorStop(0, `rgba(${SILVER},${0.075 * gratAlpha})`);
        floor.addColorStop(1, `rgba(${SILVER},0)`);
        ctx.save(); ctx.translate(cam.cx, fy); ctx.scale(1, 0.2); ctx.translate(-cam.cx, -fy);
        ctx.fillStyle = floor; ctx.fillRect(cam.cx - radius * 1.3, fy - radius * 1.3, radius * 2.6, radius * 2.6);
        ctx.restore();
      }
      const key = ctx.createRadialGradient(cam.cx - radius * 0.38, cam.cy - radius * 0.42, 0, cam.cx - radius * 0.3, cam.cy - radius * 0.3, radius * 1.05);
      key.addColorStop(0, `rgba(${MINERAL},${0.05 * gratAlpha})`);
      key.addColorStop(1, `rgba(${MINERAL},0)`);
      ctx.fillStyle = key;
      ctx.beginPath(); ctx.arc(cam.cx, cam.cy, radius, 0, Math.PI * 2); ctx.fill();

      // Graticule: a reference frame, not evidence. The far half recedes.
      const gratDraw = easeOut(span(e, 0, 0.55));
      const circle = (fn: (t: number) => { x: number; y: number; z: number }, base: number) => {
        const steps = 72, limit = Math.floor(steps * gratDraw);
        let prev: Projected | null = null;
        for (let i = 0; i <= limit; i++) {
          const t = (i / steps) * Math.PI * 2;
          const pt = project(fn(t), cam);
          if (prev) {
            const d = (prev.depth + pt.depth) / 2;
            const a = base * (0.16 + 0.84 * Math.pow((d + 1) / 2, 1.7)) * gratAlpha;
            ctx.strokeStyle = `rgba(${SILVER},${a})`;
            ctx.lineWidth = d > 0 ? 0.9 : 0.7;
            ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(pt.x, pt.y); ctx.stroke();
          }
          prev = pt;
        }
      };
      for (const lat of [-60, -30, 0, 30, 60]) {
        const phi = (lat * Math.PI) / 180, r = Math.cos(phi), y = Math.sin(phi);
        circle((t) => ({ x: Math.cos(t) * r, y, z: Math.sin(t) * r }), lat === 0 ? 0.42 : 0.26);
      }
      for (let m = 0; m < 6; m++) {
        const lon = (m * Math.PI) / 6;
        circle((t) => ({ x: Math.cos(t) * Math.cos(lon), y: Math.sin(t), z: Math.cos(t) * Math.sin(lon) }), 0.2);
      }
      // Limb.
      ctx.beginPath(); ctx.arc(cam.cx, cam.cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * gratDraw);
      ctx.strokeStyle = `rgba(${SILVER},${0.3 * gratAlpha})`; ctx.lineWidth = 1; ctx.stroke();

      // Nodes: projected once, drawn back to front.
      const frames: Frame[] = nodes.map((node, index) => {
        const pr = project(node, cam);
        const near = (pr.depth + 1) / 2;
        const threshold = 0.12 + 0.5 * (1 - near);
        const appear = easeOut(span(e, threshold, threshold + 0.3));
        const lam = lambert(pr);
        const r = (2.2 + 1.7 * lam) * pr.scale * appear * (index === sel ? 1.25 : 1);
        return { p: pr, node, index, r };
      });
      const byIndex: Frame[] = [];
      for (const f of frames) byIndex[f.index] = f;
      frames.sort((a, b) => a.p.depth - b.p.depth);

      // Edges: shared publisher only. The selected record's edges carry the blue.
      const edgeDraw = easeOut(span(e, 0.45, 0.9));
      const pulseT = time / 3200;
      for (let k = 0; k < edges.length; k++) {
        const { a, b } = edges[k];
        const A = byIndex[a].p, B = byIndex[b].p;
        const hot = a === sel || b === sel;
        const d = (A.depth + B.depth) / 2;
        const f = fog(d) * (hot ? 1 : receded);
        const ex = mix(A.x, B.x, edgeDraw), ey = mix(A.y, B.y, edgeDraw);
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(ex, ey);
        ctx.strokeStyle = hot ? `rgba(${BLUE},${0.7 * f})` : `rgba(${SILVER},${0.22 * f})`;
        ctx.lineWidth = hot ? 1.1 : 0.7;
        ctx.stroke();
        if (hot && edgeDraw >= 1 && !s.reduced) {
          const t = (pulseT + k * 0.37) % 1;
          const from = a === sel ? A : B, to = a === sel ? B : A;
          ctx.beginPath(); ctx.arc(mix(from.x, to.x, t), mix(from.y, to.y, t), 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${BLUE},${0.9 * f * Math.sin(t * Math.PI)})`; ctx.fill();
        }
      }

      s.hits = [];
      const breath = s.reduced ? 0 : Math.sin(time / 1900) * 0.5 + 0.5;
      for (const f of frames) {
        const { p: pr, index, r } = f;
        if (r <= 0.05) continue;
        const lam = lambert(pr);
        const isSel = index === sel, isHover = index === s.hover;
        const depthFog = fog(pr.depth);
        const alpha = (0.34 + 0.66 * lam) * depthFog * (isSel ? 1 : receded);
        if (isSel) {
          const haloR = 30 + 14 * breath + 12 * resolveT;
          const halo = ctx.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, haloR);
          halo.addColorStop(0, `rgba(${BLUE},${0.22 + 0.05 * breath})`);
          halo.addColorStop(1, `rgba(${BLUE},0)`);
          ctx.fillStyle = halo; ctx.fillRect(pr.x - haloR, pr.y - haloR, haloR * 2, haloR * 2);
          ctx.beginPath(); ctx.arc(pr.x, pr.y, 11 * pr.scale + 3 * resolveT, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${BLUE},${0.85 * easeOut(span(e, 0.7, 1))})`; ctx.lineWidth = 1; ctx.stroke();
        }
        if (isHover && !isSel) {
          ctx.beginPath(); ctx.arc(pr.x, pr.y, r + 5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${MINERAL},0.7)`; ctx.lineWidth = 1; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(pr.x, pr.y, isSel ? r + 1.5 : r, 0, Math.PI * 2);
        ctx.fillStyle = isSel ? `rgba(${BLUE},1)` : `rgba(${MINERAL},${alpha})`;
        ctx.fill();
        // Rim on the lit near side gives the point a body.
        if (!isSel && pr.depth > 0.1 && lam > 0.5) {
          ctx.beginPath(); ctx.arc(pr.x, pr.y, r + 0.8, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${MINERAL},${0.18 * alpha})`; ctx.lineWidth = 0.6; ctx.stroke();
        }
        s.hits.push({ x: pr.x, y: pr.y, r: Math.max(r, 4), index });
      }

      // Leader line: selected node to the record plate. It shortens to nothing as the record resolves.
      const anchor = sel >= 0 ? props.current.getAnchor() : null;
      const selFrame = sel >= 0 ? byIndex[sel] : null;
      if (anchor && selFrame) {
        const a = 0.75 * easeOut(span(e, 0.82, 1)) * (1 - span(p, 0.75, 1));
        if (a > 0.01) {
          const { x, y } = selFrame.p;
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(anchor.x, anchor.y);
          ctx.strokeStyle = `rgba(${BLUE},${a})`; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(anchor.x, anchor.y, 2.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(${BLUE},${a})`; ctx.fill();
        }
      }

      // Labels: the selected record, the hovered one, and a few nearest points at rest.
      const label = (f: Frame, alpha: number, strong: boolean) => {
        const text = f.node.name.length > 30 ? `${f.node.name.slice(0, 28)}…` : f.node.name;
        ctx.font = `${strong ? 500 : 400} 12px ${s.font}`;
        const tw = ctx.measureText(text).width;
        const right = f.p.x + 16 + tw + 10 <= w * comp.labelLimit;
        const tx = right ? f.p.x + 16 : f.p.x - 16 - tw;
        ctx.fillStyle = `rgba(12,13,15,${0.82 * alpha})`;
        ctx.fillRect(tx - 6, f.p.y - 10, tw + 12, 20);
        ctx.fillStyle = strong ? `rgba(${MINERAL},${alpha})` : `rgba(${SILVER},${alpha})`;
        ctx.fillText(text, tx, f.p.y + 4);
      };
      if (comp.labels && p < 0.05) {
        const rest = frames.filter((f) => f.index !== sel && f.p.depth > 0.62).sort((a, b) => b.p.depth - a.p.depth).slice(0, 3);
        for (const f of rest) label(f, 0.75 * span(f.p.depth, 0.62, 0.8) * easeOut(span(e, 0.7, 1)), false);
      }
      if (s.hover >= 0 && s.hover !== sel) { const f = byIndex[s.hover]; if (f) label(f, 1, true); }
      if (selFrame && p < 0.5) label(selFrame, easeOut(span(e, 0.75, 1)) * (1 - span(p, 0.2, 0.5)), true);

      if (ambient || !s.entranceDone) schedule();
    };

    const schedule = () => { if (!s.frame) s.frame = requestAnimationFrame(draw); };
    const wake = () => { s.last = 0; schedule(); };
    loop.current = { wake };

    const io = new IntersectionObserver(([entry]) => { s.visible = entry.isIntersecting; if (s.visible) wake(); }, { threshold: 0 });
    io.observe(canvas);
    const ro = new ResizeObserver(wake);
    ro.observe(canvas);
    const onMedia = () => { s.reduced = media.matches; if (s.reduced) s.entranceDone = true; wake(); };
    media.addEventListener('change', onMedia);
    document.addEventListener('visibilitychange', wake);
    wake();
    return () => {
      loop.current = null;
      cancelAnimationFrame(s.frame); s.frame = 0;
      io.disconnect(); ro.disconnect();
      media.removeEventListener('change', onMedia);
      document.removeEventListener('visibilitychange', wake);
    };
    // The draw loop reads live props through a ref; it only needs to restart when the field itself changes.
  }, [nodes, edges, entrance]);

  // Selection and pause changes need a frame even when nothing is animating.
  useEffect(() => { loop.current?.wake(); }, [selectedIndex, paused]);

  // Scroll progress must redraw even while the ambient loop is paused.
  useEffect(() => {
    const offs = [resolve, layers].map((mv) => mv?.on('change', () => loop.current?.wake()));
    return () => offs.forEach((off) => off?.());
  }, [resolve, layers]);

  const hitAt = (clientX: number, clientY: number, slack: number) => {
    const canvas = canvasRef.current; if (!canvas) return -1;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    let best = -1, bestD = Infinity;
    for (const hit of state.current.hits) {
      const d = Math.hypot(hit.x - x, hit.y - y);
      if (d < hit.r + slack && d < bestD) { bestD = d; best = hit.index; }
    }
    return best;
  };

  const setHover = (index: number) => {
    const s = state.current;
    if (s.hover === index) return;
    s.hover = index;
    props.current.onHover?.(index >= 0 ? props.current.nodes[index].slug : null);
    if (canvasRef.current) canvasRef.current.style.cursor = index >= 0 ? 'pointer' : '';
    loop.current?.wake();
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    state.current.drag = { x: e.clientX, y: e.clientY, moved: false, spin: state.current.spin };
    if (e.pointerType === 'mouse') e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const s = state.current;
    if (s.drag && e.pointerType === 'mouse' && e.buttons) {
      const dx = e.clientX - s.drag.x;
      if (Math.abs(dx) > 3 || s.drag.moved) {
        s.drag.moved = true;
        s.spin = s.drag.spin + dx * 0.0055;
        e.currentTarget.style.cursor = 'grabbing';
        loop.current?.wake();
      }
      return;
    }
    if (s.drag && e.pointerType !== 'mouse') {
      if (Math.hypot(e.clientX - s.drag.x, e.clientY - s.drag.y) > 8) s.drag.moved = true;
      return;
    }
    if (e.pointerType === 'mouse') setHover(hitAt(e.clientX, e.clientY, 12));
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const s = state.current;
    const wasDrag = s.drag?.moved;
    s.drag = null;
    if (!wasDrag) {
      const hit = hitAt(e.clientX, e.clientY, e.pointerType === 'mouse' ? 12 : 18);
      if (hit >= 0) onSelect(props.current.nodes[hit].slug);
    }
    e.currentTarget.style.cursor = state.current.hover >= 0 ? 'pointer' : '';
    loop.current?.wake();
  };
  const onPointerLeave = () => { state.current.drag = null; setHover(-1); };

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      role="img"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerLeave}
      onPointerLeave={onPointerLeave}
    />
  );
}
