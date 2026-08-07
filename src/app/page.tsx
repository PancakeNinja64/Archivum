import { getFeatured, getFacets } from "@/lib/api/client";
import { Hero } from "@/components/home/Hero";
import { Problem } from "@/components/home/Problem";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CoverageMethod } from "@/components/home/CoverageMethod";
import { MarketplacePreview } from "@/components/home/MarketplacePreview";
import { Integrations } from "@/components/home/Integrations";
import { ClosingCTA } from "@/components/home/ClosingCTA";

/** Refresh catalog counts without a full redeploy. */
export const revalidate = 60;

export default async function Home() {
  const [featured, facets] = await Promise.all([getFeatured(6), getFacets()]);
  const catalogCount = facets.total;
  const platformCount = facets.platforms.length;
  return (
    <>
      <Hero featured={featured} catalogCount={catalogCount} platformCount={platformCount} />
      <Problem />
      <HowItWorks featured={featured} />
      <CoverageMethod />
      <MarketplacePreview initial={featured} catalogCount={catalogCount} />
      <Integrations />
      <ClosingCTA />
    </>
  );
}
