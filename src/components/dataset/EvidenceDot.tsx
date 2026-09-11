import type { EvidenceLabel } from "@/lib/types";
import { evidenceColorVar, evidenceLabel } from "@/lib/utils";

/** Shapes and text carry the meaning independently of color. */
export function EvidenceDot({ label, showLabel = true, className = "" }: { label: EvidenceLabel | "n/a"; showLabel?: boolean; className?: string }) {
  const color = label === "n/a" ? "var(--muted-foreground)" : evidenceColorVar[label];
  return <span className={`inline-flex items-center gap-1.5 ${className}`}>
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="shrink-0">
      {label === "documented" && <circle cx="5" cy="5" r="4" fill={color} />}
      {label === "reported" && <><circle cx="5" cy="5" r="3.6" fill="none" stroke={color} strokeWidth="1.4" /><path d="M5 1.4 A3.6 3.6 0 0 1 5 8.6 Z" fill={color} /></>}
      {label === "not_found" && <circle cx="5" cy="5" r="3.6" fill="none" stroke={color} strokeWidth="1.6" />}
      {label === "n/a" && <path d="M1 5h8" fill="none" stroke={color} strokeWidth="1.4" />}
    </svg>
    {showLabel && <span className="whitespace-nowrap text-[12px]" style={{ color }}>{label === "n/a" ? "Not applicable" : evidenceLabel[label]}</span>}
  </span>;
}
