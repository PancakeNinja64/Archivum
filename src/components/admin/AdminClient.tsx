"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { COVERAGE_CHECKS, COVERAGE_SECTIONS } from "@/lib/coverage/rules";
import type { CheckResult, CoverageSectionKey } from "@/lib/coverage/rules";
import { EvidenceDot } from "@/components/dataset/EvidenceDot";
import { coverageColorVar, fmtRelative } from "@/lib/utils";

type Row = {
  id: string; slug: string; name: string; publisher: string; platform: string;
  status: string; coverage_total: number; coverage_checked_at: string | null;
  license_spdx: string | null; coverage_detail: Record<string, CheckResult>;
  source_url: string;
};
type Run = {
  id: string; platform: string; source_identifier: string; status: string;
  error_message: string | null; triggered_by: string | null; started_at: string;
};
type Correction = {
  id: string; dataset_slug: string; field: string | null; message: string;
  submitter_email: string | null; status: string; created_at: string;
};

const SECTION_ORDER: CoverageSectionKey[] = ["origin", "licensing", "composition", "maintenance"];

export function AdminClient({ adminEmail }: { adminEmail: string }) {
  const [platform, setPlatform] = useState<"huggingface" | "github">("huggingface");
  const [identifier, setIdentifier] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const [seedRunning, setSeedRunning] = useState(false);
  const [seedLog, setSeedLog] = useState<string[]>([]);

  const [rows, setRows] = useState<Row[] | null>(null);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [corrections, setCorrections] = useState<Correction[] | null>(null);

  const reload = useCallback(async () => {
    // Drafts, runs, and corrections are invisible to the anon key by design —
    // all admin reads go through the service role behind /api/admin/overview.
    try {
      const res = await fetch("/api/admin/overview");
      if (!res.ok) return;
      const body = await res.json();
      setRows((body.datasets ?? []) as Row[]);
      setRuns((body.runs ?? []) as Run[]);
      setCorrections((body.corrections ?? []) as Correction[]);
    } catch {
      // leave the current state; the console shows stale data rather than crashing
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function importOne() {
    if (!identifier.trim()) return;
    setImporting(true); setImportResult(null);
    try {
      const res = await fetch("/api/admin/ingest", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, identifier: identifier.trim() }),
      });
      const body = await res.json();
      setImportResult(res.ok
        ? `${body.status}${body.slug ? ` — ${body.slug}` : ""}${typeof body.coverageTotal === "number" ? ` · coverage ${body.coverageTotal}%` : ""}${body.detail ? ` · ${body.detail}` : ""}`
        : body.error ?? body.detail ?? "Import failed.");
      await reload();
    } catch {
      setImportResult("Network error — the import may still have run. Check the log below.");
    } finally {
      setImporting(false);
    }
  }

  async function runSeed() {
    setSeedRunning(true); setSeedLog(["Starting seed run…"]);
    let offset = 0;
    try {
      for (let batch = 0; batch < 20; batch++) {
        const res = await fetch("/api/admin/ingest", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seed: true, offset }),
        });
        if (!res.ok) { setSeedLog((l) => [...l, `Batch failed (${res.status}) — stopping. Re-run to resume; completed imports are skipped automatically.`]); break; }
        const body = await res.json();
        const lines = (body.results ?? []).map((r: { identifier: string; status: string; coverageTotal?: number; detail?: string }) =>
          `${r.identifier}: ${r.status}${typeof r.coverageTotal === "number" ? ` (${r.coverageTotal}%)` : ""}${r.detail ? ` — ${r.detail}` : ""}`);
        setSeedLog((l) => [...l, ...lines]);
        offset = body.nextOffset ?? offset;
        if (body.done) { setSeedLog((l) => [...l, `Done — ${body.total} identifiers processed.`]); break; }
      }
    } catch {
      setSeedLog((l) => [...l, "Network error — re-run to resume. Completed imports are skipped automatically."]);
    } finally {
      setSeedRunning(false);
      await reload();
    }
  }

  async function setStatus(datasetId: string, status: string) {
    await fetch("/api/admin/publish", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datasetId, status }),
    });
    await reload();
  }

  async function resolveCorrection(id: string, status: "resolved" | "rejected") {
    await fetch("/api/admin/corrections", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correctionId: id, status }),
    });
    await reload();
  }

  const drafts = rows?.filter((r) => r.status === "draft") ?? [];
  const published = rows?.filter((r) => r.status !== "draft") ?? [];

  const checkRow = (r: Row) => (
    <div className="mt-4 grid gap-6 border-t border-border pt-4 md:grid-cols-2">
      {SECTION_ORDER.map((key) => (
        <div key={key}>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{COVERAGE_SECTIONS[key].label}</p>
          <ul className="mt-2 space-y-1">
            {COVERAGE_CHECKS.filter((c) => c.section === key).map((c) => {
              const result = r.coverage_detail?.[c.id] ?? "not_found";
              return (
                <li key={c.id} className="flex items-center justify-between gap-3 text-[13px]" title={c.method}>
                  <span className="text-muted-foreground">{c.label}</span>
                  {result === "n/a"
                    ? <span className="font-mono text-[11px] text-muted-foreground">n/a</span>
                    : <EvidenceDot label={result} />}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  const datasetRow = (r: Row, isDraft: boolean) => (
    <li key={r.id} className="rounded-[10px] border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground">{r.name} <span className="font-mono text-[11px] text-muted-foreground">· {r.publisher} · {r.platform}</span></p>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {r.slug} · {r.license_spdx ?? "licence not stated"} · checked {r.coverage_checked_at ? fmtRelative(r.coverage_checked_at) : "never"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="tnum font-mono text-sm" style={{ color: coverageColorVar(r.coverage_total) }}>{r.coverage_total}%</span>
          <button type="button" onClick={() => setOpenRow(openRow === r.id ? null : r.id)}
            className="rounded-md border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground">
            {openRow === r.id ? "hide checks" : "28 checks"}
          </button>
          <a href={r.source_url} rel="noopener noreferrer"
            className="rounded-md border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground">source</a>
          {isDraft ? (
            <button type="button" onClick={() => setStatus(r.id, "published")}
              className="rounded-md bg-accent-strong px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90">Publish</button>
          ) : (
            <>
              <Link href={`/datasets/${r.slug}/`} className="rounded-md border border-border px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground">view</Link>
              <button type="button" onClick={() => setStatus(r.id, r.status === "hidden" ? "published" : "hidden")}
                className="rounded-md border border-border-strong px-3 py-1.5 text-[12px] text-foreground hover:bg-muted">
                {r.status === "hidden" ? "Unhide" : "Hide"}
              </button>
            </>
          )}
        </div>
      </div>
      {openRow === r.id && checkRow(r)}
    </li>
  );

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-8">
      <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-accent">Admin</h1>
      <p className="mt-2 font-mono text-[12px] text-muted-foreground">{adminEmail}</p>

      {/* Import */}
      <section className="mt-10 rounded-[10px] border border-border bg-surface p-6">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Import a dataset</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <select value={platform} onChange={(e) => setPlatform(e.target.value as "huggingface" | "github")}
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground">
            <option value="huggingface">Hugging Face</option>
            <option value="github">GitHub</option>
          </select>
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)}
            placeholder="owner/name or a full URL"
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2.5 font-mono text-sm text-foreground" />
          <button type="button" onClick={importOne} disabled={importing || !identifier.trim()}
            className="rounded-md bg-accent-strong px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">
            {importing ? "Importing…" : "Import as draft"}
          </button>
        </div>
        {importResult && <p className="mt-3 font-mono text-[12px] text-muted-foreground">{importResult}</p>}

        <div className="mt-6 border-t border-border pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm text-foreground">Seed the catalog</h3>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Imports the 52 curated identifiers in batches. Safe to re-run — unchanged
                datasets are skipped, and gated or renamed sources are logged and passed over.
              </p>
            </div>
            <button type="button" onClick={runSeed} disabled={seedRunning}
              className="rounded-md border border-border-strong px-4 py-2.5 text-sm text-foreground hover:bg-muted disabled:opacity-50">
              {seedRunning ? "Running…" : "Run seed import"}
            </button>
          </div>
          {seedLog.length > 0 && (
            <pre className="mt-4 max-h-64 overflow-y-auto rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {seedLog.join("\n")}
            </pre>
          )}
        </div>
      </section>

      {/* Drafts */}
      <section className="mt-10">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Draft queue {drafts.length > 0 && `· ${drafts.length}`}
        </h2>
        {rows === null ? <p className="mt-3 text-sm text-muted-foreground">Loading…</p> :
          drafts.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No drafts waiting. Import something above.</p> :
          <ul className="mt-3 space-y-2">{drafts.map((r) => datasetRow(r, true))}</ul>}
      </section>

      {/* Published */}
      <section className="mt-10">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Catalog {published.length > 0 && `· ${published.length}`}
        </h2>
        {rows !== null && published.length > 0 &&
          <ul className="mt-3 space-y-2">{published.map((r) => datasetRow(r, false))}</ul>}
      </section>

      {/* Corrections */}
      <section className="mt-10">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Open corrections {corrections && corrections.length > 0 && `· ${corrections.length}`}
        </h2>
        {corrections === null ? null : corrections.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nothing open.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {corrections.map((c) => (
              <li key={c.id} className="rounded-[10px] border border-border bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-[12px] text-foreground">{c.dataset_slug}{c.field ? ` · ${c.field}` : ""}</p>
                  <span className="font-mono text-[11px] text-muted-foreground">{fmtRelative(c.created_at)}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.message}</p>
                {c.submitter_email && !c.submitter_email.startsWith("ip:") && (
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{c.submitter_email}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => resolveCorrection(c.id, "resolved")}
                    className="rounded-md border border-border-strong px-3 py-1.5 text-[12px] text-foreground hover:bg-muted">Mark resolved</button>
                  <button type="button" onClick={() => resolveCorrection(c.id, "rejected")}
                    className="rounded-md border border-border px-3 py-1.5 text-[12px] text-muted-foreground hover:text-foreground">Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Runs */}
      <section className="mt-10">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Last 50 runs</h2>
        {runs !== null && (
          <div className="mt-3 overflow-x-auto rounded-[10px] border border-border">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-4 py-2.5 font-normal">Identifier</th>
                  <th className="px-4 py-2.5 font-normal">Status</th>
                  <th className="px-4 py-2.5 font-normal">By</th>
                  <th className="px-4 py-2.5 font-normal">When</th>
                  <th className="px-4 py-2.5 font-normal">Note</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-mono text-[12px] text-foreground">{r.platform}:{r.source_identifier}</td>
                    <td className={`px-4 py-2.5 font-mono text-[12px] ${r.status === "completed" ? "text-verified" : r.status === "failed" ? "text-risk" : "text-asserted"}`}>{r.status}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{r.triggered_by ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{fmtRelative(r.started_at)}</td>
                    <td className="max-w-[280px] truncate px-4 py-2.5 text-[12px] text-muted-foreground" title={r.error_message ?? ""}>{r.error_message ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
