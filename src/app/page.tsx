import { getDataset, getDatasets, getPreservedRecords, dataMode } from "@/lib/api/client";
import { ProductHome } from "@/components/product/ProductHome";
import { chooseFeatured } from "@/components/product/atlas/geometry";
import type { DelistedRecord } from "@/lib/graveyard/types";

export const revalidate = 60;

/** The preservation example is always the illustrative fixture, labelled as such on the page. */
function choosePreserved(records: DelistedRecord[]): DelistedRecord | null {
  const gone = records.filter((r) => r.endState === 'unreachable');
  const pool = gone.length ? gone : records.filter((r) => r.endState === 'withdrawn');
  return pool.sort((a, b) => b.coverageTotal - a.coverageTotal)[0] ?? records[0] ?? null;
}

export default async function Home() {
  const result = await getDatasets({ pageSize: 80, sort: "coverage" }).catch(() => null);
  const records = result?.items ?? [];
  const featuredSummary = chooseFeatured(records);
  const [featured, preservedResult] = await Promise.all([
    featuredSummary ? getDataset(featuredSummary.slug).catch(() => null) : Promise.resolve(null),
    getPreservedRecords(process.env.NEXT_PUBLIC_DATA_SOURCE, true).catch(() => null),
  ]);
  const preserved = preservedResult && (preservedResult.status === 'illustrative' || preservedResult.status === 'catalog') ? choosePreserved(preservedResult.records) : null;
  return (
    <ProductHome
      records={records}
      featured={featured}
      featuredSummary={featuredSummary}
      preserved={preserved}
      total={result?.total ?? null}
      mode={dataMode}
      unavailable={result === null}
    />
  );
}
