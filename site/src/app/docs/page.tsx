import type { Metadata } from "next";
import Link from "next/link";
import { TierDot } from "@/components/dataset/TierDot";
import { IntegrateTabs } from "@/components/dataset/IntegrateTabs";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Quickstart, trust scoring methodology, lineage model, and API reference for the Archivum dataset index.",
};

const nav = [
  { id: "quickstart", label: "Quickstart" },
  { id: "methodology", label: "Trust methodology" },
  { id: "lineage", label: "Lineage model" },
  { id: "api", label: "API reference" },
  { id: "exports", label: "Exports" },
  { id: "disputes", label: "Disputes" },
];

const factors = [
  {
    name: "Source transparency",
    weight: 35,
    what: "Can each record be traced to a named, reachable origin?",
    how: "Checks for a declared source list, working links to the original material, and consistency between the declared origin and what sampling actually finds. A dataset that names its sources and survives spot-checking scores high; a dataset whose records cannot be traced anywhere scores near the floor regardless of quality elsewhere.",
  },
  {
    name: "Community verification",
    weight: 25,
    what: "Has anyone independent of the publisher confirmed this data?",
    how: "Counts citations in published work, downstream projects that consumed the dataset, independent replications, and issue-tracker activity that was answered. New submissions start at zero here by design — this factor can only be earned over time, which is why freshly published datasets rarely score above the low 70s.",
  },
  {
    name: "Update frequency",
    weight: 20,
    what: "Is the dataset maintained, or abandoned?",
    how: "Measures release cadence against the volatility of the underlying domain. A legal corpus updated yearly can score well; a news dataset untouched for a year cannot. Staleness decays the factor continuously rather than in cliffs, so scores drift down as maintenance stops.",
  },
  {
    name: "Documentation quality",
    weight: 20,
    what: "Could a stranger use this correctly without asking the author?",
    how: "Looks for a complete schema, a described collection method, known-limitations notes, and licensing stated where the data lives. Documentation claims are verified against the artifacts themselves — a README that promises a schema the files don't match is scored on the files, not the README.",
  },
];

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-32 border-t border-border pt-12 font-serif text-3xl tracking-[-0.02em] text-accent first:border-0 first:pt-0">
      {children}
    </h2>
  );
}

export default function DocsPage() {
  return (
    <div className="mx-auto flex max-w-6xl gap-14 px-6 pb-24 pt-28 md:px-8">
      {/* Sidebar */}
      <aside className="sticky top-28 hidden h-fit w-52 shrink-0 lg:block" aria-label="Documentation sections">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Documentation</p>
        <ul className="mt-4 space-y-2.5 border-l border-border pl-4">
          {nav.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </aside>

      <article className="min-w-0 max-w-3xl flex-1">
        <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-accent md:text-5xl">Documentation</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          How to use the index, and — more importantly — how the judgments in it
          are made. Archivum publishes opinions about other people&rsquo;s data, so the
          method is public and versioned.
        </p>

        {/* Quickstart */}
        <section className="mt-14">
          <H2 id="quickstart">Quickstart</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Search needs no account:{" "}
            <Link href="/explore/" className="link-underline text-accent-strong dark:text-accent">explore the index</Link>{" "}
            and open any dataset to read its passport. To pull data into a pipeline
            with the provenance record attached:
          </p>
          <div className="mt-5">
            <IntegrateTabs slug="clinical-notes-mimic-derived" version="v3.2.0" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Every pull verifies the content fingerprint against the index before
            handing you the data, so what you got is provably what was graded.
          </p>
        </section>

        {/* Methodology */}
        <section className="mt-14">
          <H2 id="methodology">Trust methodology <span className="font-mono text-sm text-muted-foreground">v1.0</span></H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Every dataset receives a score from 0 to 100, computed as a weighted
            sum of four factors. The weights are fixed across the entire index —
            no dataset, publisher, or payment changes them — and any future change
            to weights or definitions ships as a new methodology version, with
            prior scores retained under the version that produced them.
          </p>

          <div className="mt-8 space-y-8">
            {factors.map((f) => (
              <div key={f.name} className="border-l-2 border-accent pl-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-medium text-foreground">{f.name}</h3>
                  <span className="tnum font-mono text-[12px] text-muted-foreground">weight {f.weight} / 100</span>
                </div>
                <p className="mt-1 text-[15px] italic text-muted-foreground">{f.what}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.how}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-10 text-lg font-medium text-foreground">How claims are labeled</h3>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            A score is only as good as the evidence beneath it, so every individual
            claim in a dataset&rsquo;s record carries one of three labels:
          </p>
          <ul className="mt-5 space-y-4">
            <li className="flex gap-4">
              <TierDot tier="verified" showLabel={false} className="mt-1.5" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Verified.</strong> Archivum independently confirmed the claim
                against the primary source — the license file was read at the origin,
                the sample was traced to the declared source, the hash matched.
              </p>
            </li>
            <li className="flex gap-4">
              <TierDot tier="inferred" showLabel={false} className="mt-1.5" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Inferred.</strong> Derived from metadata or automated
                analysis — a license detected from repository files, a modality
                classified from sampling — but not confirmed by a person or primary document.
              </p>
            </li>
            <li className="flex gap-4">
              <TierDot tier="asserted" showLabel={false} className="mt-1.5" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Asserted.</strong> Stated by the publisher and not yet
                checked. Assertions are displayed as assertions — they are never
                silently promoted.
              </p>
            </li>
          </ul>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            A dataset&rsquo;s overall tier is the tier of the evidence behind its scoring
            inputs, not a reward for a high score: an 80 built on assertions is
            displayed as <em>asserted</em>, and that is a fact about the evidence,
            not an insult to the dataset.
          </p>
          <p className="mt-5 rounded-md border border-border bg-surface p-4 text-[13px] leading-relaxed text-muted-foreground">
            Scores summarize available evidence at a point in time. They are not
            legal advice, and a high score is not a warranty — read the license
            verdict and its evidence before commercial use.
          </p>
        </section>

        {/* Lineage */}
        <section className="mt-14">
          <H2 id="lineage">Lineage model</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Lineage answers one question: what happened to this data between its
            origin and the file you download? Archivum models the chain as six
            stages — original source, raw acquisition, cleaning, annotation,
            embedding, and current version. Each documented stage records the
            actor, a content fingerprint, a timestamp, and its evidence tier.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Stages that cannot be documented render as explicit gaps — dashed, in
            warning color — on every lineage graph. Gaps reduce the
            source-transparency factor, which means the honest incentive runs the
            right way: documenting an unglamorous chain scores better than hiding it.
          </p>
        </section>

        {/* API */}
        <section className="mt-14">
          <H2 id="api">API reference</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            The REST API mirrors what the site shows — same scores, same evidence
            labels. All endpoints are read-only and return JSON.
          </p>
          <div className="mt-5 overflow-x-auto rounded-[10px] border border-border">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3 font-normal">Endpoint</th>
                  <th className="px-4 py-3 font-normal">Returns</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                {[
                  ["GET /v1/datasets", "Paginated index with filters: query, platform, modality, license, min_trust"],
                  ["GET /v1/datasets/:slug", "Full record: score, factors, license verdict, schema"],
                  ["GET /v1/datasets/:slug/lineage", "Stage graph with actors, fingerprints, and gaps"],
                  ["GET /v1/datasets/:slug/versions", "Version history with per-version trust scores"],
                  ["GET /v1/facets", "Available filter values with counts"],
                ].map(([e, r]) => (
                  <tr key={e} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-accent-strong dark:text-accent">{e}</td>
                    <td className="px-4 py-3 font-sans text-muted-foreground">{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Free keys allow 100 calls per month; Team keys 10,000. Responses carry
            the methodology version so pipelines can pin against it.
          </p>
        </section>

        {/* Exports */}
        <section className="mt-14">
          <H2 id="exports">Exports</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Datasets export to LlamaIndex, LangChain, and common vector stores with
            the provenance record embedded as metadata on every chunk — so a
            retrieval pipeline can answer not just <em>what</em> it retrieved but{" "}
            <em>where that text came from and under what license</em>. Audit
            reports export as PDF and JSON, snapshotting a dataset&rsquo;s score,
            license verdict, and lineage on a given date.
          </p>
        </section>

        {/* Disputes */}
        <section className="mt-14 pb-4">
          <H2 id="disputes">Disputes</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Any publisher or user can dispute a specific claim — not the score in
            the abstract, but a particular labeled fact: <em>this license verdict
            is wrong, here is the primary source</em>. Disputed claims are
            re-verified against the evidence presented; if the claim changes, the
            score recomputes and the dataset&rsquo;s record shows the correction
            history. Disputes are free, including on the Free tier, because being
            correctable in public is what makes the index worth trusting.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Open a dispute from any dataset page, or write to{" "}
            <a href="mailto:disputes@archivum.ai" className="link-underline text-accent-strong dark:text-accent">disputes@archivum.ai</a>{" "}
            with the dataset slug and the claim in question.
          </p>
        </section>
      </article>
    </div>
  );
}
