import type { TrustTier } from "@/lib/types";
import { tierColorVar, tierLabel } from "@/lib/utils";

/**
 * Tier is never encoded by color alone: distinct glyph + label travel with it.
 * verified = filled · inferred = half-filled · asserted = hollow
 */
export function TierDot({ tier, showLabel = true, className = "" }: { tier: TrustTier; showLabel?: boolean; className?: string }) {
  const c = tierColorVar[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="shrink-0">
        {tier === "verified" && <circle cx="5" cy="5" r="4" fill={c} />}
        {tier === "inferred" && (
          <>
            <circle cx="5" cy="5" r="3.6" fill="none" stroke={c} strokeWidth="1.4" />
            <path d="M5 1.4 A3.6 3.6 0 0 1 5 8.6 Z" fill={c} />
          </>
        )}
        {tier === "asserted" && <circle cx="5" cy="5" r="3.6" fill="none" stroke={c} strokeWidth="1.6" />}
      </svg>
      {showLabel && <span className="font-mono text-[11px]" style={{ color: c }}>{tierLabel[tier]}</span>}
    </span>
  );
}
