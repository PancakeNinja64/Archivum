"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dataset } from "@/lib/types";
import { fmtDate } from "@/lib/utils";
import { TrustScore } from "./TrustScore";
import { TierDot } from "./TierDot";

export function TrustPanel({ d }: { d: Dataset }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="rounded-[10px] border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-center">
        <div className="flex flex-col items-center gap-2">
          <TrustScore score={d.trustScore} size="lg" />
          <TierDot tier={d.trustTier} />
        </div>
        <ul className="flex-1 space-y-4">
          {d.trustFactors.map((f) => (
            <li key={f.key}>
              <button
                type="button"
                onClick={() => setOpen(open === f.key ? null : f.key)}
                aria-expanded={open === f.key}
                className="w-full text-left"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-foreground">{f.label}</span>
                  <span className="tnum shrink-0 font-mono text-[12px] text-muted-foreground">
                    w{f.weight} · <span className="text-foreground">{f.score}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${f.score}%` }} />
                </div>
              </button>
              {open === f.key && (
                <p className="mt-2 flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
                  <TierDot tier={f.tier} showLabel={false} className="mt-1" />
                  <span><span className="font-mono text-[11px]">{f.tier}</span> · {f.summary}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 border-t border-border pt-4 font-mono text-[11px] text-muted-foreground">
        Computed {fmtDate(d.lastUpdated)} · methodology v{d.methodologyVersion} ·{" "}
        <Link href="/docs/#methodology" className="link-underline text-accent-strong dark:text-accent">how scoring works</Link>
      </p>
    </div>
  );
}
