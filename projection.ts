/**
 * Atlas projection — rotate, tilt, project, sort.
 *
 * Pure functions. No React, no canvas, no DOM. Everything here is testable in
 * isolation, which matters because a projection bug looks like a styling bug.
 */

import type { AtlasNode, ProjectedNode } from './types';

/** Camera distance. Larger = flatter; smaller = more aggressive perspective. */
export const FOCAL_LENGTH = 900;

/** Fixed downward look at the field, as in a table-top hologram. */
export const BASE_TILT_X = -0.32;

/** Ground plane, in field units. */
export const GROUND_Y = 235;

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Rotate about the Y axis, then tilt about X, then tilt about Y again for parallax. */
export function transform(p: Vec3, theta: number, tiltX: number, tiltY: number): Vec3 {
  // Y-axis spin
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  let x = p.x * cosT - p.z * sinT;
  let z = p.x * sinT + p.z * cosT;
  let y = p.y;

  // Parallax yaw
  if (tiltY !== 0) {
    const cy = Math.cos(tiltY);
    const sy = Math.sin(tiltY);
    const nx = x * cy - z * sy;
    z = x * sy + z * cy;
    x = nx;
  }

  // X-axis tilt
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const ny = y * cosX - z * sinX;
  z = y * sinX + z * cosX;
  y = ny;

  return { x, y, z };
}

/** Perspective divide. Returns null when the point is behind the camera. */
export function project(
  p: Vec3,
  cx: number,
  cy: number,
  zoom: number,
): { sx: number; sy: number; scale: number } | null {
  const denom = FOCAL_LENGTH + p.z;
  if (denom <= 1) return null;
  const scale = (FOCAL_LENGTH / denom) * zoom;
  return { sx: cx + p.x * scale, sy: cy + p.y * scale, scale };
}

/**
 * Node radius in field units, from row count. Log-scaled so a 1e9-row corpus
 * does not swallow a 1e3-row one.
 */
export function radiusFor(sizeRows: number, maxRows: number): number {
  const denom = Math.log10(maxRows + 1) || 1;
  return 2.5 + 6 * (Math.log10(sizeRows + 1) / denom);
}

/**
 * Project every node and sort back-to-front.
 *
 * The sort is the painter's algorithm and it is not optional: without it, far
 * nodes draw over near ones and the field collapses to a flat scatter.
 */
export function projectField(
  nodes: AtlasNode[],
  opts: {
    theta: number;
    tiltX: number;
    tiltY: number;
    cx: number;
    cy: number;
    zoom: number;
    maxRows: number;
  },
): ProjectedNode[] {
  const { theta, tiltX, tiltY, cx, cy, zoom, maxRows } = opts;
  const out: ProjectedNode[] = [];

  let minZ = Infinity;
  let maxZ = -Infinity;
  const staged: { node: AtlasNode; v: Vec3 }[] = [];

  for (const node of nodes) {
    const v = transform(node, theta, tiltX, tiltY);
    if (v.z < minZ) minZ = v.z;
    if (v.z > maxZ) maxZ = v.z;
    staged.push({ node, v });
  }

  const span = maxZ - minZ || 1;

  for (const { node, v } of staged) {
    const pr = project(v, cx, cy, zoom);
    if (!pr) continue;
    out.push({
      node,
      sx: pr.sx,
      sy: pr.sy,
      sr: Math.max(1, radiusFor(node.sizeRows, maxRows) * pr.scale),
      // 0 at the far plane, 1 at the near plane.
      depth: 1 - (v.z - minZ) / span,
      z: v.z,
    });
  }

  // Back to front: largest z first.
  out.sort((a, b) => b.z - a.z);
  return out;
}

/** Points on the ground reference ellipses, in field space. */
export function groundRing(radius: number, segments = 72): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push({ x: Math.cos(a) * radius, y: GROUND_Y, z: Math.sin(a) * radius });
  }
  return pts;
}

/** Radial spokes on the ground plane. */
export function groundSpokes(radius: number, count = 12): [Vec3, Vec3][] {
  const out: [Vec3, Vec3][] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    out.push([
      { x: Math.cos(a) * radius * 0.28, y: GROUND_Y, z: Math.sin(a) * radius * 0.28 },
      { x: Math.cos(a) * radius, y: GROUND_Y, z: Math.sin(a) * radius },
    ]);
  }
  return out;
}

/** Nearest projected node under a point, front-to-back so near nodes win. */
export function hitTest(
  projected: ProjectedNode[],
  px: number,
  py: number,
  slop = 8,
): ProjectedNode | null {
  for (let i = projected.length - 1; i >= 0; i--) {
    const p = projected[i];
    const dx = p.sx - px;
    const dy = p.sy - py;
    const r = p.sr + slop;
    if (dx * dx + dy * dy <= r * r) return p;
  }
  return null;
}
