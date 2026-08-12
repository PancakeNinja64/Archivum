'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  buildBoard,
  fitCamera,
  focusCamera,
  hitTestColumns,
  lerpCamera,
  LOD_HI,
  LOD_LO,
  type BoardColumn,
  type Camera,
  type CohortSize,
  type ColumnQuad,
} from '@/lib/graveyard/board';
import {
  drawAxes,
  drawCapGlyph,
  drawColumn,
  drawDownstream,
  drawLeader,
  drawMeasureRule,
  drawPlanes,
  quadFor,
  readBoardTokens,
  type BoardTokens,
} from '@/lib/graveyard/draw';
import type { DelistedRecord } from '@/lib/graveyard/types';

/* Intro timings. Total lands at 1.2s: fast enough that nobody waits, slow
   enough that the board is legibly assembled rather than simply appearing. */
const SWEEP_MS = 180;
const GROW_MS = 240;
const STAGGER_MS = 600;
const DETAIL_MS = 220;
const FOCUS_IN_MS = 620;
const FOCUS_OUT_MS = 480;
const GHOST_MS = 200;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/* Matches --ease-archivum: cubic-bezier(0.22, 1, 0.36, 1). */
const easeArchivum = (t: number) => 1 - Math.pow(1 - t, 4);

export function DecayBoard({
  records,
  visible,
  hovered,
  focused,
  cohortSize,
  interactive,
  panelAnchor,
  onHover,
  onSelect,
}: {
  records: DelistedRecord[];
  /** Slugs passing the search. Non-matches ghost; they never move or unmount. */
  visible: Set<string>;
  hovered: string | null;
  focused: string | null;
  cohortSize: CohortSize;
  interactive: boolean;
  /** Screen point the leader line runs to, in CSS px. */
  panelAnchor: { x: number; y: number } | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string | null) => void;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const layout = useMemo(() => buildBoard(records, cohortSize), [records, cohortSize]);
  const layoutRef = useRef(layout);

  const tokensRef = useRef<BoardTokens | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const quadsRef = useRef<ColumnQuad[]>([]);
  const growRef = useRef<Map<string, number>>(new Map());
  const ghostRef = useRef<Map<string, number>>(new Map());
  const heightRef = useRef<Map<string, number>>(new Map());
  const introRef = useRef(0);
  const focusTRef = useRef(0);
  const camNowRef = useRef<Camera>({ cx: 0, cy: 0, zoom: 1 });
  /* Held through the exit transition so the camera pulls back from the column
     it was on rather than cutting to the wide framing on the first frame. */
  const lastFocusRef = useRef<BoardColumn | null>(null);
  const runningRef = useRef(true);
  const dirtyRef = useRef(true);
  const rafRef = useRef<number | null>(null);

  const hoveredRef = useRef(hovered);
  const focusedRef = useRef(focused);
  const visibleRef = useRef(visible);
  const anchorRef = useRef(panelAnchor);

  useEffect(() => {
    layoutRef.current = layout;
    dirtyRef.current = true;
  }, [layout]);
  useEffect(() => {
    hoveredRef.current = hovered;
    dirtyRef.current = true;
  }, [hovered]);
  useEffect(() => {
    visibleRef.current = visible;
    dirtyRef.current = true;
  }, [visible]);
  useEffect(() => {
    anchorRef.current = panelAnchor;
    dirtyRef.current = true;
  }, [panelAnchor]);

  useEffect(() => {
    focusedRef.current = focused;
    dirtyRef.current = true;
  }, [focused]);

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
      tokensRef.current = readBoardTokens(wrap);
      dirtyRef.current = true;
    };
    resize();

    const ro = new ResizeObserver(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(resize, 150);
    });
    ro.observe(wrap);

    const mo = new MutationObserver(() => {
      tokensRef.current = readBoardTokens(wrap);
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
    if (!tokensRef.current) tokensRef.current = readBoardTokens(wrap);

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

      const lay = layoutRef.current;
      let animating = false;

      /* Intro. Runs once; filter changes never replay it. */
      const introTotal = SWEEP_MS + STAGGER_MS + GROW_MS + DETAIL_MS;
      if (introRef.current < 1) {
        introRef.current = reduce ? 1 : Math.min(1, introRef.current + dt / introTotal);
        animating = true;
      }
      const elapsed = introRef.current * introTotal;
      const sweep = reduce ? 1 : Math.min(1, elapsed / SWEEP_MS);
      const detail = reduce
        ? 1
        : Math.min(1, Math.max(0, (elapsed - (SWEEP_MS + STAGGER_MS)) / DETAIL_MS));

      /* Ghosting: non-matches fade, they do not move or unmount, so the eye
         keeps its place on the board while typing. */
      const ghosts = ghostRef.current;
      for (const col of lay.columns) {
        const target = visibleRef.current.has(col.slug) ? 1 : 0.14;
        const cur = ghosts.get(col.slug) ?? target;
        if (Math.abs(cur - target) < 0.004) {
          ghosts.set(col.slug, target);
        } else {
          animating = true;
          const step = reduce ? 1 : dt / GHOST_MS;
          ghosts.set(col.slug, cur + Math.sign(target - cur) * Math.min(step, Math.abs(target - cur)));
        }
      }

      const focusTarget = focusedRef.current ? 1 : 0;
      if (Math.abs(focusTRef.current - focusTarget) > 0.003) {
        animating = true;
        const dur = focusTarget === 1 ? FOCUS_IN_MS : FOCUS_OUT_MS;
        const step = reduce ? 1 : dt / dur;
        focusTRef.current +=
          Math.sign(focusTarget - focusTRef.current) *
          Math.min(step, Math.abs(focusTarget - focusTRef.current));
      } else {
        focusTRef.current = focusTarget;
      }

      if (!animating && !dirtyRef.current) return;
      dirtyRef.current = false;

      /* The wide framing is derived from the band size and the layout, so it is
         the same every time: leaving focus returns to exactly where the eye was. */
      const base = fitCamera(w, h, lay);
      const focusCol = lay.columns.find((c) => c.slug === focusedRef.current) ?? null;
      if (focusCol) lastFocusRef.current = focusCol;
      const framed = focusCol ?? lastFocusRef.current;
      const cam: Camera = framed
        ? lerpCamera(base, focusCamera(w, h, base, framed), easeArchivum(focusTRef.current))
        : base;
      camNowRef.current = cam;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      drawPlanes(ctx, lay, cam, tokens, sweep);

      /* Painter's algorithm. Without it, far columns draw over near ones and
         the board collapses into a flat scatter. */
      const ordered = lay.columns.slice().sort((a, b) => b.z - a.z);
      const quads: ColumnQuad[] = [];
      const zSpan = Math.max(1, lay.bounds.z1 - lay.bounds.z0);

      for (const col of ordered) {
        const startAt = SWEEP_MS + (col.order / Math.max(1, lay.columns.length - 1)) * STAGGER_MS;
        const grow = reduce ? 1 : Math.min(1, Math.max(0, (elapsed - startAt) / GROW_MS));
        growRef.current.set(col.slug, grow);
        const height = col.height * easeOut(grow);
        heightRef.current.set(col.slug, height);
        if (height < 0.5) continue;

        const ghost = ghostRef.current.get(col.slug) ?? 1;
        const isFocus = col.slug === focusedRef.current;
        const isHover = col.slug === hoveredRef.current;
        /* Dim everything but the focused column, and drop columns standing in
           front of the hovered one so a tall neighbour cannot hide it. */
        let presence = ghost;
        if (focusCol) presence = isFocus ? 1 : ghost * (1 - 0.84 * focusTRef.current);
        else if (hoveredRef.current && !isHover) {
          const front = lay.columns.find((c) => c.slug === hoveredRef.current);
          if (front && col.z < front.z) presence = ghost * 0.42;
        }

        /* 0 at the near edge, 1 at the far edge: fog grows with distance. */
        const depthT = (col.z - lay.bounds.z0) / zSpan;
        drawColumn(ctx, col, height, cam, tokens, {
          grow,
          presence,
          hovered: isHover,
          focused: isFocus,
          detail,
        }, depthT);

        const q = quadFor(col, height, cam);
        if (q) {
          quads.push(q);
          const lodT =
            q.scale <= LOD_LO ? 0 : q.scale >= LOD_HI ? 1 : (q.scale - LOD_LO) / (LOD_HI - LOD_LO);
          const glyphAlpha = detail * presence * lodT;
          drawCapGlyph(ctx, q, tokens, wrap, glyphAlpha);
          drawDownstream(ctx, q, tokens, glyphAlpha, interactive);
        }
      }

      quadsRef.current = quads;
      drawAxes(ctx, lay, cam, tokens, detail * (1 - 0.5 * focusTRef.current));

      if (focusCol && focusTRef.current > 0.15) {
        const a = (focusTRef.current - 0.15) / 0.85;
        drawMeasureRule(
          ctx,
          focusCol,
          heightRef.current.get(focusCol.slug) ?? focusCol.height,
          cam,
          tokens,
          a,
        );
        const q = quads.find((x) => x.col.slug === focusCol.slug);
        if (q && anchorRef.current) drawLeader(ctx, q, tokens, anchorRef.current, a);
      }
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduce, interactive]);

  const hit = useCallback(
    (clientX: number, clientY: number, rect: DOMRect): BoardColumn | null =>
      hitTestColumns(
        quadsRef.current,
        clientX - rect.left,
        clientY - rect.top,
        camNowRef.current,
        (c) => heightRef.current.get(c.slug) ?? c.height,
      ),
    [],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!interactive) return;
      const col = hit(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
      onHover(col ? col.slug : null);
    },
    [hit, interactive, onHover],
  );

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const col = hit(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
      onSelect(col ? col.slug : null);
    },
    [hit, onSelect],
  );

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden
        className="h-full w-full cursor-pointer"
        onPointerMove={onPointerMove}
        onPointerLeave={() => interactive && onHover(null)}
        onClick={onClick}
      />
    </div>
  );
}
