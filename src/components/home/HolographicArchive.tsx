"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import { ATLAS_FIXTURE } from "@/lib/atlas/fixture";
import type { AtlasNode } from "@/lib/atlas/types";
import { DELISTED_FIXTURE } from "@/lib/graveyard/fixture";
import { buildBoard } from "@/lib/graveyard/board";
import {
  type DelistedRecord,
  type EndState,
} from "@/lib/graveyard/types";
import styles from "./HolographicArchive.module.css";

type Point3 = { x: number; y: number; z: number };
type Projected = { x: number; y: number; depth: number; scale: number };

type AtlasSignal = {
  id: string;
  node: AtlasNode;
  point: Point3;
  radius: number;
};

type DecayStructure = {
  id: string;
  record: DelistedRecord;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  decay: number;
  age: number;
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const smoothstep = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

function hash(value: string) {
  let output = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    output ^= value.charCodeAt(index);
    output = Math.imul(output, 16777619);
  }
  return output >>> 0;
}

function createAtlasSignals(): AtlasSignal[] {
  const maxRows = ATLAS_FIXTURE.nodes.reduce((maximum, node) => Math.max(maximum, node.sizeRows), 1);
  const maxLog = Math.log10(maxRows + 1);

  return ATLAS_FIXTURE.nodes.map((node) => ({
    id: node.slug,
    node,
    point: {
      x: node.x * 0.72,
      y: -node.y * 0.54,
      z: node.z * 0.58,
    },
    radius: 2.2 + (Math.log10(node.sizeRows + 1) / maxLog) * 3.2,
  }));
}

function createDecayStructures(): DecayStructure[] {
  const board = buildBoard(DELISTED_FIXTURE.records, "half");
  return board.columns.map((column) => {
    const record = column.record;
    const jitter = hash(record.slug);
    const logRows = Math.log10(Math.max(10, record.sizeRows));
    const elapsed = column.decay.terms.find((term) => term.key === "elapsed")?.value ?? 0;

    return {
      id: record.slug,
      record,
      x: column.x * 0.38,
      z: column.z * 0.62,
      width: 7.5 + logRows * 1.02,
      depth: 8 + ((jitter >> 7) % 10),
      height: column.height * 0.78,
      decay: column.decay.index / 100,
      age: elapsed,
    };
  });
}

const ATLAS_SIGNALS = createAtlasSignals();
const DECAY_STRUCTURES = createDecayStructures();

function project(
  point: Point3,
  width: number,
  height: number,
  yaw: number,
  pitch: number,
  distance: number,
): Projected | null {
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const x1 = point.x * cosYaw - point.z * sinYaw;
  const z1 = point.x * sinYaw + point.z * cosYaw;

  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const y2 = point.y * cosPitch - z1 * sinPitch;
  const z2 = point.y * sinPitch + z1 * cosPitch;
  const cameraDepth = z2 + distance;
  if (cameraDepth < 36) return null;

  const focal = Math.min(width, height) * 0.94;
  const scale = focal / cameraDepth;
  return {
    x: width * 0.52 + x1 * scale,
    y: height * 0.57 - y2 * scale,
    depth: cameraDepth,
    scale,
  };
}

function strokePath(
  context: CanvasRenderingContext2D,
  points: Array<Projected | null>,
  close = false,
) {
  const first = points[0];
  if (!first || points.some((point) => !point)) return;
  context.beginPath();
  context.moveTo(first.x, first.y);
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    if (point) context.lineTo(point.x, point.y);
  }
  if (close) context.closePath();
  context.stroke();
}

function drawAtmosphere(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
) {
  context.fillStyle = "#030507";
  context.fillRect(0, 0, width, height);
  const fog = context.createRadialGradient(
    width * lerp(0.62, 0.5, progress),
    height * 0.54,
    height * 0.05,
    width * 0.54,
    height * 0.58,
    width * 0.72,
  );
  fog.addColorStop(0, `rgba(58, 83, 146, ${lerp(0.085, 0.12, progress)})`);
  fog.addColorStop(0.42, `rgba(22, 33, 58, ${lerp(0.045, 0.075, progress)})`);
  fog.addColorStop(1, "rgba(3,5,7,0)");
  context.fillStyle = fog;
  context.fillRect(0, 0, width, height);
}

function drawReferenceGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  yaw: number,
  pitch: number,
  distance: number,
) {
  context.save();
  context.strokeStyle = "rgba(132, 147, 169, 0.05)";
  context.lineWidth = 0.6;
  for (let coordinate = -280; coordinate <= 280; coordinate += 40) {
    strokePath(context, [
      project({ x: coordinate, y: 88, z: -250 }, width, height, yaw, pitch, distance),
      project({ x: coordinate, y: 88, z: 250 }, width, height, yaw, pitch, distance),
    ]);
    strokePath(context, [
      project({ x: -260, y: 88, z: coordinate }, width, height, yaw, pitch, distance),
      project({ x: 260, y: 88, z: coordinate }, width, height, yaw, pitch, distance),
    ]);
  }
  context.restore();
}

function drawAtlasNetwork(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  yaw: number,
  pitch: number,
  distance: number,
  progress: number,
  time: number,
  reducedMotion: boolean,
  mode: "sequence" | "atlas" | "afterimage",
) {
  const handoff = smoothstep((progress - 0.47) / 0.22);
  const reunion = smoothstep((progress - 0.84) / 0.14);
  const alpha = mode === "atlas"
    ? 1
    : mode === "afterimage"
      ? 0.045
      : clamp(1 - handoff * 0.92 + reunion * 0.46);
  if (alpha < 0.01) return;
  const resolve = smoothstep((progress - 0.12) / 0.23);
  const selectedIndex = progress < 0.25 ? 2 : progress < 0.46 ? 28 : 83;
  const selected = ATLAS_SIGNALS[selectedIndex];
  const connected = new Set<string>();
  for (const edge of ATLAS_FIXTURE.edges) {
    if (edge.a === selected.id) connected.add(edge.b);
    if (edge.b === selected.id) connected.add(edge.a);
  }

  const projected = new Map<string, Projected>();
  for (const signal of ATLAS_SIGNALS) {
    const point = project(signal.point, width, height, yaw, pitch, distance);
    if (point) projected.set(signal.id, point);
  }

  context.save();
  for (let index = 0; index < ATLAS_FIXTURE.edges.length; index += 1) {
    const edge = ATLAS_FIXTURE.edges[index];
    const a = projected.get(edge.a);
    const b = projected.get(edge.b);
    if (!a || !b) continue;
    const touchesSelection = edge.a === selected.id || edge.b === selected.id;
    const kindAlpha = edge.kind === "declared" ? 0.24 : edge.kind === "publisher" ? 0.14 : 0.095;
    const focus = touchesSelection ? lerp(1, 3.1, resolve) : lerp(1, 0.68, resolve);
    context.strokeStyle = touchesSelection
      ? `rgba(93, 121, 255, ${kindAlpha * focus * alpha})`
      : `rgba(130, 147, 174, ${kindAlpha * focus * alpha})`;
    context.lineWidth = touchesSelection ? 0.95 : 0.55;
    context.setLineDash(edge.kind === "domain" ? [2, 5] : []);
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();

    if (!reducedMotion && resolve > 0.08 && index % 7 === 0) {
      const phase = (time * 0.000055 + index * 0.117) % 1;
      const x = lerp(a.x, b.x, phase);
      const y = lerp(a.y, b.y, phase);
      context.fillStyle = `rgba(121, 145, 255, ${0.34 * alpha * resolve})`;
      context.beginPath();
      context.arc(x, y, touchesSelection ? 1.5 : 0.9, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.setLineDash([]);

  const sortedSignals = ATLAS_SIGNALS
    .map((signal) => ({ signal, point: projected.get(signal.id) }))
    .filter((entry): entry is { signal: AtlasSignal; point: Projected } => Boolean(entry.point))
    .sort((a, b) => b.point.depth - a.point.depth);

  for (const { signal, point } of sortedSignals) {
    const isSelected = signal.id === selected.id;
    const isConnected = connected.has(signal.id);
    const pulse = reducedMotion ? 0.5 : 0.5 + Math.sin(time * 0.001 + hash(signal.id) * 0.0002) * 0.5;
    const radius = Math.max(1.2, signal.radius * point.scale * (isSelected ? 1.18 : 1));
    const nodeAlpha = (0.24 + signal.node.coverageTotal / 170) * alpha * (resolve && !isSelected && !isConnected ? 0.76 : 1);

    context.fillStyle = isSelected
      ? `rgba(120, 143, 255, ${Math.min(0.95, nodeAlpha + 0.18)})`
      : `rgba(157, 171, 194, ${nodeAlpha})`;
    if (isSelected) {
      context.shadowColor = "rgba(83, 111, 255, 0.72)";
      context.shadowBlur = 16;
    }
    context.beginPath();
    context.arc(point.x, point.y, radius, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;

    context.strokeStyle = isSelected
      ? `rgba(106, 132, 255, ${0.72 * alpha})`
      : `rgba(145, 160, 183, ${(0.12 + pulse * 0.08) * alpha})`;
    context.lineWidth = isSelected ? 1 : 0.55;
    context.beginPath();
    context.arc(point.x, point.y, radius + (isSelected ? 7 + pulse * 3 : 2.5 + pulse * 1.5), 0, Math.PI * 2);
    context.stroke();
  }

  const selectedPoint = projected.get(selected.id);
  if (selectedPoint && alpha > 0.2) {
    context.fillStyle = `rgba(190, 201, 219, ${0.78 * alpha})`;
    context.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillText(selected.node.name.toUpperCase(), selectedPoint.x + 14, selectedPoint.y - 10);
    context.fillStyle = `rgba(115, 135, 168, ${0.58 * alpha})`;
    context.fillText(`${selected.node.coverageTotal}/100 DOCUMENTED · ${selected.node.platform.toUpperCase()}`, selectedPoint.x + 14, selectedPoint.y + 6);
  }
  context.restore();
}

function lineDashForState(state: EndState) {
  if (state === "gated") return [5, 4];
  if (state === "withdrawn") return [3, 5];
  if (state === "unreachable") return [1, 6];
  return [];
}

function drawDecayStructure(
  context: CanvasRenderingContext2D,
  structure: DecayStructure,
  index: number,
  width: number,
  height: number,
  yaw: number,
  pitch: number,
  distance: number,
  reveal: number,
  time: number,
  reducedMotion: boolean,
  selected: boolean,
) {
  const stagger = (hash(structure.id) % 100) / 490;
  const individualReveal = smoothstep((reveal - stagger) / Math.max(0.01, 1 - stagger));
  if (individualReveal < 0.006) return;

  const towerHeight = structure.height * individualReveal;
  const halfWidth = structure.width / 2;
  const halfDepth = structure.depth / 2;
  const base: Point3[] = [
    { x: structure.x - halfWidth, y: 88, z: structure.z - halfDepth },
    { x: structure.x + halfWidth, y: 88, z: structure.z - halfDepth },
    { x: structure.x + halfWidth, y: 88, z: structure.z + halfDepth },
    { x: structure.x - halfWidth, y: 88, z: structure.z + halfDepth },
  ];
  const top = base.map((point) => ({ ...point, y: point.y - towerHeight }));
  const projectedBase = base.map((point) => project(point, width, height, yaw, pitch, distance));
  const projectedTop = top.map((point) => project(point, width, height, yaw, pitch, distance));
  const centerTop = project({ x: structure.x, y: 88 - towerHeight, z: structure.z }, width, height, yaw, pitch, distance);
  if (!centerTop) return;

  const depthFade = clamp(1.45 - centerTop.depth / 850, 0.2, 1);
  const alpha = (0.17 + structure.record.coverageTotal / 185) * depthFade * individualReveal;
  const isBlue = selected || index % 31 === 4;
  context.save();
  context.setLineDash(lineDashForState(structure.record.endState));
  context.lineDashOffset = reducedMotion ? 0 : -time * (0.002 + structure.decay * 0.0025);
  context.lineWidth = selected ? 1.2 : 0.62;
  context.strokeStyle = isBlue
    ? `rgba(75, 105, 255, ${Math.min(0.9, alpha * 2.2)})`
    : `rgba(150, 163, 184, ${alpha})`;
  if (selected) {
    context.shadowColor = "rgba(70, 101, 255, 0.62)";
    context.shadowBlur = 13;
  }
  strokePath(context, projectedBase, true);
  strokePath(context, projectedTop, true);
  for (let edge = 0; edge < 4; edge += 1) strokePath(context, [projectedBase[edge], projectedTop[edge]]);
  context.shadowBlur = 0;
  context.setLineDash([]);

  const bandCount = 4;
  for (let band = 1; band <= bandCount; band += 1) {
    if (structure.record.endState === "withdrawn" && band === 2 + (hash(structure.id) % 2)) continue;
    const bandProgress = band / (bandCount + 1);
    const bandOffset = reducedMotion ? 0 : Math.sin(time * 0.00042 + index * 0.31 + band) * structure.decay * 2.8;
    const bandY = 88 - towerHeight * bandProgress;
    const bandPoints: Point3[] = [
      { x: structure.x - halfWidth + bandOffset, y: bandY, z: structure.z - halfDepth },
      { x: structure.x + halfWidth + bandOffset, y: bandY, z: structure.z - halfDepth },
      { x: structure.x + halfWidth + bandOffset, y: bandY, z: structure.z + halfDepth },
      { x: structure.x - halfWidth + bandOffset, y: bandY, z: structure.z + halfDepth },
    ];
    context.strokeStyle = isBlue
      ? `rgba(91, 119, 255, ${0.16 * individualReveal})`
      : `rgba(139, 154, 179, ${(0.07 + structure.decay * 0.06) * individualReveal})`;
    context.lineWidth = 0.45;
    strokePath(context, bandPoints.map((point) => project(point, width, height, yaw, pitch, distance)), true);
  }

  const echoCount = Math.max(1, Math.round(1 + structure.decay * 3));
  for (let echo = 1; echo <= echoCount; echo += 1) {
    const echoTop = top.map((point) => ({ ...point, y: point.y - echo * (5 + structure.decay * 5) }));
    const projectedEcho = echoTop.map((point) => project(point, width, height, yaw, pitch, distance));
    context.strokeStyle = `rgba(83, 111, 255, ${0.075 * individualReveal * (1 - echo / (echoCount + 1))})`;
    context.lineWidth = 0.55;
    strokePath(context, projectedEcho, true);
  }

  if (selected || structure.decay > 0.78 && index % 9 === 0) {
    const trailEnd: Projected = { x: centerTop.x, y: -height * (0.04 + structure.age * 0.1), depth: centerTop.depth, scale: 1 };
    const gradient = context.createLinearGradient(centerTop.x, centerTop.y, trailEnd.x, trailEnd.y);
    gradient.addColorStop(0, `rgba(77, 108, 255, ${selected ? 0.46 : 0.16})`);
    gradient.addColorStop(1, "rgba(77, 108, 255, 0)");
    context.strokeStyle = gradient;
    context.lineWidth = selected ? 0.95 : 0.5;
    strokePath(context, [centerTop, trailEnd]);
  }

  if (!reducedMotion && structure.decay > 0.72 && index % 5 === 0) {
    for (let fragment = 0; fragment < 2; fragment += 1) {
      const travel = (time * 0.009 + fragment * 23 + index * 7) % 46;
      context.fillStyle = `rgba(112, 135, 255, ${0.2 * individualReveal * (1 - travel / 46)})`;
      context.fillRect(centerTop.x + Math.sin(index + fragment) * 6, centerTop.y - travel, 1, 1);
    }
  }

  if (selected) {
    context.fillStyle = "rgba(188, 199, 217, 0.74)";
    context.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillText(structure.record.name.toUpperCase(), centerTop.x + 11, centerTop.y - 8);
    context.fillStyle = "rgba(112, 133, 173, 0.62)";
    context.fillText(`${structure.record.endState.toUpperCase()} · LAST ${structure.record.lastConfirmed}`, centerTop.x + 11, centerTop.y + 7);
  }
  context.restore();
}

function drawDecayField(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  yaw: number,
  pitch: number,
  distance: number,
  progress: number,
  time: number,
  reducedMotion: boolean,
) {
  const reveal = smoothstep((progress - 0.48) / 0.27);
  if (reveal < 0.006) return;
  const selectedIndex = Math.min(DECAY_STRUCTURES.length - 1, 4 + Math.floor(clamp((progress - 0.58) / 0.36) * 3) * 31);
  const sorted = DECAY_STRUCTURES
    .map((structure, index) => ({ structure, index, depth: structure.x * Math.sin(yaw) + structure.z * Math.cos(yaw) }))
    .sort((a, b) => b.depth - a.depth);

  for (const entry of sorted) {
    drawDecayStructure(context, entry.structure, entry.index, width, height, yaw, pitch, distance, reveal, time, reducedMotion, entry.index === selectedIndex);
  }
}

function drawHandoff(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
  reducedMotion: boolean,
) {
  const handoff = smoothstep((progress - 0.44) / 0.25);
  if (handoff <= 0 || handoff >= 1) return;
  const x = lerp(width * 0.06, width * 0.94, handoff);
  const veil = context.createLinearGradient(x - 110, 0, x + 110, 0);
  veil.addColorStop(0, "rgba(83,111,255,0)");
  veil.addColorStop(0.5, `rgba(83,111,255,${reducedMotion ? 0.03 : 0.075})`);
  veil.addColorStop(1, "rgba(83,111,255,0)");
  context.fillStyle = veil;
  context.fillRect(x - 110, 0, 220, height);
  context.strokeStyle = "rgba(105, 133, 255, 0.34)";
  context.lineWidth = 0.75;
  context.beginPath();
  context.moveTo(x, height * 0.14);
  context.lineTo(x, height * 0.86);
  context.stroke();
}

export function HolographicArchive({
  progress,
  mode = "sequence",
  className = "",
}: {
  progress?: MotionValue<number>;
  mode?: "sequence" | "atlas" | "afterimage";
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const fallbackProgress = useMotionValue(mode === "afterimage" ? 0.92 : mode === "atlas" ? 0.23 : 0.05);
  const sourceProgress = progress ?? fallbackProgress;
  const data = useMemo(() => ({ atlas: ATLAS_SIGNALS, decay: DECAY_STRUCTURES }), []);

  useEffect(() => {
    fallbackProgress.set(mode === "afterimage" ? 0.92 : mode === "atlas" ? 0.23 : 0.05);
  }, [fallbackProgress, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;
    const state = {
      width: 0,
      height: 0,
      progress: sourceProgress.get(),
      pointerX: 0,
      pointerY: 0,
      targetX: 0,
      targetY: 0,
      visible: true,
      documentVisible: document.visibilityState === "visible",
    };
    let running = false;

    function stop() {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      running = false;
    }

    function start() {
      if (running || !state.visible || !state.documentVisible) return;
      running = true;
      frameRef.current = requestAnimationFrame(render);
    }

    function syncActivity() {
      if (state.visible && state.documentVisible) start();
      else stop();
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      state.width = Math.max(1, rect.width);
      state.height = Math.max(1, rect.height);
      canvas.width = Math.round(state.width * dpr);
      canvas.height = Math.round(state.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      start();
    };

    const unsubscribe = sourceProgress.on("change", (value) => {
      state.progress = value;
      start();
    });

    const onPointerMove = (event: PointerEvent) => {
      if (reducedMotion) return;
      const rect = canvas.getBoundingClientRect();
      state.targetX = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 2 - 1;
      state.targetY = clamp((event.clientY - rect.top) / rect.height, 0, 1) * 2 - 1;
      start();
    };
    const onPointerLeave = () => {
      state.targetX = 0;
      state.targetY = 0;
    };
    const onVisibility = () => {
      state.documentVisible = document.visibilityState === "visible";
      syncActivity();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      state.visible = entry.isIntersecting;
      syncActivity();
    }, { threshold: 0.01 });
    intersectionObserver.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);
    resize();

    function render(time: number) {
      frameRef.current = null;
      running = false;
      if (!state.visible || !state.documentVisible || state.width < 2 || state.height < 2) return;

      state.pointerX = lerp(state.pointerX, state.targetX, reducedMotion ? 1 : 0.05);
      state.pointerY = lerp(state.pointerY, state.targetY, reducedMotion ? 1 : 0.05);
      const rawProgress = clamp(state.progress);
      const progressValue = reducedMotion && mode === "sequence" ? 0.94 : rawProgress;
      const drift = reducedMotion ? 0 : Math.sin(time * 0.0001) * 0.018;
      const yaw = -0.33 + progressValue * 0.57 + state.pointerX * 0.045 + drift;
      const pitch = 0.52 - progressValue * 0.08 + state.pointerY * 0.026;
      const distance = lerp(710, 570, smoothstep(progressValue));

      drawAtmosphere(ctx, state.width, state.height, progressValue);
      drawReferenceGrid(ctx, state.width, state.height, yaw, pitch, distance);
      drawAtlasNetwork(ctx, state.width, state.height, yaw, pitch, distance, progressValue, time, Boolean(reducedMotion), mode);
      drawDecayField(ctx, state.width, state.height, yaw, pitch, distance, progressValue, time, Boolean(reducedMotion));
      drawHandoff(ctx, state.width, state.height, progressValue, Boolean(reducedMotion));

      const vignette = ctx.createRadialGradient(
        state.width * 0.52,
        state.height * 0.58,
        state.height * 0.08,
        state.width * 0.52,
        state.height * 0.58,
        state.width * 0.74,
      );
      vignette.addColorStop(0, "rgba(3,5,7,0)");
      vignette.addColorStop(0.64, "rgba(3,5,7,0.05)");
      vignette.addColorStop(1, "rgba(3,5,7,0.84)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, state.width, state.height);
      if (!reducedMotion) start();
    }

    start();
    return () => {
      stop();
      unsubscribe();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [data, mode, reducedMotion, sourceProgress]);

  return (
    <div
      className={`${styles.visual} ${className}`}
      role="img"
      aria-label={
        mode === "atlas"
          ? `Atlas prototype field with ${ATLAS_FIXTURE.nodeCount} deterministic fixture nodes and ${ATLAS_FIXTURE.edges.length} fixture relations.`
          : mode === "afterimage"
            ? `Delisted holographic decay field with ${DELISTED_FIXTURE.total} synthetic last-observed prototype records.`
            : `Animated archival field transitioning between an Atlas prototype network of ${ATLAS_FIXTURE.nodeCount} fixture nodes and ${DELISTED_FIXTURE.total} synthetic Delisted afterimages without cross-linking unrelated records.`
      }
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className={styles.optics} aria-hidden="true" />
    </div>
  );
}
