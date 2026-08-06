"use client";

import { useState } from "react";

/**
 * No billing exists anywhere in this product yet. Paid tiers are disabled and
 * say "Coming soon" — no checkout, no payment processor, no waitlist promises.
 */
const tiers = [
  {
    name: "Free",
    price: "$0",
    per: "",
    who: "Everyone — searching the catalog needs no account",
    features: ["Full search across the catalog", "Documentation Coverage with all 28 checks", "Lineage viewing", "Licence terms as published", "Save up to 50 datasets"],
    cta: "Explore datasets",
    href: "/explore/",
    highlight: false,
    available: true,
  },
  {
    name: "Team",
    price: "Coming soon",
    per: "",
    who: "AI startups building on external data",
    features: ["Everything in Free", "Change monitoring and alerts", "Licence-change notifications", "Exportable reports", "API access", "Private collections"],
    cta: "Coming soon",
    href: null,
    highlight: true,
    available: false,
  },
  {
    name: "Enterprise",
    price: "Coming soon",
    per: "",
    who: "Regulated industries and large organizations",
    features: ["Everything in Team", "Org-wide dataset inventory", "SSO and custom policy rules", "Compliance reporting", "Dedicated support"],
    cta: "Coming soon",
    href: null,
    highlight: false,
    available: false,
  },
];

const faqs = [
  ["Is search really free?", "Yes. Searching the catalog, reading coverage records, and viewing lineage costs nothing and needs no account. An account adds saved datasets and change tracking, also free."],
  ["Can we submit a correction?", "Yes, and without an account. Every record has a 'Suggest a correction' link — you point at the specific field and what the source actually says, and the record is re-checked against the origin."],
  ["What does the coverage figure mean?", "It is the percentage of 28 provenance checks that were documented at the source when Archivum last checked — a factual measure of the record, not a grade of the dataset. Every record shows the date of its check and the full check-by-check breakdown."],
  ["How are records kept current?", "Cataloged datasets are re-checked on a rolling schedule. When something changes at the source — the licence, the file list, a new version — the record updates and the change is logged with a date."],
  ["When do paid plans launch?", "When they are actually ready. Nothing on this page takes payment today, and no launch date is promised. The free catalog is the product; paid tiers will add monitoring and governance on top of it."],
];

export function PricingClient() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-8">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-accent md:text-5xl">
          Free to search. Paid tiers coming soon.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
          The catalog and its records are free for everyone. Team and enterprise
          plans — monitoring, alerts, and reporting — are in the works and not yet for sale.
        </p>
      </header>

      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col rounded-[10px] border bg-surface p-7 ${t.highlight ? "border-accent-strong dark:border-accent" : "border-border"}`}
          >
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
            {t.available && t.href ? (
              <a
                href={t.href}
                className="mt-7 rounded-md bg-accent-strong px-4 py-2.5 text-center text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
              >
                {t.cta}
              </a>
            ) : (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="mt-7 cursor-not-allowed rounded-md border border-border px-4 py-2.5 text-sm text-muted-foreground opacity-60"
              >
                {t.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 font-mono text-[11px] text-muted-foreground">
        No payment is collected anywhere on this site today.
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
    </div>
  );
}
