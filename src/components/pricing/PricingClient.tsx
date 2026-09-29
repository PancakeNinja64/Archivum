import Link from "next/link";
import styles from "./Pricing.module.css";

/**
 * No billing exists anywhere in this product yet. Paid tiers are disabled and
 * say "Coming soon" — no checkout, no payment processor, no waitlist promises.
 */
const tiers = [
  {
    name: "Free",
    price: "$0",
    who: "Everyone — searching the catalog needs no account",
    features: ["Full search across the catalog", "Documentation Coverage with all 28 checks", "Lineage viewing", "Licence terms as published", "Save up to 50 datasets"],
    cta: "Explore datasets",
    href: "/workspace/",
    featured: false,
    available: true,
  },
  {
    name: "Team",
    price: "Coming soon",
    who: "AI startups building on external data",
    features: ["Everything in Free", "Change monitoring and alerts", "Licence-change notifications", "Exportable reports", "API access", "Private collections"],
    cta: "Coming soon",
    href: null,
    featured: true,
    available: false,
  },
  {
    name: "Enterprise",
    price: "Coming soon",
    who: "Regulated industries and large organizations",
    features: ["Everything in Team", "Org-wide dataset inventory", "SSO and custom policy rules", "Compliance reporting", "Dedicated support"],
    cta: "Coming soon",
    href: null,
    featured: false,
    available: false,
  },
];

const faqs: [string, string][] = [
  ["Is search really free?", "Yes. Searching the catalog, reading coverage records, and viewing lineage costs nothing and needs no account. An account adds saved datasets and change tracking, also free."],
  ["Can we submit a correction?", "Yes, and without an account. Every record has a 'Suggest a correction' link — you point at the specific field and what the source actually says, and the record is re-checked against the origin."],
  ["What does the coverage figure mean?", "It is the percentage of 28 provenance checks that were documented at the source when Archivum last checked — a factual measure of the record, not a grade of the dataset. Every record shows the date of its check and the full check-by-check breakdown."],
  ["How are records kept current?", "Cataloged datasets are re-checked on a rolling schedule. When something changes at the source — the licence, the file list, a new version — the record updates and the change is logged with a date."],
  ["When do paid plans launch?", "When they are actually ready. Nothing on this page takes payment today, and no launch date is promised. The free catalog is the product; paid tiers will add monitoring and governance on top of it."],
];

export function PricingClient() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <header className={styles.lead}>
          <span className={styles.chapter}>Pricing</span>
          <h1>Free to search.<br />Paid tiers coming soon.</h1>
          <p>
            The catalog and its records are free for everyone. Team and enterprise
            plans — monitoring, alerts, and reporting — are in the works and not yet for sale.
          </p>
        </header>

        <div className={styles.tiers}>
          {tiers.map((tier) => (
            <article key={tier.name} className={styles.plate} data-featured={tier.featured || undefined} data-available={tier.available || undefined}>
              <p className={styles.status}>{tier.available ? "Available" : "Forthcoming"}</p>
              <h2 className={styles.tier}>{tier.name}</h2>
              <p className={styles.price} data-phrase={tier.price.startsWith("$") ? undefined : true}>{tier.price}</p>
              <p className={styles.who}>{tier.who}</p>
              <ul className={styles.features}>
                {tier.features.map((feature) => (
                  <li key={feature}><span aria-hidden="true">—</span>{feature}</li>
                ))}
              </ul>
              {tier.available && tier.href ? (
                <Link href={tier.href} className={styles.action}>{tier.cta}</Link>
              ) : (
                <button type="button" className={styles.pending} disabled aria-disabled="true">{tier.cta}</button>
              )}
            </article>
          ))}
        </div>

        <p className={styles.note}>No payment is collected anywhere on this site today.</p>

        <section className={styles.questions} aria-labelledby="pricing-questions">
          <span className={styles.chapter}>Questions</span>
          <h2 id="pricing-questions">Questions worth asking</h2>
          {faqs.map(([question, answer], index) => (
            <details key={question} className={styles.item} open={index === 0 ? true : undefined}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </section>
      </div>
    </div>
  );
}
