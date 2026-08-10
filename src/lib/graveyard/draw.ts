/**
 * Delisted terrain — canvas drawing.
 *
 * Token resolution is reused from the Atlas (readTokens / withAlpha / fog), so
 * no colour literal appears here and the design system stays the single source
 * of truth.
 */

import { withAlpha, type Tokens } from '@/lib/atlas/draw';
import {
  MESH_STEP,
  MESH_X0,
  MESH_X1,
  MESH_Z0,
  MESH_Z1,
  heightAt,
  projectPoint,
  proximityTo,
  wellnessAt,
  type Camera,
  type Well,
} from './terrain';

function mix(a: string, b: string, t: number): string {
  const pa = parse(a);
  const pb = parse(b);
  const k = Math.max(0, Math.min(1, t));
  return `rgb(${Math.round(pa[0] + (pb[0] - pa[0]) * k)}, ${Math.round(
    pa[1] + (pb[1] - pa[1]) * k,
  )}, ${Math.round(pa[2] + (pb[2] - pa[2]) * k)})`;
}

const cache = new Map<string, [number, number, number]>();
function parse(color: string): [number, number, number] {
  const hit = cache.get(color);
  if (hit) return hit;
  let h = color.replace('#', '').trim();
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  const out: [number, number, number] = Number.isNaN(n)
    ? [255, 255, 255]
    : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  cache.set(color, out);
  return out;
}

export interface MeshOptions {
  wells: Well[];
  hovered: Well | null;
  cam: Camera;
  tokens: Tokens;
  maxAmp: number;
}

/**
 * The mesh.
 *
 * Grid at rest is --border-strong. It warms toward --tier-asserted with local
 * well intensity and toward --accent under the hovered well, so mass
 * differentiates itself rather than being announced by a separate legend.
 */
export function drawMesh(ctx: CanvasRenderingContext2D, o: MeshOptions) {
  const { wells, hovered, cam, tokens, maxAmp } = o;
  const xs: number[] = [];
  for (let x = MESH_X0; x <= MESH_X1; x += MESH_STEP) xs.push(x);
  const zs: number[] = [];
  for (let z = MESH_Z0; z <= MESH_Z1; z += MESH_STEP) zs.push(z);

  // Height and projection are shared by both line directions, so do them once.
  const pts: ({ sx: number; sy: number } | null)[][] = [];
  const tint: number[][] = [];
  const hov: number[][] = [];
  for (let zi = 0; zi < zs.length; zi++) {
    const rowPts: ({ sx: number; sy: number } | null)[] = [];
    const rowTint: number[] = [];
    const rowHov: number[] = [];
    for (let xi = 0; xi < xs.length; xi++) {
      const x = xs[xi];
      const z = zs[zi];
      const y = heightAt(x, z, wells);
      rowPts.push(projectPoint(x, y, z, cam));
      rowTint.push(wellnessAt(x, z, wells, maxAmp));
      rowHov.push(proximityTo(x, z, hovered));
    }
    pts.push(rowPts);
    tint.push(rowTint);
    hov.push(rowHov);
  }

  const warm = mix(tokens.borderStrong, tokens.asserted, 1);
  const cool = mix(tokens.borderStrong, tokens.accent, 1);

  const seg = (
    a: { sx: number; sy: number } | null,
    b: { sx: number; sy: number } | null,
    w: number,
    h: number,
    zFade: number,
  ) => {
    if (!a || !b) return;
    const alpha = 0.09 + 0.17 * zFade + 0.52 * w + 0.35 * h;
    if (alpha <= 0.02) return;
    let color = mix(tokens.borderStrong, warm, Math.min(1, w * 1.3));
    if (h > 0.01) color = mix(color, cool, h * 0.75);
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.strokeStyle = withAlpha(color, alpha);
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Rows back to front, then columns.
  for (let zi = 0; zi < zs.length; zi++) {
    const zFade = zi / Math.max(1, zs.length - 1);
    for (let xi = 0; xi < xs.length - 1; xi++) {
      seg(
        pts[zi][xi],
        pts[zi][xi + 1],
        Math.max(tint[zi][xi], tint[zi][xi + 1]),
        Math.max(hov[zi][xi], hov[zi][xi + 1]),
        zFade,
      );
    }
  }
  for (let xi = 0; xi < xs.length; xi++) {
    for (let zi = 0; zi < zs.length - 1; zi++) {
      const zFade = zi / Math.max(1, zs.length - 1);
      seg(
        pts[zi][xi],
        pts[zi + 1][xi],
        Math.max(tint[zi][xi], tint[zi + 1][xi]),
        Math.max(hov[zi][xi], hov[zi + 1][xi]),
        zFade * 0.85,
      );
    }
  }
}

/**
 * Well floors.
 *
 * A hollow ring, never filled. Nothing sits at the centre — the record is gone,
 * and only the deformation survives it. That is the whole argument of the page,
 * so the ring must not become a dot.
 */
export function drawFloors(
  ctx: CanvasRenderingContext2D,
  wells: Well[],
  cam: Camera,
  tokens: Tokens,
  hovered: Well | null,
) {
  for (const w of wells) {
    if (w.presence <= 0.05) continue;
    const p = projectPoint(w.x, heightAt(w.x, w.z, wells), w.z, cam);
    if (!p) continue;
    const on = hovered?.slug === w.slug;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, 4, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(
      on ? tokens.accent : tokens.mutedForeground,
      (on ? 0.95 : 0.3) * w.presence,
    );
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/** Targeting brackets plus a leader line out to the pinned card. */
export function drawReticle(
  ctx: CanvasRenderingContext2D,
  well: Well,
  wells: Well[],
  cam: Camera,
  tokens: Tokens,
  t: number,
  cardAnchor: { x: number; y: number } | null,
) {
  const p = projectPoint(well.x, heightAt(well.x, well.z, wells), well.z, cam);
  if (!p) return;
  const R = 18;
  const B = 8;

  ([
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ] as const).forEach(([sx, sy], i) => {
    const stagger = Math.max(0, Math.min(1, (t - i * 0.09) / 0.4));
    if (stagger <= 0) return;
    const off = 6 * (1 - stagger);
    const cx = p.sx + sx * (R + off);
    const cy = p.sy + sy * (R + off);
    ctx.beginPath();
    ctx.moveTo(cx, cy - sy * B);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx - sx * B, cy);
    ctx.strokeStyle = withAlpha(tokens.accent, 0.9 * stagger);
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  if (cardAnchor && t > 0.4) {
    const a = Math.min(1, (t - 0.4) / 0.6);
    ctx.beginPath();
    ctx.moveTo(p.sx + R, p.sy - R * 0.6);
    ctx.lineTo(cardAnchor.x, cardAnchor.y);
    ctx.strokeStyle = withAlpha(tokens.accent, 0.4 * a);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
