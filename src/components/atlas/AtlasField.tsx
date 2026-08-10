'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  BASE_TILT_X,
  groundRing,
  groundSpokes,
  hitTest,
  project,
  projectField,
  transform,
} from '@/lib/atlas/projection';
import {
  drawEdge,
  drawLabel,
  drawNode,
  drawPolyline,
  nodeColor,
  readTokens,
  withAlpha,
  type Tokens,
} from '@/lib/atlas/draw';
import type { AtlasField as Field, ProjectedNode } from '@/lib/atlas/types';
import { drawReticle } from './AtlasReticle';

const DRAG_ROTATE_SENS = 0.004;
const DRAG_TILT_SENS = 0.0025;
const ROTATION_PER_MS = 0.00008;
const TILT_X_MIN = -0.75;
const TILT_X_MAX = 0.25;
const INTERACTION_IDLE_MS = 2500;
const RETICLE_MS = 220;
const MOBILE_NODES = 60;
const SPARSE_THRESHOLD = 24;

const RING_RADII = [230, 370, 510];
const RING_ALPHA = [0.3, 0.21, 0.14];

export function AtlasField({ field }: { field: Field }) {
  const reduce = useReducedMotion();

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  /* Mutable frame state — deliberately refs, so nothing here re-renders React. */
  const thetaRef = useRef(0);
  const tiltYRef = useRef(0);
  const tiltXRef = useRef(BASE_TILT_X);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const lastDragRef = useRef({ x: 0, y: 0 });
  const autoSpinEnabledRef = useRef(true);
  const lastInteractionRef = useRef(0);
  const activeSlugRef = useRef<string | null>(null);
  const reticleRef = useRef(0);
  const projectedRef = useRef<ProjectedNode[]>([]);
  const tokensRef = useRef<Tokens | null>(null);
  const startedRef = useRef(0);
  const runningRef = useRef(true);
  const rafRef = useRef<number | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const sparse = field.nodeCount < SPARSE_THRESHOLD;

  /* Node set: mobile shows the best-documented slice, so the depth channel
     still reads on a small viewport instead of turning to mush. */
  const nodes = useMemo(() => {
    const base = isMobile
      ? [...field.nodes].sort((a, b) => b.coverageTotal - a.coverageTotal).slice(0, MOBILE_NODES)
      : field.nodes;
    if (!sparse) return base;
    return base.map((n) => ({ ...n, x: n.x * 1.8, y: n.y * 1.8 }));
  }, [field.nodes, isMobile, sparse]);

  const visibleSlugs = useMemo(() => new Set(nodes.map((n) => n.slug)), [nodes]);

  const edges = useMemo(() => {
    const kept = field.edges.filter((e) => visibleSlugs.has(e.a) && visibleSlugs.has(e.b));
    return isMobile ? kept.filter((e) => e.kind === 'declared') : kept;
  }, [field.edges, visibleSlugs, isMobile]);

  const maxRows = useMemo(
    () => nodes.reduce((m, n) => Math.max(m, n.sizeRows), 1),
    [nodes],
  );

  /** slug -> set of connected slugs, for the reticle's edge highlighting. */
  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!m.has(e.a)) m.set(e.a, new Set());
      if (!m.has(e.b)) m.set(e.b, new Set());
      m.get(e.a)!.add(e.b);
      m.get(e.b)!.add(e.a);
    }
    return m;
  }, [edges]);

  /* Viewport class. */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /* Sizing. */
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
    };
    resize();

    const ro = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(resize, 150);
    });
    ro.observe(wrap);

    /* The token set changes when the theme class flips. */
    const mo = new MutationObserver(() => {
      tokensRef.current = readTokens(wrap);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      ro.disconnect();
      mo.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const markInteracting = useCallback(() => {
    lastInteractionRef.current = performance.now();
    autoSpinEnabledRef.current = false;
  }, []);

  /* Pause when off-screen or backgrounded. */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        runningRef.current = entry.isIntersecting && !document.hidden;
      },
      { threshold: 0.01 },
    );
    io.observe(wrap);
    const onVis = () => {
      runningRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  /* The frame loop. */
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!tokensRef.current) tokensRef.current = readTokens(wrap);
    if (reduce) thetaRef.current = 0.6;
    startedRef.current = performance.now();
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

      const elapsed = now - startedRef.current;

      if (draggingRef.current) {
        lastInteractionRef.current = now;
        autoSpinEnabledRef.current = false;
      } else if (!reduce && now - lastInteractionRef.current >= INTERACTION_IDLE_MS) {
        autoSpinEnabledRef.current = true;
      }

      if (!reduce && autoSpinEnabledRef.current) {
        thetaRef.current += ROTATION_PER_MS * dt;
      }

      const cx = w / 2;
      // Lift the field: the ground plane sits below the cloud, so a centred
      // origin leaves the composition bottom-heavy.
      const cy = h / 2 - 30;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = tokens.background;
      ctx.fillRect(0, 0, w, h);

      const opts = {
        theta: thetaRef.current,
        tiltX: tiltXRef.current,
        tiltY: tiltYRef.current,
        cx,
        cy,
        zoom: 1,
        maxRows,
      };

      /* Ground reference. Drawn first, and the reason the field reads as
         volume rather than a scatter plot. */
      const groundFade = reduce ? 1 : Math.min(1, elapsed / 300);
      RING_RADII.forEach((radius, i) => {
        const pts = groundRing(radius)
          .map((p) => project(transform(p, opts.theta, opts.tiltX, opts.tiltY), cx, cy, 1))
          .filter((p): p is NonNullable<typeof p> => p !== null);
        drawPolyline(ctx, pts, withAlpha(tokens.borderStrong, RING_ALPHA[i] * groundFade), 1);
      });
      groundSpokes(RING_RADII[2]).forEach(([a, b]) => {
        const pa = project(transform(a, opts.theta, opts.tiltX, opts.tiltY), cx, cy, 1);
        const pb = project(transform(b, opts.theta, opts.tiltX, opts.tiltY), cx, cy, 1);
        if (pa && pb) drawPolyline(ctx, [pa, pb], withAlpha(tokens.borderStrong, 0.095 * groundFade), 1);
      });

      /* Project once per frame, sorted back to front. */
      const projected = projectField(nodes, opts);
      projectedRef.current = projected;
      const byslug = new Map<string, ProjectedNode>();
      for (const p of projected) byslug.set(p.node.slug, p);

      /* Hit test against the fresh projection (hover highlight). */
      if (pointerRef.current && !isMobile && !draggingRef.current) {
        const hit = hitTest(projected, pointerRef.current.x, pointerRef.current.y);
        if (hit) activeSlugRef.current = hit.node.slug;
        else activeSlugRef.current = null;
      }

      const active = activeSlugRef.current;
      const activeP = active ? byslug.get(active) ?? null : null;
      const connected = active ? adjacency.get(active) ?? new Set<string>() : new Set<string>();

      /* Reticle assembly progress. */
      const target = activeP ? 1 : 0;
      const step = dt / (target > reticleRef.current ? RETICLE_MS : 150);
      reticleRef.current = reduce
        ? target
        : Math.max(0, Math.min(1, reticleRef.current + (target ? step : -step)));

      /* Edges. */
      for (const e of edges) {
        const a = byslug.get(e.a);
        const b = byslug.get(e.b);
        if (!a || !b) continue;
        let scale = 1;
        if (active) {
          const touches = e.a === active || e.b === active;
          scale = touches ? 3.2 : 0.35;
        }
        drawEdge(ctx, a, b, e.kind, tokens, scale);
      }

      /* Nodes, back to front. */
      for (const p of projected) {
        const slug = p.node.slug;
        let entrance = 1;
        if (!reduce) {
          const delay = p.depth * 500;
          entrance = Math.max(0, Math.min(1, (elapsed - delay) / 400));
        }

        let scale = 1;
        if (active) scale = slug === active || connected.has(slug) ? 1 : 0.12;

        const color = nodeColor(p.node.coverageTotal, tokens);
        drawNode(
          ctx,
          p,
          color,
          tokens,
          scale,
          entrance,
          opts.theta,
          opts.tiltX,
          opts.tiltY,
        );

        const labelled =
          sparse ||
          slug === active ||
          (p.node.coverageTotal >= 75 && p.depth > 0.6);
        if (labelled && !isMobile) {
          const a = (slug === active ? 0.95 : 0.35 + 0.4 * p.depth) * entrance * Math.min(1, scale);
          drawLabel(ctx, p, tokens, a, true);
        }
      }

      /* Reticle last, so it sits above the field. */
      if (activeP && reticleRef.current > 0.01 && !isMobile) {
        drawReticle(ctx, activeP, wrap, tokens, reticleRef.current, activeP.sx > w * 0.7);
      }
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [nodes, edges, adjacency, maxRows, reduce, isMobile, sparse]);

  const clampTiltX = (v: number) => Math.max(TILT_X_MIN, Math.min(TILT_X_MAX, v));

  const applyDrag = useCallback((clientX: number, clientY: number) => {
    const dx = clientX - lastDragRef.current.x;
    const dy = clientY - lastDragRef.current.y;
    lastDragRef.current = { x: clientX, y: clientY };
    thetaRef.current += dx * DRAG_ROTATE_SENS;
    tiltXRef.current = clampTiltX(tiltXRef.current + dy * DRAG_TILT_SENS);
    tiltYRef.current = 0;
  }, []);

  /* Pointer — drag to rotate, hover to highlight. */
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    markInteracting();
    draggingRef.current = true;
    lastDragRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [markInteracting]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointerRef.current = { x, y };

      if (draggingRef.current) {
        applyDrag(e.clientX, e.clientY);
        return;
      }

      if (!isMobile) {
        const hit = hitTest(projectedRef.current, x, y);
        if (hit) activeSlugRef.current = hit.node.slug;
        else activeSlugRef.current = null;
      }
    },
    [applyDrag, isMobile],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onPointerLeave = useCallback(() => {
    if (!draggingRef.current) {
      pointerRef.current = null;
      activeSlugRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    markInteracting();
    const t = e.touches[0];
    if (!t) return;
    draggingRef.current = true;
    lastDragRef.current = { x: t.clientX, y: t.clientY };
  }, [markInteracting]);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current || e.touches.length !== 1) return;
    const t = e.touches[0];
    if (!t) return;
    applyDrag(t.clientX, t.clientY);
  }, [applyDrag]);

  const onTouchEnd = useCallback(() => {
    draggingRef.current = false;
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
    </div>
  );
}
