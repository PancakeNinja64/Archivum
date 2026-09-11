"use client";

import Link from "next/link";
import { useState } from "react";

/** Publishing has no submission endpoint. A local draft is useful without claiming receipt. */
export function PublishClient() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [license, setLicense] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const input = "mt-2 w-full rounded-lg border border-border-strong bg-background px-4 py-3 text-sm text-foreground";
  return <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-10">
    <header className="max-w-2xl"><p className="text-xs text-muted-foreground">FOR DATASET PUBLISHERS</p><h1 className="mt-5 text-4xl font-medium leading-tight tracking-[-.04em] text-foreground md:text-5xl">A clearer record starts<br />with the source.</h1><p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">Prepare the information behind your dataset. Public submission is not available yet; you can download a draft to keep or share with your team.</p></header>
    <div className="mt-12 grid items-start gap-12 lg:grid-cols-[1.3fr_1fr]">
      <form className="space-y-5 rounded-xl border border-border bg-surface p-6 md:p-8" onSubmit={(event) => {
        event.preventDefault();
        const draft = { status: "local-draft-not-submitted", name, sourceUrl: url, description, declaredLicense: license || "Not stated", provenanceNotes: notes };
        const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
        const anchor = document.createElement("a"); anchor.href = objectUrl; anchor.download = "archivum-dataset-draft.json"; document.body.appendChild(anchor); anchor.click(); anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000); setSaved(true);
      }}>
        <label className="block text-sm text-muted-foreground">Dataset name<input className={input} value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} required maxLength={200} /></label>
        <label className="block text-sm text-muted-foreground">Canonical source URL<input className={input} type="url" value={url} onChange={(event) => setUrl(event.target.value)} required placeholder="https://…" pattern="https?://.+" /></label>
        <label className="block text-sm text-muted-foreground">Source description<textarea className={input} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} required maxLength={6000} /></label>
        <label className="block text-sm text-muted-foreground">Declared licence<input className={input} value={license} onChange={(event) => setLicense(event.target.value)} placeholder="As written at the source, or Not stated" maxLength={200} /></label>
        <label className="block text-sm text-muted-foreground">Provenance notes and evidence links<textarea className={input} rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={8000} placeholder="Origin, processing, maintenance, and links to supporting documentation" /></label>
        <button type="submit" className="min-h-11 rounded-lg bg-accent-strong px-5 py-3 text-sm font-medium text-white">Download draft ↓</button>
        <p role="status" className="text-xs leading-relaxed text-muted-foreground">{saved ? "Draft download requested. Nothing has been submitted to Archivum." : "This form stays in your browser. It does not send or publish your information."}</p>
      </form>
      <aside className="lg:sticky lg:top-28"><p className="text-xs text-muted-foreground">THE PUBLISHER’S CHECKLIST</p><h2 className="mt-4 text-2xl font-medium tracking-tight text-foreground">Make the evidence easy to find.</h2><ol className="mt-8 divide-y divide-border border-y border-border">{[
        ["Origin", "Name the source and the organization responsible for the record."], ["Licensing", "Link to the applicable terms and document upstream restrictions."], ["Composition", "Describe what is included, the schema, and any preview limitations."], ["Maintenance", "Record revisions, update dates, and a way to report corrections."],
      ].map(([title, body], index) => <li className="flex gap-5 py-5" key={title}><span className="pt-1 font-mono text-xs text-muted-foreground">0{index + 1}</span><div><h3 className="text-sm font-medium text-foreground">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></div></li>)}</ol><p className="mt-5 text-sm leading-relaxed text-muted-foreground">Coverage is calculated from source observations. Preparing this draft does not assign a score or establish that a dataset has been checked.</p><Link href="/docs/#methodology" className="mt-4 inline-flex min-h-11 items-center text-sm text-accent">Read the methodology ↗</Link></aside>
    </div>
  </div>;
}
