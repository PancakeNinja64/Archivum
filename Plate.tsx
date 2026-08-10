import Link from 'next/link';
import {
  END_STATE_LABEL,
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
 * One plate: the record exactly as it stood at the final successful check.
 *
 * Nothing here is --foreground at full strength, because nothing here is
 * current. Body opacity falls with time since the last confirmed check, so
 * the grid fades as it goes further back.
 */
export function Plate({
  record,
  focused,
  onSelect,
}: {
  record: DelistedRecord;
  focused: boolean;
  onSelect?: (slug: string) => void;
}) {
  const age = daysSince(record.lastConfirmed);
  const fade = 0.3 + 0.55 * Math.max(0, 1 - age / 1400);
  const ageToken = age > 600 ? '--tier-asserted' : '--tier-inferred';

  const fields: [string, string][] = [
    ['LICENSE', record.license],
    ['COVERAGE', `${record.coverageTotal}% documented`],
    ['VERSIONS', String(record.versions)],
    ['ROWS', rows(record.sizeRows)],
    ['END STATE', END_STATE_LABEL[record.endState]],
  ];

  return (
    <article
      id={`record-${record.slug}`}
      onClick={onSelect ? () => onSelect(record.slug) : undefined}
      aria-current={focused ? 'true' : undefined}
      style={{ scrollMarginTop: '7rem' }}
      className={`relative bg-surface/55 p-7 transition-colors ${onSelect ? 'cursor-pointer hover:border-accent/60' : ''} ${
        focused ? 'border border-accent' : 'border border-border-strong/55'
      }`}
    >
      {/* Registration crosses, as on a photographic plate. */}
      {[
        ['left-3.5 top-3.5', ''],
        ['right-3.5 top-3.5', ''],
        ['left-3.5 bottom-3.5', ''],
        ['right-3.5 bottom-3.5', ''],
      ].map(([pos], i) => (
        <svg
          key={i}
          aria-hidden
          width="11"
          height="11"
          viewBox="0 0 11 11"
          className={`absolute ${pos} text-border-strong/70`}
        >
          <line x1="0" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1" />
          <line x1="5.5" y1="0" x2="5.5" y2="11" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}

      <p className="font-mono text-[14px]" style={{ color: `rgb(from var(--foreground) r g b / ${fade})` }}>
        {record.name}
      </p>
      <p className="mt-1.5 font-mono text-[10px]" style={{ opacity: fade * 0.85 }}>
        <span className="text-muted-foreground">{record.publisher}</span>
      </p>

      <dl className="mt-7 space-y-3">
        {fields.map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-4">
            <dt
              className="w-[5.5rem] shrink-0 font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground"
              style={{ opacity: fade * 0.6 }}
            >
              {k}
            </dt>
            <dd
              className="font-mono text-[10px] text-muted-foreground"
              style={{
                opacity: fade,
                color: k === 'END STATE' ? `var(${END_STATE_TOKEN[record.endState]})` : undefined,
              }}
            >
              {v}
            </dd>
          </div>
        ))}
      </dl>

      {record.supersededBy && (
        <Link
          href="/explore/"
          className="link-underline mt-5 inline-block font-mono text-[10px] text-accent"
        >
          → {record.supersededBy}
        </Link>
      )}

      <div className="mt-8 flex items-baseline justify-between border-t border-border-strong/50 pt-3.5">
        <span className="flex flex-col">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
            Last confirmed
          </span>
          <span className="tnum mt-0.5 font-mono text-[11px]" style={{ color: `var(${ageToken})` }}>
            {record.lastConfirmed}
          </span>
        </span>
        <span className="tnum font-mono text-[10px] text-muted-foreground">
          gone {goneFor(record.lastConfirmed)}
        </span>
      </div>
    </article>
  );
}
