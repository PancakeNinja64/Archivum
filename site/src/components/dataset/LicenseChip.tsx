import type { DatasetLicense } from "@/lib/types";

export function LicenseChip({ license }: { license: Pick<DatasetLicense, "spdx" | "commercialUse"> }) {
  const unclear = license.spdx === "Unspecified";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px]">
      <span className={unclear ? "text-asserted" : "text-foreground"}>{license.spdx}</span>
      <span className={license.commercialUse ? "text-verified" : "text-risk"}>
        {license.commercialUse ? "commercial ok" : "no commercial"}
      </span>
    </span>
  );
}
