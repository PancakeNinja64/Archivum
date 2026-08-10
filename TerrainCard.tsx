import {
  END_STATE_LABEL,
  END_STATE_NOTE,
  END_STATE_TOKEN,
  lightAge,
  type DelistedRecord,
} from '@/lib/graveyard/types';

/**
 * Pinned hover readout.
 *
 * Fixed position, never following the cursor: a tooltip chasing a pointer
 * across a deforming surface is unreadable. The leader line back to the well is
 * drawn on the canvas.
 */
export function TerrainCard({ record }: { record: DelistedRecord }) {
  const age = lightAge(record.lastConfirmed);
  const deps =
    record.dependentModels !== null && record.dependentPapers !== null
      ? `${record.dependentModels} models · ${record.dependentPapers} papers`
      : null;

  const rows: [string, string, string | undefined][] = [
    ['END STATE', END_STATE_LABEL[record.endState], END_STATE_TOKEN[record.endState]],
    // Omitted entirely when unavailable. Never "unknown", never a placeholder.
    ...(deps ? ([['DEPENDENTS', deps, '--tier-asserted']] as [string, string, string][]) : []),
    ['LAST CONFIRMED', record.lastConfirmed, undefined],
    ['LIGHT AGE', `${age.toLocaleString()} d`, undefined],
    ['COVERAGE AT LAST CHECK', `${record.coverageTotal}% documented`, undefined],
  ];

  return (
    <div className="pointer-events-none w-[21rem] border border-border-strong bg-surface/95 p-5">
      <p className="font-mono text-[13px] text-foreground">{record.name}</p>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">{record.publisher}</p>
      <dl className="mt-4 space-y-1.5">
        {rows.map(([k, v, token]) => (
          <div key={k} className="flex items-baseline gap-3">
            <dt className="w-[9.5rem] shrink-0 font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
              {k}
            </dt>
            <dd
              className="tnum font-mono text-[10px]"
              style={{ color: token ? `var(${token})` : 'var(--muted-foreground)' }}
            >
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 border-t border-border pt-3 font-mono text-[9px] leading-relaxed text-muted-foreground">
        {END_STATE_NOTE[record.endState]}
      </p>
    </div>
  );
}
