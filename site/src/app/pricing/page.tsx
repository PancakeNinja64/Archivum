import type { Metadata } from "next";
import { PricingClient } from "@/components/pricing/PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free search and trust scores for everyone. Monitoring and audit reports for teams. Governance for enterprises.",
};

export default function PricingPage() {
  return <PricingClient />;
}
