"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getActivity, getWatchlist } from "@/lib/api/client";
import type { ActivityEvent, WatchedDataset } from "@/lib/types";
import { fmtRelative, scoreColorVar } from "@/lib/utils";
import { Skeleton } from "../ui/Skeleton";

function Sparkline({ points, w = 96, h = 28 }: { points: number[]; w?: number; h?: number }) {
  if (points.length < 2) return null;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * (w - 4) + 2} ${h - 4 - ((p - min) / span) * (h - 8)}`)
    .join(" ");
  const up = points[points.length - 1] >= points[0];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path d={d} fill="none" stroke={up ? "var(--tier-verified)" : "var(--risk)"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const sevColor: Record<ActivityEvent["severity"], string> = {
  info: "var(--tier-inferred)",
  warning: "var(--tier-asserted)",
  critical: "var(--risk)",
};

export function DashboardClient() {
  const [banner, setBanner] = useState(true);
  const [watch, setWatch] = useState<WatchedDataset[] | null>(null);
  const [events, setEvents] = useState<ActivityEvent[] | null>(null);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    getWatchlist().then(setWatch);
    getActivity().then(setEvents);
  }, []);

  const compliance = watch
    ? {
        ok: watch.filter((w) => w.licenseStatus === "ok").length,
        review: watch.filter((w) => w.licenseStatus !== "ok").length,
        avg: Math.round(watch.reduce((s, w) => s + w.trustScore, 0) / watch.length),
      }
    : null;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8">
      {banner && (
        <div className="mb-8 flex items-center justify-between gap-4 rounded-[10px] border border-accent-soft bg-accent-wash px-5 py-3.5">
          <p className="text-sm text-foreground">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-strong dark:text-accent">Demo view</span>
            <span className="ml-3 text-muted-foreground">Sample data. The live dashboard ships with Team plans — <Link href="/pricing/" className="link-underline text-accent-strong dark:text-accent">see pricing</Link>.</span>
          </p>
          <button type="button" onClick={() => setBanner(false)} aria-label="Dismiss demo notice" className="shrink-0 font-mono text-muted-foreground hover:text-foreground">×</button>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-accent md:text-5xl">Monitoring</h1>
          <p className="mt-3 text-base text-muted-foreground">Nine datasets watched. The scores don&rsquo;t sit still — that&rsquo;s the point.</p>
        </div>
        <button
          type="button"
          onClick={() => { setExported(true); setTimeout(() => setExported(false), 2000); }}
          className="rounded-md border border-border-strong px-4 py-2.5 font-mono text-[12px] text-foreground hover:bg-surface"
        >
          {exported ? "audit-report.pdf ✓ (demo)" : "Export audit report"}
        </button>
      </div>

      {/* Compliance summary */}
      <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-border bg-border sm:grid-cols-4">
        {compliance === null ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-surface p-5"><Skeleton className="h-10 w-full" /></div>)
        ) : (
          <>
            <div className="bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Watched</p>
              <p className="tnum mt-1.5 font-mono text-2xl text-foreground">{watch!.length}</p>
            </div>
            <div className="bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">License ok</p>
              <p className="tnum mt-1.5 font-mono text-2xl text-verified">{compliance.ok}</p>
            </div>
            <div className="bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Needs review</p>
              <p className="tnum mt-1.5 font-mono text-2xl text-asserted">{compliance.review}</p>
            </div>
            <div className="bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Avg trust</p>
              <p className="tnum mt-1.5 font-mono text-2xl" style={{ color: scoreColorVar(compliance.avg) }}>{compliance.avg}</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        {/* Watchlist */}
        <section aria-label="Watched datasets">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Watched datasets</h2>
          <div className="mt-3 overflow-x-auto rounded-[10px] border border-border">
            <table className="w-full min-w-[620px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-3 font-normal">Dataset</th>
                  <th className="px-4 py-3 font-normal">Trust</th>
                  <th className="px-4 py-3 font-normal">30d</th>
                  <th className="px-4 py-3 font-normal">90-day trend</th>
                  <th className="px-4 py-3 font-normal">License</th>
                </tr>
              </thead>
              <tbody>
                {watch === null &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0"><td colSpan={5} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>
                  ))}
                {watch?.map((w) => (
                  <tr key={w.slug} className="border-b border-border last:border-0 hover:bg-accent-wash/50 dark:hover:bg-accent-wash">
                    <td className="px-4 py-3">
                      <Link href={`/datasets/${w.slug}/`} className="text-foreground hover:text-accent-strong dark:hover:text-accent">{w.name}</Link>
                    </td>
                    <td className="tnum px-4 py-3 font-mono" style={{ color: scoreColorVar(w.trustScore) }}>{w.trustScore}</td>
                    <td className="tnum px-4 py-3 font-mono text-[12px]">
                      <span className={w.scoreDelta > 0 ? "text-verified" : w.scoreDelta < 0 ? "text-risk" : "text-muted-foreground"}>
                        {w.scoreDelta > 0 ? `+${w.scoreDelta}` : w.scoreDelta}
                      </span>
                    </td>
                    <td className="px-4 py-3"><Sparkline points={w.scoreHistory} /></td>
                    <td className="px-4 py-3 font-mono text-[12px]">
                      <span className={w.licenseStatus === "ok" ? "text-verified" : w.licenseStatus === "changed" ? "text-risk" : "text-asserted"}>
                        {w.licenseStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Alerts */}
        <section aria-label="Alerts">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Alerts</h2>
          <ul className="mt-3 space-y-2">
            {events === null &&
              Array.from({ length: 5 }).map((_, i) => <li key={i}><Skeleton className="h-16 w-full" /></li>)}
            {events?.map((e) => (
              <li key={e.id} className="rounded-[10px] border border-border bg-surface p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: sevColor[e.severity] }} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[13px] font-medium text-foreground">{e.datasetName}</p>
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{fmtRelative(e.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{e.message}</p>
                    <Link href={`/datasets/${e.datasetSlug}/`} className="link-underline mt-1.5 inline-block font-mono text-[11px] text-accent-strong dark:text-accent">
                      {e.datasetSlug} →
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
