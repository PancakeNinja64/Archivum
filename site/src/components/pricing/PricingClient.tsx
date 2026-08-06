"use client";

import { useState } from "react";
import { WaitlistModal } from "../layout/WaitlistModal";

// Provisional price points — confirm before launch.
const tiers = [
  {
    name: "Free",
    price: "$0",
    per: "",
    who: "Individual developers evaluating datasets",
    features: ["Full search across the index", "Trust scores and factor breakdowns", "Lineage viewing", "License verdicts", "100 API calls / month"],
    cta: "Explore datasets",
    href: "/explore/",
    highlight: false,
  },
  {
    name: "Team",
    price: "$49",
    per: "/ user / month",
    who: "AI startups building on external data",
    features: ["Everything in Free", "Change monitoring and alerts", "License-change notifications", "Exportable audit reports", "10,000 API calls / month", "Private collections"],
    cta: "Join the waitlist",
    href: null,
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Contact sales",
    per: "",
    who: "Regulated industries and large organizations",
    features: ["Everything in Team", "Org-wide dataset inventory", "SSO and custom policy rules", "Compliance reporting", "Dedicated support and SLA", "On-prem option"],
    cta: "Contact sales",
    href: "mailto:hello@archivum.ai?subject=Enterprise",
    highlight: false,
  },
];

const faqs = [
  ["Is search really free?", "Yes. Searching the index, reading trust scores, and viewing lineage costs nothing and needs no account. The free tier is how the index earns credibility; the paid tiers sell monitoring and governance on top of it."],
  ["Can we dispute a score?", "Yes. Every score decomposes into its factors, each labeled by how it was established. If you believe a factor is wrong, the methodology page describes the dispute process — you point at the specific claim and the evidence, and the claim gets re-verified against the primary source."],
  ["What happens if a dataset's license changes after we've used it?", "Team and Enterprise plans monitor every dataset you watch. A license change triggers an alert the day it is detected, along with an audit report showing what the terms were on the date you pulled the data — which is the record you need if the question ever becomes a legal one."],
  ["How are scores kept current?", "Indexed datasets are re-checked on a rolling schedule, weighted by how often they change. Update-frequency decay is part of the score, so an abandoned dataset drifts down rather than staying frozen at its best day."],
  ["What counts as a seat?", "Anyone who signs in. Read-only viewers of exported audit reports don't need seats."],
];

export function PricingClient() {
  const [open, setOpen] = useState<number | null>(0);
  const [waitlist, setWaitlist] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-8">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-accent md:text-5xl">
          Free to search. Paid to monitor.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          The index and its scores are free for everyone. Teams pay for ongoing
          monitoring, alerts, and the reports they hand to auditors.
        </p>
      </header>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col rounded-[10px] border bg-surface p-7 ${t.highlight ? "border-accent-strong dark:border-accent" : "border-border"}`}
          >
            {t.highlight && (
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-strong dark:text-accent">Most popular</p>
            )}
            <h2 className="text-lg font-medium text-foreground">{t.name}</h2>
            <p className="mt-3">
              <span className="tnum font-mono text-3xl text-foreground">{t.price}</span>
              <span className="ml-1 font-mono text-[12px] text-muted-foreground">{t.per}</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t.who}</p>
            <ul className="mt-6 flex-1 space-y-2.5">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm text-foreground/85">
                  <span className="text-accent-strong dark:text-accent" aria-hidden>—</span>
                  {f}
                </li>
              ))}
            </ul>
            {t.href ? (
              <a
                href={t.href}
                className={`mt-7 rounded-md px-4 py-2.5 text-center text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 ${t.highlight ? "bg-accent-strong text-white hover:opacity-90" : "border border-border-strong text-foreground hover:bg-muted"}`}
              >
                {t.cta}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setWaitlist(true)}
                className="mt-7 rounded-md bg-accent-strong px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
              >
                {t.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 font-mono text-[11px] text-muted-foreground">
        Prices are provisional during early access.
      </p>

      <section className="mt-20 max-w-3xl">
        <h2 className="font-serif text-3xl tracking-[-0.02em] text-accent">Questions worth asking</h2>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {faqs.map(([q, a], i) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
              >
                <span className="text-[15px] text-foreground">{q}</span>
                <span className="font-mono text-muted-foreground" aria-hidden>{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <p className="pb-5 pr-8 text-sm leading-relaxed text-muted-foreground">{a}</p>}
            </li>
          ))}
        </ul>
      </section>

      <WaitlistModal open={waitlist} onClose={() => setWaitlist(false)} />
    </div>
  );
}
