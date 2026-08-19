"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDatasets } from "@/lib/api/client";
import type { DatasetSummary, Modality } from "@/lib/types";
import { DatasetCard } from "../dataset/DatasetCard";
import { CardSkeleton } from "../ui/Skeleton";

const MODALITIES: Modality[] = ["text", "image", "audio", "tabular"];

export function MarketplacePreview({
  initial,
  catalogCount,
}: {
  initial: DatasetSummary[];
  catalogCount: number;
}) {
  const reduce = useReducedMotion();
  const [modality, setModality] = useState<Modality | null>(null);
  const [minScore, setMinScore] = useState(0);
  const [rows, setRows] = useState<DatasetSummary[] | null>(initial);
  const countLabel = catalogCount.toLocaleString();

  useEffect(() => {
    let live = true;
    getDatasets({
      modality: modality ? [modality] : undefined,
      minCoverage: minScore || undefined,
      pageSize: 6,
      sort: "coverage",
    }).then((r) => {
      if (!live) return;
      // Keep one low scorer visible in the default view — the grading is real.
      let items = r.items;
      if (!modality && minScore === 0) {
        const low = initial.find((d) => d.coverageTotal < 50);
        if (low && !items.some((d) => d.coverageTotal < 50)) items = [...items.slice(0, 5), low];
      }
      setRows(items.slice(0, 6));
    });
    return () => { live = false; };
  }, [modality, minScore, initial]);

  const empty = rows !== null && rows.length === 0;

  return (
    <section className="border-t border-border bg-surface/40 py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">The index</p>
        <h2 className="mt-5 font-serif text-[2.1rem] leading-[1.1] tracking-[-0.03em] text-accent sm:text-4xl md:text-5xl">
          {countLabel} dataset{catalogCount === 1 ? "" : "s"}. Every one graded.
        </h2>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by modality">
            <button
              type="button"
              onClick={() => setModality(null)}
              aria-pressed={modality === null}
              className={`rounded-md border px-3 py-1.5 font-mono text-[12px] transition-colors max-sm:min-h-11 max-sm:px-3.5 max-sm:py-2.5 ${modality === null ? "border-accent-strong text-accent-strong dark:text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              all
            </button>
            {MODALITIES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModality(modality === m ? null : m)}
                aria-pressed={modality === m}
                className={`rounded-md border px-3 py-1.5 font-mono text-[12px] transition-colors max-sm:min-h-11 max-sm:px-3.5 max-sm:py-2.5 ${modality === m ? "border-accent-strong text-accent-strong dark:text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {m}
              </button>
            ))}
          </div>
          <label className="ml-auto flex items-center gap-3 font-mono text-[12px] text-muted-foreground max-sm:ml-0 max-sm:w-full">
            min trust <span className="tnum w-6 text-right text-foreground">{minScore}</span>
            <input
              type="range" min={0} max={90} step={5} value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-36 accent-[var(--accent-strong)] max-sm:h-11 max-sm:min-w-0 max-sm:w-auto max-sm:flex-1"
            />
          </label>
        </div>

        <motion.div layout className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows === null &&
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          {rows?.map((d) => (
            <motion.div
              key={d.slug}
              layout={reduce ? false : true}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DatasetCard d={d} />
            </motion.div>
          ))}
        </motion.div>

        {empty && (
          <div className="mt-8 rounded-[10px] border border-border bg-surface p-10 text-center">
            <p className="text-foreground">No datasets match these filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try lowering the minimum coverage.</p>
          </div>
        )}

        <p className="mt-10">
          <Link href="/explore/" className="link-underline text-accent-strong dark:text-accent">
            Explore all {countLabel} dataset{catalogCount === 1 ? "" : "s"} →
          </Link>
        </p>
      </div>
    </section>
  );
}
