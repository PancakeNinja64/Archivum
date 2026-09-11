"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getDataset } from "@/lib/api/client";
import type { Dataset, DatasetSummary } from "@/lib/types";
import { COVERAGE_SECTIONS } from "@/lib/coverage/rules";
import { BrandMark } from "@/components/brand/Brand";
import { NetworkField } from "@/components/spatial/NetworkField";
import styles from "./ArchiveHome.module.css";

const media = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const subscribe = (callback: () => void) => { const m = matchMedia(media); m.addEventListener("change", callback); return () => m.removeEventListener("change", callback); };
const date = (value: string | null | undefined) => value && !Number.isNaN(Date.parse(value)) ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value)) : "Not recorded";
const Arrow = () => <span aria-hidden>↗</span>;
const sections = Object.entries(COVERAGE_SECTIONS);

type Props = { featured: DatasetSummary[]; records: DatasetSummary[]; initialDataset: Dataset | null; catalogCount: number | null; platformCount: number | null; unavailable?: boolean };
export function ArchiveHome({ featured, records, initialDataset, catalogCount, platformCount, unavailable = false }: Props) {
  const cinematic = useSyncExternalStore(subscribe, () => matchMedia(media).matches, () => false);
  const demo = process.env.NEXT_PUBLIC_DATA_SOURCE !== "supabase";
  const stage = useRef<HTMLElement>(null);
  const [selectedSlug, setSelectedSlug] = useState(initialDataset?.slug ?? records[0]?.slug ?? "");
  const [dataset, setDataset] = useState<Dataset | null>(initialDataset);
  const [status, setStatus] = useState<"ready" | "loading" | "error">(initialDataset ? "ready" : "error");
  const [chapter, setChapter] = useState(0);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", p => setChapter(p < .25 ? 0 : p < .48 ? 1 : p < .8 ? 2 : 3));
  // Derive once in JavaScript so every layer shares the same section-relative clock.
  // Avoid native ViewTimeline interpolation diverging from the pinned transforms.
  const progress = useTransform(scrollYProgress, value => value);
  const introOpacity = useTransform(progress, [0, .17, .31], [1, 1, 0]);
  const introY = useTransform(progress, [0, .31], [0, -35]);
  const evidenceOpacity = useTransform(progress, [.25, .42], [0, 1]);
  const networkOpacity = useTransform(progress, [0, .35, .58], [1, 1, 0]);
  const networkScale = useTransform(progress, [0, .4, .6], [1, 1.16, .9]);
  const layersOpacity = useTransform(progress, [.38, .54], [0, 1]);
  const rotateX = useTransform(progress, [.48, .72, .94], [54, 54, 0]);
  const rotateZ = useTransform(progress, [.48, .72, .94], [-24, -24, 0]);
  const spread = useTransform(progress, [.48, .72, .94], [1, 1, 0]);
  const passportOpacity = useTransform(progress, [.76, .96], [0, 1]);
  const layerContentOpacity = useTransform(progress, [.74, .9], [1, 0]);
  const p0 = useTransform(spread, s => -142 * s);
  const p1 = useTransform(spread, s => -47 * s);
  const p2 = useTransform(spread, s => 47 * s);
  const p3 = useTransform(spread, s => 142 * s);
  const z = [p3, p2, p1, p0];
  const selected = records.find(r => r.slug === selectedSlug) ?? initialDataset;
  useEffect(() => {
    if (!selectedSlug || selectedSlug === initialDataset?.slug) return;
    let cancelled = false;
    getDataset(selectedSlug).then(data => { if (!cancelled) { setDataset(data); setStatus(data ? "ready" : "error"); } }).catch(() => { if (!cancelled) { setDataset(null); setStatus("error"); } });
    return () => { cancelled = true; };
  }, [selectedSlug, initialDataset?.slug]);
  const select = (slug: string) => {
    if (slug === selectedSlug) return;
    setSelectedSlug(slug);
    if (slug === initialDataset?.slug) { setDataset(initialDataset); setStatus("ready"); }
    else { setDataset(null); setStatus("loading"); }
  };
  const current = status === "ready" && dataset?.slug === selectedSlug ? dataset : null;
  const chapterTitles = ["The public field", "One record in focus", "Evidence, layer by layer", "Clarity at every level"];
  return <div className={styles.home}>
    <section className={styles.story} ref={stage} aria-label="From Atlas to a dataset passport">
      <div className={styles.stage}>
        <div className={styles.stageGrid} aria-hidden />
        <div className={styles.left}>
          <motion.div className={styles.intro} style={{ opacity: cinematic ? introOpacity : 1, y: cinematic ? introY : 0 }} inert={cinematic && chapter > 0} aria-hidden={cinematic && chapter > 0 ? true : undefined}>
            <p className={styles.eyebrow}><span className={styles.dot} />THE RECORD OF PUBLIC AI DATA</p>
            <h1>Know your data.<br /><span>Trace its story.</span></h1>
            <p className={styles.lead}>Explore public AI datasets through their origin, licensing, lineage, and documentation. One consistent record, with the evidence and the gaps in view.</p>
            <form action="/explore/" className={styles.search} role="search"><label className="sr-only" htmlFor="home-search">Search datasets</label><span aria-hidden>⌕</span><input id="home-search" type="search" name="q" placeholder="Search datasets, publishers, domains…" /><button type="submit" aria-label="Explore datasets">Explore <span aria-hidden>→</span></button></form>
            <div className={styles.heroLinks}>{initialDataset ? <Link href={`/datasets/${initialDataset.slug}/`}>Open an example <Arrow /></Link> : <Link href="/explore/">Open the catalog <Arrow /></Link>}<span>{demo ? "Example catalog" : "Public metadata"}</span></div>
            <div className={styles.stats}><div><strong>{catalogCount ?? "—"}</strong><span>{demo ? "example records" : "dataset records"}</span></div><div><strong>{platformCount ?? "—"}</strong><span>source platforms</span></div><p>One view.<br />Evidence in context.</p></div>
            {unavailable && <p className={styles.notice}>The catalog is temporarily unavailable. Explore can retry the connection.</p>}
          </motion.div>
          <motion.div className={styles.evidenceCopy} style={{ opacity: cinematic ? evidenceOpacity : 1 }} inert={cinematic && chapter === 0} aria-hidden={cinematic && chapter === 0 ? true : undefined}>
            <p className={styles.eyebrow}>FROM THE FIELD TO THE FACTS</p><h2>A dataset.<br /><span>Made legible.</span></h2>
            <p className={styles.lead}>A name is only the beginning. Unfold the source, the terms, the structure, and the record of change.</p>
            <label className={styles.selector}>Inspect a record<select value={selectedSlug} onChange={e => select(e.target.value)} disabled={!records.length}>{records.map(record => <option key={record.slug} value={record.slug}>{record.name}</option>)}</select></label>
            <p className={styles.selectionNote}>{demo ? "Illustrative example data" : "Catalog observation"} · {status === "loading" ? "Retrieving evidence…" : status === "error" ? "Evidence unavailable" : `Checked ${date(current?.coverageCheckedAt)}`}</p>
            {selectedSlug && <Link className={styles.textLink} href={`/datasets/${selectedSlug}/`}>Open the complete passport <Arrow /></Link>}
          </motion.div>
        </div>
        <div className={styles.scene}>
          <motion.div className={styles.network} style={{ opacity: cinematic ? networkOpacity : 1, scale: cinematic ? networkScale : 1 }} inert={cinematic && chapter >= 2} aria-hidden={cinematic && chapter >= 2 ? true : undefined}>
            <NetworkField records={records} selectedSlug={selectedSlug} onSelect={select} mode="hero" active={chapter < 2} />
          </motion.div>
          <motion.div className={styles.layerScene} style={{ opacity: cinematic ? layersOpacity : 1 }} aria-hidden={cinematic && chapter < 2 ? true : undefined}>
            <motion.div className={styles.plates} style={{ rotateX: cinematic ? rotateX : 0, rotateZ: cinematic ? rotateZ : 0 }}>
              {sections.map(([key, section], i) => {
                const evidence = current?.coverageSections.find(s => s.key === key);
                return <motion.div key={key} className={`${styles.plate} ${styles[`plate${i}`]}`} style={{ z: cinematic ? z[i] : 0 }}>
                  <motion.div className={styles.plateContent} style={{ opacity: cinematic ? layerContentOpacity : 1 }}><div><span>0{i + 1} / EVIDENCE LAYER</span><i aria-hidden /></div><h3>{section.label.split(" & ")[0]}</h3><p>{section.question}</p><div className={styles.layerScore}><strong>{evidence ? evidence.documented : "—"}</strong><span>{evidence ? `documented / ${evidence.applicable} applicable checks` : status === "loading" ? "Loading evidence" : "No evidence loaded"}</span></div></motion.div>
                </motion.div>;
              })}
              <motion.div className={styles.flatPassport} style={{ opacity: cinematic ? passportOpacity : 1, z: cinematic ? 1 : 0 }}>
                <div className={styles.passportKicker}><span>DATASET PASSPORT</span><span className={styles.passportBrand}>{demo ? "EXAMPLE" : "ARCHIVUM"}<BrandMark signal /></span></div>
                <h3>{selected?.name ?? "Dataset evidence"}</h3><p>{selected?.publisher ?? "Select a record to inspect"}</p>
                <div className={styles.passportFacts}><div><span>Published license</span><strong>{selected?.license.spdx || "Not stated"}</strong></div><div><span>Documentation coverage</span><strong>{current ? `${current.coverageTotal}%` : "—"}</strong></div></div>
                <div className={styles.passportSections}>{sections.map(([key, section]) => { const s = current?.coverageSections.find(s => s.key === key); return <div key={key}><span>{section.label}</span><div className={styles.coverageTrack}><i style={{ width: `${s?.score ?? 0}%` }} /></div><span>{s ? `${s.score}%` : "—"}</span></div>; })}</div>
                <div className={styles.passportFoot}><span>Checked {date(current?.coverageCheckedAt)}</span><span>28 checks / 4 layers</span></div>
              </motion.div>
            </motion.div>
            <p className={styles.sceneCaption}>{cinematic && chapter === 2 ? "Four lenses. One consistent record." : "Documentation coverage measures available evidence."}</p>
          </motion.div>
        </div>
        <div className={styles.stageFoot}><span>{demo ? "DEMO / ILLUSTRATIVE RECORDS" : "INDEX / PUBLIC METADATA"}</span><div className={styles.chapters} aria-hidden>{chapterTitles.map((title, i) => <span key={title} className={i === chapter ? styles.currentChapter : ""}><b>0{i + 1}</b><em>{title}</em></span>)}</div><span className={styles.scrollCue}>SCROLL TO UNFOLD ↓</span></div>
      </div>
    </section>
    <section className={styles.catalog}>
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>01 / THE CATALOG</p><h2>Find your next starting point.</h2></div><Link href="/explore/">Explore all datasets <Arrow /></Link></div>
      <div className={styles.catalogMeta}><span>{demo ? "Illustrative catalog · examples for exploring the interface" : "Selected catalog records · source metadata may change"}</span><span>DOCUMENTATION, IN CONTEXT</span></div>
      <div className={styles.recordList}>{featured.length ? featured.slice(0, 6).map((r, i) => <Link href={`/datasets/${r.slug}/`} key={r.slug} className={styles.record}><span className={styles.recordNumber}>0{i + 1}</span><div><h3>{r.name}</h3><p>{r.publisher} <span>· {r.domain.slice(0, 2).join(" / ")}</span></p></div><span className={styles.license}>{r.license.spdx}</span><div className={styles.coverage}><span>{r.coverageTotal}%</span><small>documentation</small></div><Arrow /></Link>) : <div className={styles.empty}><h3>No records to show yet.</h3><p>{unavailable ? "The catalog could not be reached." : "Published records will appear here."}</p><Link href="/explore/">Open catalog →</Link></div>}</div>
    </section>
    <section className={styles.delisted}>
      <div className={styles.archiveSculpture} aria-hidden><div className={styles.archiveRail} />{[0,1,2,3,4].map(i => <div key={i} className={styles.mineral} style={{ "--i": i } as React.CSSProperties}><span>ARCH / {String(i + 1).padStart(3, "0")}</span><i /><i /><i /><small>PRESERVED RECORD</small></div>)}<span className={styles.sculptureCaption}>DELISTED / AN ILLUSTRATIVE ARCHIVE</span></div>
      <div className={styles.delistedCopy}><p className={styles.eyebrow}>02 / DELISTED</p><h2>The source can change.<br /><span>The record still matters.</span></h2><p>See a dataset’s last confirmed state when a source becomes gated, withdrawn, superseded, or unreachable. Observations stay separate from explanations.</p><Link href="/delisted/">Explore the archive <Arrow /></Link><small>Historical records are currently an illustrative preview.</small></div>
    </section>
    <section className={styles.method} id="methodology"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>03 / A CLEARER METHOD</p><h2>Evidence has a language.</h2></div><Link href="/docs/#methodology">Read the methodology <Arrow /></Link></div><p className={styles.methodLead}>Every check describes what was available at the source. Coverage is a measure of documentation, separate from data quality and permission to use it.</p><div className={styles.evidenceTypes}>{[{ symbol:"●", title:"Documented", body:"Retrieved as a structured field or source artifact." }, {symbol:"◐", title:"Reported",body:"Stated by the publisher; not independently confirmed."}, {symbol:"○",title:"Not found",body:"Not present in the metadata when the record was checked."}, {symbol:"—",title:"Not applicable",body:"Excluded when a check does not apply to this source."}].map(item => <article key={item.title}><span aria-hidden>{item.symbol}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
    <section className={styles.closing}><div><p className={styles.eyebrow}>START WITH THE RECORD</p><h2>Context before commitment.</h2></div><Link href="/explore/">Explore datasets <span aria-hidden>→</span></Link></section>
  </div>;
}
