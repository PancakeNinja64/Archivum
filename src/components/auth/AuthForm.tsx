"use client";

import { useState } from "react";
import Link from "next/link";
import { safeReturnPath } from "@/lib/utils";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Mode = "login" | "signup" | "reset";

const copy: Record<Mode, { title: string; blurb: string; cta: string }> = {
  login: {
    title: "Sign in",
    blurb: "Saved datasets and change tracking, on the account you already made.",
    cta: "Sign in",
  },
  signup: {
    title: "Create an account",
    blurb: "Free. Save up to 50 datasets and follow how their documentation changes at the source.",
    cta: "Create account",
  },
  reset: {
    title: "Reset password",
    blurb: "Enter the email you signed up with and we'll send a reset link.",
    cta: "Send reset link",
  },
};

export function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (mode === "signup" && !acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy to create an account.");
      return;
    }
    setState("busy");
    try {
      const sb = supabaseBrowser();
      if (mode === "signup") {
        const { error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
        window.location.href = safeReturnPath(new URLSearchParams(window.location.search).get("next"));
      } else if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = safeReturnPath(new URLSearchParams(window.location.search).get("next"));
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login/`,
        });
        if (error) throw error;
        setState("done");
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setState("idle");
    }
  }

  const c = copy[mode];
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== "supabase") return (
    <div className="mx-auto max-w-md px-6 pb-24 pt-32">
      <p className="text-xs text-muted-foreground">ILLUSTRATIVE CATALOG</p>
      <h1 className="mt-4 text-4xl font-medium tracking-tight text-foreground">{c.title}</h1>
      <p className="mt-5 text-base leading-relaxed text-muted-foreground">Accounts are unavailable in this local demonstration. You can explore every sample dataset without signing in.</p>
      <Link href="/workspace/" className="mt-6 inline-flex min-h-11 items-center text-accent">Open the workspace →</Link>
    </div>
  );
  const canSubmit =
    state !== "busy" &&
    !!email &&
    (mode === "reset" || password.length >= 8) &&
    (mode !== "signup" || acceptedTerms);

  return (
    <div className="mx-auto max-w-md px-6 pb-24 pt-32 md:px-8">
      <h1 className="font-medium text-4xl leading-[1.08] tracking-[-0.03em] text-foreground">{c.title}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{c.blurb}</p>

      {state === "done" ? (
        <p className="mt-8 rounded-[10px] border border-border bg-surface p-5 text-sm leading-relaxed text-muted-foreground">
          If an account exists for {email}, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); if (canSubmit) void submit(); }}>
          <label className="block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Email
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email" required
              className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-sans text-sm text-foreground outline-none focus:border-accent-strong"
            />
          </label>
          {mode !== "reset" && (
            <label className="block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Password
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8}
                className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-sans text-sm text-foreground outline-none focus:border-accent-strong"
              />
            </label>
          )}
          {mode === "signup" && (
            <label className="flex items-start gap-3 text-[13px] leading-snug text-muted-foreground">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-[var(--accent-strong)]"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms/" className="link-underline text-foreground">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy/" className="link-underline text-foreground">Privacy Policy</Link>
                , and I understand the{" "}
                <Link href="/disclaimer/" className="link-underline text-foreground">Disclaimer</Link>
                {" "}(Archivum is not legal advice and does not grant dataset licences).
              </span>
            </label>
          )}
          {error && <p role="alert" className="text-sm leading-relaxed text-risk">{error}</p>}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-md bg-accent-strong px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === "busy" ? "…" : c.cta}
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[12px] text-muted-foreground">
        {mode !== "login" && <Link href="/login/" className="hover:text-foreground">Sign in</Link>}
        {mode !== "signup" && <Link href="/signup/" className="hover:text-foreground">Create an account</Link>}
        {mode !== "reset" && <Link href="/reset-password/" className="hover:text-foreground">Forgot password</Link>}
      </div>
      {mode === "signup" && (
        <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
          This form uses email and password sign-in. See how account information is handled in our{" "}
          <Link href="/privacy/" className="link-underline text-foreground">Privacy Policy</Link>.
        </p>
      )}
    </div>
  );
}
