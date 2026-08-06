"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { SAVED_DATASET_LIMIT } from "@/lib/config";

const live = process.env.NEXT_PUBLIC_DATA_SOURCE === "supabase";

/** Save / unsave a dataset. RLS restricts rows to the signed-in user. */
export function SaveButton({ datasetSlug }: { datasetSlug: string }) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!live) return;
    const sb = supabaseBrowser();
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth?.user) { setSaved(false); return; }
      setUserId(auth.user.id);
      const { data: d } = await sb.from("datasets").select("id").eq("slug", datasetSlug).maybeSingle();
      if (!d) { setSaved(false); return; }
      setDatasetId(d.id);
      const { data: row } = await sb.from("saved_datasets")
        .select("dataset_id").eq("user_id", auth.user.id).eq("dataset_id", d.id).maybeSingle();
      setSaved(Boolean(row));
    })();
  }, [datasetSlug]);

  if (!live) {
    return (
      <Link href="/dashboard/" className="rounded-md border border-border-strong px-4 py-2.5 text-sm text-foreground hover:bg-surface">
        Save
      </Link>
    );
  }

  async function toggle() {
    const sb = supabaseBrowser();
    if (!userId) { window.location.href = "/login/"; return; }
    if (!datasetId) return;
    setNotice(null);
    if (saved) {
      await sb.from("saved_datasets").delete().eq("user_id", userId).eq("dataset_id", datasetId);
      setSaved(false);
      return;
    }
    const { count } = await sb.from("saved_datasets")
      .select("dataset_id", { count: "exact", head: true }).eq("user_id", userId);
    if ((count ?? 0) >= SAVED_DATASET_LIMIT) {
      setNotice(`You have ${SAVED_DATASET_LIMIT} saved datasets — remove one to save this.`);
      return;
    }
    const { error } = await sb.from("saved_datasets").insert({ user_id: userId, dataset_id: datasetId });
    if (!error) setSaved(true);
  }

  return (
    <span className="relative inline-flex flex-col items-end">
      <button type="button" onClick={toggle}
        className="rounded-md border border-border-strong px-4 py-2.5 text-sm text-foreground hover:bg-surface">
        {saved === null ? "…" : saved ? "Saved ✓" : "Save"}
      </button>
      {notice && <span className="mt-1.5 max-w-[220px] text-right text-[12px] leading-snug text-muted-foreground">{notice}</span>}
    </span>
  );
}
