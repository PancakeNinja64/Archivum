'use client';

import { useMemo, useState } from 'react';
import { decayIndex } from '@/lib/graveyard/decay';
import {
  END_STATE_LABEL,
  END_STATE_TOKEN,
  lightAge,
  type DelistedRecord,
} from '@/lib/graveyard/types';
import { fmtDate, fmtInt } from '@/lib/utils';

type SortKey = 'name' | 'publisher' | 'endState' | 'lastConfirmed' | 'coverageTotal' | 'decay';

const COLUMNS: { key: SortKey; label: string; align?: 'right' }[] = [
  { key: 'name', label: 'Record' },
  { key: 'publisher', label: 'Publisher' },
  { key: 'endState', label: 'End state' },
  { key: 'lastConfirmed', label: 'Last confirmed' },
  { key: 'coverageTotal', label: 'Coverage', align: 'right' },
  { key: 'decay', label: 'Decay', align: 'right' },
];

/**
 * The board is an aria-hidden canvas, so this is the accessible and indexable
 * equivalent. It is not a fallback: sorting by decay is genuinely the faster way
 * to answer "what is worst", and the board is the faster way to see the shape.
 */
export function DelistedRegister({
  records,
  focusSlug,
  hovered,
  onHover,
  onSelect,
}: {
  records: DelistedRecord[];
  focusSlug: string | null;
  hovered: string | null;
  onHover: (slug: string | null) => void;
  onSelect: (slug: string) => void;
}) {
  const [sort, setSort] = useState<SortKey>('decay');
  const [desc, setDesc] = useState(true);

  const rows = useMemo(() => {
    const withDecay = records.map((r) => ({ record: r, decay: decayIndex(r).index }));
    withDecay.sort((a, b) => {
      let d = 0;
      if (sort === 'decay') d = a.decay - b.decay;
      else if (sort === 'coverageTotal') d = a.record.coverageTotal - b.record.coverageTotal;
      else if (sort === 'lastConfirmed')
        d = a.record.lastConfirmed.localeCompare(b.record.lastConfirmed);
      else d = String(a.record[sort]).localeCompare(String(b.record[sort]));
      return desc ? -d : d;
    });
    return withDecay;
  }, [records, sort, desc]);

  if (records.length === 0) {
    return (
      <p className="border border-border py-16 text-center font-mono text-[12px] text-muted-foreground">
        No delisted records match. Clear the search to see the full register.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Delisted records, sorted by {sort}. Every figure is the state at the final successful
          check. Decay index computed from 3 of 4 signals.
        </caption>
        <thead>
          <tr className="border-b border-border-strong">
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                scope="col"
                aria-sort={sort === c.key ? (desc ? 'descending' : 'ascending') : 'none'}
                className={`pb-2 ${c.align === 'right' ? 'text-right' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (sort === c.key) setDesc((v) => !v);
                    else {
                      setSort(c.key);
                      setDesc(c.key === 'decay' || c.key === 'coverageTotal');
                    }
                  }}
                  className={`font-mono text-[10px] uppercase tracking-[0.14em] transition-colors ${
                    sort === c.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {c.label}
                  {sort === c.key ? (desc ? ' ↓' : ' ↑') : ''}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ record, decay }) => {
            const age = lightAge(record.lastConfirmed);
            const on = hovered === record.slug || focusSlug === record.slug;
            return (
              <tr
                key={record.slug}
                onMouseEnter={() => onHover(record.slug)}
                onMouseLeave={() => onHover(null)}
                aria-current={focusSlug === record.slug ? 'true' : undefined}
                className={`border-b border-border transition-colors ${on ? 'bg-muted' : ''}`}
              >
                <td className="py-2.5 pr-4">
                  <button
                    type="button"
                    onClick={() => onSelect(record.slug)}
                    className="text-left text-[13px] text-foreground underline-offset-4 hover:underline"
                  >
                    {record.name}
                  </button>
                </td>
                <td className="py-2.5 pr-4 text-[13px] text-muted-foreground">{record.publisher}</td>
                <td className="py-2.5 pr-4">
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: `var(${END_STATE_TOKEN[record.endState]})` }}
                  >
                    {END_STATE_LABEL[record.endState]}
                  </span>
                </td>
                <td className="py-2.5 pr-4">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {fmtDate(record.lastConfirmed)}
                  </span>
                  <span className="tnum ml-2 font-mono text-[10px] text-muted-foreground">
                    {fmtInt(age)}d
                  </span>
                </td>
                <td className="tnum py-2.5 pr-4 text-right font-mono text-[12px] text-foreground">
                  {record.coverageTotal}%
                </td>
                <td className="tnum py-2.5 text-right font-mono text-[12px] text-foreground">
                  {decay.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="pt-3 font-mono text-[10px] text-muted-foreground">
        Decay index computed from 3 of 4 signals. Downstream references are not yet measured.
      </p>
    </div>
  );
}
