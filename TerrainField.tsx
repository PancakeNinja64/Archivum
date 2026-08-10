'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { readTokens, type Tokens } from '@/lib/atlas/draw';
import { drawFloors, drawMesh, drawReticle } from '@/lib/graveyard/draw';
import {
  buildWells,
  cameraFor,
  hitTestWells,
  type Camera,
  type Well,
} from '@/lib/graveyard/terrain';
import type { DelistedRecord, MassMetric } from '@/lib/graveyard/types';

const RELAX_MS = 420;
const RETICLE_MS = 220;

export function TerrainField({
  records,
  visible,
  mass,
  hovered,
  onHover,
  onSelect,
  interactive,
}: {
  /** Every record. Filtered-out ones relax to flat rather than unmounting. */
  records: DelistedRecord[];
  /** Slugs currently passing the filters. */
  visible: Set<string>;
  mass: MassMetric;
  hovered: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
  interactive: boolean;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tokensRef = useRef<Tokens | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const presenceRef = useRef<Map<string, number>>(new Map());
  const reticleRef = useRef(0);
  const dirtyRef = useRef(true);
  const runningRef = useRef(true);
  const rafRef = useRef<number | null>(null);
  const wellsRef = useRef<Well[]>([]);
  const camRef = useRef<Camera>({ cx: 0, cy: 0, zoom: 1 });

  const hoveredRef = useRef<string | null>(hovered);
  const massRef = useRef<MassMetric>(mass);
  const visibleRef = useRef<Set<string>>(visible);
  const recordsRef = useRef(records);

  const byslug = useMemo(() => {
    const m = new Map<string, DelistedRecord>();
    records.forEach((r) => m.set(r.slug, r));
    return m;
  }, [records]);

  /* Feed changes into the loop through refs and mark the canvas dirty.
     The terrain is static, so redrawing only on change keeps an idle page at
     zero frames rather than 60. */
  useEffect(() => {
    hoveredRef.current = hovered;
    dirtyRef.current = true;
  }, [hovered]);
  useEffect(() => {
    massRef.current = mass;
    dirtyRef.current = true;
  }, [mass]);
  useEffect(() => {
    visibleRef.current = visible;
    dirtyRef.current = true;
  }, [visible]);
  useEffect(() => {
    recordsRef.current = records;
    dirtyRef.current = true;
  }, [records]);

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

      /* Presence easing — this is the relax-to-flat transition.
         The map must be seeded explicitly: defaulting `cur` to `target` and
         relying on a `cur !== target` guard writes nothing on the first frame,
         so buildWells reads an empty map, every well gets presence 0, and the
         terrain renders as a mathematically flat plane. */
      let animating = false;
      const pres = presenceRef.current;
      for (const rec of recordsRef.current) {
        const target = visibleRef.current.has(rec.slug) ? 1 : 0;
        if (!pres.has(rec.slug)) {
          pres.set(rec.slug, target);
          continue;
        }
        const cur = pres.get(rec.slug) as number;
        if (Math.abs(cur - target) < 0.002) {
          pres.set(rec.slug, target);
          continue;
        }
        animating = true;
        const step = reduce ? 1 : dt / RELAX_MS;
        pres.set(rec.slug, cur + Math.sign(target - cur) * Math.min(step, Math.abs(target - cur)));
      }

      const hoverTarget = hoveredRef.current ? 1 : 0;
      if (Math.abs(reticleRef.current - hoverTarget) > 0.002) {
        animating = true;
        const step = reduce ? 1 : dt / RETICLE_MS;
        reticleRef.current +=
          Math.sign(hoverTarget - reticleRef.current) *
          Math.min(step, Math.abs(hoverTarget - reticleRef.current));
      } else {
        reticleRef.current = hoverTarget;
      }

      if (!animating && !dirtyRef.current) return;
      dirtyRef.current = false;

      const cam = cameraFor(w, h);
      camRef.current = cam;
      const wells = buildWells(recordsRef.current, massRef.current, (s) => pres.get(s) ?? (visibleRef.current.has(s) ? 1 : 0));
      wellsRef.current = wells;
      const maxAmp = wells.reduce((m, x) => Math.max(m, x.amp), 1);
      const hoveredWell = wells.find((x) => x.slug === hoveredRef.current) ?? null;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      drawMesh(ctx, { wells, hovered: hoveredWell, cam, tokens, maxAmp });
      drawFloors(ctx, wells, cam, tokens, hoveredWell);
      if (hoveredWell && reticleRef.current > 0.01) {
        drawReticle(ctx, hoveredWell, wells, cam, tokens, reticleRef.current, null);
      }
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduce]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!interactive) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const hit = hitTestWells(
        wellsRef.current,
        e.clientX - rect.left,
        e.clientY - rect.top,
        camRef.current,
      );
      onHover(hit ? hit.slug : null);
    },
    [interactive, onHover],
  );

  const onClick = useCallback(() => {
    if (!interactive) return;
    const slug = hoveredRef.current;
    if (slug && byslug.has(slug)) onSelect(slug);
  }, [interactive, byslug, onSelect]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`h-full w-full ${interactive ? 'cursor-pointer' : ''}`}
        onPointerMove={onPointerMove}
        onPointerLeave={() => interactive && onHover(null)}
        onClick={onClick}
      />
    </div>
  );
}
