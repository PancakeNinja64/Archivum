"use client";

import { useEffect, useRef, useState } from "react";

export function WaitlistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setState("idle");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      return;
    }
    // TODO: point at form endpoint (static export cannot handle form posts itself).
    console.log("waitlist signup:", email);
    setState("done");
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Join the waitlist"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={ref} className="w-full max-w-md rounded-[10px] border border-border bg-surface-elevated p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]">
        {state === "done" ? (
          <>
            <p className="font-serif text-2xl text-accent-strong dark:text-accent">You&rsquo;re on the list.</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We&rsquo;ll write when there is something worth reading — updates on the index and the methodology, nothing else.
            </p>
            <button type="button" onClick={onClose} className="mt-6 rounded-md border border-border-strong px-4 py-2 text-sm text-foreground hover:bg-muted">
              Close
            </button>
          </>
        ) : (
          <>
            <p className="font-serif text-2xl text-accent-strong dark:text-accent">Join the waitlist</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Archivum is in early access. Occasional updates on the index and the methodology — no sales email.
            </p>
            <div className="mt-5 flex gap-2">
              <input
                ref={inputRef}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                aria-label="Email address"
                aria-invalid={state === "error"}
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button type="button" onClick={submit} className="rounded-md bg-accent-strong px-4 py-2.5 text-sm font-medium text-white hover:opacity-90">
                Join
              </button>
            </div>
            {state === "error" && (
              <p className="mt-2 text-[13px] text-risk">That doesn&rsquo;t look like an email address. Check it and try again.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
