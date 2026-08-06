import { Suspense } from "react";
import type { Metadata } from "next";
import { ExploreClient } from "@/components/explore/ExploreClient";

export const metadata: Metadata = {
  title: "Explore datasets",
  description: "Browse and filter the catalog — every dataset on one consistent record of origin, licensing, lineage, and coverage.",
};

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 pt-28 md:px-8"><p className="font-mono text-sm text-muted-foreground">Loading the index…</p></div>}>
      <ExploreClient />
    </Suspense>
  );
}
