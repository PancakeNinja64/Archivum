"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COVERAGE_SECTIONS } from "@/lib/coverage/rules";
import type { CoverageSectionKey } from "@/lib/coverage/rules";
import { EvidenceDot } from "../dataset/EvidenceDot";

/** Illustrative section results for one well-documented dataset. */
const SECTIONS: { key: CoverageSectionKey; score: number }[] = [
  { key: "origin", score: 94 },
  { key: "licensing", score: 88 },
  { key: "composition", score: 90 },
  { key: "maintenance", score: 91 },
];

const COMPOSITE = Math.round(
  SECTIONS.reduce((s, f) => s + f.score * COVERAGE_SECTIONS[f.key].weight, 0) / 100
);

const LABELS = [
  { label: "documented" as const, body: "Archivum retrieved the artifact itself from the platform API — a licence field, a file manifest, a commit history." },
  { label: "reported" as const, body: "The publisher stated it in prose that Archivum retrieved but did not independently confirm." },
  { label: "not_found" as const, body: "Absent from the published metadata when Archivum checked. A fact about the record, not a defect in the data." },
];

export function CoverageMethod() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [hover, setHover] = useState<string | null>(null);
  const [n, setN] = useState(reduce ? COMPOSITE : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(COMPOSITE); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1100);
      setN(Math.round(COMPOSITE * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  // Gauge geometry — 270° sweep
  const box = 240, stroke = 8;
  const r = (box - stroke * 2) / 2;
  const C = 2 * Math.PI * r;
  const arc = C * 0.75;

  // Cumulative segments so hovering a section highlights its contribution
  let acc = 0;
  const segs = SECTIONS.map((f) => {
    const frac = (f.score * COVERAGE_SECTIONS[f.key].weight) / 100 / 100;
    const seg = { key: f.key, start: acc, len: frac };
    acc += frac;
    return seg;
  });

  return (
    <section id="coverage" className="border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Documentation Coverage</p>
        <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-[1.1] tracking-[-0.03em] text-accent md:text-5xl">
          A number anyone can recompute.
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Documentation Coverage measures one thing: how much of a dataset&rsquo;s provenance
          is documented at the source. Twenty-eight factual checks across four sections —
          each answering &ldquo;was this present in the record?&rdquo;, never &ldquo;is this dataset good?&rdquo;
        </p>

        <div ref={ref} className="mt-14 grid gap-14 lg:grid-cols-[auto_1fr] lg:gap-20">
          {/* The gauge */}
          <motion.div
            layoutId="coverage-gauge"
            className="flex flex-col items-center self-start"
          >
            <div className="relative" style={{ width: box, height: box }}>
              <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="-rotate-[135deg]" aria-hidden>
                <circle cx={box / 2} cy={box / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}
                  strokeDasharray={`${arc} ${C}`} strokeLinecap="round" />
                {segs.map((s) => (
                  <circle
                    key={s.key}
                    cx={box / 2} cy={box / 2} r={r} fill="none"
                    stroke="var(--accent)"
                    strokeWidth={stroke}
                    strokeLinecap="butt"
                    strokeDasharray={`${arc * s.len * (n / COMPOSITE)} ${C}`}
                    strokeDashoffset={-arc * s.start * (n / COMPOSITE)}
                    opacity={hover === null ? 1 : hover === s.key ? 1 : 0.25}
                    style={{ transition: "opacity 0.2s" }}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="tnum font-mono text-7xl text-accent" role="img" aria-label={`Documentation Coverage ${COMPOSITE} percent`}>{n}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">% documented</span>
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">coverage rules v1.0 · example record</p>
          </motion.div>

          {/* The four sections */}
          <ul className="flex flex-col justify-center gap-6">
            {SECTIONS.map((f, i) => (
              <li
                key={f.key}
                onMouseEnter={() => setHover(f.key)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(f.key)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                className="rounded-md outline-none"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[15px] text-foreground">{COVERAGE_SECTIONS[f.key].label}</span>
                  <span className="tnum shrink-0 font-mono text-[12px] text-muted-foreground">
                    7 checks · <span className="text-foreground">{f.score}%</span>
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={reduce ? { width: `${f.score}%` } : { width: 0 }}
                    whileInView={{ width: `${f.score}%` }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
                <p className="mt-1.5 text-[13px] text-muted-foreground">{COVERAGE_SECTIONS[f.key].question}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* The evidence labels */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-[10px] border border-border bg-border sm:grid-cols-3">
          {LABELS.map((t) => (
            <div key={t.label} className="bg-surface p-6 md:p-7">
              <EvidenceDot label={t.label} />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Every figure shows its arithmetic.{" "}
            <Link href="/docs/#methodology" className="link-underline text-accent-strong dark:text-accent">
              Read how coverage is measured →
            </Link>
          </p>
          <p className="max-w-md text-[12px] leading-relaxed text-muted-foreground">
            Coverage reflects what was present at the source at the time of the check.
            It describes documentation, not data quality, and is not legal advice.
          </p>
        </div>
      </div>
    </section>
  );
}
