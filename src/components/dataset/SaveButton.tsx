"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const live = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    if (body?.error) return body.error;
  } catch {
    /* ignore */
  }
  return fallback;
}

/** Save / unsave a dataset via /api/saved (session-scoped; service role on the server). */
export function SaveButton({ datasetSlug }: { datasetSlug: string }) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/saved?slug=${encodeURIComponent(datasetSlug)}`, {
        credentials: "same-origin",
      });
      if (cancelled) return;
      if (res.status === 401) {
        setSignedIn(false);
        setSaved(false);
        return;
      }
      if (!res.ok) {
        setNotice(await readError(res, "Could not check whether this dataset is saved."));
        setSaved(false);
        return;
      }
      const body = (await res.json()) as { saved: boolean };
      setSignedIn(true);
      setSaved(Boolean(body.saved));
    })();
    return () => {
      cancelled = true;
    };
  }, [datasetSlug]);

  if (!live) {
    return (
      <Link href="/dashboard/" className="rounded-md border border-border-strong px-4 py-2.5 text-sm text-foreground hover:bg-surface">
        Save
      </Link>
    );
  }

  async function toggle() {
    if (!signedIn) {
      window.location.href = "/login/";
      return;
    }
    if (busy || saved === null) return;
    setNotice(null);
    setBusy(true);
    try {
      const res = await fetch("/api/saved", {
        method: saved ? "DELETE" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: datasetSlug }),
      });
      if (res.status === 401) {
        window.location.href = "/login/";
        return;
      }
      if (!res.ok) {
        setNotice(await readError(res, saved ? "Could not remove this dataset from your saved list." : "Could not save this dataset."));
        return;
      }
      setSaved(!saved);
    } catch {
      setNotice("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="relative inline-flex flex-col items-end">
      <button
        type="button"
        onClick={toggle}
        disabled={busy || saved === null}
        className="rounded-md border border-border-strong px-4 py-2.5 text-sm text-foreground hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saved === null ? "…" : busy ? "…" : saved ? "Saved ✓" : "Save"}
      </button>
      {notice && (
        <span role="alert" className="mt-1.5 max-w-[240px] text-right text-[12px] leading-snug text-risk">
          {notice}
        </span>
      )}
    </span>
  );
}
