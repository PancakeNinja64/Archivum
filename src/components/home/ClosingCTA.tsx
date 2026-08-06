"use client";

import Link from "next/link";
import { useState } from "react";

export function ClosingCTA() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "error" | "done">("idle");

  const submit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setState("error"); return; }
    // TODO: point at form endpoint (static export cannot handle form posts itself).
    console.log("waitlist signup:", email);
    setState("done");
  };

  return (
    <section className="border-y border-border bg-accent-wash/60 py-24 dark:bg-accent-wash md:py-28">
      <div className="mx-auto max-w-2xl px-6 text-center md:px-8">
        {/* The arc resolves into a final documented node */}
        <svg viewBox="0 0 120 22" className="mx-auto h-5 w-28 text-accent" aria-hidden>
          <path d="M4 16 Q60 6 116 16" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.6" />
          <circle cx="60" cy="10.5" r="4.5" fill="var(--surface)" stroke="var(--tier-verified)" strokeWidth="1.5" />
          <circle cx="60" cy="10.5" r="2" fill="var(--tier-verified)" />
        </svg>
        <h2 className="mt-6 font-serif text-4xl leading-[1.1] tracking-[-0.03em] text-accent md:text-5xl">
          Know what your model learned from.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
          Archivum is in early access. Join the waitlist and help shape what gets
          indexed first.
        </p>

        {state === "done" ? (
          <p className="mt-8 font-mono text-sm text-verified">You&rsquo;re on the list.</p>
        ) : (
          <>
            <div className="mx-auto mt-8 flex max-w-sm gap-2">
              <input
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
              <button type="button" onClick={submit} className="rounded-md bg-accent-strong px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90">
                Join the waitlist
              </button>
            </div>
            {state === "error" && (
              <p className="mt-2 text-[13px] text-risk">That doesn&rsquo;t look like an email address. Check it and try again.</p>
            )}
          </>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Publishing a dataset?{" "}
          <Link href="/publish/" className="link-underline text-accent-strong dark:text-accent">Submit it →</Link>
        </p>
      </div>
    </section>
  );
}
