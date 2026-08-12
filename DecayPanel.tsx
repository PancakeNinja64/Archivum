'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { EvidenceDot } from '@/components/dataset/EvidenceDot';
import { COVERAGE_CHECKS, COVERAGE_SECTIONS, type CoverageSectionKey } from '@/lib/coverage/rules';
import { DECAY_BAND_LABEL, decayBand, decayIndex, signalsNote } from '@/lib/graveyard/decay';
import {
  END_STATE_LABEL,
  END_STATE_NOTE,
  END_STATE_TOKEN,
  decodeChecks,
  lightAge,
  type DelistedRecord,
} from '@/lib/graveyard/types';
import { bandLabel, fmtDate, fmtInt } from '@/lib/utils';
import { DecayComposition } from './DecayComposition';

const SECTION_ORDER: CoverageSectionKey[] = [
  'origin',
  'licensing',
  'composition',
  'maintenance',
];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-[13px] text-foreground">{value}</dd>
    </div>
  );
}

/** Observation timeline. Four marks, one rule, no ornament. */
function Timeline({ record }: { record: DelistedRecord }) {
  const age = lightAge(record.lastConfirmed);
  const start = Date.parse(record.firstObserved);
  const end = Date.parse(record.lastConfirmed);
  const span = Math.max(1, Date.now() - start);
  const confirmedAt = Math.min(96, Math.max(4, ((end - start) / span) * 100));

  return (
    <div>
      <div className="relative h-px w-full bg-border">
        <span className="absolute -top-1 left-0 h-2 w-px bg-border-strong" />
        <span
          className="absolute -top-1.5 h-3 w-px"
          style={{ left: `${confirmedAt}%`, backgroundColor: 'var(--foreground)' }}
        />
        <span
          className="absolute -top-1 right-0 h-2 w-px"
          style={{ backgroundColor: `var(${END_STATE_TOKEN[record.endState]})` }}
        />
        <span
          className="absolute top-0 h-px"
          style={{
            left: `${confirmedAt}%`,
            right: 0,
            backgroundColor: `var(${END_STATE_TOKEN[record.endState]})`,
            opacity: 0.55,
          }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>First observed {fmtDate(record.firstObserved)}</span>
        <span>{fmtInt(age)} days unretrievable</span>
      </div>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
        Last confirmed {fmtDate(record.lastConfirmed)}
        {record.consecutiveFailures > 0
          ? ` · ${record.consecutiveFailures} consecutive failed probes since`
          : ''}
      </p>
    </div>
  );
}

export function DecayPanel({
  record,
  onClose,
}: {
  record: DelistedRecord;
  onClose: () => void;
}) {
  const result = decayIndex(record);
  const band = decayBand(result.index);
  const detail = decodeChecks(record.checksAtLastCheck);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <aside
      aria-label={`Decay record for ${record.name}`}
      className="flex h-full flex-col overflow-y-auto border border-border-strong bg-surface-elevated"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-6">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {record.publisher} · {record.platform}
          </p>
          <h2 className="mt-2 font-serif text-2xl leading-tight tracking-[-0.02em] text-foreground">
            {record.name}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to board
        </button>
      </div>

      <div className="border-b border-border p-6">
        <div className="flex items-end gap-4">
          <span className="tnum font-serif text-5xl leading-none text-foreground">
            {result.index.toFixed(1)}
          </span>
          <span className="pb-1 text-sm text-muted-foreground">{DECAY_BAND_LABEL[band]}</span>
        </div>
        <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
          {signalsNote(result)}
        </p>
      </div>

      <section className="border-b border-border p-6">
        <h3 className="pb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          How the index was computed
        </h3>
        <DecayComposition result={result} />
      </section>

      <section className="border-b border-border p-6">
        <h3 className="pb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Observation timeline
        </h3>
        <Timeline record={record} />
      </section>

      <section className="border-b border-border p-6">
        <h3 className="pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          End state
        </h3>
        <p
          className="font-mono text-[12px]"
          style={{ color: `var(${END_STATE_TOKEN[record.endState]})` }}
        >
          {END_STATE_LABEL[record.endState]}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {END_STATE_NOTE[record.endState]}
        </p>
        {record.supersededBy && (
          <Link
            href={`/delisted/?record=${record.supersededBy}`}
            scroll={false}
            className="mt-3 inline-block font-mono text-[11px] text-accent-deep underline underline-offset-4"
          >
            Successor: {record.supersededBy}
          </Link>
        )}
      </section>

      <section className="border-b border-border p-6">
        <h3 className="pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Record at last check
        </h3>
        <p className="pb-3 font-mono text-[10px] text-muted-foreground">
          As it stood on {fmtDate(record.lastConfirmed)}.
        </p>
        <dl>
          <Row label="Licence" value={record.license} />
          <Row
            label="Coverage"
            value={`${record.coverageTotal}% · ${bandLabel[record.coverageBand]}`}
          />
          <Row label="Versions" value={String(record.versions)} />
          <Row label="Rows" value={fmtInt(record.sizeRows)} />
        </dl>
      </section>

      <section className="border-b border-border p-6">
        <h3 className="pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Coverage at last check
        </h3>
        <p className="pb-4 font-mono text-[10px] text-muted-foreground">
          The 28 checks as they stood. Frozen — the source is gone, so there is nothing left to
          re-check.
        </p>
        <div className="space-y-4">
          {SECTION_ORDER.map((key) => (
            <div key={key}>
              <p className="pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {COVERAGE_SECTIONS[key].label}
              </p>
              <ul className="space-y-1.5 opacity-70">
                {COVERAGE_CHECKS.filter((c) => c.section === key).map((c) => {
                  const outcome = detail[c.id];
                  return (
                    <li key={c.id} className="flex items-baseline justify-between gap-3">
                      <span className="text-[12px] text-foreground">{c.label}</span>
                      {outcome === 'n/a' ? (
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                          n/a
                        </span>
                      ) : (
                        <EvidenceDot label={outcome} showLabel={false} className="shrink-0" />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-border p-6">
        <h3 className="pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Downstream references
        </h3>
        <div className="flex items-center gap-3">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
            <circle cx="6" cy="6" r="4" fill="none" stroke="var(--border-strong)" strokeWidth="1" />
          </svg>
          <p className="text-[13px] text-muted-foreground">
            Not yet measured. Archivum does not publish figures it has not observed.
          </p>
        </div>
      </section>

      <p className="p-6 font-mono text-[10px] leading-relaxed text-muted-foreground">
        Observed by Archivum · last successful check {fmtDate(record.lastConfirmed)} · index
        recomputed at render
      </p>
    </aside>
  );
}
