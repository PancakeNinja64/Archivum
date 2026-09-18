import { describe, expect, it } from 'vitest';
import type { DatasetSummary } from '@/lib/types';
import { chooseFeatured, fog, lambert, layoutNodes, project, publisherEdges, span } from './geometry';

const summary = (over: Partial<DatasetSummary>): DatasetSummary => ({
  slug: 'a', name: 'A', publisher: 'P', description: '', platform: 'github', domain: ['code'], languages: ['en'], modality: 'text',
  sizeRows: 1, sizeBytes: 1, license: { spdx: 'MIT', commercialUse: 'permitted', attribution: true, shareAlike: false, label: 'documented', notes: [] },
  coverageTotal: 90, coverageBand: 'extensive', coverageCheckedAt: null, lastUpdated: null, version: 'v1', ...over,
});

describe('layoutNodes', () => {
  it('places every record on (or a hair inside) the unit sphere', () => {
    const nodes = layoutNodes(Array.from({ length: 40 }, (_, i) => summary({ slug: `s${i}` })));
    expect(nodes).toHaveLength(40);
    for (const n of nodes) {
      const r = Math.hypot(n.x, n.y, n.z);
      expect(r).toBeGreaterThan(0.96);
      expect(r).toBeLessThanOrEqual(1.0001);
    }
  });
  it('caps the field at 80 nodes and keeps the order', () => {
    const nodes = layoutNodes(Array.from({ length: 120 }, (_, i) => summary({ slug: `s${i}` })));
    expect(nodes).toHaveLength(80);
    expect(nodes[0].slug).toBe('s0');
  });
});

describe('publisherEdges', () => {
  it('connects only records that share a named publisher', () => {
    const nodes = layoutNodes([
      summary({ slug: 'a', publisher: 'Same' }), summary({ slug: 'b', publisher: 'Same' }),
      summary({ slug: 'c', publisher: 'Other' }), summary({ slug: 'd', publisher: 'Independent contributor' }), summary({ slug: 'e', publisher: 'Independent contributor' }),
    ]);
    expect(publisherEdges(nodes)).toEqual([{ a: 0, b: 1 }]);
  });
});

describe('project and lighting', () => {
  const cam = { spin: 0, tilt: 0, radius: 100, cx: 200, cy: 150 };
  it('keeps the globe centre at the camera centre', () => {
    const p = project({ x: 0, y: 0, z: 0 }, cam);
    expect(p.x).toBe(200);
    expect(p.y).toBe(150);
  });
  it('brings near points forward with a larger scale', () => {
    expect(project({ x: 0, y: 0, z: 1 }, cam).scale).toBeGreaterThan(project({ x: 0, y: 0, z: -1 }, cam).scale);
  });
  it('lights the upper-left near face and fogs the far side', () => {
    const lit = lambert({ nx: -0.55, ny: -0.65, nz: 0.55 });
    const dark = lambert({ nx: 0.55, ny: 0.65, nz: -0.55 });
    expect(lit).toBeGreaterThan(0.9);
    expect(dark).toBe(0);
    expect(fog(1)).toBe(1);
    expect(fog(-1)).toBeCloseTo(0.28);
  });
  it('span clamps progress to a window', () => {
    expect(span(0.1, 0.2, 0.6)).toBe(0);
    expect(span(0.4, 0.2, 0.6)).toBeCloseTo(0.5);
    expect(span(1, 0.2, 0.6)).toBe(1);
  });
});

describe('chooseFeatured', () => {
  it('prefers a connected record with partial coverage', () => {
    const rows = [
      summary({ slug: 'top', coverageTotal: 95, coverageBand: 'extensive', publisher: 'Solo' }),
      summary({ slug: 'x', coverageTotal: 91, coverageBand: 'extensive', publisher: 'Pair' }),
      summary({ slug: 'y', coverageTotal: 71, coverageBand: 'partial', publisher: 'Pair' }),
      summary({ slug: 'z', coverageTotal: 73, coverageBand: 'partial', publisher: 'Alone' }),
    ];
    expect(chooseFeatured(rows)?.slug).toBe('y');
  });
  it('falls back to a connected record, then any partial record, then the first', () => {
    expect(chooseFeatured([summary({ slug: 'a', publisher: 'Pair' }), summary({ slug: 'b', publisher: 'Pair' })])?.slug).toBe('a');
    expect(chooseFeatured([summary({ slug: 'a', publisher: 'One' }), summary({ slug: 'b', publisher: 'Two', coverageBand: 'partial' })])?.slug).toBe('b');
    expect(chooseFeatured([summary({ slug: 'only', publisher: 'One' })])?.slug).toBe('only');
    expect(chooseFeatured([])).toBeNull();
  });
});
