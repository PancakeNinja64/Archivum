import { getFeatured } from "@/lib/api/client";
import { Hero } from "@/components/home/Hero";
import { Problem } from "@/components/home/Problem";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustScoring } from "@/components/home/TrustScoring";
import { MarketplacePreview } from "@/components/home/MarketplacePreview";
import { Integrations } from "@/components/home/Integrations";
import { ClosingCTA } from "@/components/home/ClosingCTA";

export default async function Home() {
  const featured = await getFeatured(6);
  return (
    <>
      <Hero featured={featured} />
      <Problem />
      <HowItWorks featured={featured} />
      <TrustScoring />
      <MarketplacePreview initial={featured} />
      <Integrations />
      <ClosingCTA />
    </>
  );
}
