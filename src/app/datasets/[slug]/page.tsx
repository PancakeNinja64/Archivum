import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dataMode, getAllSlugs, getDataset, getRelated } from "@/lib/api/client";
import { fmtBytes, fmtDate, fmtInt, platformLabel, commercialUseLabel, safeExternalUrl } from "@/lib/utils";
import { CoveragePanel } from "@/components/dataset/CoveragePanel";
import { LineageGraph } from "@/components/dataset/LineageGraph";
import { VersionList } from "@/components/dataset/VersionList";
import { SchemaTable } from "@/components/dataset/SchemaTable";
import { SampleRecords } from "@/components/dataset/SampleRecords";
import { DatasetCard } from "@/components/dataset/DatasetCard";
import { EvidenceDot } from "@/components/dataset/EvidenceDot";
import { CorrectionModal } from "@/components/dataset/CorrectionModal";
import { SaveButton } from "@/components/dataset/SaveButton";
import { PassportNav } from "@/components/dataset/PassportNav";
import { BrandMark } from "@/components/brand/Brand";
import { ContentHash } from "@/components/dataset/ContentHash";
import styles from "@/components/dataset/passport.module.css";

export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  try { return (await getAllSlugs()).map((slug) => ({ slug })); }
  catch { return []; }
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const d = await getDataset(slug);
    if (!d) return { title: "Dataset not found" };
    return { title: d.name, description: `${d.description.slice(0, 160)} · ${d.publisher}.` };
  } catch { return { title: "Dataset record temporarily unavailable" }; }
}
export default async function DatasetPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // A failed request reaches error.tsx. Only a successful absent lookup is a 404.
  const d = await getDataset(slug);
  if (!d) notFound();
  const related = await getRelated(slug).catch(() => []);
  const sourceUrl = dataMode === "catalog" ? safeExternalUrl(d.platformUrl) : null;
  const missing = Object.values(d.coverageDetail).filter((result) => result === "not_found").length;
  const stats = [
    ["Records", fmtInt(d.sizeRows)], ["Download size", fmtBytes(d.sizeBytes)],
    ["Modality", d.modality], ["Languages", d.languages.join(", ") || "Not stated"],
    ["Domain", d.domain.join(", ") || "Not stated"], ["First published at source", fmtDate(d.firstPublished)],
    ["Source updated", fmtDate(d.lastUpdated)], ["Archivum checked", fmtDate(d.coverageCheckedAt)],
  ];
  return <article className={styles.page}>
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/explore/">← Explore</Link><span aria-hidden>/</span><span>Dataset record</span></nav>
    {dataMode === "illustrative" && <div className={styles.demo}><strong>Illustrative record</strong><span>This demonstration uses fictional sample metadata to show the experience. It is not a current source report.</span></div>}
    <header className={styles.hero}>
      <div>
        <p className={styles.kicker}><BrandMark /> DATASET PASSPORT</p><h1 className={styles.title}>{d.name}</h1>
        <div className={styles.identity}><strong>{d.publisher}</strong><span>{platformLabel[d.platform]}</span><span>{d.version}</span></div>
        <div className={styles.description}><p>{d.description || "A source description is not available for this record."}</p>{d.description && <details><summary>Read source description</summary><div className={styles.fullDescription}>{d.description}</div></details>}</div>
        <div className={styles.correction}><CorrectionModal datasetSlug={d.slug} datasetName={d.name} /></div>
      </div>
      <aside className={styles.factPanel} aria-label="Record facts and actions">
        <div className={styles.coverage}><p className={styles.coverageValue}>{d.coverageTotal}<span>%</span></p><p className={styles.coverageCaption}>Documentation<br />coverage</p></div>
        <dl className={styles.facts}><div><dt>Declared licence</dt><dd>{d.license.spdx}</dd></div><div><dt>Source</dt><dd>{platformLabel[d.platform]}</dd></div><div><dt>Last checked</dt><dd>{fmtDate(d.coverageCheckedAt)}</dd></div></dl>
        <div className={styles.actions}>{sourceUrl ? <a className={styles.primary} href={sourceUrl} rel="noopener noreferrer">View at source <span aria-hidden>&nbsp;↗</span></a> : <span className={styles.caption}>{dataMode === "illustrative" ? "Illustrative source · no external link" : "Source link unavailable"}</span>}<SaveButton datasetSlug={d.slug} /></div>
        <p className={styles.caption}>Measures documentation completeness. It does not assess dataset quality or grant permission to use it.</p>
      </aside>
    </header>
    <PassportNav />
    <section id="overview" className={styles.section}>
      <div className={styles.sectionHeader}><span className={styles.sectionIndex}>01</span><div><h2>The record at a glance.</h2><p>Source metadata, organized for inspection. Unavailable fields remain visible.</p></div></div>
      <dl className={styles.stats}>{stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      {missing > 0 && <p className={styles.note}><strong>{missing} documentation {missing === 1 ? "check was" : "checks were"} not found.</strong> These are gaps in the available documentation. Open Evidence to see what was checked.</p>}
      {d.contentHash && <ContentHash hash={d.contentHash} />}
    </section>
    <section id="evidence" className={styles.section}>
      <div className={styles.sectionHeader}><span className={styles.sectionIndex}>02</span><div><h2>Evidence, with its context.</h2><p>Four perspectives on what the source documents. Open a section, then a check, to inspect the method and observation.</p></div></div>
      <div id="coverage" className={styles.subsection}><CoveragePanel d={d} /></div>
      <div id="license" className={styles.subsection}>
        <h3>Declared licence</h3><p>The identifier below preserves the source spelling. Lookup-derived terms are separate from the source’s own evidence.</p>
        <div className={styles.licenseGrid}>
          <div><p className={styles.licenseLabel}>Published identifier</p><p className={styles.licenseValue}>{d.license.spdx}</p><EvidenceDot label={d.license.label} /></div>
          <div><p className={styles.licenseLabel}>Static licence lookup</p><p className={styles.licenseValue}>{commercialUseLabel[d.license.commercialUse]}</p><p className={styles.caption}>A lookup of the declared identifier; review the source terms and any upstream restrictions.</p><div className={styles.licenseNotes}><span>Attribution requirement: {d.license.attribution === true ? "identified by lookup" : "not established here"}</span><span>Share-alike requirement: {d.license.shareAlike === true ? "identified by lookup" : "not established here"}</span></div></div>
        </div>
        {d.license.notes.length > 0 && <div className={styles.note}><strong>Notes attached to the record</strong><ul>{d.license.notes.map((note) => <li key={note}>{note}</li>)}</ul></div>}
      </div>
      <div id="lineage" className={styles.subsection}><h3>Recorded lineage</h3><p>Only nodes and connections supplied by this record appear below. Missing documentation is named separately.</p><LineageGraph lineage={d.lineage} /></div>
    </section>
    <section id="history" className={styles.section}>
      <div className={styles.sectionHeader}><span className={styles.sectionIndex}>03</span><div><h2>A record through time.</h2><p>Available observations, most recent first. Row changes appear only when measured; licence and schema comparisons require historical snapshots.</p></div></div>
      <div id="versions" className={styles.subsection}><VersionList versions={d.versions} /></div>
    </section>
    <section id="structure" className={styles.section}>
      <div className={styles.sectionHeader}><span className={styles.sectionIndex}>04</span><div><h2>Inside the dataset.</h2><p>Inspect documented fields and the preview rows available in this record.</p></div></div>
      <div id="schema" className={styles.subsection}><h3>Schema</h3>{d.schema.length ? <SchemaTable schema={d.schema} /> : <p className={styles.empty}>No schema fields are available in this record.</p>}</div>
      <div id="samples" className={styles.subsection}><h3>Preview records</h3>{d.sampleRecords.length ? <><p>{d.sampleRecords.length} preview {d.sampleRecords.length === 1 ? "row" : "rows"} supplied with this record{dataMode === "illustrative" ? " as illustrative examples" : ""}. This preview does not describe the distribution of the full dataset.</p><SampleRecords records={d.sampleRecords} /></> : <p className={styles.empty}>Preview rows are not available. Check the original source for supported previews and access terms.</p>}</div>
      <div id="integrate" className={styles.subsection}><h3>Use the original source</h3><p>Download and access instructions belong to the source platform. Archivum’s SDK and CLI are not available in this release.</p>{sourceUrl && <a className={styles.secondary} href={sourceUrl} rel="noopener noreferrer">Open source instructions ↗</a>}</div>
    </section>
    {related.length > 0 && <section className={styles.section}><div className={styles.sectionHeader}><span className={styles.sectionIndex}>↗</span><div><h2>Continue exploring.</h2><p>Other records with related catalog metadata. This does not imply derivation.</p></div></div><div className={styles.related}>{related.map((record) => <DatasetCard d={record} key={record.slug} />)}</div></section>}
  </article>;
}
