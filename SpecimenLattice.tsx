'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useReducedMotion, useScroll } from 'framer-motion';
import { readTokens, withAlpha, type Tokens } from '@/lib/atlas/draw';
import type { CoverageSectionKey } from '@/lib/coverage/rules';
import {
  buildLattice,
  hitTest,
  projectLattice,
  projectNode,
  projectPoint,
  ghostRing,
  ringSummary,
  RING_RADIUS,
  RING_Y,
  SECTION_ORDER,
  type Camera,
  type LatticeNode,
} from '@/lib/home/lattice';
import { RESULT_PRESENTATION } from '@/lib/home/specimen';

const THETA_FROM = -0.35;
const THETA_TO = 0.55;
const TILT_FROM = -0.30;
const TILT_TO = -0.54;
const RETICLE_MS = 180;
const EASE_RATE = 0.14;

const TOKEN_FOR: Record<'documented' | 'reported' | 'not_found', keyof Tokens> = {
  documented: 'verified',
  reported: 'inferred',
  not_found: 'asserted',
};

/**
 * The specimen lattice.
 *
 * Scroll drives the object directly — no spring, no inertia, no idle loop. It
 * should feel like a mechanism the reader is turning rather than an animation
 * playing at them; that is the whole difference between an instrument and a
 * landing-page carousel. When scrolling stops, the object stops.
 *
 * The canvas is decoration for assistive tech. SpecimenReport carries the same
 * twenty-eight checks as real DOM.
 */
export function SpecimenLattice({
  sectionRef,
  activeSection,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
  activeSection: CoverageSectionKey | null;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const lattice = useMemo(() => buildLattice(), []);
  const summary = useMemo(() => ringSummary(lattice), [lattice]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const progressRef = useRef(reduce ? 0.5 : 0);
  const tokensRef = useRef<Tokens | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const hoverRef = useRef<LatticeNode | null>(null);
  const reticleRef = useRef(0);
  const activeRef = useRef<CoverageSectionKey | null>(activeSection);
  /** Per-ring eased isolation state: 0 = at rest, 1 = pushed back. */
  const recedeRef = useRef<number[]>(RING_Y.map(() => 0));
  const liftRef = useRef<number[]>(RING_Y.map(() => 0));
  const dirtyRef = useRef(true);
  const runningRef = useRef(true);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    activeRef.current = activeSection;
    dirtyRef.current = true;
  }, [activeSection]);

  useEffect(() => {
    if (reduce) return;
    const unsub = scrollYProgress.on('change', (v) => {
      progressRef.current = v;
      dirtyRef.current = true;
    });
    return () => unsub();
  }, [scrollYProgress, reduce]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      tokensRef.current = readTokens(wrap);
      dirtyRef.current = true;
    };
    resize();

    const ro = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(resize, 150);
    });
    ro.observe(wrap);

    const mo = new MutationObserver(() => {
      tokensRef.current = readTokens(wrap);
      dirtyRef.current = true;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const io = new IntersectionObserver(
      ([e]) => {
        runningRef.current = e.isIntersecting && !document.hidden;
      },
      { threshold: 0.01 },
    );
    io.observe(wrap);
    const onVis = () => {
      runningRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const cameraNow = useCallback((): Camera => {
    const { w, h } = sizeRef.current;
    const p = reduce ? 0.5 : Math.max(0, Math.min(1, progressRef.current));
    const theta = reduce ? 0.25 : THETA_FROM + (THETA_TO - THETA_FROM) * p;
    const tiltX = reduce ? -0.44 : TILT_FROM + (TILT_TO - TILT_FROM) * p;
    const scale = Math.min(1, Math.min(w, h) / 620);
    return {
      // Biased left: the ring labels sit to the right of the cage.
      cx: w * 0.42,
      cy: h / 2,
      theta,
      tiltX,
      scale,
      ringOffset: (ring) => recedeRef.current[ring] * 60,
      ringLift: (ring) => liftRef.current[ring],
    };
  }, [reduce]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (!tokensRef.current) tokensRef.current = readTokens(wrap);

    let last = performance.now();

    const frame = (now: number) => {
      rafRef.current = requestAnimationFrame(frame);
      const dt = Math.min(64, now - last);
      last = now;
      if (!runningRef.current) return;

      const tokens = tokensRef.current;
      if (!tokens) return;
      const { w, h, dpr } = sizeRef.current;
      if (w < 2 || h < 2) return;

      /* Ease ring isolation and the reticle. Nothing else moves on its own. */
      let animating = false;
      const active = activeRef.current;
      SECTION_ORDER.forEach((section, ring) => {
        const recedeTarget = active === null || active === section ? 0 : 1;
        const liftTarget = active === section ? -RING_Y[ring] : 0;
        const r = recedeRef.current[ring];
        const l = liftRef.current[ring];
        if (Math.abs(r - recedeTarget) > 0.002) {
          animating = true;
          recedeRef.current[ring] = reduce ? recedeTarget : r + (recedeTarget - r) * EASE_RATE;
        } else recedeRef.current[ring] = recedeTarget;
        if (Math.abs(l - liftTarget) > 0.3) {
          animating = true;
          liftRef.current[ring] = reduce ? liftTarget : l + (liftTarget - l) * EASE_RATE;
        } else liftRef.current[ring] = liftTarget;
      });

      const reticleTarget = hoverRef.current ? 1 : 0;
      if (Math.abs(reticleRef.current - reticleTarget) > 0.002) {
        animating = true;
        const step = reduce ? 1 : dt / RETICLE_MS;
        reticleRef.current +=
          Math.sign(reticleTarget - reticleRef.current) *
          Math.min(step, Math.abs(reticleTarget - reticleRef.current));
      } else reticleRef.current = reticleTarget;

      if (!animating && !dirtyRef.current) return;
      dirtyRef.current = false;

      const cam = cameraNow();
      const p = reduce ? 1 : Math.max(0, Math.min(1, progressRef.current));
      /* Nodes first, then segments assemble top ring to bottom. */
      const assembly = reduce ? 1 : Math.max(0, Math.min(1, (p - 0.15) / 0.4));
      const nodeFade = reduce ? 1 : Math.max(0, Math.min(1, p / 0.15));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      /* Ghost rings first. They are the reference that turns a missing arc into
         a visible void rather than an absent dot. */
      RING_Y.forEach((_, ring) => {
        const dim = active !== null && SECTION_ORDER[ring] !== active ? 0.2 : 1;
        const pts = ghostRing(ring, cam);
        if (pts.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(pts[0].sx, pts[0].sy);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].sx, pts[i].sy);
        ctx.strokeStyle = withAlpha(tokens.borderStrong, 0.3 * dim * nodeFade);
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      const items = projectLattice(lattice, cam);
      const hovered = hoverRef.current;

      for (const it of items) {
        /* Behind the object's centre — this is what sells the volume. */
        const behind = it.z > 0 ? 0.45 : 1;

        if (it.kind === 'segment' && it.a && it.b && it.segment) {
          const seg = it.segment;
          const ringFade = Math.max(
            0,
            Math.min(1, (assembly - seg.ring * 0.12) / 0.5),
          );
          if (ringFade <= 0.01) continue;
          const dim = active !== null && SECTION_ORDER[seg.ring] !== active ? 0.15 : 1;
          const touched =
            hovered !== null &&
            (lattice.nodes[seg.a].id === hovered.id || lattice.nodes[seg.b].id === hovered.id);
          const base = seg.partial ? tokens.inferred : tokens.verified;
          const color = touched ? tokens.accent : base;
          ctx.save();
          if (seg.partial) ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(it.a.sx, it.a.sy);
          ctx.lineTo(it.b.sx, it.b.sy);
          ctx.strokeStyle = withAlpha(
            color,
            (seg.partial ? 0.5 : 0.85) * behind * dim * ringFade,
          );
          ctx.lineWidth = touched ? 1.4 : 1;
          ctx.stroke();
          ctx.restore();
          continue;
        }

        if (it.kind === 'node' && it.node && it.p) {
          const n = it.node;
          const dim = active !== null && n.section !== active ? 0.15 : 1;
          const on = hovered?.id === n.id;
          const color = on ? tokens.accent : tokens[TOKEN_FOR[n.outcome]];
          const alpha =
            (n.outcome === 'not_found' ? 0.6 : 0.95) * behind * dim * nodeFade;
          const r = 3.4 * it.p.scale;
          ctx.beginPath();
          if (n.outcome === 'documented') {
            ctx.arc(it.p.sx, it.p.sy, r, 0, Math.PI * 2);
            ctx.fillStyle = withAlpha(color, alpha);
            ctx.fill();
          } else {
            ctx.arc(it.p.sx, it.p.sy, r * 0.92, 0, Math.PI * 2);
            ctx.strokeStyle = withAlpha(color, alpha);
            ctx.lineWidth = 1.2;
            ctx.stroke();
            if (n.outcome === 'reported') {
              ctx.beginPath();
              ctx.arc(it.p.sx, it.p.sy, r * 0.92, -Math.PI / 2, Math.PI / 2);
              ctx.closePath();
              ctx.fillStyle = withAlpha(color, alpha);
              ctx.fill();
            }
          }
        }
      }

      /* Ring labels, right of the cage. */
      ctx.font = '9px var(--font-geist-mono), ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      summary.forEach((s) => {
        const centre = projectPoint(0, RING_Y[s.ring] + cam.ringLift(s.ring), cam.ringOffset(s.ring), cam);
        if (!centre) return;
        const dim = active !== null && SECTION_ORDER[s.ring] !== active ? 0.2 : 1;
        const x = centre.sx + RING_RADIUS * centre.scale + 18;
        ctx.fillStyle = withAlpha(tokens.mutedForeground, 0.75 * dim * nodeFade);
        ctx.fillText(s.label, x, centre.sy - 6);
        ctx.fillStyle = withAlpha(tokens.asserted, 0.85 * dim * nodeFade);
        ctx.fillText(`${s.documented} of ${s.total} documented`, x, centre.sy + 7);
      });

      /* Reticle. */
      if (hovered && reticleRef.current > 0.01) {
        const p2 = projectNode(hovered, cam);
        if (p2) {
          const t = reticleRef.current;
          const R = 13;
          const B = 6;
          ([
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, 1],
          ] as const).forEach(([sx, sy], i) => {
            const st = Math.max(0, Math.min(1, (t - i * 0.08) / 0.5));
            if (st <= 0) return;
            const off = 5 * (1 - st);
            const cx = p2.sx + sx * (R + off);
            const cy = p2.sy + sy * (R + off);
            ctx.beginPath();
            ctx.moveTo(cx, cy - sy * B);
            ctx.lineTo(cx, cy);
            ctx.lineTo(cx - sx * B, cy);
            ctx.strokeStyle = withAlpha(tokens.accent, 0.9 * st);
            ctx.lineWidth = 1;
            ctx.stroke();
          });

          if (t > 0.35) {
            const a = Math.min(1, (t - 0.35) / 0.65);
            const flip = p2.sx > w * 0.62;
            const dir = flip ? -1 : 1;
            const ex = p2.sx + dir * (R + 26);
            const ey = p2.sy - 22;
            ctx.beginPath();
            ctx.moveTo(p2.sx + dir * R, p2.sy - R * 0.5);
            ctx.lineTo(ex, ey);
            ctx.lineTo(ex + dir * 10, ey);
            ctx.strokeStyle = withAlpha(tokens.accent, 0.5 * a);
            ctx.lineWidth = 1;
            ctx.stroke();

            const tx = ex + dir * 15;
            ctx.textAlign = flip ? 'right' : 'left';
            const pres = RESULT_PRESENTATION[hovered.outcome];
            ctx.font = '11px var(--font-geist-mono), ui-monospace, monospace';
            ctx.fillStyle = withAlpha(tokens.foreground, a);
            ctx.fillText(hovered.label, tx, ey - 8);
            ctx.font = '9px var(--font-geist-mono), ui-monospace, monospace';
            ctx.fillStyle = withAlpha(tokens[TOKEN_FOR[hovered.outcome]], a);
            ctx.fillText(pres.label, tx, ey + 7);
            ctx.fillStyle = withAlpha(tokens.mutedForeground, 0.9 * a);
            // The method sentence is the credibility argument; it must be
            // reachable here, not only in the list.
            wrapText(ctx, hovered.method, tx, ey + 21, 240, 12, flip);
          }
        }
      }
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [lattice, summary, cameraNow, reduce]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const hit = hitTest(lattice, cameraNow(), e.clientX - rect.left, e.clientY - rect.top);
      if (hit?.id !== hoverRef.current?.id) {
        hoverRef.current = hit;
        dirtyRef.current = true;
      }
    },
    [lattice, cameraNow],
  );

  return (
    <div ref={wrapRef} className="relative h-[34rem] w-full">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="h-full w-full"
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          hoverRef.current = null;
          dirtyRef.current = true;
        }}
      />
    </div>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  flip: boolean,
) {
  const words = text.split(' ');
  let line = '';
  let cursor = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cursor);
      cursor += lineHeight;
      line = word;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, cursor);
  void flip;
}
