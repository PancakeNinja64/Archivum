"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TRUST_WEIGHTS } from "@/lib/types";
import { TierDot } from "../dataset/TierDot";

const FACTORS = [
  { key: "sourceTransparency", label: "Source transparency", score: 94, q: "Can every record be traced to a named origin?" },
  { key: "communityVerification", label: "Community verification", score: 88, q: "Independent confirmation, citations, downstream use." },
  { key: "updateFrequency", label: "Update frequency", score: 90, q: "Is it maintained, or abandoned?" },
  { key: "documentationQuality", label: "Documentation quality", score: 91, q: "Schema, collection method, and known limitations documented." },
] as const;

const COMPOSITE = Math.round(
  FACTORS.reduce((s, f) => s + f.score * TRUST_WEIGHTS[f.key], 0) / 100
);

const TIERS = [
  { tier: "verified" as const, body: "Archivum independently confirmed it against the original source." },
  { tier: "inferred" as const, body: "Derived from metadata or automated analysis, not confirmed." },
  { tier: "asserted" as const, body: "Claimed by the publisher, unconfirmed." },
];

export function TrustScoring() {
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

  // Cumulative segments so hovering a factor highlights its contribution
  let acc = 0;
  const segs = FACTORS.map((f) => {
    const frac = (f.score * TRUST_WEIGHTS[f.key]) / 100 / 100; // contribution to composite, as fraction of full scale
    const seg = { key: f.key, start: acc, len: frac };
    acc += frac;
    return seg;
  });

  return (
    <section id="trust" className="border-t border-border py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Trust scoring</p>
        <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-[1.1] tracking-[-0.03em] text-accent md:text-5xl">
          A score you can argue with.
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Archivum publishes judgments about other people&rsquo;s data, so the method is
          public. Every score decomposes into four weighted factors, and every claim
          is labeled by how it was established.
        </p>

        <div ref={ref} className="mt-14 grid gap-14 lg:grid-cols-[auto_1fr] lg:gap-20">
          {/* The gauge */}
          <motion.div
            layoutId="trust-gauge"
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
                <span className="tnum font-mono text-7xl text-accent" role="img" aria-label={`Composite trust score ${COMPOSITE} out of 100`}>{n}</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">/ 100</span>
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">composite · methodology v1.0</p>
          </motion.div>

          {/* The four factors */}
          <ul className="flex flex-col justify-center gap-6">
            {FACTORS.map((f, i) => (
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
                  <span className="text-[15px] text-foreground">{f.label}</span>
                  <span className="tnum shrink-0 font-mono text-[12px] text-muted-foreground">
                    weight {TRUST_WEIGHTS[f.key]} · <span className="text-foreground">{f.score}</span>
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
                <p className="mt-1.5 text-[13px] text-muted-foreground">{f.q}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* The tiers */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-[10px] border border-border bg-border sm:grid-cols-3">
          {TIERS.map((t) => (
            <div key={t.tier} className="bg-surface p-6 md:p-7">
              <TierDot tier={t.tier} />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Every score shows its work.{" "}
            <Link href="/docs/#methodology" className="link-underline text-accent-strong dark:text-accent">
              Read the full methodology →
            </Link>
          </p>
          <p className="max-w-md text-[12px] leading-relaxed text-muted-foreground">
            Scores reflect available evidence at a point in time and are not legal advice.
          </p>
        </div>
      </div>
    </section>
  );
}
