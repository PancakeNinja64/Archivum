/**
 * Delisted board — canvas routines and token resolution.
 *
 * Canvas cannot consume `var(--token)`, so every colour is resolved once from
 * computed style against the board wrapper. No colour literal appears in this
 * file: the design system stays the single source of truth.
 */

import { withAlpha } from '@/lib/atlas/draw';
import { coverageColorVar } from '@/lib/utils';
import {
  BASE_Y,
  boardAnchor,
  CELL_W,
  HEIGHT_MAX,
  PITCH_X,
  PITCH_Z,
  projectPoint,
  type BoardColumn,
  type BoardLayout,
  type Camera,
  type ColumnQuad,
} from './board';
import { END_STATE_LABEL } from './types';

const MONO = 'var(--font-geist-mono), ui-monospace, monospace';

/** Coverage arc — matches CoverageGauge, AtlasReticle and the Atlas nodes. */
const ARC_START = -0.75 * Math.PI;
const ARC_SWEEP = 1.5 * Math.PI;

export interface BoardTokens {
  background: string;
  surface: string;
  border: string;
  borderStrong: string;
  foreground: string;
  mutedForeground: string;
  accent: string;
  inferred: string;
  asserted: string;
  risk: string;
}

const TOKEN_MAP: Record<keyof BoardTokens, string> = {
  background: '--background',
  surface: '--surface',
  border: '--border',
  borderStrong: '--border-strong',
  foreground: '--foreground',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  inferred: '--tier-inferred',
  asserted: '--tier-asserted',
  risk: '--risk',
};

export function readBoardTokens(scope: HTMLElement): BoardTokens {
  const cs = getComputedStyle(scope);
  const out = {} as BoardTokens;
  (Object.keys(TOKEN_MAP) as (keyof BoardTokens)[]).forEach((k) => {
    out[k] = cs.getPropertyValue(TOKEN_MAP[k]).trim() || cs.color;
  });
  return out;
}

/* ------------------------------------------------------------------ ramp -- */

type RGB = [number, number, number];

const rgbCache = new Map<string, RGB>();

function toRgb(color: string): RGB {
  const hit = rgbCache.get(color);
  if (hit) return hit;
  let out: RGB = [0, 0, 0];
  const h = color.trim();
  if (h.startsWith('#')) {
    let hex = h.slice(1);
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    const n = parseInt(hex, 16);
    if (!Number.isNaN(n)) out = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  } else {
    const m = h.match(/(\d+(?:\.\d+)?)/g);
    if (m && m.length >= 3) out = [Number(m[0]), Number(m[1]), Number(m[2])];
  }
  rgbCache.set(color, out);
  return out;
}

function mixRgb(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

export const RAMP_MID = 55;

/**
 * Decay ramp: blue at 0, amber mid, red at 100.
 *
 * Green is deliberately absent. A green-to-red ramp reads as good-to-bad, which
 * would make the board a verdict about publishers — exactly the posture
 * Archivum cannot take. Blue-to-red reads as recent-to-distant: the same
 * intensity gradient with no moral axis. Do not "fix" this back to green.
 */
export function rampRgb(decay: number, tokens: BoardTokens): RGB {
  const d = Math.min(100, Math.max(0, decay));
  const lo = toRgb(tokens.inferred);
  const mid = toRgb(tokens.asserted);
  const hi = toRgb(tokens.risk);
  return d <= RAMP_MID
    ? mixRgb(lo, mid, d / RAMP_MID)
    : mixRgb(mid, hi, (d - RAMP_MID) / (100 - RAMP_MID));
}

export function rampColor(decay: number, tokens: BoardTokens, alpha = 1): string {
  const [r, g, b] = rampRgb(decay, tokens);
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/** Push a colour toward the background so far columns recede. */
function foggy(rgb: RGB, tokens: BoardTokens, amount: number, alpha: number): string {
  const [r, g, b] = mixRgb(rgb, toRgb(tokens.background), Math.max(0, Math.min(1, amount)));
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/* --------------------------------------------------------------- planes -- */

function line(
  ctx: CanvasRenderingContext2D,
  a: { sx: number; sy: number } | null,
  b: { sx: number; sy: number } | null,
  color: string,
) {
  if (!a || !b) return;
  ctx.beginPath();
  ctx.moveTo(a.sx, a.sy);
  ctx.lineTo(b.sx, b.sy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
}

export const DECAY_RULES = [0, 25, 50, 75, 100];

/**
 * The three reference planes: ground, back wall, left wall.
 *
 * `sweep` runs 0..1 during the intro. Lines are revealed outward from the
 * back-left corner, which is where the extrusion then starts from.
 */
export function drawPlanes(
  ctx: CanvasRenderingContext2D,
  layout: BoardLayout,
  cam: Camera,
  tokens: BoardTokens,
  sweep: number,
) {
  const { x0, x1, z0, z1 } = layout.bounds;
  const grid = withAlpha(tokens.border, 0.55);
  const rule = withAlpha(tokens.border, 0.32);
  const edge = withAlpha(tokens.borderStrong, 0.7);
  const P = (x: number, y: number, z: number) => projectPoint(x, y, z, cam);

  // Plate fill first: without it the grid reads as floating rules, not a board.
  const plate = [
    P(x0, BASE_Y, z0),
    P(x1, BASE_Y, z0),
    P(x1, BASE_Y, z1),
    P(x0, BASE_Y, z1),
  ];
  if (plate.every((p) => p !== null)) {
    ctx.beginPath();
    ctx.moveTo(plate[0]!.sx, plate[0]!.sy);
    for (let i = 1; i < plate.length; i++) ctx.lineTo(plate[i]!.sx, plate[i]!.sy);
    ctx.closePath();
    ctx.fillStyle = withAlpha(tokens.surface, 0.55 * sweep);
    ctx.fill();
  }

  const spanX = x1 - x0;
  const spanZ = z1 - z0;
  const { farX, farZ, nearX, nearZ } = boardAnchor(layout);
  const towardNearX = (t: number) => farX + (nearX - farX) * t;
  const towardNearZ = (t: number) => farZ + (nearZ - farZ) * t;

  // Ground grid, revealed outward from the far corner.
  for (let x = x0; x <= x1 + 0.5; x += PITCH_X) {
    if (Math.abs(x - farX) / spanX > sweep) continue;
    line(ctx, P(x, BASE_Y, z0), P(x, BASE_Y, z1), grid);
  }
  for (let z = z0; z <= z1 + 0.5; z += PITCH_Z) {
    if (Math.abs(z - farZ) / spanZ > sweep) continue;
    line(ctx, P(x0, BASE_Y, z), P(x1, BASE_Y, z), grid);
  }

  // The two walls that stand behind the data: decay rules at 0/25/50/75/100.
  for (const d of DECAY_RULES) {
    const y = BASE_Y - (HEIGHT_MAX * d) / 100;
    line(ctx, P(farX, y, farZ), P(towardNearX(sweep), y, farZ), rule);
    line(ctx, P(farX, y, farZ), P(farX, y, towardNearZ(sweep)), rule);
  }
  // Verticals on the far wall, one per lane boundary.
  for (const lane of layout.lanes) {
    for (const x of [lane.x0 - CELL_W * 0.7, lane.x1 + CELL_W * 0.7]) {
      if (Math.abs(x - farX) / spanX > sweep) continue;
      line(ctx, P(x, BASE_Y, farZ), P(x, BASE_Y - HEIGHT_MAX, farZ), rule);
    }
  }

  // Plate outline and the two standing corners, once the sweep has landed.
  if (sweep > 0.98) {
    line(ctx, P(x0, BASE_Y, z0), P(x1, BASE_Y, z0), edge);
    line(ctx, P(x0, BASE_Y, z1), P(x1, BASE_Y, z1), edge);
    line(ctx, P(x0, BASE_Y, z0), P(x0, BASE_Y, z1), edge);
    line(ctx, P(x1, BASE_Y, z0), P(x1, BASE_Y, z1), edge);
    line(ctx, P(farX, BASE_Y, farZ), P(farX, BASE_Y - HEIGHT_MAX, farZ), edge);
    line(ctx, P(nearX, BASE_Y, farZ), P(nearX, BASE_Y - HEIGHT_MAX, farZ), edge);
    line(ctx, P(farX, BASE_Y, nearZ), P(farX, BASE_Y - HEIGHT_MAX, nearZ), edge);
  }
}

/** Lane names along the front edge, cohorts down the left, decay up the wall. */
/**
 * Lane names along the near lane edge, cohorts along the near time edge, decay
 * up the left standing corner.
 *
 * Every label is nudged AWAY from the board's screen centroid rather than in a
 * fixed direction, so the scaffolding stays outside the plate whatever the yaw
 * and tilt are set to. Fixed offsets put the axis labels on top of the data the
 * first time someone retunes the camera.
 */
export function drawAxes(
  ctx: CanvasRenderingContext2D,
  layout: BoardLayout,
  cam: Camera,
  tokens: BoardTokens,
  alpha: number,
) {
  if (alpha <= 0.02) return;
  const { farX, farZ, nearX, nearZ } = boardAnchor(layout);
  const { x0, x1, z0, z1 } = layout.bounds;

  const mid = projectPoint((x0 + x1) / 2, BASE_Y, (z0 + z1) / 2, cam);
  if (!mid) return;

  const place = (
    text: string,
    wx: number,
    wy: number,
    wz: number,
    gap: number,
    baseline: CanvasTextBaseline,
  ) => {
    const p = projectPoint(wx, wy, wz, cam);
    if (!p) return;
    const left = p.sx < mid.sx;
    ctx.textAlign = left ? 'right' : 'left';
    ctx.textBaseline = baseline;
    ctx.fillText(text, p.sx + (left ? -gap : gap), p.sy);
  };

  const outZ = nearZ + Math.sign(nearZ - farZ) * PITCH_Z * 0.75;
  const outX = nearX + Math.sign(nearX - farX) * PITCH_X * 0.85;
  const scaleZ = nearZ + Math.sign(nearZ - farZ) * PITCH_Z * 0.15;

  ctx.save();
  ctx.font = `10px ${MONO}`;
  ctx.fillStyle = withAlpha(tokens.mutedForeground, alpha);

  for (const lane of layout.lanes) {
    place(END_STATE_LABEL[lane.state].toUpperCase(), lane.centerX, BASE_Y, outZ, 8, 'middle');
  }
  for (const cohort of layout.cohorts) {
    place(cohort.label, outX, BASE_Y, cohort.z, 8, 'middle');
  }
  for (const d of DECAY_RULES) {
    place(String(d), farX, BASE_Y - (HEIGHT_MAX * d) / 100, scaleZ, 7, 'middle');
  }

  ctx.fillStyle = withAlpha(tokens.mutedForeground, alpha * 0.85);
  place('DECAY INDEX', farX, BASE_Y - HEIGHT_MAX - 26, scaleZ, 7, 'middle');

  ctx.restore();
}

/* --------------------------------------------------------------- columns -- */

export interface ColumnPaint {
  /** 0..1 extrusion progress for the intro. */
  grow: number;
  /** 0..1 opacity multiplier — search ghosting and focus dimming ride on this. */
  presence: number;
  hovered: boolean;
  focused: boolean;
  /** Detail glyphs fade in after the extrusion settles. */
  detail: number;
}

/** Project a column and return its cap quad plus depth key. */
export function quadFor(col: BoardColumn, height: number, cam: Camera): ColumnQuad | null {
  const half = CELL_W / 2;
  const corners: [number, number][] = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];
  const top = corners.map(([dx, dz]) => projectPoint(col.x + dx, BASE_Y - height, col.z + dz, cam));
  if (top.some((p) => p === null)) return null;
  const centre = projectPoint(col.x, BASE_Y, col.z, cam);
  if (!centre) return null;
  return {
    col,
    top: top.map((p) => ({ sx: p!.sx, sy: p!.sy })),
    depth: col.z,
    scale: centre.scale,
  };
}

/**
 * One column: three faces under the fixed yaw, plus a silhouette stroke.
 *
 * The stroke is what makes this Archivum rather than a stock chart — the brand
 * is line art, so the columns read as wireframe volumes with translucent fill,
 * not solid plastic bars.
 */
export function drawColumn(
  ctx: CanvasRenderingContext2D,
  col: BoardColumn,
  height: number,
  cam: Camera,
  tokens: BoardTokens,
  paint: ColumnPaint,
  depthT: number,
) {
  const a = paint.presence;
  if (a <= 0.02) return;

  const half = CELL_W / 2;
  const yTop = BASE_Y - height;
  const P = (dx: number, y: number, dz: number) =>
    projectPoint(col.x + dx, y, col.z + dz, cam);

  const corners: [number, number][] = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];
  const top = corners.map(([dx, dz]) => P(dx, yTop, dz));
  const bot = corners.map(([dx, dz]) => P(dx, BASE_Y, dz));
  if (top.some((p) => !p) || bot.some((p) => !p)) return;

  const rgb = rampRgb(col.decay.index, tokens);
  const fogAmt = 0.34 * depthT;
  const boost = paint.focused ? 1.6 : paint.hovered ? 1.35 : 1;

  const quad = (pts: ({ sx: number; sy: number } | null)[], alpha: number) => {
    ctx.beginPath();
    ctx.moveTo(pts[0]!.sx, pts[0]!.sy);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.sx, pts[i]!.sy);
    ctx.closePath();
    ctx.fillStyle = foggy(rgb, tokens, fogAmt, alpha * a * boost);
    ctx.fill();
  };

  /* Painter order within the box: the two side faces, then the cap. Which side
     faces the camera is fixed by the yaw, so no per-column normal test. */
  quad([bot[1], bot[2], top[2], top[1]], 0.1);
  quad([bot[2], bot[3], top[3], top[2]], 0.18);
  quad(top, 0.3);

  ctx.strokeStyle = foggy(rgb, tokens, fogAmt * 0.5, 0.85 * a * (paint.focused ? 1.1 : 1));
  ctx.lineWidth = paint.focused || paint.hovered ? 1.4 : 1;
  ctx.beginPath();
  ctx.moveTo(top[0]!.sx, top[0]!.sy);
  for (let i = 1; i < 4; i++) ctx.lineTo(top[i]!.sx, top[i]!.sy);
  ctx.closePath();
  ctx.stroke();
  for (const i of [1, 2, 3]) {
    ctx.beginPath();
    ctx.moveTo(top[i]!.sx, top[i]!.sy);
    ctx.lineTo(bot[i]!.sx, bot[i]!.sy);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(bot[1]!.sx, bot[1]!.sy);
  ctx.lineTo(bot[2]!.sx, bot[2]!.sy);
  ctx.lineTo(bot[3]!.sx, bot[3]!.sy);
  ctx.stroke();
}

/**
 * Cap glyph: the coverage arc at the final check, in the shared 270° convention.
 * This is what ties the board to CoverageGauge rather than letting it float as
 * an unrelated visualisation.
 */
export function drawCapGlyph(
  ctx: CanvasRenderingContext2D,
  quad: ColumnQuad,
  tokens: BoardTokens,
  scope: HTMLElement,
  alpha: number,
) {
  if (alpha <= 0.02) return;
  const cx = (quad.top[0].sx + quad.top[2].sx) / 2;
  const cy = (quad.top[0].sy + quad.top[2].sy) / 2;
  const r = Math.max(3, Math.min(9, 10 * quad.scale));
  const value = quad.col.record.coverageTotal;
  const varName = coverageColorVar(value).replace(/^var\(\s*|\s*\)$/g, '');
  const color = getComputedStyle(scope).getPropertyValue(varName).trim() || tokens.accent;

  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy, r, ARC_START, ARC_START + ARC_SWEEP);
  ctx.strokeStyle = withAlpha(tokens.borderStrong, 0.5 * alpha);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r, ARC_START, ARC_START + ARC_SWEEP * (value / 100));
  ctx.strokeStyle = withAlpha(color, 0.95 * alpha);
  ctx.stroke();
}

/**
 * Downstream references, drawn above the cap.
 *
 * Papers and models still running on a corpus nobody can retrieve. One hairline
 * each, so a heavily-cited loss grows a visible tuft.
 *
 * When the counts are null — which is every record today — no filaments are
 * drawn and an empty socket ring takes their place. The empty socket is the
 * honest visual and it is the one that ships. Do not invent a count to make
 * this look better.
 */
export function drawDownstream(
  ctx: CanvasRenderingContext2D,
  quad: ColumnQuad,
  tokens: BoardTokens,
  alpha: number,
  allowed: boolean,
) {
  if (alpha <= 0.02 || !allowed) return;
  const { record } = quad.col;
  const cx = (quad.top[0].sx + quad.top[2].sx) / 2;
  const cy = (quad.top[0].sy + quad.top[2].sy) / 2;

  if (record.dependentModels === null || record.dependentPapers === null) {
    ctx.beginPath();
    ctx.arc(cx, cy - 7, 3, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(tokens.borderStrong, 0.75 * alpha);
    ctx.lineWidth = 1;
    ctx.stroke();
    return;
  }

  const total = record.dependentModels + record.dependentPapers;
  const shown = Math.min(12, total);
  const spread = Math.max(6, 14 * quad.scale);
  ctx.strokeStyle = withAlpha(tokens.risk, 0.5 * alpha);
  ctx.lineWidth = 1;
  for (let i = 0; i < shown; i++) {
    const t = shown === 1 ? 0.5 : i / (shown - 1);
    const x = cx - spread / 2 + spread * t;
    const len = 6 + 12 * quad.scale * (0.6 + 0.4 * Math.sin(i * 2.399));
    ctx.beginPath();
    ctx.moveTo(x, cy - 2);
    ctx.lineTo(x, cy - 2 - len);
    ctx.stroke();
  }
  if (total > shown) {
    ctx.save();
    ctx.font = `9px ${MONO}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = withAlpha(tokens.risk, 0.8 * alpha);
    ctx.fillText(`+${total - shown}`, cx + spread / 2 + 3, cy - 4);
    ctx.restore();
  }
}

/** Vertical scale beside the focused column, with a marker at its index. */
export function drawMeasureRule(
  ctx: CanvasRenderingContext2D,
  col: BoardColumn,
  height: number,
  cam: Camera,
  tokens: BoardTokens,
  alpha: number,
) {
  if (alpha <= 0.02) return;
  /* Toward the viewer rather than off to one side: a rule beside the column
     collides with its neighbour, a rule in front of it never does. */
  const offset = CELL_W * 1.25;
  const rz = col.z - offset;
  const foot = projectPoint(col.x, BASE_Y, rz, cam);
  const head = projectPoint(col.x, BASE_Y - HEIGHT_MAX, rz, cam);
  if (!foot || !head) return;

  ctx.save();
  ctx.strokeStyle = withAlpha(tokens.borderStrong, 0.8 * alpha);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(foot.sx, foot.sy);
  ctx.lineTo(head.sx, head.sy);
  ctx.stroke();

  ctx.font = `9px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (const d of DECAY_RULES) {
    const p = projectPoint(col.x, BASE_Y - (HEIGHT_MAX * d) / 100, rz, cam);
    if (!p) continue;
    ctx.beginPath();
    ctx.moveTo(p.sx, p.sy);
    ctx.lineTo(p.sx + 5, p.sy);
    ctx.strokeStyle = withAlpha(tokens.borderStrong, 0.8 * alpha);
    ctx.stroke();
    ctx.fillStyle = withAlpha(tokens.mutedForeground, 0.85 * alpha);
    ctx.fillText(String(d), p.sx - 4, p.sy);
  }

  const mark = projectPoint(col.x, BASE_Y - height, rz, cam);
  const cap = projectPoint(col.x, BASE_Y - height, col.z, cam);
  if (mark && cap) {
    ctx.strokeStyle = rampColor(col.decay.index, tokens, 0.9 * alpha);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(mark.sx - 5, mark.sy);
    ctx.lineTo(cap.sx, mark.sy);
    ctx.stroke();
    ctx.font = `10px ${MONO}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = rampColor(col.decay.index, tokens, alpha);
    ctx.fillText(col.decay.index.toFixed(1), mark.sx - 9, mark.sy);
  }
  ctx.restore();
}

/** Leader line from the focused cap out to the panel. */
export function drawLeader(
  ctx: CanvasRenderingContext2D,
  quad: ColumnQuad,
  tokens: BoardTokens,
  anchor: { x: number; y: number },
  alpha: number,
) {
  if (alpha <= 0.02) return;
  const cx = (quad.top[0].sx + quad.top[2].sx) / 2;
  const cy = Math.min(...quad.top.map((p) => p.sy));
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(anchor.x, anchor.y);
  ctx.strokeStyle = withAlpha(tokens.accent, 0.4 * alpha);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha(tokens.accent, 0.9 * alpha);
  ctx.fill();
}
