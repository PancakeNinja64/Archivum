import type { DatasetLicense } from "@/lib/types";
import { commercialUseLabel } from "@/lib/utils";

export function LicenseChip({ license }: { license: Pick<DatasetLicense, "spdx" | "commercialUse"> }) {
  const notStated = license.spdx === "Not stated";
  const cuColor =
    license.commercialUse === "permitted" ? "text-verified" :
    license.commercialUse === "not_stated" ? "text-asserted" : "text-risk";
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px]">
      <span className={notStated ? "text-asserted" : "text-foreground"}>{license.spdx}</span>
      <span className={cuColor}>{commercialUseLabel[license.commercialUse]}</span>
    </span>
  );
}
