import type { DatasetVersion } from "@/lib/types";
import { fmtDate, fmtInt, coverageColorVar } from "@/lib/utils";

export function VersionList({ versions }: { versions: DatasetVersion[] }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
      <ul>
        {versions.map((v) => (
          <li key={v.version} className="border-b border-border px-5 py-4 last:border-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-foreground">{v.note}</p>
              <span className="font-mono text-[11px] text-muted-foreground">{fmtDate(v.date)}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
              <span className="text-foreground">{v.version}</span>
              <span>{v.author}</span>
              <span className="tnum"><span className="text-verified">+{fmtInt(v.rowsAdded)}</span> / <span className="text-risk">−{fmtInt(v.rowsRemoved)}</span> rows</span>
              <span className="tnum">coverage <span style={{ color: coverageColorVar(v.coverageTotal) }}>{v.coverageTotal}%</span></span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
