'use client';

import {
  END_STATE_LABEL,
  END_STATE_NOTE,
  END_STATE_TOKEN,
  daysSince,
  goneFor,
  type DelistedRecord,
} from '@/lib/graveyard/types';

function rows(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${Math.round(n / 1e6)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return String(n);
}

/**
 * The card, shown in place of the list rather than on another page.
 *
 * Switching between browsing and reading should not cost a navigation — the
 * terrain stays put and only this panel changes.
 */
export function RecordDetail({
  record,
  onBack,
}: {
  record: DelistedRecord;
  onBack: () => void;
}) {
  const deps =
    record.dependentModels !== null && record.dependentPapers !== null
      ? `${record.dependentModels} models · ${record.dependentPapers} papers`
      : null;

  const fields: [string, string, string | undefined][] = [
    ['End state', END_STATE_LABEL[record.endState], END_STATE_TOKEN[record.endState]],
    ['Last confirmed', record.lastConfirmed, undefined],
    ['Gone for', goneFor(record.lastConfirmed), undefined],
    ['Publisher', record.publisher, undefined],
    ['Platform', record.platform, undefined],
    ['Licence', record.license, undefined],
    ['Coverage at last check', `${record.coverageTotal}% documented`, undefined],
    ['Rows at last check', rows(record.sizeRows), undefined],
    ['Versions seen', String(record.versions), undefined],
    // Omitted entirely when unavailable — never "unknown", never a placeholder.
    ...(deps ? ([['Downstream', deps, '--tier-asserted']] as [string, string, string][]) : []),
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <button
          type="button"
          onClick={onBack}
          className="link-underline font-mono text-[11px] text-muted-foreground hover:text-foreground"
        >
          ← All records
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <p className="font-mono text-[15px] text-foreground">{record.name}</p>
        <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
          Last confirmed present {daysSince(record.lastConfirmed).toLocaleString()} days ago.
        </p>

        <dl className="mt-7 space-y-0 border-t border-border">
          {fields.map(([k, v, token]) => (
            <div key={k} className="flex items-baseline gap-4 border-b border-border py-2.5">
              <dt className="w-[10.5rem] shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {k}
              </dt>
              <dd
                className="tnum font-mono text-[11px]"
                style={{ color: token ? `var(${token})` : 'var(--foreground)' }}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>

        {record.supersededBy && (
          <p className="mt-5 font-mono text-[11px] text-muted-foreground">
            Publisher named a successor:{' '}
            <span className="text-accent">{record.supersededBy}</span>
          </p>
        )}

        <p className="mt-7 border-t border-border pt-4 font-mono text-[10px] leading-relaxed text-muted-foreground">
          {END_STATE_NOTE[record.endState]} This is the record as it stood at the final successful
          check. Archivum reports what was observed and makes no assessment of the publisher.
        </p>
      </div>
    </div>
  );
}
