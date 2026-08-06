"use client";

import { useState } from "react";

export function SampleRecords({ records }: { records: Record<string, unknown>[] }) {
  const [raw, setRaw] = useState(false);
  if (records.length === 0) return null;
  const cols = Object.keys(records[0]);
  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setRaw((v) => !v)}
          aria-pressed={raw}
          className="rounded-md border border-border px-3 py-1.5 font-mono text-[12px] text-muted-foreground hover:text-foreground"
        >
          {raw ? "table view" : "raw JSON"}
        </button>
      </div>
      {raw ? (
        <pre className="mt-3 overflow-x-auto rounded-[10px] border border-border bg-surface p-4 font-mono text-[12px] leading-relaxed text-foreground">
{JSON.stringify(records, null, 2)}
        </pre>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-[10px] border border-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {cols.map((c) => <th key={c} className="px-4 py-3 font-normal">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 align-top">
                  {cols.map((c) => (
                    <td key={c} className="max-w-[280px] truncate px-4 py-3 font-mono text-[12px] text-muted-foreground">
                      {r[c] === null || r[c] === undefined ? <span className="opacity-50">—</span> : typeof r[c] === "object" ? JSON.stringify(r[c]) : String(r[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
