import type { Metadata } from "next";
import { PublishClient } from "@/components/publish/PublishClient";

export const metadata: Metadata = {
  title: "Publish a dataset",
  description: "Submit a dataset to the catalog. The more its provenance is documented, the more complete its record.",
};

export default function PublishPage() {
  return <PublishClient />;
}
