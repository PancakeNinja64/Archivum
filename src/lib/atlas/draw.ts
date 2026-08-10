/**
 * Atlas drawing — canvas routines and token resolution.
 *
 * Canvas cannot consume `var(--token)`, so every colour is resolved once from
 * computed style against the field wrapper. No colour literal appears in this
 * file: the design system stays the single source of truth.
 */

import { coverageColorVar } from '@/lib/utils';
import type { AtlasEdgeKind, ProjectedNode } from './types';

export interface Tokens {
  background: string;
  border: string;
  borderStrong: string;
  accent: string;
  foreground: string;
  mutedForeground: string;
  verified: string;
  inferred: string;
  asserted: string;
}

const TOKEN_MAP: Record<keyof Tokens, string> = {
  background: '--background',
  border: '--border',
  borderStrong: '--border-strong',
  accent: '--accent',
  foreground: '--foreground',
  mutedForeground: '--muted-foreground',
  verified: '--tier-verified',
  inferred: '--tier-inferred',
  asserted: '--tier-asserted',
};

/**
 * Read the token set from a scoped element. Pass the Atlas wrapper so
 * inherited theme variables resolve to the active light or dark palette.
 */
export function readTokens(scope: HTMLElement): Tokens {
  const cs = getComputedStyle(scope);
  const out = {} as Tokens;
  (Object.keys(TOKEN_MAP) as (keyof Tokens)[]).forEach((k) => {
    out[k] = cs.getPropertyValue(TOKEN_MAP[k]).trim() || '#000';
  });
  return out;
}

/** Resolve a `var(--x)` string returned by the shared colour helpers. */
export function resolveVar(scope: HTMLElement, varExpr: string): string {
  const name = varExpr.replace(/^var\(\s*/, '').replace(/\s*\)$/, '');
  return getComputedStyle(scope).getPropertyValue(name).trim() || '#000';
}

type RGB = [number, number, number];

function parseHex(hex: string): RGB {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return [255, 255, 255];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgbCache = new Map<string, RGB>();
function toRgb(color: string): RGB {
  const hit = rgbCache.get(color);
  if (hit) return hit;
  const v = parseHex(color);
  rgbCache.set(color, v);
  return v;
}

/** Mix `color` toward `into` by `amount` (0-1), returning an rgba() string. */
export function fog(color: string, into: string, amount: number, alpha: number): string {
  const [r1, g1, b1] = toRgb(color);
  const [r2, g2, b2] = toRgb(into);
  const t = Math.max(0, Math.min(1, amount));
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

export function withAlpha(color: string, alpha: number): string {
  const [r, g, b] = toRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/**
 * Band colour for a coverage figure.
 * Delegates to coverageColorVar so bandFor() stays the only place thresholds
 * are defined. Duplicating them here is how the two surfaces drift apart.
 */
export function bandColor(scope: HTMLElement, coverageTotal: number): string {
  return resolveVar(scope, coverageColorVar(coverageTotal));
}

/* ------------------------------------------------------------------ */
/* Ground reference                                                    */
/* ------------------------------------------------------------------ */

export function drawPolyline(
  ctx: CanvasRenderingContext2D,
  pts: { sx: number; sy: number }[],
  stroke: string,
  width: number,
) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].sx, pts[0].sy);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].sx, pts[i].sy);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

/* ------------------------------------------------------------------ */
/* Edges                                                               */
/* ------------------------------------------------------------------ */

export const EDGE_STYLE: Record<
  AtlasEdgeKind,
  { token: keyof Tokens; dash: number[]; boost: number; width: number }
> = {
  declared: { token: 'accent', dash: [], boost: 1.6, width: 1 },
  publisher: { token: 'borderStrong', dash: [], boost: 1, width: 0.9 },
  domain: { token: 'borderStrong', dash: [2, 5], boost: 1, width: 0.75 },
};

export function drawEdge(
  ctx: CanvasRenderingContext2D,
  a: ProjectedNode,
  b: ProjectedNode,
  kind: AtlasEdgeKind,
  tokens: Tokens,
  opacityScale: number,
) {
  const style = EDGE_STYLE[kind];
  const near = Math.min(a.depth, b.depth);
  const alpha = (0.1 + 0.28 * near) * style.boost * opacityScale;
  if (alpha <= 0.005) return;

  ctx.save();
  ctx.setLineDash(style.dash);
  ctx.beginPath();
  ctx.moveTo(a.sx, a.sy);
  ctx.lineTo(b.sx, b.sy);
  ctx.strokeStyle = fog(tokens[style.token], tokens.background, (1 - near) * 0.55, alpha);
  ctx.lineWidth = style.width;
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Nodes                                                               */
/* ------------------------------------------------------------------ */

/**
 * Glyph geometry mirrors EvidenceDot exactly, so the same encoding reads the
 * same way on a dataset page and in the field:
 *   extensive = filled disc · partial = half-filled ring · minimal = hollow ring
 * Colour is never the only channel.
 */
export function drawNode(
  ctx: CanvasRenderingContext2D,
  p: ProjectedNode,
  color: string,
  tokens: Tokens,
  opacityScale: number,
  entrance: number,
) {
  const alpha = (0.18 + 0.82 * p.depth) * opacityScale * entrance;
  if (alpha <= 0.01) return;

  const c = fog(color, tokens.background, (1 - p.depth) * 0.55, alpha);
  const w = 0.6 + 0.9 * p.depth;
  const r = p.sr;
  const band = p.node.coverageBand;

  ctx.save();
  if (band === 'extensive') {
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  } else if (band === 'partial') {
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r * 0.9, 0, Math.PI * 2);
    ctx.strokeStyle = c;
    ctx.lineWidth = w * 1.1;
    ctx.stroke();
    // Right half filled — the half dot.
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r * 0.9, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = c;
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r * 0.9, 0, Math.PI * 2);
    ctx.strokeStyle = c;
    ctx.lineWidth = w * 1.25;
    ctx.stroke();
  }
  ctx.restore();
}

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  p: ProjectedNode,
  tokens: Tokens,
  alpha: number,
) {
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.font = '10px var(--font-geist-mono), ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = withAlpha(tokens.mutedForeground, alpha);
  ctx.fillText(p.node.name, p.sx + p.sr + 6, p.sy);
  ctx.restore();
}
