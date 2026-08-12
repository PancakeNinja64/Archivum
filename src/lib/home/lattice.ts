/**
 * The specimen lattice.
 *
 * The twenty-eight coverage checks as a cage: four stacked rings, seven nodes
 * each. A segment exists only where the checks it joins are both documented, so
 * the object is literally full of holes — the Composition ring closes almost
 * completely, the Licensing ring is one isolated point with nothing attached.
 *
 * Every node renders whether documented or not. Absence has to be visible, not
 * merely missing; this follows LineageGraph, where gaps are shown rather than
 * hidden.
 *
 * Pure geometry. No React, no canvas, no DOM.
 */

import { transform, type Vec3 } from '@/lib/atlas/projection';
import {
  COVERAGE_CHECKS,
  COVERAGE_SECTIONS,
  type CheckResult,
  type CoverageSectionKey,
} from '@/lib/coverage/rules';
import { SPECIMEN_DETAIL } from './specimen';

/** Local to the lattice. The Atlas hard-codes 900 and must not be edited. */
export const FOCAL = 800;
export const RING_RADIUS = 178;
/** Wider than tall: at a 360-unit span the object reads as a tower, not a cage. */
export const RING_Y = [-138, -46, 46, 138] as const;
export const PER_RING = 7;

export type Outcome = Exclude<CheckResult, 'n/a'>;

export interface LatticeNode {
  id: string;
  label: string;
  method: string;
  section: CoverageSectionKey;
  /** 0-3, top to bottom. */
  ring: number;
  /** 0-6 around the ring. */
  index: number;
  outcome: Outcome;
  x: number;
  y: number;
  z: number;
}

export interface LatticeSegment {
  a: number;
  b: number;
  kind: 'arc' | 'strut';
  ring: number;
  /** Dashed when either endpoint is only partially stated. */
  partial: boolean;
}

export interface Lattice {
  nodes: LatticeNode[];
  segments: LatticeSegment[];
}

const SECTION_ORDER = Object.keys(COVERAGE_SECTIONS) as CoverageSectionKey[];

/**
 * A segment needs both endpoints to carry evidence. `reported` counts, but
 * renders dashed at half opacity — half-present, matching its 0.5 weight in
 * computeCoverage().
 */
function joins(a: Outcome, b: Outcome): { present: boolean; partial: boolean } {
  const aOk = a === 'documented' || a === 'reported';
  const bOk = b === 'documented' || b === 'reported';
  return {
    present: aOk && bOk,
    partial: a === 'reported' || b === 'reported',
  };
}

export function buildLattice(): Lattice {
  const nodes: LatticeNode[] = [];

  SECTION_ORDER.forEach((section, ring) => {
    const checks = COVERAGE_CHECKS.filter((c) => c.section === section);
    checks.forEach((check, index) => {
      const angle = (index / PER_RING) * Math.PI * 2;
      nodes.push({
        id: check.id,
        label: check.label,
        method: check.method,
        section,
        ring,
        index,
        outcome: (SPECIMEN_DETAIL[check.id] ?? 'not_found') as Outcome,
        x: Math.cos(angle) * RING_RADIUS,
        y: RING_Y[ring],
        z: Math.sin(angle) * RING_RADIUS,
      });
    });
  });

  const at = (ring: number, index: number) =>
    nodes.findIndex((n) => n.ring === ring && n.index === index);

  const segments: LatticeSegment[] = [];

  // Arcs around each ring.
  for (let ring = 0; ring < RING_Y.length; ring++) {
    for (let i = 0; i < PER_RING; i++) {
      const a = at(ring, i);
      const b = at(ring, (i + 1) % PER_RING);
      if (a < 0 || b < 0) continue;
      const j = joins(nodes[a].outcome, nodes[b].outcome);
      if (j.present) segments.push({ a, b, kind: 'arc', ring, partial: j.partial });
    }
  }

  // Struts between adjacent rings at the same angular index.
  for (let ring = 0; ring < RING_Y.length - 1; ring++) {
    for (let i = 0; i < PER_RING; i++) {
      const a = at(ring, i);
      const b = at(ring + 1, i);
      if (a < 0 || b < 0) continue;
      const j = joins(nodes[a].outcome, nodes[b].outcome);
      if (j.present) segments.push({ a, b, kind: 'strut', ring, partial: j.partial });
    }
  }

  return { nodes, segments };
}

export interface Camera {
  cx: number;
  cy: number;
  theta: number;
  tiltX: number;
  /** Per-ring z push, used when a probe isolates one ring. */
  ringOffset: (ring: number) => number;
  /** Per-ring vertical shift, used to centre an isolated ring. */
  ringLift: (ring: number) => number;
  scale: number;
}

export interface Projected {
  sx: number;
  sy: number;
  /** Camera-space z, for painter's-algorithm sorting. */
  z: number;
  scale: number;
}

export function projectNode(n: LatticeNode, cam: Camera): Projected | null {
  return projectPoint(n.x, n.y + cam.ringLift(n.ring), n.z + cam.ringOffset(n.ring), cam);
}

export function projectPoint(
  x: number,
  y: number,
  z: number,
  cam: Camera,
): Projected | null {
  const v: Vec3 = transform({ x, y, z }, cam.theta, cam.tiltX, 0);
  const denom = FOCAL + v.z;
  // Guard clear of the camera plane: a near-plane point gives a finite but
  // enormous scale, which is worse than dropping it.
  if (denom <= FOCAL * 0.3) return null;
  const s = (FOCAL / denom) * cam.scale;
  return { sx: cam.cx + v.x * s, sy: cam.cy + v.y * s, z: v.z, scale: s };
}

export interface DrawItem {
  kind: 'node' | 'segment';
  z: number;
  node?: LatticeNode;
  p?: Projected;
  a?: Projected;
  b?: Projected;
  segment?: LatticeSegment;
}

/**
 * Project everything and sort back to front.
 *
 * The sort is not optional. Without it the cage renders as a flat scribble —
 * near struts drawn under far ones — and no amount of styling recovers it.
 */
export function projectLattice(lattice: Lattice, cam: Camera): DrawItem[] {
  const items: DrawItem[] = [];
  const projected = lattice.nodes.map((n) => projectNode(n, cam));

  lattice.segments.forEach((seg) => {
    const a = projected[seg.a];
    const b = projected[seg.b];
    if (!a || !b) return;
    items.push({ kind: 'segment', z: (a.z + b.z) / 2, a, b, segment: seg });
  });

  lattice.nodes.forEach((n, i) => {
    const p = projected[i];
    if (!p) return;
    items.push({ kind: 'node', z: p.z, node: n, p });
  });

  items.sort((x, y) => y.z - x.z);
  return items;
}

/** Nearest node to a screen point, evaluated front to back so near nodes win. */
export function hitTest(
  lattice: Lattice,
  cam: Camera,
  px: number,
  py: number,
): LatticeNode | null {
  let best: LatticeNode | null = null;
  let bestZ = Infinity;
  lattice.nodes.forEach((n) => {
    const p = projectNode(n, cam);
    if (!p) return;
    const r = Math.max(14, 4 * p.scale + 10);
    const d = Math.hypot(p.sx - px, p.sy - py);
    if (d < r && p.z < bestZ) {
      bestZ = p.z;
      best = n;
    }
  });
  return best;
}

/**
 * Ghost ring — the complete circle each ring would be.
 *
 * Without this the missing arcs read as scattered dots rather than as absence:
 * the viewer has no reference for where a segment ought to have been. It is the
 * same role the ground rings play in the Atlas, and it is the cheapest thing in
 * the whole build.
 */
export function ghostRing(ring: number, cam: Camera, segments = 56): { sx: number; sy: number }[] {
  const pts: { sx: number; sy: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const p = projectPoint(
      Math.cos(a) * RING_RADIUS,
      RING_Y[ring] + cam.ringLift(ring),
      Math.sin(a) * RING_RADIUS + cam.ringOffset(ring),
      cam,
    );
    if (p) pts.push({ sx: p.sx, sy: p.sy });
  }
  return pts;
}

/** Per-section counts, for the label beside each ring. */
export function ringSummary(lattice: Lattice) {
  return SECTION_ORDER.map((section, ring) => {
    const ns = lattice.nodes.filter((n) => n.ring === ring);
    return {
      ring,
      section,
      label: COVERAGE_SECTIONS[section].label,
      documented: ns.filter((n) => n.outcome === 'documented').length,
      total: ns.length,
    };
  });
}

export { SECTION_ORDER };
