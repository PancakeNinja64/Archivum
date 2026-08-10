/**
 * Archivum Atlas — frontend contract.
 *
 * Vocabulary note, inherited from src/lib/types.ts and load-bearing here:
 * the Atlas REPORTS what a dataset documents about itself. Depth, brightness
 * and the reticle ring all restate Documentation Coverage. None of them is a
 * quality judgement, and no copy in this feature may imply one.
 */

import type { CoverageBand, Platform } from '@/lib/types';

export interface AtlasNode {
  slug: string;
  name: string;
  publisher: string;
  platform: Platform;
  /** 0-100. Drives depth, brightness, label visibility and the reticle ring. */
  coverageTotal: number;
  coverageBand: CoverageBand;
  sizeRows: number;
  /** SPDX string exactly as published, for the reticle readout. */
  license: string;
  /** Field-space position, roughly -520..520. z is derived from coverageTotal. */
  x: number;
  y: number;
  z: number;
}

/**
 * Edges are declared relations and shared attributes. They are NOT derivation.
 * The catalog holds no dataset-to-dataset derivation edges, so the Atlas must
 * not draw any. The legend states this without interaction.
 */
export type AtlasEdgeKind = 'declared' | 'publisher' | 'domain';

export interface AtlasEdge {
  a: string;
  b: string;
  kind: AtlasEdgeKind;
}

export interface AtlasField {
  nodes: AtlasNode[];
  edges: AtlasEdge[];
  nodeCount: number;
  platformCount: number;
}

/** A node after rotation, tilt and perspective projection. */
export interface ProjectedNode {
  node: AtlasNode;
  /** Screen-space centre, device-independent pixels. */
  sx: number;
  sy: number;
  /** Screen-space radius after perspective scaling. */
  sr: number;
  /** Camera-space depth, 0 = furthest, 1 = nearest. */
  depth: number;
  /** Raw rotated z, for painter's-algorithm sorting. */
  z: number;
}
