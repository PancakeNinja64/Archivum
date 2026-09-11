"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DatasetSummary } from "@/lib/types";
import styles from "./NetworkField.module.css";

type Props = { records: DatasetSummary[]; selectedSlug?: string | null; onSelect?: (slug: string) => void; mode?: "hero" | "explore"; className?: string; active?: boolean };
type Point = { slug: string; name: string; x: number; y: number; z: number; publisher: string; domain: string[] };
function hash(input: string) { let h = 2166136261; for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
/** Geometry is identity based. Distance and dot size do not encode quality. */
export function NetworkField({ records, selectedSlug, onSelect, mode = "explore", className = "", active = true }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const angle = useRef(0.35);
  const projected = useRef<{ slug: string; x: number; y: number }[]>([]);
  const pointer = useRef<{ x: number; y: number; dragged: boolean } | null>(null);
  const [paused, setPaused] = useState(false);
  const [rotationFor, setRotationFor] = useState(selectedSlug);
  const isPaused = paused || rotationFor !== selectedSlug;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [domains, setDomains] = useState(false);
  const [revision, setRevision] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [compact, setCompact] = useState(false);
  const points = useMemo<Point[]>(() => records.slice(0, compact ? 24 : 80).map(r => {
    const longitude = (hash(r.slug + "longitude") % 100000) / 100000 * Math.PI * 2;
    const y = (hash(r.slug + "latitude") % 100000) / 50000 - 1;
    const radius = Math.sqrt(1 - y * y);
    return { slug: r.slug, name: r.name, x: Math.cos(longitude) * radius, y, z: Math.sin(longitude) * radius, publisher: r.publisher, domain: r.domain };
  }), [records, compact]);
  const edges = useMemo(() => {
    const result: { a: number; b: number; domain: boolean }[] = [];
    for (let a = 0; a < points.length; a++) {
      let count = 0;
      for (let b = a + 1; b < points.length && count < 3; b++) {
        const sharedPublisher = points[a].publisher !== "" && points[a].publisher !== "Unknown" && points[a].publisher === points[b].publisher;
        const sharedDomain = domains && points[a].domain.some(d => points[b].domain.includes(d));
        if (sharedPublisher || sharedDomain) { result.push({ a, b, domain: !sharedPublisher }); count++; }
      }
    }
    return result;
  }, [points, domains]);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const size = matchMedia("(max-width: 767px)");
    const update = () => { setReduced(media.matches); setCompact(size.matches); };
    update(); media.addEventListener("change", update); size.addEventListener("change", update);
    return () => { media.removeEventListener("change", update); size.removeEventListener("change", update); };
  }, []);
  useEffect(() => {
    const el = canvas.current; const box = container.current;
    if (!el || !box) return;
    const ctx = el.getContext("2d"); if (!ctx) return;
    let frame = 0; let visible = false; let previous = 0;
    const draw = (time: number) => {
      const w = box.clientWidth, h = box.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) { el.width = Math.round(w * dpr); el.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      const animate = visible && active && !isPaused && !hovered && !focused && !reduced && !document.hidden;
      if (animate && previous) angle.current += Math.min(time - previous, 50) * 0.000014;
      previous = time;
      const rad = Math.min(w * 0.40, h * 0.38) * zoom;
      const cx = w / 2, cy = h / 2 - 14;
      const project = (p: { x: number; y: number; z: number }) => {
        const x = p.x * Math.cos(angle.current) + p.z * Math.sin(angle.current);
        const z0 = -p.x * Math.sin(angle.current) + p.z * Math.cos(angle.current);
        const y = p.y * Math.cos(-.22) - z0 * Math.sin(-.22);
        const z = p.y * Math.sin(-.22) + z0 * Math.cos(-.22);
        const perspective = 3.5 / (3.5 - z * .35);
        return { x: cx + x * rad * perspective, y: cy + y * rad * perspective, z };
      };
      // Reference meridians are a coordinate frame, never dataset relationships.
      ctx.lineWidth = .7; ctx.setLineDash([]);
      for (let ring = 0; ring < 9; ring++) {
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const a = i / 100 * Math.PI * 2;
          const longitude = ring * Math.PI / 9;
          const p = project({ x: Math.cos(a) * Math.cos(longitude), y: Math.sin(a), z: Math.cos(a) * Math.sin(longitude) });
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(168,173,180,.12)"; ctx.stroke();
      }
      for (const latitude of [-.72, -.35, 0, .35, .72]) {
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const a = i / 100 * Math.PI * 2, r = Math.sqrt(1 - latitude * latitude);
          const p = project({ x: Math.cos(a) * r, y: latitude, z: Math.sin(a) * r });
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(168,173,180,.15)"; ctx.stroke();
      }
      const pp = points.map(p => ({ ...project(p), point: p }));
      for (const edge of edges) {
        const a = pp[edge.a], b = pp[edge.b];
        const selected = a.point.slug === selectedSlug || b.point.slug === selectedSlug;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.setLineDash(edge.domain ? [3, 5] : []);
        ctx.strokeStyle = selected ? "rgba(77,163,255,.7)" : "rgba(77,163,255,.22)";
        ctx.lineWidth = selected ? 1.1 : .65; ctx.stroke();
      }
      ctx.setLineDash([]);
      for (const p of [...pp].sort((a, b) => a.z - b.z)) {
        const selected = p.point.slug === selectedSlug;
        const alpha = .4 + (p.z + 1) * .3;
        if (selected) {
          ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.strokeStyle = "#4da3ff"; ctx.lineWidth = 1; ctx.stroke();
          ctx.beginPath(); ctx.arc(p.x, p.y, 19, 0, Math.PI * 2); ctx.strokeStyle = "rgba(77,163,255,.2)"; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fillStyle = selected ? "#4da3ff" : `rgba(243,243,240,${alpha})`; ctx.fill();
        if (selected || (p.z > .5 && pp.length <= 30)) {
          const text = p.point.name.length > 25 ? p.point.name.slice(0, 23) + "…" : p.point.name;
          ctx.font = selected ? "500 12px system-ui" : "11px system-ui";
          ctx.fillStyle = selected ? "#f3f3f0" : "#a8adb4";
          const tw = ctx.measureText(text).width;
          const tx = Math.max(8, Math.min(w - tw - 8, p.x + 13));
          ctx.fillStyle = "rgba(8,11,16,.85)"; ctx.fillRect(tx - 3, p.y - 10, tw + 6, 18);
          ctx.fillStyle = selected ? "#f3f3f0" : "#a8adb4"; ctx.fillText(text, tx, p.y + 3);
        }
      }
      projected.current = pp.map(p => ({ slug: p.point.slug, x: p.x, y: p.y }));
      if (animate) frame = requestAnimationFrame(draw);
    };
    const redraw = () => { cancelAnimationFrame(frame); previous = 0; frame = requestAnimationFrame(draw); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; redraw(); }, { threshold: .02 }); observer.observe(box);
    const resize = new ResizeObserver(redraw); resize.observe(box);
    document.addEventListener("visibilitychange", redraw); redraw();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); document.removeEventListener("visibilitychange", redraw); };
  }, [points, edges, selectedSlug, active, isPaused, hovered, focused, reduced, zoom, revision]);
  const selectPoint = (x: number, y: number) => {
    const bounds = canvas.current?.getBoundingClientRect(); if (!bounds) return;
    const hit = projected.current.map(p => ({ ...p, d: Math.hypot(p.x - (x - bounds.left), p.y - (y - bounds.top)) })).sort((a, b) => a.d - b.d)[0];
    if (hit && hit.d < 26) { setPaused(true); onSelect?.(hit.slug); }
  };
  return <div ref={container} className={`${styles.field} ${className}`} data-mode={mode} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false); }}>
    <div className={styles.coordinate} aria-hidden><span>ATLAS / CATALOG FIELD</span><span>01 — PUBLIC METADATA</span></div>
    <canvas ref={canvas} className={styles.canvas} role="img" aria-label={`Atlas showing ${points.length} dataset records. Use the record list to select with a keyboard. Thin curves are reference coordinates; connections represent shared publishers${domains ? " or domains" : ""}.`} onPointerDown={e => { pointer.current = { x: e.clientX, y: e.clientY, dragged: false }; if (e.pointerType === "mouse") e.currentTarget.setPointerCapture(e.pointerId); }} onPointerMove={e => {
      if (e.pointerType !== "mouse" || !pointer.current || !e.buttons) return;
      const delta = e.clientX - pointer.current.x;
      if (Math.abs(delta) > 2 || pointer.current.dragged) { pointer.current.dragged = true; angle.current += delta * .004; pointer.current.x = e.clientX; setPaused(true); setRevision(n => n + 1); }
    }} onPointerUp={e => { if (!pointer.current?.dragged) selectPoint(e.clientX, e.clientY); pointer.current = null; }} onPointerCancel={() => { pointer.current = null; }} />
    <div className={styles.controls}>
      <button type="button" onClick={() => { setPaused(!isPaused); setRotationFor(selectedSlug); }} disabled={reduced} aria-label={isPaused ? "Resume Atlas rotation" : "Pause Atlas rotation"}>{reduced ? "Motion reduced" : isPaused ? "Resume ↻" : "Pause Ⅱ"}</button>
      <button type="button" onClick={() => { angle.current = .35; setZoom(1); setRevision(n => n + 1); }} aria-label="Reset Atlas view">Reset</button>
      <button type="button" onClick={() => setZoom(z => Math.max(.65, z - .1))} disabled={zoom <= .65} aria-label="Zoom out Atlas">−</button>
      <button type="button" onClick={() => setZoom(z => Math.min(1.4, z + .1))} disabled={zoom >= 1.4} aria-label="Zoom in Atlas">+</button>
    </div>
    <div className={styles.legend}><span>{points.length} records shown{records.length > points.length ? ` of ${records.length}` : ""} · Position is illustrative</span><label><input type="checkbox" checked={domains} onChange={e => setDomains(e.target.checked)} />Shared domains</label></div>
  </div>;
}
