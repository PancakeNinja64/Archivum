/**
 * Atlas drawing — canvas routines and token resolution.
 *
 * Canvas cannot consume `var(--token)`, so every colour is resolved once from
 * computed style against the field wrapper. No colour literal appears in this
 * file: the design system stays the single source of truth.
 */

import { coverageColorVar } from '@/lib/utils';
import { solidForPlatform } from './geometry';
import { transform } from './projection';
import type { AtlasEdgeKind, ProjectedNode } from './types';

/** Coverage arc — matches CoverageGauge and AtlasReticle. */
const ARC_SWEEP = 1.5 * Math.PI;
const ARC_START = -0.75 * Math.PI;

const LOD_LO = 5.5;
const LOD_HI = 7;

const BAND_LOW = 40;
const BAND_HIGH = 75;
const BAND_WINDOW = 8;

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

/**
 * Band colour with ±8-point interpolation at thresholds 40 and 75.
 * Geometry carries the precise figure; colour stays a coarse three-way read.
 */
export function nodeColor(coverageTotal: number, tokens: Tokens): string {
  const lowStart = BAND_LOW - BAND_WINDOW;
  const lowEnd = BAND_LOW + BAND_WINDOW;
  const highStart = BAND_HIGH - BAND_WINDOW;
  const highEnd = BAND_HIGH + BAND_WINDOW;

  if (coverageTotal <= lowStart) return tokens.asserted;
  if (coverageTotal >= highEnd) return tokens.verified;
  if (coverageTotal < lowEnd) {
    const t = (coverageTotal - lowStart) / (lowEnd - lowStart);
    return fog(tokens.asserted, tokens.inferred, t, 1);
  }
  if (coverageTotal < highStart) return tokens.inferred;
  const t = (coverageTotal - highStart) / (highEnd - highStart);
  return fog(tokens.inferred, tokens.verified, t, 1);
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
/* Nodes — wireframe solids + coverage arc at small LOD                */
/* ------------------------------------------------------------------ */

function nodeAlpha(p: ProjectedNode, opacityScale: number, entrance: number): number {
  return (0.18 + 0.82 * p.depth) * opacityScale * entrance;
}

function nodeFogColor(color: string, p: ProjectedNode, tokens: Tokens, alpha: number): string {
  return fog(color, tokens.background, (1 - p.depth) * 0.55, alpha);
}

function nodeLineWidth(p: ProjectedNode): number {
  return 0.6 + 0.9 * p.depth;
}

/** Small LOD glyph: 270° coverage arc matching CoverageGauge convention. */
function drawCoverageArcGlyph(
  ctx: CanvasRenderingContext2D,
  p: ProjectedNode,
  color: string,
  tokens: Tokens,
  opacityScale: number,
  entrance: number,
) {
  const alpha = nodeAlpha(p, opacityScale, entrance);
  if (alpha <= 0.01) return;

  const c = nodeFogColor(color, p, tokens, alpha);
  const w = nodeLineWidth(p);
  const r = p.sr * 0.9;
  const coverage = p.node.coverageTotal;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(p.sx, p.sy, r, ARC_START, ARC_START + ARC_SWEEP);
  ctx.strokeStyle = withAlpha(tokens.border, alpha * 0.85);
  ctx.lineWidth = w * 1.1;
  ctx.stroke();

  const filled = ARC_SWEEP * (coverage / 100);
  if (filled > 0.001) {
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r, ARC_START, ARC_START + filled);
    ctx.strokeStyle = c;
    ctx.lineWidth = w * 1.1;
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
  ctx.restore();
}

function projectLocalVertex(
  local: { x: number; y: number; z: number },
  p: ProjectedNode,
  theta: number,
  tiltX: number,
  tiltY: number,
): { sx: number; sy: number; z: number } {
  const r = transform(local, theta, tiltX, tiltY);
  return {
    sx: p.sx + r.x * p.sr,
    sy: p.sy + r.y * p.sr,
    z: r.z,
  };
}

function drawWireframeSolid(
  ctx: CanvasRenderingContext2D,
  p: ProjectedNode,
  color: string,
  tokens: Tokens,
  opacityScale: number,
  entrance: number,
  theta: number,
  tiltX: number,
  tiltY: number,
) {
  const baseAlpha = nodeAlpha(p, opacityScale, entrance);
  if (baseAlpha <= 0.01) return;

  const solid = solidForPlatform(p.node.platform);
  const projectedVerts = solid.vertices.map((v) =>
    projectLocalVertex(v, p, theta, tiltX, tiltY),
  );

  const exact = (p.node.coverageTotal / 100) * solid.edges.length;
  const full = Math.floor(exact);
  const frac = exact - full;
  const w = nodeLineWidth(p);

  ctx.save();

  for (let i = 0; i < solid.edges.length; i++) {
    if (i > full) break;

    const [a, b] = solid.edges[i];
    const va = projectedVerts[a];
    const vb = projectedVerts[b];
    const midZ = (va.z + vb.z) / 2;
    const edgeAlpha = baseAlpha * (midZ < 0 ? 0.45 : 1);
    if (edgeAlpha <= 0.01) continue;

    const c = nodeFogColor(color, p, tokens, edgeAlpha);

    ctx.beginPath();
    ctx.moveTo(va.sx, va.sy);

    if (i < full) {
      ctx.lineTo(vb.sx, vb.sy);
    } else if (frac > 0.001) {
      ctx.lineTo(va.sx + (vb.sx - va.sx) * frac, va.sy + (vb.sy - va.sy) * frac);
    }

    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.stroke();
  }

  const dotAlpha = baseAlpha * 1.1;
  if (dotAlpha > 0.02) {
    const dotColor = nodeFogColor(color, p, tokens, Math.min(1, dotAlpha));
    for (const v of projectedVerts) {
      ctx.beginPath();
      ctx.arc(v.sx, v.sy, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();
    }
  }

  ctx.restore();
}

export function drawNode(
  ctx: CanvasRenderingContext2D,
  p: ProjectedNode,
  color: string,
  tokens: Tokens,
  opacityScale: number,
  entrance: number,
  theta: number,
  tiltX: number,
  tiltY: number,
) {
  const sr = p.sr;

  if (sr < LOD_LO) {
    drawCoverageArcGlyph(ctx, p, color, tokens, opacityScale, entrance);
    return;
  }

  if (sr >= LOD_HI) {
    drawWireframeSolid(ctx, p, color, tokens, opacityScale, entrance, theta, tiltX, tiltY);
    return;
  }

  const t = (sr - LOD_LO) / (LOD_HI - LOD_LO);
  drawCoverageArcGlyph(ctx, p, color, tokens, opacityScale * (1 - t), entrance);
  drawWireframeSolid(ctx, p, color, tokens, opacityScale * t, entrance, theta, tiltX, tiltY);
}

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  p: ProjectedNode,
  tokens: Tokens,
  alpha: number,
  withCoverage = false,
) {
  if (alpha <= 0.02) return;
  const text = withCoverage
    ? `${p.node.name} · ${p.node.coverageTotal}%`
    : p.node.name;
  ctx.save();
  ctx.font = '10px var(--font-geist-mono), ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = withAlpha(tokens.mutedForeground, alpha);
  ctx.fillText(text, p.sx + p.sr + 6, p.sy);
  ctx.restore();
}
