/**
 * Atlas geometry — pure functions behind the homepage globe.
 *
 * Positions are a navigation composition, never evidence: records are placed
 * on a Fibonacci sphere so they spread evenly, and the only edges drawn are
 * shared-publisher relationships that exist in the catalog metadata.
 */
import type { DatasetSummary } from '@/lib/types';

export interface AtlasNode {
  slug: string;
  name: string;
  publisher: string;
  platform: string;
  domain: string;
  coverageTotal: number;
  /** Unit-sphere position, before any camera rotation. */
  x: number;
  y: number;
  z: number;
}

export interface AtlasEdge {
  a: number;
  b: number;
}

export interface Camera {
  /** Rotation about the vertical axis, radians. */
  spin: number;
  /** Tilt toward the viewer, radians. Negative shows the top of the globe. */
  tilt: number;
  /** Screen radius of the globe in CSS pixels. */
  radius: number;
  cx: number;
  cy: number;
}

export interface Projected {
  x: number;
  y: number;
  /** Depth after rotation: +1 nearest the viewer, −1 furthest. */
  depth: number;
  /** Perspective scale, > 1 when nearer. */
  scale: number;
  /** Rotated unit vector, used for lighting. */
  nx: number;
  ny: number;
  nz: number;
}

export const MAX_NODES = 80;
export const UNKNOWN_PUBLISHER = new Set(['', 'unknown', 'independent contributor', 'not stated']);

const fnv = (s: string) => Array.from(s).reduce((n, c) => Math.imul(n ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

/** Fibonacci sphere: uniform spread for any count, stable for a given order. */
export function layoutNodes(records: DatasetSummary[]): AtlasNode[] {
  const rows = records.slice(0, MAX_NODES);
  const n = Math.max(1, rows.length);
  return rows.map((r, i) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * 2.399963229728653; // golden angle
    // A hair of shell variation keeps points from reading as a lattice; they still sit on the globe.
    const shell = 0.965 + (fnv(r.slug) % 100) / 2857;
    return {
      slug: r.slug,
      name: r.name,
      publisher: r.publisher,
      platform: r.platform,
      domain: r.domain[0] ?? 'Unclassified',
      coverageTotal: r.coverageTotal,
      x: Math.cos(theta) * ring * shell,
      y: y * shell,
      z: Math.sin(theta) * ring * shell,
    };
  });
}

/** Only relationships present in the metadata: the same named publisher. */
export function publisherEdges(nodes: AtlasNode[]): AtlasEdge[] {
  const edges: AtlasEdge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const p = nodes[i].publisher.trim();
    if (UNKNOWN_PUBLISHER.has(p.toLowerCase())) continue;
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[j].publisher.trim() === p) edges.push({ a: i, b: j });
    }
  }
  return edges;
}

/** Rotate a unit vector by the camera, then project with mild perspective. */
export function project(v: { x: number; y: number; z: number }, cam: Camera): Projected {
  const cs = Math.cos(cam.spin), sn = Math.sin(cam.spin);
  const x1 = v.x * cs + v.z * sn;
  const z1 = -v.x * sn + v.z * cs;
  const ct = Math.cos(cam.tilt), st = Math.sin(cam.tilt);
  const y2 = v.y * ct - z1 * st;
  const z2 = v.y * st + z1 * ct;
  const scale = 3.2 / (3.2 - z2 * 0.55);
  return {
    x: cam.cx + x1 * cam.radius * scale,
    y: cam.cy + y2 * cam.radius * scale,
    depth: z2,
    scale,
    nx: x1,
    ny: y2,
    nz: z2,
  };
}

/** One key light, upper-left and toward the viewer. Shared with the CSS stage. */
export const LIGHT = normalize(-0.55, -0.65, 0.55);

function normalize(x: number, y: number, z: number) {
  const l = Math.hypot(x, y, z) || 1;
  return { x: x / l, y: y / l, z: z / l };
}

/** Lambert term for a point on the globe, 0..1. */
export function lambert(p: Pick<Projected, 'nx' | 'ny' | 'nz'>): number {
  return Math.max(0, p.nx * LIGHT.x + p.ny * LIGHT.y + p.nz * LIGHT.z);
}

/** Depth fog: far side of the globe recedes without vanishing. */
export function fog(depth: number, strength = 1): number {
  const t = (depth + 1) / 2; // 0 far, 1 near
  return 1 - strength * (1 - (0.28 + 0.72 * t));
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };
export const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** Progress of `v` between `a` and `b`, clamped. */
export const span = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/**
 * The record the homepage resolves first. A record with a shared-publisher
 * connection and partial coverage demonstrates the most: it has edges to
 * follow and gaps that must stay visible. Falls back to the first record.
 */
export function chooseFeatured(records: DatasetSummary[]): DatasetSummary | null {
  if (records.length === 0) return null;
  const counts = new Map<string, number>();
  for (const r of records) {
    const key = r.publisher.trim();
    if (UNKNOWN_PUBLISHER.has(key.toLowerCase())) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const connected = records.filter((r) => (counts.get(r.publisher.trim()) ?? 0) > 1);
  const partial = (rows: DatasetSummary[]) => rows.filter((r) => r.coverageBand === 'partial').sort((a, b) => b.coverageTotal - a.coverageTotal)[0];
  return partial(connected) ?? connected[0] ?? partial(records) ?? records[0];
}
