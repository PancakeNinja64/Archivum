"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { DatasetSummary } from "@/lib/types";
import { fmtInt, fmtRelative, platformLabel, scoreColorVar } from "@/lib/utils";
import { TierDot } from "../dataset/TierDot";

/** Six-stage strip along the brand arc; verified nodes filled. */
function LineageStrip({ tier }: { tier: DatasetSummary["trustTier"] }) {
  const stages = ["source", "scrape", "clean", "annotate", "embed", "current"];
  return (
    <svg viewBox="0 0 300 44" className="mt-1 h-11 w-full" aria-hidden>
      <path d="M8 30 Q150 16 292 30" fill="none" stroke="var(--accent)" strokeWidth="1.25" opacity="0.55" />
      {stages.map((s, i) => {
        const x = 8 + (284 / 5) * i;
        const y = 30 - Math.sin((i / 5) * Math.PI) * 6.4;
        const strong = tier === "verified" || i === 5 || i < 2;
        return (
          <g key={s}>
            <circle cx={x} cy={y} r="4" fill="var(--surface)" stroke={strong ? "var(--tier-verified)" : "var(--tier-asserted)"} strokeWidth="1.4" />
            {strong && <circle cx={x} cy={y} r="1.8" fill="var(--tier-verified)" />}
          </g>
        );
      })}
    </svg>
  );
}

function CountUp({ to, color, run }: { to: number; color: string; run: boolean }) {
  const [n, setN] = useState(run ? 0 : to);
  useEffect(() => {
    if (!run) { setN(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 700);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return <span className="tnum font-mono text-5xl" style={{ color }}>{n}</span>;
}

export function HeroPassport({ datasets }: { datasets: DatasetSummary[] }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduce || datasets.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % datasets.length), 5000);
    return () => clearInterval(t);
  }, [paused, reduce, datasets.length]);

  const d = datasets[idx];
  if (!d) return null;
  const color = scoreColorVar(d.trustScore);

  const rows: [string, React.ReactNode][] = [
    ["License", <span key="l" className={d.license.spdx === "Unspecified" ? "text-asserted" : "text-foreground"}>{d.license.spdx}</span>],
    ["Commercial use", <span key="c" className={d.license.commercialUse ? "text-verified" : "text-risk"}>{d.license.commercialUse ? "Allowed" : "Not allowed"}</span>],
    ["Last updated", <span key="u" className="text-foreground">{fmtRelative(d.lastUpdated)}</span>],
    ["Records", <span key="r" className="tnum text-foreground">{fmtInt(d.sizeRows)}</span>],
  ];

  const stagger = (i: number) =>
    reduce ? undefined : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.35 + i * 0.08, duration: 0.4 } };

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative"
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[10px] border border-border bg-surface shadow-[0_24px_60px_-40px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Dataset passport</span>
          <TierDot tier={d.trustTier} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={d.slug}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-mono text-[11px] text-muted-foreground">{d.publisher} · {platformLabel[d.platform]}</p>
                <h3 className="mt-1.5 text-lg font-medium tracking-[-0.01em] text-foreground">{d.name}</h3>
              </div>
              <div className="text-right">
                <CountUp to={d.trustScore} color={color} run={!reduce && idx === 0} />
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">/ 100</p>
              </div>
            </div>

            <div className="mt-5 space-y-0">
              {rows.map(([k, v], i) => (
                <motion.div key={k} {...stagger(i)} className="flex items-baseline justify-between border-b border-border/70 py-2.5 last:border-0">
                  <span className="text-[13px] text-muted-foreground">{k}</span>
                  <span className="font-mono text-[13px]">{v}</span>
                </motion.div>
              ))}
            </div>

            <motion.div {...stagger(4)}>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Lineage</p>
              <LineageStrip tier={d.trustTier} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
        {datasets.map((x, i) => (
          <button
            key={x.slug}
            type="button"
            tabIndex={-1}
            onClick={() => setIdx(i)}
            className="h-1 w-5 rounded-full transition-colors"
            style={{ background: i === idx ? "var(--accent)" : "var(--border)" }}
          />
        ))}
      </div>
    </div>
  );
}
