import Link from "next/link";
import type { DatasetSummary } from "@/lib/types";
import { fmtInt, fmtRelative, platformLabel } from "@/lib/utils";
import { TrustScore } from "./TrustScore";
import { TierDot } from "./TierDot";
import { LicenseChip } from "./LicenseChip";

export function DatasetCard({ d }: { d: DatasetSummary }) {
  return (
    <Link
      href={`/datasets/${d.slug}/`}
      className="group flex flex-col rounded-[10px] border border-border bg-surface p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-accent-strong/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {d.publisher} · {platformLabel[d.platform]}
          </p>
          <h3 className="mt-2 text-base font-medium tracking-[-0.01em] text-foreground group-hover:text-accent-strong dark:group-hover:text-accent">
            {d.name}
          </h3>
        </div>
        <TrustScore score={d.trustScore} size="sm" />
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{d.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-4">
        <TierDot tier={d.trustTier} />
        <LicenseChip license={d.license} />
        <span className="tnum font-mono text-[11px] text-muted-foreground">{fmtInt(d.sizeRows)} rows</span>
        <span className="font-mono text-[11px] text-muted-foreground">{fmtRelative(d.lastUpdated)}</span>
      </div>
    </Link>
  );
}
