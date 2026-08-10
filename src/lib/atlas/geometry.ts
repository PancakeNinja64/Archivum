/**
 * Unit-radius wireframe primitives per platform.
 * Edge order is a fixed BFS walk from vertex 0 — deterministic across every
 * node of the same platform so partial solids read as part-built shapes.
 */

import type { Platform } from '@/lib/types';
import type { Vec3 } from './projection';

export interface WireframeSolid {
  vertices: Vec3[];
  edges: [number, number][];
}

function norm(v: Vec3): Vec3 {
  const d = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / d, y: v.y / d, z: v.z / d };
}

function bfsEdgeOrder(vertexCount: number, edges: [number, number][]): [number, number][] {
  const adj: Set<number>[] = Array.from({ length: vertexCount }, () => new Set());
  for (const [a, b] of edges) {
    adj[a].add(b);
    adj[b].add(a);
  }

  const ordered: [number, number][] = [];
  const seen = new Set<string>();
  const visited = new Set<number>([0]);
  const queue = [0];

  while (queue.length > 0) {
    const v = queue.shift()!;
    for (const n of adj[v]) {
      const key = v < n ? `${v},${n}` : `${n},${v}`;
      if (seen.has(key)) continue;
      seen.add(key);
      ordered.push([v, n]);
      if (!visited.has(n)) {
        visited.add(n);
        queue.push(n);
      }
    }
  }

  for (const [a, b] of edges) {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    if (!seen.has(key)) {
      seen.add(key);
      ordered.push([a, b]);
    }
  }

  return ordered;
}

function solid(vertices: Vec3[], edgePairs: [number, number][]): WireframeSolid {
  return {
    vertices: vertices.map(norm),
    edges: bfsEdgeOrder(vertices.length, edgePairs),
  };
}

const s = 1 / Math.sqrt(3);

const OCTAHEDRON = solid(
  [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
  ],
  [
    [0, 2], [0, 3], [0, 4], [0, 5],
    [1, 2], [1, 3], [1, 4], [1, 5],
    [2, 4], [2, 5], [3, 4], [3, 5],
  ],
);

const CUBE = solid(
  [
    { x: s, y: s, z: s },
    { x: s, y: s, z: -s },
    { x: s, y: -s, z: s },
    { x: s, y: -s, z: -s },
    { x: -s, y: s, z: s },
    { x: -s, y: s, z: -s },
    { x: -s, y: -s, z: s },
    { x: -s, y: -s, z: -s },
  ],
  [
    [0, 1], [0, 2], [0, 4],
    [1, 3], [1, 5],
    [2, 3], [2, 6],
    [3, 7],
    [4, 5], [4, 6],
    [5, 7],
    [6, 7],
  ],
);

const TETRAHEDRON = solid(
  [
    { x: s, y: s, z: s },
    { x: s, y: -s, z: -s },
    { x: -s, y: s, z: -s },
    { x: -s, y: -s, z: s },
  ],
  [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [1, 3],
    [2, 3],
  ],
);

const phi = (1 + Math.sqrt(5)) / 2;
const ICO_RAW: Vec3[] = [
  { x: -1, y: phi, z: 0 },
  { x: 1, y: phi, z: 0 },
  { x: -1, y: -phi, z: 0 },
  { x: 1, y: -phi, z: 0 },
  { x: 0, y: -1, z: phi },
  { x: 0, y: 1, z: phi },
  { x: 0, y: -1, z: -phi },
  { x: 0, y: 1, z: -phi },
  { x: phi, y: 0, z: -1 },
  { x: phi, y: 0, z: 1 },
  { x: -phi, y: 0, z: -1 },
  { x: -phi, y: 0, z: 1 },
];

const ICOSAHEDRON = solid(ICO_RAW, [
  [0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
  [1, 5], [1, 7], [1, 8], [1, 9],
  [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
  [3, 4], [3, 6], [3, 8], [3, 9],
  [4, 5], [4, 9], [4, 11],
  [5, 9], [5, 11],
  [6, 7], [6, 8], [6, 10],
  [7, 8], [7, 10],
  [8, 9], [8, 10],
]);

const BIPYRAMID = solid(
  [
    { x: 0, y: 1, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: -1 },
    { x: 0, y: -1, z: 0 },
  ],
  [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [1, 2], [2, 3], [3, 4], [4, 1],
    [5, 1], [5, 2], [5, 3], [5, 4],
  ],
);

const BY_PLATFORM: Record<Platform, WireframeSolid> = {
  huggingface: OCTAHEDRON,
  github: CUBE,
  kaggle: TETRAHEDRON,
  academic: ICOSAHEDRON,
  direct: BIPYRAMID,
};

export function solidForPlatform(platform: Platform): WireframeSolid {
  return BY_PLATFORM[platform];
}
