import type { Metadata } from "next";
import { PublishClient } from "@/components/publish/PublishClient";

export const metadata: Metadata = {
  title: "Publish a dataset",
  description: "Submit a dataset to the index. Documented provenance is rewarded with a higher starting trust score.",
};

export default function PublishPage() {
  return <PublishClient />;
}
