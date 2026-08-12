import type { DecayResult } from '@/lib/graveyard/decay';

/**
 * The mechanic that makes the number trustworthy.
 *
 * A term with no observation behind it is shown, greyed, with the reason. It is
 * never hidden and never zero-filled: the absence IS the disclosure, and hiding
 * it would turn a partial measurement into an implied complete one.
 */
export function DecayComposition({ result }: { result: DecayResult }) {
  const segments = result.terms.filter((t) => t.available && t.contribution > 0);

  return (
    <div>
      <div
        className="flex h-2 w-full overflow-hidden bg-muted"
        role="img"
        aria-label={`Decay index ${result.index} composed of ${segments.length} terms`}
      >
        {segments.map((t, i) => (
          <span
            key={t.key}
            className="block h-full"
            style={{
              width: `${t.contribution}%`,
              backgroundColor: 'var(--foreground)',
              opacity: 0.25 + 0.2 * i,
            }}
          />
        ))}
      </div>

      <dl className="mt-4 space-y-2">
        {result.terms.map((t) => (
          <div key={t.key} className="flex items-baseline gap-3">
            <dt
              className={`flex-1 text-[13px] ${
                t.available ? 'text-foreground' : 'text-muted-foreground'
              }`}
              title={t.method}
            >
              {t.label}
            </dt>
            {t.available ? (
              <>
                <dd className="tnum shrink-0 font-mono text-[10px] text-muted-foreground">
                  {t.weight.toFixed(2)} × {(t.value ?? 0).toFixed(2)}
                </dd>
                <dd className="tnum w-12 shrink-0 text-right font-mono text-[12px] text-foreground">
                  {t.contribution.toFixed(1)}
                </dd>
              </>
            ) : (
              <dd className="shrink-0 font-mono text-[11px] text-muted-foreground">
                not yet measured
              </dd>
            )}
          </div>
        ))}
      </dl>

      <div className="mt-3 flex items-baseline gap-3 border-t border-border pt-3">
        <span className="flex-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Decay index
        </span>
        <span className="tnum font-mono text-[13px] text-foreground">
          {result.index.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
