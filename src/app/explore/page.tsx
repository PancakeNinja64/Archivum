import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ExploreClient } from '@/components/explore/ExploreClient';

export const metadata: Metadata = {
  title: 'Explore datasets',
  description: 'Search public AI datasets through their origin, declared licence, lineage, and documentation. Explore the same records in List or Atlas view.',
};

export default function ExplorePage() {
  return <Suspense fallback={<div className="mx-auto max-w-7xl px-6 pb-24 pt-32" role="status"><p className="text-sm text-muted-foreground">Loading the index…</p></div>}><ExploreClient /></Suspense>;
}
