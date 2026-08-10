/**
 * The reticle — the Atlas signature element.
 *
 * Drawn to canvas rather than DOM so it can track a rotating field without
 * forcing a React render per frame.
 *
 * The ring restates CoverageGauge, and matches its convention exactly:
 * a 270-degree sweep starting at -135 degrees, round cap, unfilled track
 * behind it. The gauge's own note is load-bearing — "the arc echoes the
 * mark's baseline: a sweep, not a full ring" — so a full ring here would
 * quietly break the identity.
 */

import { platformLabel } from '@/lib/utils';
import { bandColor, withAlpha, type Tokens } from '@/lib/atlas/draw';
import type { ProjectedNode } from '@/lib/atlas/types';

/** Total sweep of the coverage arc: 270 degrees, as in CoverageGauge. */
export const ARC_SWEEP = 1.5 * Math.PI;
/** Start angle: -135 degrees, the 7:30 position. */
export const ARC_START = -0.75 * Math.PI;

const BRACKET = 9;
const LEADER_LEN = 34;
const LEADER_ANGLE = -Math.PI / 6; // 30 degrees up and to the right

/**
 * @param t 0-1 assembly progress. Brackets stagger across the first 60%,
 *          the ring sweeps over the middle, the readout fades in last.
 */
export function drawReticle(
  ctx: CanvasRenderingContext2D,
  p: ProjectedNode,
  scope: HTMLElement,
  tokens: Tokens,
  t: number,
  flip: boolean,
) {
  const color = bandColor(scope, p.node.coverageTotal);
  const ringR = p.sr + 9;
  const boxR = ringR + 6;

  ctx.save();

  /* 1. Bracket corners, translating inward from +6px, staggered. */
  const corners: [number, number][] = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  corners.forEach(([sx, sy], i) => {
    const stagger = Math.max(0, Math.min(1, (t - i * 0.09) / 0.4));
    if (stagger <= 0) return;
    const off = 6 * (1 - stagger);
    const cx = p.sx + sx * (boxR + off);
    const cy = p.sy + sy * (boxR + off);
    ctx.beginPath();
    ctx.moveTo(cx, cy - sy * BRACKET);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx - sx * BRACKET, cy);
    ctx.strokeStyle = withAlpha(color, 0.9 * stagger);
    ctx.lineWidth = 1;
    ctx.lineCap = 'butt';
    ctx.stroke();
  });

  /* 2. Coverage ring — unfilled track, then the sweep. */
  const ringT = Math.max(0, Math.min(1, (t - 0.15) / 0.5));
  if (ringT > 0) {
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, ringR, ARC_START, ARC_START + ARC_SWEEP);
    ctx.strokeStyle = withAlpha(tokens.border, 0.85 * ringT);
    ctx.lineWidth = 1;
    ctx.stroke();

    const filled = ARC_SWEEP * (p.node.coverageTotal / 100) * ringT;
    if (filled > 0.001) {
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, ringR, ARC_START, ARC_START + filled);
      ctx.strokeStyle = withAlpha(color, 0.95);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  }

  /* 3. Leader line and readout. */
  const textT = Math.max(0, Math.min(1, (t - 0.45) / 0.55));
  if (textT > 0) {
    const dir = flip ? -1 : 1;
    const lx = p.sx + Math.cos(LEADER_ANGLE) * ringR * dir;
    const ly = p.sy + Math.sin(LEADER_ANGLE) * ringR;
    const ex = lx + Math.cos(LEADER_ANGLE) * LEADER_LEN * dir;
    const ey = ly + Math.sin(LEADER_ANGLE) * LEADER_LEN;

    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex + 8 * dir, ey);
    ctx.strokeStyle = withAlpha(color, 0.7 * textT);
    ctx.lineWidth = 1;
    ctx.stroke();

    const tx = ex + 12 * dir;
    const platform = platformLabel[p.node.platform] ?? p.node.platform;
    const lines: [string, string, number][] = [
      [p.node.name, tokens.foreground, 1],
      [`${p.node.publisher} · ${platform}`, tokens.mutedForeground, 0.85],
      [
        `${p.node.coverageTotal}% documented · ${p.node.license}`,
        tokens.mutedForeground,
        0.85,
      ],
    ];

    ctx.textAlign = flip ? 'right' : 'left';
    ctx.textBaseline = 'middle';
    lines.forEach(([text, col, a], i) => {
      ctx.font = i === 0 ? '11px var(--font-geist-mono), ui-monospace, monospace' : '10px var(--font-geist-mono), ui-monospace, monospace';
      ctx.fillStyle = withAlpha(col, a * textT);
      ctx.fillText(text, tx, ey - 14 + i * 13);
    });
  }

  ctx.restore();
}
