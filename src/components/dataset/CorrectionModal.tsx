"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./passport.module.css";

const live = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";
export function CorrectionModal({ datasetSlug, datasetName }: { datasetSlug: string; datasetName: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!open || !element) return;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element.close(); document.body.style.overflow = previousOverflow; };
  }, [open]);
  return <>
    <button type="button" onClick={() => { setOpen(true); setError(""); setState("idle"); }} className="inline-flex min-h-11 items-center text-[13px] text-muted-foreground underline decoration-border-strong underline-offset-4 hover:text-foreground">Suggest a correction</button>
    <dialog ref={dialog} aria-labelledby={titleId} onClose={() => setOpen(false)} className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%-40px)] max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 text-foreground shadow-2xl backdrop:bg-black/65 md:p-8">
      <h2 id={titleId} className="text-2xl font-medium tracking-tight">{state === "sent" ? "Correction received." : "Suggest a correction"}</h2>
      {state === "sent" ? <><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Your correction for {datasetName} was saved for review against the source record.</p><button type="button" className={`${styles.secondary} mt-6`} onClick={() => setOpen(false)}>Close</button></> : <>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Describe what should change in {datasetName}, and include a source link if available.</p>
        {!live && <p className="mt-4 rounded-lg border border-border p-4 text-sm leading-relaxed text-muted-foreground">Corrections are unavailable in this illustrative catalog. Nothing entered here will be submitted.</p>}
        <form className="mt-5 space-y-4" onSubmit={async (event) => {
          event.preventDefault(); if (!live || state === "sending") return;
          const form = new FormData(event.currentTarget);
          setState("sending"); setError("");
          try {
            const response = await fetch("/api/corrections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ datasetSlug, field: form.get("field") || undefined, message: form.get("message"), email: form.get("email") || undefined, website: form.get("website") }) });
            const body = await response.json();
            if (!response.ok || body.ok !== true) throw new Error(typeof body.error === "string" ? body.error : "The correction could not be saved. Please try again.");
            setState("sent");
          } catch (reason) { setError(reason instanceof Error ? reason.message : "The request failed. Please try again."); setState("idle"); }
        }}>
          <label className="block text-sm text-muted-foreground">Field (optional)<input name="field" maxLength={120} placeholder="e.g. licence, publisher, lineage" className="mt-2 w-full rounded-lg border border-border-strong bg-background px-3 py-3 text-foreground" /></label>
          <label className="block text-sm text-muted-foreground">What should change<textarea name="message" rows={4} required minLength={5} maxLength={4000} className="mt-2 w-full rounded-lg border border-border-strong bg-background px-3 py-3 text-foreground" /></label>
          <label className="block text-sm text-muted-foreground">Email for follow-up (optional)<input name="email" type="email" maxLength={200} className="mt-2 w-full rounded-lg border border-border-strong bg-background px-3 py-3 text-foreground" /></label>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          {error && <p role="alert" className="text-sm leading-relaxed text-risk">{error}</p>}
          <div className="flex flex-wrap gap-3 pt-2"><button type="submit" disabled={!live || state === "sending"} className={`${styles.secondary} disabled:opacity-50`}>{state === "sending" ? "Sending…" : "Submit correction"}</button><button type="button" className={styles.secondary} onClick={() => setOpen(false)}>Cancel</button></div>
        </form>
      </>}
    </dialog>
  </>;
}
