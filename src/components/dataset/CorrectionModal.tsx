"use client";

import { useState } from "react";

/**
 * "Suggest a correction" — the public channel for publishers and users to
 * dispute or amend a record. Posts to /api/corrections; no account needed.
 */
export function CorrectionModal({ datasetSlug, datasetName }: { datasetSlug: string; datasetName: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [field, setField] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see it

  async function submit() {
    if (!message.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetSlug, field: field || undefined, message, email: email || undefined, website }),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setState("idle"); }}
        className="font-mono text-[12px] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
      >
        Suggest a correction
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label="Suggest a correction">
          <div className="w-full max-w-md rounded-[10px] border border-border bg-surface p-6">
            {state === "sent" ? (
              <>
                <h2 className="font-serif text-xl text-accent">Received</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Your correction for {datasetName} was submitted and will be reviewed against the source record.
                </p>
                <button type="button" onClick={() => setOpen(false)} className="mt-4 rounded-md border border-border-strong px-4 py-2 text-sm text-foreground hover:bg-muted">Close</button>
              </>
            ) : (
              <>
                <h2 className="font-serif text-xl text-accent">Suggest a correction</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Spotted something this record gets wrong about {datasetName}? Describe it and, if it helps, name the field.
                </p>
                <label className="mt-4 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Field (optional)
                  <input value={field} onChange={(e) => setField(e.target.value)} placeholder="e.g. licence, publisher, lineage"
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground" />
                </label>
                <label className="mt-3 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  What should change
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground" />
                </label>
                <label className="mt-3 block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Email for follow-up (optional)
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground" />
                </label>
                <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"
                  aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                {state === "error" && (
                  <p className="mt-3 text-sm text-risk">The submission did not go through. Wait a moment and try again.</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={submit} disabled={state === "sending" || !message.trim()}
                    className="rounded-md bg-accent-strong px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
                    {state === "sending" ? "Sending…" : "Submit"}
                  </button>
                  <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-border-strong px-4 py-2 text-sm text-foreground hover:bg-muted">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
