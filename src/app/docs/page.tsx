import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceDot } from "@/components/dataset/EvidenceDot";
import { IntegrateTabs } from "@/components/dataset/IntegrateTabs";
import { COVERAGE_CHECKS, COVERAGE_SECTIONS, COVERAGE_VERSION } from "@/lib/coverage/rules";
import type { CoverageSectionKey } from "@/lib/coverage/rules";

export const metadata: Metadata = {
  title: "Documentation",
  description: "How Archivum records public AI datasets and measures Documentation Coverage.",
};

const nav = [
  { id: "quickstart", label: "Quickstart" },
  { id: "methodology", label: "Coverage methodology" },
  { id: "lineage", label: "Lineage model" },
  { id: "api", label: "API reference" },
  { id: "corrections", label: "Corrections" },
];

const SECTION_ORDER: CoverageSectionKey[] = ["origin", "licensing", "composition", "maintenance"];

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
      {/* Side nav */}
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
          Archivum is a catalog of public AI datasets with a consistent record of what
          each one documents about itself. This page explains exactly how those records
          are assembled and how Documentation Coverage is calculated — so you can
          recompute any figure yourself.
        </p>

        {/* Quickstart */}
        <section className="mt-14">
          <H2 id="quickstart">Quickstart</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Search is free and needs no account —{" "}
            <Link href="/explore/" className="link-underline text-accent-strong dark:text-accent">explore the catalog</Link>{" "}
            and open any dataset for its full record: origin, licensing, structure, and lineage as documented at the source.
          </p>
          <div className="mt-5">
            <IntegrateTabs slug="clinical-notes-mimic-derived" version="v3.2.0" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Every record links back to its source platform. Archivum stores metadata only —
            downloads always happen at the origin, under the origin&rsquo;s terms.
          </p>
        </section>

        {/* Methodology */}
        <section className="mt-14">
          <H2 id="methodology">Coverage methodology <span className="font-mono text-sm text-muted-foreground">v{COVERAGE_VERSION}</span></H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Documentation Coverage measures one thing: how much of a dataset&rsquo;s provenance
            was documented at the source when Archivum checked. It is a factual measure of
            the record, not a judgment of the dataset. Twenty-eight checks are grouped into
            four equally weighted sections; each check asks a question with a verifiable
            yes-or-no answer.
          </p>

          <h3 className="mt-8 text-lg font-medium text-foreground">How each check is scored</h3>
          <ul className="mt-5 space-y-4">
            <li className="flex gap-4">
              <EvidenceDot label="documented" showLabel={false} className="mt-1.5" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Documented — 1 point.</strong> Archivum retrieved the artifact
                itself through the platform&rsquo;s API: a licence field, a file manifest,
                a schema, a commit history.
              </p>
            </li>
            <li className="flex gap-4">
              <EvidenceDot label="reported" showLabel={false} className="mt-1.5" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Reported — half a point.</strong> The publisher stated it in
                prose — a README section, a dataset card paragraph — that Archivum retrieved
                but did not independently confirm.
              </p>
            </li>
            <li className="flex gap-4">
              <EvidenceDot label="not_found" showLabel={false} className="mt-1.5" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Not found — 0 points.</strong> Absent from the published metadata
                at the time of the check. This is a fact about the record, not a defect in
                the data. Checks that cannot apply on a platform are excluded from that
                dataset&rsquo;s denominator entirely.
              </p>
            </li>
          </ul>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            A section&rsquo;s score is its points divided by its applicable checks. The overall
            figure is the mean of the four sections. That is the entire calculation — no
            weights to tune, no popularity bonus, no judgment call.
          </p>

          <h3 className="mt-10 text-lg font-medium text-foreground">The 28 checks</h3>
          <div className="mt-6 space-y-8">
            {SECTION_ORDER.map((key) => {
              const sec = COVERAGE_SECTIONS[key];
              const checks = COVERAGE_CHECKS.filter((c) => c.section === key);
              return (
                <div key={key} className="border-l-2 border-accent pl-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-lg font-medium text-foreground">{sec.label}</h4>
                    <span className="tnum font-mono text-[12px] text-muted-foreground">{checks.length} checks · weight {sec.weight}</span>
                  </div>
                  <p className="mt-1 text-[15px] italic text-muted-foreground">{sec.question}</p>
                  <ul className="mt-3 space-y-2">
                    {checks.map((c) => (
                      <li key={c.id} className="text-sm leading-relaxed text-muted-foreground">
                        <span className="text-foreground">{c.label}.</span> {c.method}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <p className="mt-8 rounded-md border border-border bg-surface p-4 text-[13px] leading-relaxed text-muted-foreground">
            Coverage reflects what was present at the source on the date shown with each
            record. It describes documentation, not data quality, and nothing on this site
            is legal advice — read the licence at the origin before commercial use.
          </p>
        </section>

        {/* Lineage */}
        <section className="mt-14">
          <H2 id="lineage">Lineage model</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Lineage answers one question: what does the source document about this data&rsquo;s
            path from origin to the current version? Archivum models the chain as stages —
            original source, raw acquisition, cleaning, annotation, and current version.
            Each stage the source documents records the actor, a content fingerprint where
            available, a timestamp, and whether it was documented or reported.
          </p>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Stages the source does not document render as explicit gaps — dashed, in warning
            color — on every lineage graph. Archivum never invents a stage to close a gap.
            The gap is the information.
          </p>
        </section>

        {/* API */}
        <section className="mt-14">
          <H2 id="api">API reference</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            The read API mirrors what the site shows — the same records, the same evidence
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
                  ["GET /v1/datasets", "Paginated catalog with filters: query, platform, modality, licence, min_coverage"],
                  ["GET /v1/datasets/:slug", "Full record: coverage sections, all 28 check outcomes, licence as published, schema"],
                  ["GET /v1/datasets/:slug/lineage", "Stage graph with actors, fingerprints, and documented gaps"],
                  ["GET /v1/datasets/:slug/versions", "Version history with per-version coverage"],
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
            Responses carry the coverage rules version so pipelines can pin against it.
          </p>
        </section>

        {/* Corrections */}
        <section className="mt-14 pb-4">
          <H2 id="corrections">Corrections</H2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Any publisher or user can submit a correction to a specific part of a record —
            not the figure in the abstract, but a particular stated fact: <em>this licence
            entry is out of date, here is the current file</em>. Corrections are checked
            against the source; when the record changes, the dataset&rsquo;s history shows the
            revision. Corrections are free and require no account, because being correctable
            in public is what makes a reference work worth consulting.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Use <em>Suggest a correction</em> on any dataset page, or write to{" "}
            <a href="mailto:archivumllc@gmail.com" className="link-underline text-accent-strong dark:text-accent">archivumllc@gmail.com</a>{" "}
            with the dataset slug and the field in question.
          </p>
        </section>
      </article>
    </div>
  );
}
