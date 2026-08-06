"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { LineageGraph as LG, LineageNode, LineageStage } from "@/lib/types";
import { fmtDate, tierColorVar, tierLabel } from "@/lib/utils";
import { TierDot } from "./TierDot";

const ALL_STAGES: { stage: LineageStage; label: string }[] = [
  { stage: "source", label: "Original source" },
  { stage: "scrape", label: "Raw acquisition" },
  { stage: "clean", label: "Cleaning" },
  { stage: "annotate", label: "Annotation" },
  { stage: "embed", label: "Embedding" },
  { stage: "current", label: "Current version" },
];

/** Point along the brand arc for stage i of 6. */
function pos(i: number) {
  const x = 46 + (568 / 5) * i;
  const y = 96 - Math.sin((i / 5) * Math.PI) * 26;
  return { x, y };
}

export function LineageGraph({ lineage }: { lineage: LG }) {
  const reduce = useReducedMotion();
  const documented = new Map(lineage.nodes.map((n) => [n.stage, n]));
  const [active, setActive] = useState<LineageNode | null>(
    documented.get("current") ?? lineage.nodes[lineage.nodes.length - 1] ?? null
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <span className="font-mono text-[11px] text-muted-foreground">provenance.graph</span>
          <span className={`tnum font-mono text-[11px] ${lineage.completeness === 100 ? "text-verified" : lineage.completeness >= 60 ? "text-inferred" : "text-asserted"}`}>
            {lineage.completeness}% documented
          </span>
        </div>

        <svg viewBox="0 0 660 190" className="h-auto w-full" role="group" aria-label="Provenance chain from original source to current version">
          {/* Edges along the arc; undocumented spans render dashed in risk color. */}
          {ALL_STAGES.slice(0, -1).map((s, i) => {
            const a = pos(i);
            const b = pos(i + 1);
            const midX = (a.x + b.x) / 2;
            const midY = Math.min(a.y, b.y) - 6;
            const d = `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
            const fromDoc = documented.has(s.stage);
            const toDoc = documented.has(ALL_STAGES[i + 1].stage);
            const gap = !fromDoc || !toDoc;
            const edge = lineage.edges.find(
              (e) =>
                documented.get(s.stage)?.id === e.from &&
                documented.get(ALL_STAGES[i + 1].stage)?.id === e.to
            );
            return (
              <path
                key={s.stage}
                d={d}
                fill="none"
                stroke={gap ? "var(--risk)" : edge ? tierColorVar[edge.tier] : "var(--border-strong)"}
                strokeWidth={gap ? 1.25 : 1.75}
                strokeDasharray={gap ? "4 5" : undefined}
                opacity={gap ? 0.7 : 0.9}
              />
            );
          })}

          {ALL_STAGES.map((s, i) => {
            const { x, y } = pos(i);
            const node = documented.get(s.stage);
            if (!node) {
              return (
                <g key={s.stage} aria-label={`${s.label}: undocumented`}>
                  <circle cx={x} cy={y} r="8" fill="var(--surface)" stroke="var(--risk)" strokeWidth="1.25" strokeDasharray="3 3" opacity="0.8" />
                  <text x={x} y={y + 26} textAnchor="middle" className="fill-[var(--risk)] font-mono text-[10px]" opacity="0.85">
                    {s.label}
                  </text>
                  <text x={x} y={y + 40} textAnchor="middle" className="fill-[var(--risk)] font-mono text-[9px]" opacity="0.7">
                    undocumented
                  </text>
                </g>
              );
            }
            const isActive = active?.id === node.id;
            return (
              <g
                key={s.stage}
                tabIndex={0}
                role="button"
                aria-label={`${s.label}, ${tierLabel[node.tier]}`}
                aria-pressed={isActive}
                onMouseEnter={() => setActive(node)}
                onFocus={() => setActive(node)}
                onClick={() => setActive(node)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive(node)}
                className="cursor-pointer outline-none focus-visible:opacity-100"
              >
                <circle
                  cx={x} cy={y} r={isActive ? 10 : 8}
                  fill="var(--surface)"
                  stroke={tierColorVar[node.tier]}
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{ transition: reduce ? undefined : "r 180ms ease" }}
                />
                {node.tier === "verified" && <circle cx={x} cy={y} r="3.5" fill={tierColorVar.verified} />}
                {node.tier === "inferred" && (
                  <path d={`M ${x} ${y - 3.5} A 3.5 3.5 0 0 1 ${x} ${y + 3.5} Z`} fill={tierColorVar.inferred} />
                )}
                <text x={x} y={y + 26} textAnchor="middle" className="fill-[var(--muted-foreground)] font-mono text-[10px]">
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Text equivalent for assistive tech */}
        <ol className="sr-only">
          {ALL_STAGES.map((s) => {
            const n = documented.get(s.stage);
            return (
              <li key={s.stage}>
                {s.label}: {n ? `${tierLabel[n.tier]}, ${n.actor}, ${fmtDate(n.timestamp)}` : "undocumented"}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Passport panel */}
      <div className="rounded-[10px] border border-border bg-surface p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Stage passport</p>
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mt-4 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-medium text-foreground">{active.label}</span>
                <TierDot tier={active.tier} />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{active.description}</p>
              {(
                [
                  ["Actor", active.actor],
                  ["Fingerprint", active.hash],
                  ["Recorded", fmtDate(active.timestamp)],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5 border-t border-border/70 pt-2.5">
                  <span className="text-[11px] text-muted-foreground">{k}</span>
                  <span className="font-mono text-[13px] text-foreground">{v}</span>
                </div>
              ))}
              {active.url && (
                <a href={active.url} className="link-underline inline-block pt-1 text-[13px] text-accent-strong dark:text-accent" rel="noopener noreferrer">
                  View source artifact →
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {lineage.undocumentedStages.length > 0 && (
          <p className="mt-5 border-t border-border pt-4 text-[12px] leading-relaxed text-muted-foreground">
            <span className="text-risk">{lineage.undocumentedStages.length} stage{lineage.undocumentedStages.length > 1 ? "s" : ""} undocumented.</span>{" "}
            Gaps lower the lineage-completeness factor and are shown, not hidden.
          </p>
        )}
      </div>
    </div>
  );
}
