"use client";

import { useState } from "react";
import Link from "next/link";
import type { Dataset } from "@/lib/types";
import { COVERAGE_CHECKS, COVERAGE_SECTIONS, coverageDisclaimer } from "@/lib/coverage/rules";
import type { CheckResult } from "@/lib/coverage/rules";
import { platformLabel } from "@/lib/utils";
import { CoverageGauge } from "./CoverageGauge";
import { EvidenceDot } from "./EvidenceDot";

/**
 * Documentation Coverage panel: the four sections, each expanding to its seven
 * checks with the documented / reported / not found outcome and the method note.
 */
export function CoveragePanel({ d }: { d: Dataset }) {
  const [open, setOpen] = useState<string | null>(null);
  const detail = d.coverageDetail ?? {};
  return (
    <div className="rounded-[10px] border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="flex flex-col items-center gap-2">
          <CoverageGauge value={d.coverageTotal} size="lg" />
          <span className="font-mono text-[11px] text-muted-foreground">Documentation Coverage</span>
        </div>
        <ul className="flex-1 space-y-4">
          {d.coverageSections.map((sec) => {
            const checks = COVERAGE_CHECKS.filter((c) => c.section === sec.key);
            return (
              <li key={sec.key}>
                <button
                  type="button"
                  onClick={() => setOpen(open === sec.key ? null : sec.key)}
                  aria-expanded={open === sec.key}
                  className="w-full text-left"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-foreground">{sec.label}</span>
                    <span className="tnum shrink-0 font-mono text-[12px] text-muted-foreground">
                      {sec.documented} documented · {sec.reported} reported ·{" "}
                      <span className="text-foreground">{sec.score}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${sec.score}%` }} />
                  </div>
                </button>
                {open === sec.key && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[12px] leading-relaxed text-muted-foreground">
                      {COVERAGE_SECTIONS[sec.key].question}
                    </p>
                    <ul className="space-y-1">
                      {checks.map((c) => {
                        const result = (detail[c.id] ?? "not_found") as CheckResult;
                        if (result === "n/a") return null;
                        return (
                          <li key={c.id} className="flex items-start justify-between gap-3 text-[13px]" title={c.method}>
                            <span className="text-muted-foreground">{c.label}</span>
                            <EvidenceDot label={result} className="shrink-0" />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="mt-6 border-t border-border pt-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
        {coverageDisclaimer(d.coverageCheckedAt, platformLabel[d.platform] ?? d.platform)}{" "}
        <Link href="/docs/#methodology" className="link-underline text-accent-strong dark:text-accent">How coverage is measured</Link>
      </p>
    </div>
  );
}
