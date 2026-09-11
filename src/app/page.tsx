import { getDatasets, getFeatured, getFacets, getDataset } from "@/lib/api/client";
import { ArchiveHome } from "@/components/home/ArchiveHome";
export const revalidate = 60;
export default async function Home() {
  const [featuredResult, facetsResult, recordsResult] = await Promise.allSettled([getFeatured(6), getFacets(), getDatasets({ pageSize: 80, sort: "name" })]);
  const featured = featuredResult.status === "fulfilled" ? featuredResult.value : [];
  const facets = facetsResult.status === "fulfilled" ? facetsResult.value : null;
  const records = recordsResult.status === "fulfilled" ? recordsResult.value.items : featured;
  const initialSlug = featured[0]?.slug ?? records[0]?.slug;
  const initialDataset = initialSlug ? await getDataset(initialSlug).catch(() => null) : null;
  return <ArchiveHome featured={featured} records={records} initialDataset={initialDataset} catalogCount={facets?.total ?? null} platformCount={facets?.platforms.length ?? null} unavailable={featuredResult.status === "rejected" || facetsResult.status === "rejected" || recordsResult.status === "rejected"} />;
}
