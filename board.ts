/**
 * Delisted board — pure geometry. No React, no canvas, no DOM.
 *
 * Reuses transform() / project() from the Atlas unchanged. There is no new 3D
 * maths here; only the layout is new.
 *
 * Layout is DERIVED, never authored. Records used to carry x/z coordinates,
 * which meant the data type encoded a view concern and two records could
 * silently overlap. Position now falls out of the record's own facts: the lane
 * is its mode of loss, the row is when it was last confirmed.
 */

import { project, transform, type Vec3 } from '@/lib/atlas/projection';
import { decayIndex, type DecayResult } from './decay';
import { END_STATES, type DelistedRecord, type EndState } from './types';

/* ---------------------------------------------------------------- camera -- */

/**
 * Established by rendering, not derived.
 *
 * TILT_X is POSITIVE, unlike the Atlas. The sign decides which way the depth
 * axis runs on screen: negative puts the near edge at the top of the frame and
 * the horizon at the bottom, which reads as looking up at a ceiling. Positive
 * puts the far rows toward the top, where a horizon belongs. The Atlas gets
 * away with a negative tilt because it renders a cloud of nodes rather than a
 * ground plane, so nothing there establishes an up.
 *
 * Shallower than about 0.4 and the far rows hide behind the near ones; steeper
 * than about 0.8 and the columns lose the silhouette that carries their height.
 *
 * YAW is non-zero so every column shows three faces. At yaw 0 a box is a
 * rectangle and the board reads as a flat bar chart with a drop shadow.
 */
export const TILT_X = 0.6;
export const YAW = -0.62;

/**
 * Push the whole board away from the camera.
 *
 * Without it the near rows sit almost on the lens: the same column is half
 * again as large at the front of the board as at the back, and height stops
 * being comparable across rows — which is the one thing the board is for.
 */
export const WORLD_Z_OFFSET = 520;
/** Where the fitted board sits vertically in the band. */
export const VERTICAL_BIAS = 0.52;

/** Column footprint and spacing, in world units. */
export const CELL_W = 38;
export const PITCH_X = 60;
/** Deeper than PITCH_X because depth compresses under the tilt. */
export const PITCH_Z = 50;
/** Empty pitches between two lanes. */
export const LANE_GAP = 1;
/**
 * Floor on lane width. A lane whose busiest cohort held one record would
 * otherwise collapse to a single file of columns and stop reading as a block,
 * which makes the four modes of loss hard to tell apart at a glance.
 */
export const MIN_LANE_SLOTS = 3;

/** A decay-zero record is still a visible tile, not a hole in the board. */
export const HEIGHT_MIN = 8;
export const HEIGHT_MAX = 190;

/** World Y of the board surface. Y grows downward, as in the Atlas. */
export const BASE_Y = 120;

/** Level-of-detail thresholds, in projected px per world unit. */
export const LOD_LO = 0.55;
export const LOD_HI = 0.95;

export interface Camera {
  cx: number;
  cy: number;
  zoom: number;
}

/* ---------------------------------------------------------------- layout -- */

export interface BoardColumn {
  slug: string;
  record: DelistedRecord;
  decay: DecayResult;
  lane: EndState;
  laneIndex: number;
  cohortIndex: number;
  slotIndex: number;
  /** World centre of the footprint. */
  x: number;
  z: number;
  height: number;
  /** Order the intro extrusion plays in: back rows first, then left to right. */
  order: number;
}

export interface BoardLane {
  state: EndState;
  x0: number;
  x1: number;
  centerX: number;
  slots: number;
}

export interface BoardCohort {
  key: string;
  label: string;
  z: number;
}

export interface BoardLayout {
  columns: BoardColumn[];
  lanes: BoardLane[];
  cohorts: BoardCohort[];
  bounds: { x0: number; x1: number; z0: number; z1: number };
}

export type CohortSize = 'half' | 'year';

export function cohortKeyOf(iso: string, size: CohortSize): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  if (size === 'year') return `${y}`;
  return `${y}-H${d.getUTCMonth() < 6 ? 1 : 2}`;
}

export function cohortLabelOf(key: string): string {
  const [y, h] = key.split('-');
  return h ? `${h} ${y}` : y;
}

/**
 * Build the board.
 *
 * Empty cells are kept. A half-year in which nothing was observed to disappear
 * is a fact about the record, and compressing it out would make the time axis
 * lie about spacing.
 */
export function buildBoard(
  records: DelistedRecord[],
  cohortSize: CohortSize = 'half',
): BoardLayout {
  const decays = new Map<string, DecayResult>();
  records.forEach((r) => decays.set(r.slug, decayIndex(r)));

  const cohortKeys = Array.from(
    new Set(records.map((r) => cohortKeyOf(r.lastConfirmed, cohortSize))),
  ).sort();

  const cohortIndex = new Map(cohortKeys.map((k, i) => [k, i]));

  /* Bucket by (lane, cohort), then order inside the cell so layout is stable
     across renders: decay descending, then platform, then slug. */
  const cells = new Map<string, DelistedRecord[]>();
  for (const rec of records) {
    const key = `${rec.endState}|${cohortKeyOf(rec.lastConfirmed, cohortSize)}`;
    const bucket = cells.get(key);
    if (bucket) bucket.push(rec);
    else cells.set(key, [rec]);
  }
  for (const bucket of cells.values()) {
    bucket.sort((a, b) => {
      const d = (decays.get(b.slug)?.index ?? 0) - (decays.get(a.slug)?.index ?? 0);
      if (d !== 0) return d;
      if (a.platform !== b.platform) return a.platform < b.platform ? -1 : 1;
      return a.slug < b.slug ? -1 : 1;
    });
  }

  /* Lane width is the busiest cell in that lane. Lanes with nothing in them
     still occupy one slot so the axis keeps all four labels. */
  const lanes: BoardLane[] = [];
  let cursor = 0;
  END_STATES.forEach((state, laneIndex) => {
    let slots = MIN_LANE_SLOTS;
    cohortKeys.forEach((ck) => {
      slots = Math.max(slots, cells.get(`${state}|${ck}`)?.length ?? 0);
    });
    const x0 = cursor * PITCH_X;
    const x1 = (cursor + slots - 1) * PITCH_X;
    lanes.push({ state, x0, x1, centerX: (x0 + x1) / 2, slots });
    cursor += slots + (laneIndex < END_STATES.length - 1 ? LANE_GAP : 0);
  });

  const totalX = Math.max(1, cursor - 1) * PITCH_X;
  const totalZ = Math.max(1, cohortKeys.length - 1) * PITCH_Z;
  const offX = totalX / 2;
  const offZ = totalZ / 2;

  const laneByState = new Map(lanes.map((l) => [l.state, l]));

  const columns: BoardColumn[] = [];
  for (const [key, bucket] of cells) {
    const [state, ck] = key.split('|') as [EndState, string];
    const lane = laneByState.get(state);
    const ci = cohortIndex.get(ck);
    if (!lane || ci === undefined) continue;
    bucket.forEach((rec, slotIndex) => {
      const decay = decays.get(rec.slug)!;
      columns.push({
        slug: rec.slug,
        record: rec,
        decay,
        lane: state,
        laneIndex: END_STATES.indexOf(state),
        cohortIndex: ci,
        slotIndex,
        x: lane.x0 + slotIndex * PITCH_X - offX,
        /* Z grows away from the camera, so the chronological index is inverted:
           the most recent cohort sits at the front edge and time arrives at the
           viewer. Getting this backwards reads as history running away. */
        z: (cohortKeys.length - 1 - ci) * PITCH_Z - offZ,
        height: HEIGHT_MIN + (HEIGHT_MAX - HEIGHT_MIN) * (decay.index / 100),
        order: 0,
      });
    });
  }

  /* Extrusion order: back rows first, then left to right. Time arrives at the
     viewer, which is the same direction the axis reads. */
  columns.sort((a, b) => a.cohortIndex - b.cohortIndex || a.x - b.x);
  columns.forEach((c, i) => {
    c.order = i;
  });

  const cohorts: BoardCohort[] = cohortKeys.map((k, i) => ({
    key: k,
    label: cohortLabelOf(k),
    z: (cohortKeys.length - 1 - i) * PITCH_Z - offZ,
  }));

  lanes.forEach((l) => {
    l.x0 -= offX;
    l.x1 -= offX;
    l.centerX -= offX;
  });

  return {
    columns,
    lanes,
    cohorts,
    bounds: {
      x0: -offX - PITCH_X * 0.75,
      x1: totalX - offX + PITCH_X * 0.75,
      z0: -offZ - PITCH_Z * 0.75,
      z1: totalZ - offZ + PITCH_Z * 0.75,
    },
  };
}

/* ------------------------------------------------------------ projection -- */

export function toView(x: number, y: number, z: number): Vec3 {
  const v = transform({ x, y, z }, 0, TILT_X, YAW);
  return { x: v.x, y: v.y, z: v.z + WORLD_Z_OFFSET };
}

export function projectPoint(
  x: number,
  y: number,
  z: number,
  cam: Camera,
): { sx: number; sy: number; scale: number } | null {
  return project(toView(x, y, z), cam.cx, cam.cy, cam.zoom);
}

/**
 * Which ground corner sits furthest from the camera.
 *
 * Derived rather than hard-coded, so the walls and axis labels stay on the
 * outside of the plate if the yaw is ever retuned. Hard-coding "back wall at
 * z1" silently puts the scaffolding in front of the data the moment the camera
 * moves past 45 degrees.
 */
export function boardAnchor(layout: BoardLayout): {
  farX: number;
  farZ: number;
  nearX: number;
  nearZ: number;
} {
  const { x0, x1, z0, z1 } = layout.bounds;
  let best = { x: x0, z: z0, d: -Infinity };
  for (const x of [x0, x1]) {
    for (const z of [z0, z1]) {
      const d = toView(x, BASE_Y, z).z;
      if (d > best.d) best = { x, z, d };
    }
  }
  return {
    farX: best.x,
    farZ: best.z,
    nearX: best.x === x0 ? x1 : x0,
    nearZ: best.z === z0 ? z1 : z0,
  };
}

/**
 * Frame the whole board inside the band.
 *
 * Computed from the projected bounding box rather than hand-tuned, so the
 * camera survives a fixture with a different number of cohorts.
 */
export function fitCamera(w: number, h: number, layout: BoardLayout): Camera {
  const { x0, x1, z0, z1 } = layout.bounds;
  const anchor = boardAnchor(layout);
  const corners: Vec3[] = [];

  /* The whole plate, plus full height only where something actually reaches it:
     the two wall edges and the columns themselves. Sampling a full-height corner
     at all four corners inflates the box with empty sky and shrinks the board to
     half the band. */
  for (const x of [x0, x1]) for (const z of [z0, z1]) corners.push(toView(x, BASE_Y, z));
  corners.push(toView(anchor.farX, BASE_Y - HEIGHT_MAX, anchor.farZ));
  corners.push(toView(anchor.nearX, BASE_Y - HEIGHT_MAX, anchor.farZ));
  corners.push(toView(anchor.farX, BASE_Y - HEIGHT_MAX, anchor.nearZ));
  for (const c of layout.columns) {
    corners.push(toView(c.x, BASE_Y - c.height, c.z));
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const c of corners) {
    const p = project(c, 0, 0, 1);
    if (!p) continue;
    minX = Math.min(minX, p.sx);
    maxX = Math.max(maxX, p.sx);
    minY = Math.min(minY, p.sy);
    maxY = Math.max(maxY, p.sy);
  }

  const bw = Math.max(1, maxX - minX);
  const bh = Math.max(1, maxY - minY);
  const zoom = Math.min((w * 0.94) / bw, (h * 0.88) / bh);

  /* Centre the projected bounding box, not the world origin: the box already
     accounts for the tilt and for a full-height column at every corner, so the
     board cannot run off the band no matter how the fixture is shaped. */
  return {
    zoom,
    cx: w / 2 - ((minX + maxX) / 2) * zoom,
    cy: h * VERTICAL_BIAS - ((minY + maxY) / 2) * zoom,
  };
}

/**
 * Camera framing one column: base at 38% width, 68% height, zoomed in.
 * The rest of the board stays where it is, so the eye keeps its bearings.
 */
export function focusCamera(
  w: number,
  h: number,
  base: Camera,
  col: BoardColumn,
  factor = 2.35,
): Camera {
  const zoom = base.zoom * factor;
  const v = toView(col.x, BASE_Y, col.z);
  const p = project(v, 0, 0, zoom);
  if (!p) return base;
  return { zoom, cx: w * 0.38 - p.sx, cy: h * 0.68 - p.sy };
}

export function lerpCamera(a: Camera, b: Camera, t: number): Camera {
  return {
    cx: a.cx + (b.cx - a.cx) * t,
    cy: a.cy + (b.cy - a.cy) * t,
    zoom: a.zoom + (b.zoom - a.zoom) * t,
  };
}

/* -------------------------------------------------------------- hit test -- */

export interface ColumnQuad {
  col: BoardColumn;
  /** Screen-space top face, clockwise. Used for both painting and hit testing. */
  top: { sx: number; sy: number }[];
  /** Depth key. Larger is further away. */
  depth: number;
  /** Projected scale at the footprint, for level of detail. */
  scale: number;
}

function pointInPoly(px: number, py: number, poly: { sx: number; sy: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (
      a.sy > py !== b.sy > py &&
      px < ((b.sx - a.sx) * (py - a.sy)) / (b.sy - a.sy) + a.sx
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/** Convex hull of the eight projected corners: the box silhouette. */
export function columnSilhouette(
  col: BoardColumn,
  height: number,
  cam: Camera,
): { sx: number; sy: number }[] {
  const half = CELL_W / 2;
  const pts: { sx: number; sy: number }[] = [];
  for (const [dx, dz] of [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ]) {
    for (const y of [BASE_Y, BASE_Y - height]) {
      const p = projectPoint(col.x + dx, y, col.z + dz, cam);
      if (p) pts.push({ sx: p.sx, sy: p.sy });
    }
  }
  if (pts.length < 3) return pts;

  pts.sort((a, b) => a.sx - b.sx || a.sy - b.sy);
  const cross = (
    o: { sx: number; sy: number },
    a: { sx: number; sy: number },
    b: { sx: number; sy: number },
  ) => (a.sx - o.sx) * (b.sy - o.sy) - (a.sy - o.sy) * (b.sx - o.sx);

  const build = (input: { sx: number; sy: number }[]) => {
    const out: { sx: number; sy: number }[] = [];
    for (const p of input) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    out.pop();
    return out;
  };

  return [...build(pts), ...build(pts.slice().reverse())];
}

/**
 * Nearest column under a point, tested front to back so a near column wins over
 * one behind it. Tests the full silhouette, not just the cap: clicking the side
 * of a tall column should select it.
 */
export function hitTestColumns(
  quads: ColumnQuad[],
  px: number,
  py: number,
  cam: Camera,
  heightOf: (col: BoardColumn) => number,
): BoardColumn | null {
  for (let i = quads.length - 1; i >= 0; i--) {
    const q = quads[i];
    if (pointInPoly(px, py, q.top)) return q.col;
    const poly = columnSilhouette(q.col, Math.max(1, heightOf(q.col)), cam);
    if (poly.length >= 3 && pointInPoly(px, py, poly)) return q.col;
  }
  return null;
}
