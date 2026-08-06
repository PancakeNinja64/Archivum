"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDatasets, getFacets } from "@/lib/api/client";
import type { DatasetFilters, DatasetSummary, Facets, Modality, Platform } from "@/lib/types";
import { fmtInt, fmtRelative, platformLabel, coverageColorVar, commercialUseLabel } from "@/lib/utils";
import { DatasetCard } from "../dataset/DatasetCard";
import { CardSkeleton, Skeleton } from "../ui/Skeleton";

type View = "grid" | "table";
type Sort = NonNullable<DatasetFilters["sort"]>;

function readFilters(sp: URLSearchParams): DatasetFilters & { view: View } {
  const list = (k: string) => sp.get(k)?.split(",").filter(Boolean) ?? [];
  return {
    query: sp.get("q") ?? undefined,
    platform: list("platform") as Platform[],
    modality: list("modality") as Modality[],
    domain: list("domain"),
    license: list("license"),
    commercialOnly: sp.get("commercial") === "1",
    minCoverage: Number(sp.get("min")) || 0,
    sort: (sp.get("sort") as Sort) || "coverage",
    view: (sp.get("view") as View) || "grid",
  };
}

export function ExploreClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const f = useMemo(() => readFilters(new URLSearchParams(sp.toString())), [sp]);

  const [rows, setRows] = useState<DatasetSummary[] | null>(null);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState(f.query ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setParam = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [sp, router, pathname]
  );

  const toggleList = (key: string, value: string, current: string[]) => {
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    setParam({ [key]: next.length ? next.join(",") : null });
  };

  useEffect(() => { getFacets().then(setFacets); }, []);
  useEffect(() => { setQ(f.query ?? ""); }, [f.query]);

  useEffect(() => {
    let live = true;
    setRows(null);
    getDatasets({ ...f, pageSize: 24 }).then((r) => {
      if (!live) return;
      setRows(r.items);
      setTotal(r.total);
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const onSearch = (v: string) => {
    setQ(v);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setParam({ q: v || null }), 250);
  };

  const activeChips: { label: string; clear: () => void }[] = [
    ...(f.query ? [{ label: `"${f.query}"`, clear: () => { setQ(""); setParam({ q: null }); } }] : []),
    ...(f.platform ?? []).map((p) => ({ label: platformLabel[p], clear: () => toggleList("platform", p, f.platform!) })),
    ...(f.modality ?? []).map((m) => ({ label: m, clear: () => toggleList("modality", m, f.modality!) })),
    ...(f.domain ?? []).map((d) => ({ label: d, clear: () => toggleList("domain", d, f.domain!) })),
    ...(f.license ?? []).map((l) => ({ label: l, clear: () => toggleList("license", l, f.license!) })),
    ...(f.commercialOnly ? [{ label: "commercial use permitted", clear: () => setParam({ commercial: null }) }] : []),
    ...(f.minCoverage ? [{ label: `coverage ≥ ${f.minCoverage}%`, clear: () => setParam({ min: null }) }] : []),
  ];

  const facetGroup = (
    title: string,
    key: string,
    items: { value: string; count: number }[] | undefined,
    selected: string[],
    render?: (v: string) => string
  ) => (
    <fieldset className="border-t border-border py-4 first:border-0">
      <legend className="pb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{title}</legend>
      {!items && <Skeleton className="h-16 w-full" />}
      <ul className="space-y-1.5">
        {items?.filter((it) => it.count > 0).map((it) => (
          <li key={it.value}>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/85 hover:text-foreground">
              <input
                type="checkbox"
                checked={selected.includes(it.value)}
                onChange={() => toggleList(key, it.value, selected)}
                className="h-3.5 w-3.5 accent-[var(--accent-strong)]"
              />
              <span className="flex-1">{render ? render(it.value) : it.value}</span>
              <span className="tnum font-mono text-[11px] text-muted-foreground">{it.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );

  const sidebar = (
    <div className="space-y-0">
      {facetGroup("Platform", "platform", facets?.platforms, f.platform ?? [], (v) => platformLabel[v])}
      {facetGroup("Modality", "modality", facets?.modalities, f.modality ?? [])}
      {facetGroup("Domain", "domain", facets?.domains, f.domain ?? [])}
      {facetGroup("License", "license", facets?.licenses, f.license ?? [])}
      <fieldset className="border-t border-border py-4">
        <legend className="pb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Documentation</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/85">
          <input
            type="checkbox"
            checked={!!f.commercialOnly}
            onChange={() => setParam({ commercial: f.commercialOnly ? null : "1" })}
            className="h-3.5 w-3.5 accent-[var(--accent-strong)]"
          />
          Commercial use permitted by licence
        </label>
        <div className="mt-4">
          <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>min coverage</span>
            <span className="tnum text-foreground">{f.minCoverage ?? 0}%</span>
          </div>
          <input
            type="range" min={0} max={95} step={5}
            value={f.minCoverage ?? 0}
            onChange={(e) => setParam({ min: e.target.value === "0" ? null : e.target.value })}
            className="mt-2 w-full accent-[var(--accent-strong)]"
            aria-label="Minimum Documentation Coverage"
          />
        </div>
      </fieldset>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 pt-28 md:px-8">
      <header className="max-w-2xl">
        <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-accent md:text-5xl">
          Explore the index.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Every dataset on one record: origin, licensing, lineage, and how much of it the source documents.
        </p>
      </header>

      <div className="mt-10 flex gap-10">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 lg:block" aria-label="Filters">
          {sidebar}
        </aside>

        {/* Drawer (mobile) */}
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <button aria-label="Close filters" className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
            <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-background p-6">
              <div className="flex items-center justify-between pb-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Filters</p>
                <button type="button" onClick={() => setDrawer(false)} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Search + controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0 text-muted-foreground">
                <circle cx="6" cy="6" r="4.4" stroke="currentColor" strokeWidth="1.4" />
                <path d="M9.5 9.5 12.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                value={q}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search datasets, publishers, domains…"
                aria-label="Search datasets"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="rounded-md border border-border px-3 py-2.5 text-sm text-foreground lg:hidden"
            >
              Filters{activeChips.length > 0 && ` · ${activeChips.length}`}
            </button>
            <select
              value={f.sort}
              onChange={(e) => setParam({ sort: e.target.value === "coverage" ? null : e.target.value })}
              aria-label="Sort results"
              className="rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
            >
              <option value="coverage">Documentation Coverage</option>
              <option value="recent">Recently updated</option>
              <option value="size">Size</option>
              <option value="name">Name</option>
            </select>
            <div className="flex overflow-hidden rounded-md border border-border" role="group" aria-label="View">
              {(["grid", "table"] as View[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={f.view === v}
                  onClick={() => setParam({ view: v === "grid" ? null : v })}
                  className={`px-3 py-2.5 font-mono text-[12px] ${f.view === v ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Active chips */}
          {activeChips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeChips.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={c.clear}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-[12px] text-foreground hover:border-accent-strong/50"
                >
                  {c.label}
                  <span aria-hidden>×</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setQ(""); router.replace(pathname, { scroll: false }); }}
                className="font-mono text-[12px] text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          )}

          <p className="tnum mt-5 font-mono text-[12px] text-muted-foreground" aria-live="polite">
            {rows === null ? "Searching…" : `${total} dataset${total === 1 ? "" : "s"}`}
          </p>

          {/* Results */}
          {f.view === "grid" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows === null && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              {rows?.map((d) => <DatasetCard key={d.slug} d={d} />)}
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-[10px] border border-border">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-left font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-4 py-3 font-normal">Dataset</th>
                    <th className="px-4 py-3 font-normal">Coverage</th>
                    <th className="px-4 py-3 font-normal">License</th>
                    <th className="px-4 py-3 font-normal">Commercial</th>
                    <th className="px-4 py-3 text-right font-normal">Rows</th>
                    <th className="px-4 py-3 text-right font-normal">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {rows === null &&
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-4 py-3" colSpan={6}><Skeleton className="h-4 w-full" /></td>
                      </tr>
                    ))}
                  {rows?.map((d) => (
                    <tr key={d.slug} className="border-b border-border last:border-0 hover:bg-accent-wash/50 dark:hover:bg-accent-wash">
                      <td className="px-4 py-3">
                        <Link href={`/datasets/${d.slug}/`} className="text-foreground hover:text-accent-strong dark:hover:text-accent">
                          {d.name}
                        </Link>
                        <p className="font-mono text-[11px] text-muted-foreground">{d.publisher}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="tnum font-mono" style={{ color: coverageColorVar(d.coverageTotal) }}>{d.coverageTotal}%</span>
                      </td>
                      <td className={`px-4 py-3 font-mono text-[12px] ${d.license.spdx === "Not stated" ? "text-asserted" : "text-foreground"}`}>{d.license.spdx}</td>
                      <td className="px-4 py-3 font-mono text-[12px]">
                        <span className={d.license.commercialUse === "permitted" ? "text-verified" : d.license.commercialUse === "not_stated" ? "text-asserted" : "text-risk"}>{commercialUseLabel[d.license.commercialUse]}</span>
                      </td>
                      <td className="tnum px-4 py-3 text-right font-mono text-[12px] text-muted-foreground">{fmtInt(d.sizeRows)}</td>
                      <td className="px-4 py-3 text-right font-mono text-[12px] text-muted-foreground">{fmtRelative(d.lastUpdated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {rows !== null && rows.length === 0 && (
            <div className="mt-6 rounded-[10px] border border-border bg-surface p-12 text-center">
              <p className="text-foreground">No datasets match these filters.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Broaden a filter or lower the minimum coverage — or{" "}
                <Link href="/publish/" className="link-underline text-accent-strong dark:text-accent">submit a dataset</Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
