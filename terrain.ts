/**
 * Delisted terrain — pure geometry. No React, no canvas, no DOM.
 *
 * Reuses transform() / project() from the Atlas unchanged. There is no new 3D
 * math here; only the height field is new.
 */

import { transform, type Vec3 } from '@/lib/atlas/projection';
import type { DelistedRecord, MassMetric } from './types';

/**
 * Camera. These values were established by rendering, not derived.
 *
 * TILT_X shallower than about -0.7 and the wells read as a wavy curtain rather
 * than depressions; true top-down makes them invisible entirely, because a dent
 * in a flat sheet has no silhouette from directly above.
 *
 * The terrain never rotates. The Atlas turns and is lit from within; this does
 * neither. Stillness is what keeps the two features from looking the same.
 */
export const TILT_X = -0.82;
export const FOCAL = 1150;
/** Fraction of the canvas height the horizon sits at. At 0.5 the deepest well falls out of frame. */
/** Where the undeformed plane sits in the band. Wells hang below it. */
export const HORIZON_RATIO = 0.55;

/**
 * Push the whole field away from the camera.
 *
 * Without this the camera sits inside the mesh: grid cells fill the frame, the
 * warm tint covers everything because every visible point is near a well, and
 * there is no flat reference at the edges to read the depressions against.
 */
export const WORLD_Z_OFFSET = 420;

export const MESH_X0 = -1050;
export const MESH_X1 = 1050;
export const MESH_Z0 = -560;
export const MESH_Z1 = 760;
export const MESH_STEP = 32;

export interface Well {
  slug: string;
  x: number;
  z: number;
  /** Animated 0..1 presence. Filtered-out records relax to 0 and the terrain smooths back. */
  presence: number;
  amp: number;
  sigma: number;
}

/** Raw mass for a record under the selected metric. Null when unavailable. */
export function massOf(rec: DelistedRecord, metric: MassMetric): number | null {
  switch (metric) {
    case 'rows':
      return rec.sizeRows;
    case 'coverage':
      return rec.coverageTotal;
    case 'dependents': {
      if (rec.dependentModels === null || rec.dependentPapers === null) return null;
      return rec.dependentModels + rec.dependentPapers;
    }
  }
}

/** True only when every record carries the figure. Gates the Dependents option. */
export function metricAvailable(records: DelistedRecord[], metric: MassMetric): boolean {
  return records.every((r) => massOf(r, metric) !== null);
}

/**
 * Row counts span six orders of magnitude, so compress before scaling —
 * otherwise a single billion-row record is the only well on the map.
 */
function normalise(value: number, metric: MassMetric): number {
  return metric === 'rows' ? Math.log10(value + 1) : value;
}

/**
 * Sublinear on purpose. Linear scaling lets one Common-Crawl-sized record
 * swallow every other well. The exponent is a deliberate judgement about how
 * much to flatten real differences — review it, do not inherit it.
 */
export function ampFor(m: number, max: number): number {
  const t = max > 0 ? Math.min(1, Math.max(0, m / max)) : 0;
  return Math.min(122, Math.max(26, 26 + 96 * t ** 0.55));
}

export function sigmaFor(m: number, max: number): number {
  const t = max > 0 ? Math.min(1, Math.max(0, m / max)) : 0;
  return 42 + 46 * t ** 0.5;
}

/**
 * Ceiling on summed well depth.
 *
 * Wells add, and a cluster of overlapping records can sum past the point where
 * the perspective divide blows up — projected floors land thousands of pixels
 * below the band and the wells stop being clickable. The spec's 44..204
 * amplitudes were tuned against six well-separated wells; forty overlapping
 * ones need both smaller amplitudes and a hard floor.
 */
export const MAX_DEPTH = 300;

/** Build the well set. `presenceOf` supplies the animated 0..1 for each record. */
export function buildWells(
  records: DelistedRecord[],
  metric: MassMetric,
  presenceOf: (slug: string) => number,
): Well[] {
  const values = records.map((r) => {
    const raw = massOf(r, metric);
    return raw === null ? 0 : normalise(raw, metric);
  });
  const max = values.reduce((a, b) => Math.max(a, b), 0);

  return records.map((r, i) => ({
    slug: r.slug,
    x: r.x,
    z: r.z,
    presence: presenceOf(r.slug),
    amp: ampFor(values[i], max),
    sigma: sigmaFor(values[i], max),
  }));
}

/**
 * Height field. Lorentzian rather than Gaussian: the softer tail is what makes
 * neighbouring wells merge into terrain instead of sitting as separate dents.
 */
export function heightAt(x: number, z: number, wells: Well[]): number {
  let y = 0;
  for (const w of wells) {
    if (w.presence <= 0.001) continue;
    const dx = x - w.x;
    const dz = z - w.z;
    const d2 = dx * dx + dz * dz;
    y += (w.amp * w.presence) / (1 + d2 / (w.sigma * w.sigma));
  }
  // Soft-knee toward MAX_DEPTH: deep clusters keep their ordering instead of
  // flattening into one identical floor, but nothing runs away.
  if (y > MAX_DEPTH * 0.6) {
    const over = y - MAX_DEPTH * 0.6;
    y = MAX_DEPTH * 0.6 + (MAX_DEPTH * 0.4 * over) / (over + MAX_DEPTH * 0.4);
  }
  return y;
}

/** 0..1 local well intensity, driving the warm tint. */
export function wellnessAt(x: number, z: number, wells: Well[], maxAmp: number): number {
  let best = 0;
  for (const w of wells) {
    if (w.presence <= 0.001) continue;
    const dx = x - w.x;
    const dz = z - w.z;
    const s = w.sigma * 1.05;
    const v = ((w.amp * w.presence) / maxAmp) / (1 + (dx * dx + dz * dz) / (s * s));
    if (v > best) best = v;
  }
  return Math.min(1, best);
}

/** 0..1 proximity to one specific well, driving the hover tint. */
export function proximityTo(x: number, z: number, well: Well | null): number {
  if (!well) return 0;
  const dx = x - well.x;
  const dz = z - well.z;
  const s = well.sigma * 0.55;
  return Math.min(1, 1 / (1 + (dx * dx + dz * dz) / (s * s)));
}

export interface Camera {
  cx: number;
  cy: number;
  /** Viewport scale. Well depth is in field units, so a short band needs it. */
  zoom: number;
}

/** Band height the depth constants were tuned against. */
const REFERENCE_HEIGHT = 520;

/**
 * Self-correcting vertical placement.
 *
 * WORLD_Z_OFFSET and TILT_X both push the surface down-screen, so a hand-tuned
 * centre ratio silently breaks whenever either changes. Instead, project the
 * undeformed plane at the origin and place it at HORIZON_RATIO of the band;
 * everything else follows.
 */
export function cameraFor(width: number, height: number): Camera {
  const zoom = Math.min(1.3, Math.max(0.5, height / REFERENCE_HEIGHT)) * 0.55;
  const cosX = Math.cos(TILT_X);
  const sinX = Math.sin(TILT_X);
  const flatY = -WORLD_Z_OFFSET * sinX;
  const flatZ = WORLD_Z_OFFSET * cosX;
  const flatScreen = flatY * (FOCAL / (FOCAL + flatZ)) * zoom;
  return { cx: width / 2, cy: height * HORIZON_RATIO - flatScreen, zoom };
}

/**
 * Project a field-space point through the fixed terrain camera.
 *
 * transform() is reused from the Atlas unchanged — that is the actual 3D maths.
 * The perspective divide is local because the Atlas hard-codes FOCAL_LENGTH at
 * 900 and the terrain needs 1150; editing the Atlas constant would silently
 * change the shipped landing page.
 */
export function projectPoint(
  x: number,
  y: number,
  z: number,
  cam: Camera,
): { sx: number; sy: number; scale: number } | null {
  const v: Vec3 = transform({ x, y, z: z + WORLD_Z_OFFSET }, 0, TILT_X, 0);
  const denom = FOCAL + v.z;
  // Guard well clear of the camera plane, not just above zero: a near-plane
  // point produces a finite but enormous scale, which is worse than dropping it.
  if (denom <= FOCAL * 0.3) return null;
  const scale = (FOCAL / denom) * cam.zoom;
  return { sx: cam.cx + v.x * scale, sy: cam.cy + v.y * scale, scale };
}

/**
 * Nearest well to a screen point.
 *
 * The 44px floor matters: a shallow well projects to a very small target and
 * would be effectively unhittable without it.
 */
export function hitTestWells(
  wells: Well[],
  px: number,
  py: number,
  cam: Camera,
): Well | null {
  let best: Well | null = null;
  let bestD = Infinity;
  for (const w of wells) {
    if (w.presence <= 0.05) continue;
    const p = projectPoint(w.x, heightAt(w.x, w.z, wells), w.z, cam);
    if (!p) continue;
    const dx = p.sx - px;
    const dy = p.sy - py;
    const d = Math.hypot(dx, dy);
    const radius = Math.max(w.sigma * 0.8 * p.scale, 44);
    if (d < radius && d < bestD) {
      bestD = d;
      best = w;
    }
  }
  return best;
}
