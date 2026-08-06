"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

const live = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";

/** Sign-in / account control for the nav. Renders nothing in mock mode. */
export function AuthMenu({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!live) { setEmail(null); return; }
    const sb = supabaseBrowser();
    sb.auth.getUser().then(({ data }) => setEmail(data?.user?.email ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!live || email === undefined) return null;

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    window.location.href = "/";
  }

  if (variant === "mobile") {
    return email ? (
      <button type="button" onClick={signOut} className="rounded-md border border-border-strong px-5 py-3 text-sm text-foreground">
        Sign out
      </button>
    ) : (
      <Link href="/login/" className="rounded-md bg-accent-strong px-5 py-3 text-center text-sm font-medium text-white">
        Sign in
      </Link>
    );
  }

  return email ? (
    <button
      type="button"
      onClick={signOut}
      title={email}
      className="hidden rounded-md border border-border-strong px-3.5 py-2 text-[13px] text-foreground transition-all duration-200 hover:bg-muted sm:inline-flex"
    >
      Sign out
    </button>
  ) : (
    <Link
      href="/login/"
      className="hidden rounded-md bg-accent-strong px-3.5 py-2 text-[13px] font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 sm:inline-flex"
    >
      Sign in
    </Link>
  );
}
