import type { EvidenceLabel } from "@/lib/types";
import { evidenceColorVar, evidenceLabel } from "@/lib/utils";

/**
 * Evidence is never encoded by color alone: distinct glyph + label travel with it.
 * documented = filled · reported = half-filled · not found = hollow
 */
export function EvidenceDot({ label, showLabel = true, className = "" }: { label: EvidenceLabel; showLabel?: boolean; className?: string }) {
  const c = evidenceColorVar[label];
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="shrink-0">
        {label === "documented" && <circle cx="5" cy="5" r="4" fill={c} />}
        {label === "reported" && (
          <>
            <circle cx="5" cy="5" r="3.6" fill="none" stroke={c} strokeWidth="1.4" />
            <path d="M5 1.4 A3.6 3.6 0 0 1 5 8.6 Z" fill={c} />
          </>
        )}
        {label === "not_found" && <circle cx="5" cy="5" r="3.6" fill="none" stroke={c} strokeWidth="1.6" />}
      </svg>
      {showLabel && <span className="font-mono text-[11px]" style={{ color: c }}>{evidenceLabel[label]}</span>}
    </span>
  );
}
