import type { Metadata } from "next";
import { PricingClient } from "@/components/pricing/PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free search for everyone. Team and enterprise tiers are coming soon.",
};

export default function PricingPage() {
  return <PricingClient />;
}
