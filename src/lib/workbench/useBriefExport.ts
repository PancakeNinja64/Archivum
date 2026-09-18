'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { dataMode, getDataset } from '@/lib/api/client';
import type { Dataset } from '@/lib/types';
import { briefFilename, briefToJson, briefToMarkdown, buildBrief, downloadTextFile, type BriefScope, type BriefUnavailable } from './export';

export type ExportFormat = 'json' | 'md';

export interface ExportTarget {
  slug: string;
  name?: string;
  /** Pass the loaded record to skip a refetch. */
  record?: Dataset;
}

export interface ExportNotice { tone: 'ok' | 'warn' | 'error'; text: string }

/**
 * Resolves each target against the catalog, builds the brief, and hands the
 * file to the browser. Records that cannot be resolved are reported in the
 * brief and in the notice — the export never silently shrinks.
 */
export function useBriefExport() {
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [notice, setNotice] = useState<ExportNotice | null>(null);
  const mounted = useRef(false);
  // Set inside the effect so StrictMode's mount → unmount → mount cycle leaves it true.
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const run = useCallback(async (targets: readonly ExportTarget[], scope: BriefScope, format: ExportFormat) => {
    if (!targets.length) { setNotice({ tone: 'warn', text: 'Nothing to export yet.' }); return; }
    setBusy(format);
    setNotice(null);
    const settled = await Promise.allSettled(targets.map(async (target) => target.record ?? (await getDataset(target.slug))));
    if (!mounted.current) return;
    const records: Dataset[] = [];
    const unavailable: BriefUnavailable[] = [];
    settled.forEach((outcome, index) => {
      const target = targets[index];
      if (outcome.status === 'fulfilled' && outcome.value) records.push(outcome.value);
      else unavailable.push({ slug: target.slug, name: target.name, reason: outcome.status === 'rejected' ? `The catalog request failed${outcome.reason instanceof Error && outcome.reason.message ? ` (${outcome.reason.message})` : ''}.` : 'No record with this slug is in the catalog right now.' });
    });
    try {
      if (!records.length) throw new Error('None of the requested records could be loaded, so no brief was written.');
      const brief = buildBrief(records, unavailable, { origin: dataMode, scope, generatedAt: new Date().toISOString(), siteOrigin: window.location.origin });
      const content = format === 'json' ? briefToJson(brief) : briefToMarkdown(brief);
      downloadTextFile(briefFilename(brief, format), content, format === 'json' ? 'application/json' : 'text/markdown');
      const summary = `${records.length} ${records.length === 1 ? 'record' : 'records'}`;
      setNotice(unavailable.length
        ? { tone: 'warn', text: `Brief downloaded with ${summary}; ${unavailable.length} could not be loaded and ${unavailable.length === 1 ? 'is' : 'are'} listed as unavailable inside it.` }
        : { tone: 'ok', text: `${format === 'json' ? 'JSON' : 'Markdown'} brief downloaded · ${summary} · ${dataMode === 'illustrative' ? 'illustrative origin stated' : 'live catalog origin stated'}.` });
    } catch (error) {
      setNotice({ tone: 'error', text: error instanceof Error ? error.message : 'The brief could not be written.' });
    } finally {
      if (mounted.current) setBusy(null);
    }
  }, []);

  const clear = useCallback(() => setNotice(null), []);
  return { busy, notice, run, clear };
}
