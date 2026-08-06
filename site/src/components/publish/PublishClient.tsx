"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TierDot } from "../dataset/TierDot";
import { scoreColorVar } from "@/lib/utils";

const STEPS = ["Source", "Metadata", "Provenance", "Licensing", "Review"] as const;
const STAGES = ["source", "scrape", "clean", "annotate", "embed", "current"] as const;
const STAGE_LABELS: Record<(typeof STAGES)[number], string> = {
  source: "Original source",
  scrape: "Raw acquisition",
  clean: "Cleaning",
  annotate: "Annotation",
  embed: "Embedding",
  current: "Current version",
};

type Form = {
  url: string;
  platform: string;
  name: string;
  description: string;
  domain: string;
  modality: string;
  stages: Record<string, { documented: boolean; actor: string; note: string }>;
  license: string;
  commercial: "yes" | "no" | "unknown";
  attribution: boolean;
  contact: string;
};

const initial: Form = {
  url: "",
  platform: "huggingface",
  name: "",
  description: "",
  domain: "",
  modality: "text",
  stages: Object.fromEntries(STAGES.map((s) => [s, { documented: s === "current", actor: "", note: "" }])),
  license: "",
  commercial: "unknown",
  attribution: false,
  contact: "",
};

export function PublishClient() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setStage = (s: string, patch: Partial<Form["stages"][string]>) =>
    setForm((f) => ({ ...f, stages: { ...f.stages, [s]: { ...f.stages[s], ...patch } } }));

  const documentedCount = STAGES.filter((s) => form.stages[s].documented).length;
  const completeness = Math.round((documentedCount / STAGES.length) * 100);

  // Projected score: honest about what a submission alone can earn.
  const projected = useMemo(() => {
    let sourceT = 40; // asserted baseline
    if (form.url.trim()) sourceT += 25;
    if (documentedCount >= 4) sourceT += 20;
    const doc =
      30 +
      (form.description.trim().length > 80 ? 25 : form.description.trim().length > 20 ? 12 : 0) +
      (form.domain.trim() ? 10 : 0) +
      (form.name.trim() ? 10 : 0) +
      (completeness >= 80 ? 20 : completeness >= 50 ? 10 : 0);
    const community = 20; // new submission: no community signal yet
    const freshness = 70; // just submitted
    const composite = Math.round(
      (Math.min(sourceT, 95) * 35 + community * 25 + freshness * 20 + Math.min(doc, 95) * 20) / 100
    );
    return { composite, note: "Community verification starts at zero for new submissions and grows with independent use." };
  }, [form, documentedCount, completeness]);

  const validate = (s: number): string[] => {
    const e: string[] = [];
    if (s === 0) {
      if (!/^https?:\/\/.+\..+/.test(form.url.trim())) e.push("Enter the dataset's canonical URL (where it currently lives).");
    }
    if (s === 1) {
      if (form.name.trim().length < 3) e.push("Give the dataset a name (3+ characters).");
      if (form.description.trim().length < 20) e.push("Describe the dataset in at least 20 characters — this becomes its card.");
    }
    if (s === 3) {
      if (!form.license.trim()) e.push("Name the license, or write 'Unspecified' — an honest unknown scores better than a wrong claim.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact.trim())) e.push("A contact email is required so verification questions can reach you.");
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    setErrors(e);
    if (e.length === 0) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = () => {
    // TODO: point at form endpoint (static export cannot handle form posts itself).
    console.log("publish submission:", form);
    setDone(true);
  };

  const input = "w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground";
  const label = "block pb-1.5 text-[13px] text-muted-foreground";

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-6 pb-24 pt-36 text-center md:px-8">
        <svg viewBox="0 0 120 22" className="mx-auto h-5 w-28 text-accent" aria-hidden>
          <path d="M4 16 Q60 6 116 16" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
          <circle cx="60" cy="10.5" r="4.5" fill="var(--surface)" stroke="var(--tier-verified)" strokeWidth="1.5" />
          <circle cx="60" cy="10.5" r="2" fill="var(--tier-verified)" />
        </svg>
        <h1 className="mt-6 font-serif text-4xl tracking-[-0.03em] text-accent">Submitted for review.</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Your dataset enters the verification queue. Claims you documented will be
          checked against the source; anything unverifiable stays labeled{" "}
          <em>asserted</em> until it can be confirmed. You&rsquo;ll hear from us at{" "}
          <span className="font-mono text-foreground">{form.contact}</span>.
        </p>
        <Link href="/explore/" className="link-underline mt-8 inline-block text-accent-strong dark:text-accent">
          Back to the index →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-8">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-accent md:text-5xl">
          Publish a dataset.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Documented provenance is rewarded. The more of the chain you can show,
          the higher your dataset can score — and the preview on the right updates as you type.
        </p>
      </header>

      {/* Stepper */}
      <ol className="mt-10 flex flex-wrap gap-x-6 gap-y-2" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2 font-mono text-[12px]">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                i < step ? "border-accent bg-accent text-background" : i === step ? "border-accent text-accent-strong dark:text-accent" : "border-border text-muted-foreground"
              }`}
              aria-hidden
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={i === step ? "text-foreground" : "text-muted-foreground"} aria-current={i === step ? "step" : undefined}>{s}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-start">
        {/* Form */}
        <div className="rounded-[10px] border border-border bg-surface p-6 md:p-8">
          {errors.length > 0 && (
            <div className="mb-5 rounded-md border border-risk/40 bg-risk/5 p-4" role="alert">
              {errors.map((e) => (
                <p key={e} className="text-[13px] leading-relaxed text-risk">{e}</p>
              ))}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="url" className={label}>Where does the dataset live?</label>
                <input id="url" className={input} placeholder="https://huggingface.co/datasets/…" value={form.url} onChange={(e) => set("url", e.target.value)} />
              </div>
              <div>
                <label htmlFor="platform" className={label}>Platform</label>
                <select id="platform" className={input} value={form.platform} onChange={(e) => set("platform", e.target.value)}>
                  <option value="huggingface">Hugging Face</option>
                  <option value="kaggle">Kaggle</option>
                  <option value="github">GitHub</option>
                  <option value="academic">Academic repository</option>
                  <option value="direct">Direct hosting</option>
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className={label}>Dataset name</label>
                <input id="name" className={input} placeholder="Clinical Notes Corpus" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <label htmlFor="desc" className={label}>Description <span className="opacity-70">(this becomes the card in the index)</span></label>
                <textarea id="desc" rows={4} className={input} placeholder="What is in it, how it was collected, what it's good for…" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="domain" className={label}>Domain</label>
                  <input id="domain" className={input} placeholder="medical, legal, finance…" value={form.domain} onChange={(e) => set("domain", e.target.value)} />
                </div>
                <div>
                  <label htmlFor="modality" className={label}>Modality</label>
                  <select id="modality" className={input} value={form.modality} onChange={(e) => set("modality", e.target.value)}>
                    <option>text</option><option>image</option><option>audio</option><option>tabular</option><option>multimodal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Which stages of the chain can you document? Unchecked stages appear
                as gaps on your public lineage graph — visible, not hidden.
              </p>
              {STAGES.map((s) => (
                <div key={s} className={`rounded-md border p-4 ${form.stages[s].documented ? "border-border" : "border-dashed border-border"}`}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={form.stages[s].documented}
                      onChange={(e) => setStage(s, { documented: e.target.checked })}
                      className="h-3.5 w-3.5 accent-[var(--accent-strong)]"
                    />
                    {STAGE_LABELS[s]}
                  </label>
                  {form.stages[s].documented && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input aria-label={`${STAGE_LABELS[s]} actor`} className={input} placeholder="Who did this? (person, team, tool)" value={form.stages[s].actor} onChange={(e) => setStage(s, { actor: e.target.value })} />
                      <input aria-label={`${STAGE_LABELS[s]} note`} className={input} placeholder="One line on what happened" value={form.stages[s].note} onChange={(e) => setStage(s, { note: e.target.value })} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="license" className={label}>License (SPDX identifier if it has one)</label>
                <input id="license" className={input} placeholder="CC-BY-4.0, MIT, Unspecified…" value={form.license} onChange={(e) => set("license", e.target.value)} />
              </div>
              <fieldset>
                <legend className={label}>Commercial use</legend>
                <div className="flex gap-2">
                  {(["yes", "no", "unknown"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set("commercial", v)}
                      aria-pressed={form.commercial === v}
                      className={`rounded-md border px-3.5 py-2 font-mono text-[12px] ${form.commercial === v ? "border-accent-strong text-accent-strong dark:text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
                    >
                      {v === "yes" ? "allowed" : v === "no" ? "not allowed" : "unknown"}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
                <input type="checkbox" checked={form.attribution} onChange={(e) => set("attribution", e.target.checked)} className="h-3.5 w-3.5 accent-[var(--accent-strong)]" />
                Attribution required
              </label>
              <div>
                <label htmlFor="contact" className={label}>Contact email for verification</label>
                <input id="contact" type="email" className={input} placeholder="you@lab.edu" value={form.contact} onChange={(e) => set("contact", e.target.value)} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Everything below is submitted as <em>asserted</em>. Archivum then
                verifies what it can against the source; verified claims are what
                raise the score from here.
              </p>
              <dl className="divide-y divide-border border-y border-border text-sm">
                {(
                  [
                    ["URL", form.url || "—"],
                    ["Name", form.name || "—"],
                    ["Domain / modality", `${form.domain || "—"} / ${form.modality}`],
                    ["Lineage documented", `${documentedCount} of ${STAGES.length} stages (${completeness}%)`],
                    ["License", form.license || "—"],
                    ["Commercial use", form.commercial],
                    ["Contact", form.contact || "—"],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-2.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-mono text-[13px] text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => { setErrors([]); setStep((s) => Math.max(0, s - 1)); }}
              disabled={step === 0}
              className="rounded-md border border-border-strong px-4 py-2.5 text-sm text-foreground disabled:opacity-40"
            >
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="rounded-md bg-accent-strong px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
                Continue
              </button>
            ) : (
              <button type="button" onClick={submit} className="rounded-md bg-accent-strong px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
                Submit for review
              </button>
            )}
          </div>
        </div>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Live preview</span>
              <TierDot tier="asserted" />
            </div>
            <div className="p-5">
              <p className="truncate font-mono text-[11px] text-muted-foreground">{form.contact ? form.contact.split("@")[1] : "your-org"} · {form.platform}</p>
              <h3 className="mt-1.5 text-lg font-medium text-foreground">{form.name || "Untitled dataset"}</h3>
              <p className="mt-1.5 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-muted-foreground">
                {form.description || "The description you write in step 2 appears here."}
              </p>

              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Lineage · {completeness}% documented</p>
              <svg viewBox="0 0 300 46" className="mt-1 h-11 w-full" aria-hidden>
                <path d="M8 32 Q150 16 292 32" fill="none" stroke="var(--accent)" strokeWidth="1.25" opacity="0.5" />
                {STAGES.map((s, i) => {
                  const x = 8 + (284 / 5) * i;
                  const y = 32 - Math.sin((i / 5) * Math.PI) * 8;
                  const doc = form.stages[s].documented;
                  return (
                    <circle key={s} cx={x} cy={y} r="4.5"
                      fill={doc ? "var(--surface)" : "transparent"}
                      stroke={doc ? "var(--accent)" : "var(--risk)"}
                      strokeWidth="1.4"
                      strokeDasharray={doc ? undefined : "2.5 2.5"} />
                  );
                })}
              </svg>

              <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Projected starting score</p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{projected.note}</p>
                </div>
                <span className="tnum font-mono text-4xl" style={{ color: scoreColorVar(projected.composite) }}>{projected.composite}</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
            Submissions are reviewed before listing. False provenance claims, once
            caught, are annotated publicly on the dataset record.
          </p>
        </aside>
      </div>
    </div>
  );
}
