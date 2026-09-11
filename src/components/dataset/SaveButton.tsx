"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./passport.module.css";

const live = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";
type Status = "loading" | "ready" | "signed-out" | "error";
async function responseError(response: Response, fallback: string) {
  try { const body = await response.json(); return typeof body.error === "string" ? body.error : fallback; }
  catch { return fallback; }
}
export function SaveButton({ datasetSlug }: { datasetSlug: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const loginUrl = `/login/?next=${encodeURIComponent(`/datasets/${datasetSlug}/`)}`;
  const readStatus = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/saved?slug=${encodeURIComponent(datasetSlug)}`, { credentials: "same-origin", signal });
      if (response.status === 401) { setStatus("signed-out"); return; }
      if (!response.ok) throw new Error(await responseError(response, "Saved status could not be loaded."));
      const body = await response.json();
      if (typeof body.saved !== "boolean") throw new Error("Saved status was not returned. Try again.");
      if (!signal?.aborted) { setSaved(body.saved); setStatus("ready"); setNotice(""); }
    } catch (error) {
      if (!signal?.aborted) { setStatus("error"); setNotice(error instanceof Error ? error.message : "Could not check saved status."); }
    }
  }, [datasetSlug]);
  useEffect(() => {
    if (!live) return;
    const controller = new AbortController();
    // Request subscription starts asynchronously; state follows the response.
    void Promise.resolve().then(() => { if (!controller.signal.aborted) return readStatus(controller.signal); });
    return () => controller.abort();
  }, [readStatus]);
  async function toggle() {
    if (!live) { setNotice("Saving is unavailable in this illustrative catalog."); return; }
    if (status === "signed-out") { router.push(loginUrl); return; }
    if (status === "error") { setStatus("loading"); void readStatus(); return; }
    if (status !== "ready" || busy) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/saved", { method: saved ? "DELETE" : "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: datasetSlug }) });
      if (response.status === 401) { router.push(loginUrl); return; }
      if (!response.ok) throw new Error(await responseError(response, "Your saved list could not be updated."));
      // Commit the visible state only after persistence succeeds.
      setSaved(!saved); setNotice(saved ? "Removed from your saved datasets." : "Added to your saved datasets.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Network error. Please try again."); }
    finally { setBusy(false); }
  }
  return <span className="inline-flex max-w-full flex-col items-start">
    <button type="button" className={styles.secondary} onClick={toggle} disabled={live && (busy || status === "loading")} aria-pressed={live && status === "ready" ? saved : undefined}>
      {busy ? "Saving…" : live && status === "loading" ? "Checking…" : live && status === "error" ? "Retry save" : saved ? "Saved ✓" : "Save"}
    </button>
    {notice && <span role="status" className="mt-2 max-w-[260px] text-[12px] leading-relaxed text-muted-foreground">{notice}</span>}
  </span>;
}
