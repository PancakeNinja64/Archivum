import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getDataset, getRelated } from "@/lib/api/client";
import { fmtBytes, fmtDate, fmtInt, fmtRelative, platformLabel } from "@/lib/utils";
import { TrustPanel } from "@/components/dataset/TrustPanel";
import { LineageGraph } from "@/components/dataset/LineageGraph";
import { VersionList } from "@/components/dataset/VersionList";
import { SchemaTable } from "@/components/dataset/SchemaTable";
import { SampleRecords } from "@/components/dataset/SampleRecords";
import { IntegrateTabs } from "@/components/dataset/IntegrateTabs";
import { DatasetCard } from "@/components/dataset/DatasetCard";
import { TierDot } from "@/components/dataset/TierDot";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDataset(slug);
  if (!d) return { title: "Dataset not found" };
  return {
    title: d.name,
    description: `${d.description} Trust score ${d.trustScore}/100 · ${d.license.spdx} · ${d.publisher}.`,
  };
}

const sections = [
  { id: "trust", label: "Trust" },
  { id: "lineage", label: "Lineage" },
  { id: "license", label: "License" },
  { id: "versions", label: "Versions" },
  { id: "schema", label: "Schema" },
  { id: "samples", label: "Samples" },
  { id: "integrate", label: "Integrate" },
];

export default async function DatasetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getDataset(slug);
  if (!d) notFound();
  const related = await getRelated(slug);

  const stats: [string, string][] = [
    ["Records", fmtInt(d.sizeRows)],
    ["Size", fmtBytes(d.sizeBytes)],
    ["Primary sources", String(d.primarySourceCount)],
    ["Human verification", d.humanVerificationPct ? `${d.humanVerificationPct}%` : "—"],
    ["Duplicates removed", `${d.duplicatesRemovedPct}%`],
    ["Languages", d.languages.join(", ")],
    ["Modality", d.modality],
    ["First published", fmtDate(d.firstPublished)],
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-8">
      {/* Header */}
      <nav aria-label="Breadcrumb" className="font-mono text-[12px] text-muted-foreground">
        <Link href="/explore/" className="hover:text-foreground">Explore</Link>
        <span className="mx-2">/</span>
        <span>{d.publisher}</span>
      </nav>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 max-w-2xl">
          <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-accent md:text-5xl">{d.name}</h1>
          <p className="tnum mt-3 font-mono text-[12px] text-muted-foreground">
            {d.version} · updated {fmtRelative(d.lastUpdated)} · {platformLabel[d.platform]} · {d.contentHash}
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{d.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={d.platformUrl}
            rel="noopener noreferrer"
            className="rounded-md bg-accent-strong px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
          >
            Download
          </a>
          <Link href="/dashboard/" className="rounded-md border border-border-strong px-4 py-2.5 text-sm text-foreground hover:bg-surface">
            Watch
          </Link>
        </div>
      </div>

      {/* In-page nav */}
      <nav aria-label="Sections" className="sticky top-16 z-30 -mx-6 mt-8 overflow-x-auto border-y border-border bg-background/85 px-6 backdrop-blur-md md:-mx-8 md:px-8">
        <ul className="flex gap-6 whitespace-nowrap py-3">
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="font-mono text-[12px] text-muted-foreground hover:text-foreground">{s.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Trust */}
      <section id="trust" className="scroll-mt-32 pt-10">
        <TrustPanel d={d} />
      </section>

      {/* Overview stats */}
      <section className="pt-10">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-border bg-border sm:grid-cols-4">
          {stats.map(([k, v]) => (
            <div key={k} className="bg-surface p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{k}</p>
              <p className="tnum mt-1.5 font-mono text-[15px] text-foreground">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lineage */}
      <section id="lineage" className="scroll-mt-32 pt-14">
        <h2 className="font-serif text-2xl tracking-[-0.02em] text-accent md:text-3xl">Lineage</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Every step from the original source to the version you download. Gaps are shown, not hidden.
        </p>
        <div className="mt-6"><LineageGraph lineage={d.lineage} /></div>
      </section>

      {/* License */}
      <section id="license" className="scroll-mt-32 pt-14">
        <h2 className="font-serif text-2xl tracking-[-0.02em] text-accent md:text-3xl">License</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className={`rounded-[10px] border p-6 ${d.license.commercialUse ? "border-verified/40 bg-verified/5" : "border-risk/40 bg-risk/5"}`}>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Commercial use</p>
            <p className={`mt-2 text-xl font-medium ${d.license.commercialUse ? "text-verified" : "text-risk"}`}>
              {d.license.commercialUse ? "Allowed" : "Not allowed"}
            </p>
          </div>
          <div className="rounded-[10px] border border-border bg-surface p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Terms</p>
            <p className={`mt-2 font-mono text-xl ${d.license.spdx === "Unspecified" ? "text-asserted" : "text-foreground"}`}>{d.license.spdx}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[12px] text-muted-foreground">
              <span>attribution {d.license.attribution ? "required" : "not required"}</span>
              <span>share-alike {d.license.shareAlike ? "yes" : "no"}</span>
              <TierDot tier={d.license.tier} />
            </div>
          </div>
        </div>
        {d.license.conflicts.length > 0 && (
          <div className="mt-4 rounded-[10px] border border-asserted/40 bg-asserted/5 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-asserted">Upstream conflicts</p>
            <ul className="mt-2 space-y-1">
              {d.license.conflicts.map((c) => (
                <li key={c} className="text-sm leading-relaxed text-muted-foreground">{c}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Versions */}
      <section id="versions" className="scroll-mt-32 pt-14">
        <h2 className="font-serif text-2xl tracking-[-0.02em] text-accent md:text-3xl">Version history</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Per-version trust scores make drift visible over time.
        </p>
        <div className="mt-6"><VersionList versions={d.versions} /></div>
      </section>

      {/* Schema */}
      <section id="schema" className="scroll-mt-32 pt-14">
        <h2 className="font-serif text-2xl tracking-[-0.02em] text-accent md:text-3xl">Schema</h2>
        <div className="mt-6"><SchemaTable schema={d.schema} /></div>
      </section>

      {/* Samples */}
      <section id="samples" className="scroll-mt-32 pt-14">
        <h2 className="font-serif text-2xl tracking-[-0.02em] text-accent md:text-3xl">Sample records</h2>
        <div className="mt-6"><SampleRecords records={d.sampleRecords} /></div>
      </section>

      {/* Integrate */}
      <section id="integrate" className="scroll-mt-32 pt-14">
        <h2 className="font-serif text-2xl tracking-[-0.02em] text-accent md:text-3xl">Integrate</h2>
        <div className="mt-6"><IntegrateTabs slug={d.slug} version={d.version} /></div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="pt-16">
          <h2 className="font-serif text-2xl tracking-[-0.02em] text-accent md:text-3xl">Similar datasets</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <DatasetCard key={r.slug} d={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
