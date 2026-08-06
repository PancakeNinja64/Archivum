"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";
import type { DatasetSummary } from "@/lib/types";
import { platformLabel, coverageColorVar } from "@/lib/utils";
import { EvidenceDot } from "../dataset/EvidenceDot";

const steps = [
  {
    n: "01",
    title: "Search",
    lead: "One index across Hugging Face, Kaggle, GitHub, and academic sources.",
    body: "Filter by domain, language, modality, licence, and minimum Documentation Coverage. Stop hunting across a dozen sites.",
  },
  {
    n: "02",
    title: "Verify",
    lead: "Open the passport. Read the report card.",
    body: "Origin, contributors, update history, licensing, and the full lineage trail behind every transformation — with every claim labeled by how it was established.",
  },
  {
    n: "03",
    title: "Integrate",
    lead: "Pull it into your pipeline, provenance attached.",
    body: "Download directly or export to LlamaIndex, LangChain, or your vector store. The provenance record travels with the data.",
  },
];

function SearchVisual({ items }: { items: DatasetSummary[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="text-muted-foreground">
          <circle cx="6" cy="6" r="4.4" stroke="currentColor" strokeWidth="1.4" />
          <path d="M9.5 9.5 12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className="font-mono text-[13px] text-foreground">medical text, commercial use</span>
        <span className="caret text-accent" aria-hidden />
      </div>
      <ul className="mt-3 space-y-2">
        {items.slice(0, 4).map((d, i) => (
          <motion.li
            key={d.slug}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.09 }}
            className="flex items-center justify-between rounded-md border border-border bg-background px-3.5 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-[13px] text-foreground">{d.name}</p>
              <p className="truncate font-mono text-[10px] text-muted-foreground">{d.publisher}</p>
            </div>
            <span className="tnum font-mono text-sm" style={{ color: coverageColorVar(d.coverageTotal) }}>{d.coverageTotal}%</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function VerifyVisual({ d }: { d: DatasetSummary }) {
  const factors = [
    ["Source transparency", 35, 94],
    ["Community verification", 25, 88],
    ["Update frequency", 20, 90],
    ["Documentation quality", 20, 91],
  ] as const;
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] text-muted-foreground">{d.publisher} · {platformLabel[d.platform]}</p>
          <p className="mt-1 truncate text-[15px] font-medium text-foreground">{d.name}</p>
        </div>
        <span className="tnum font-mono text-2xl" style={{ color: coverageColorVar(d.coverageTotal) }}>{d.coverageTotal}%</span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {factors.map(([label, w, v], i) => (
          <li key={label}>
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] text-muted-foreground">{label}</span>
              <span className="tnum font-mono text-[11px] text-foreground">{v} <span className="text-muted-foreground">· w{w}</span></span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${v}%` }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-accent"
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <EvidenceDot label="documented" />
        <span className="font-mono text-[10px] text-muted-foreground">lineage 100% documented</span>
      </div>
    </div>
  );
}

function IntegrateVisual({ d }: { d: DatasetSummary }) {
  const lines = [
    { c: "cmd", t: `archivum pull ${d.slug}@${d.version}` },
    { c: "ok", t: "fingerprint verified" },
    { c: "ok", t: `license ${d.license.spdx} · commercial ${d.license.commercialUse ? "allowed" : "restricted"}` },
    { c: "ok", t: "provenance record attached" },
    { c: "out", t: `exported → llamaindex · ${d.slug}.jsonl` },
  ];
  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#0B1220] text-[13px] text-[#EDF2F7]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="ml-2 font-mono text-[10px] text-white/40">archivum · zsh</span>
      </div>
      <div className="p-4 font-mono leading-relaxed">
        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.14 }}
            className={l.c === "ok" ? "flex gap-2 text-[#3DD68C]" : l.c === "out" ? "pl-4 text-white/60" : "flex gap-2"}
          >
            {l.c === "cmd" && <span className="text-white/40">$</span>}
            {l.c === "ok" && <span>✓</span>}
            <span>{l.t}</span>
          </motion.div>
        ))}
        <div className="flex gap-2"><span className="text-white/40">$</span><span className="caret" aria-hidden /></div>
      </div>
    </div>
  );
}

export function HowItWorks({ featured }: { featured: DatasetSummary[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(v < 1 / 3 ? 0 : v < 2 / 3 ? 1 : 2);
  });

  const strong = featured.find((d) => d.coverageTotal >= 85) ?? featured[0];

  const visuals = [
    <SearchVisual key="s" items={featured} />,
    <VerifyVisual key="v" d={strong} />,
    <IntegrateVisual key="i" d={strong} />,
  ];

  // Reduced motion / mobile fallback: stacked steps, each with its visual.
  const stacked = (
    <div className="space-y-16 lg:hidden">
      {steps.map((s, i) => (
        <div key={s.n}>
          <p className="font-mono text-[12px] text-accent-strong dark:text-accent">{s.n}</p>
          <h3 className="mt-2 text-2xl tracking-[-0.02em] text-foreground">{s.title}</h3>
          <p className="mt-2 text-base text-muted-foreground">{s.lead}</p>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
          <div className="mt-6">{visuals[i]}</div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-6 pt-24 md:px-8 md:pt-32">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">How it works</p>
        <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-[1.1] tracking-[-0.03em] text-accent md:text-5xl">
          From search to verified in an afternoon.
        </h2>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-14 md:px-8 md:pb-32 lg:hidden">{stacked}</div>

      {/* Sticky pinned scene — desktop */}
      <div ref={ref} className="relative mx-auto hidden max-w-6xl px-6 md:px-8 lg:block" style={{ height: "260vh" }}>
        <div className="sticky top-0 grid h-screen grid-cols-[1fr_1.1fr] items-center gap-20">
          <div className="relative">
            {/* The arc thread connecting the three steps */}
            <svg aria-hidden viewBox="0 0 24 300" className="absolute -left-10 top-1/2 h-[300px] -translate-y-1/2">
              <path d="M12 8 Q20 150 12 292" fill="none" stroke="var(--accent)" strokeWidth="1.25" opacity="0.35"
                pathLength={1}
                style={{ strokeDasharray: 1, strokeDashoffset: reduce ? 0 : 1 - (active + 1) / 3, transition: "stroke-dashoffset 0.5s cubic-bezier(0.22,1,0.36,1)" }} />
              {[0, 1, 2].map((i) => (
                <circle key={i} cx={12 + (i === 1 ? 6 : 0)} cy={8 + i * 142} r="4"
                  fill={i <= active ? "var(--accent)" : "var(--surface)"}
                  stroke="var(--accent)" strokeWidth="1.4"
                  style={{ transition: "fill 0.3s" }} />
              ))}
            </svg>
            <div className="space-y-12">
              {steps.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => {
                    const el = ref.current;
                    if (!el) return;
                    const top = el.offsetTop + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / 3);
                    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
                  }}
                  className="block text-left transition-opacity duration-300"
                  style={{ opacity: active === i ? 1 : 0.38 }}
                  aria-current={active === i ? "step" : undefined}
                >
                  <p className="font-mono text-[12px] text-accent-strong dark:text-accent">{s.n}</p>
                  <h3 className="mt-2 text-3xl tracking-[-0.02em] text-foreground">{s.title}</h3>
                  <p className="mt-2 text-lg text-muted-foreground">{s.lead}</p>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {visuals[active]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
