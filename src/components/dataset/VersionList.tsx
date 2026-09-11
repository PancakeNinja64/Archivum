import type { DatasetVersion } from "@/lib/types";
import { fmtDate, fmtInt } from "@/lib/utils";
import styles from "./passport.module.css";

export function VersionList({ versions }: { versions: DatasetVersion[] }) {
  if (!versions.length) return <p className={styles.empty}>No historical observations are available in this record yet.</p>;
  return <ol className="divide-y divide-border border-y border-border">
    {versions.map((version, index) => <li key={`${version.version}-${version.date}-${index}`} className="grid gap-3 py-6 md:grid-cols-[180px_1fr] md:gap-8">
      <div className="flex items-center gap-3 font-mono text-[12px] text-muted-foreground"><span className="h-2 w-2 rounded-full border border-border-strong bg-surface" aria-hidden /><time dateTime={version.date ?? undefined}>{fmtDate(version.date)}</time></div>
      <div><p className="text-[15px] text-foreground">{version.note || "Dataset metadata observed"}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground"><span className="font-mono text-foreground">{version.version || "Revision not stated"}</span><span>{version.author}</span>{version.coverageTotal !== null && <span>Documentation coverage {version.coverageTotal}%</span>}
          {version.rowsAdded !== null || version.rowsRemoved !== null ? <span>{version.rowsAdded !== null && `+${fmtInt(version.rowsAdded)} added`}{version.rowsAdded !== null && version.rowsRemoved !== null && " · "}{version.rowsRemoved !== null && `${fmtInt(version.rowsRemoved)} removed`}</span> : <span>Row changes not measured</span>}
        </div>
      </div>
    </li>)}
  </ol>;
}
