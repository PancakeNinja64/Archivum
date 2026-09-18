import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ChronicleClient } from '@/components/chronicle/ChronicleClient';
import { getPreservedRecords } from '@/lib/api/client';
import { END_STATES, END_STATE_LABEL, type DelistedRecord, type EndState } from '@/lib/graveyard/types';
import { PLATFORM_LABELS, formatRecordDate, selectRecordPage, readRegisterState } from '@/lib/graveyard/register';
import type { Platform } from '@/lib/types';
import styles from '@/components/chronicle/Chronicle.module.css';

export const metadata: Metadata = {
  title: 'Delisted — The record outlives the source',
  description:
    'Inspect the last recorded state of public AI datasets. A considered archive of preserved provenance, documentation, and source observations.',
};

const PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

/** Plain-HTML register for browsers without JavaScript. Every value is escaped. */
function noscriptRegister(heading: string, records: DelistedRecord[]): string {
  const items = records
    .map(
      (record) =>
        `<details class="${styles.noscriptRecord}"><summary>${escapeHtml(record.name)} · ${escapeHtml(END_STATE_LABEL[record.endState])}</summary>` +
        `<p>${escapeHtml(record.publisher)} · Last confirmed ${escapeHtml(formatRecordDate(record.lastConfirmed))} · Declared licence: ${escapeHtml(record.license)} · Documentation coverage at last check: ${record.coverageTotal}%.</p></details>`,
    )
    .join('');
  return `<section class="${styles.noscriptSection}"><h2>${escapeHtml(heading)} — text register</h2><p>JavaScript is off. The records on this page remain available below.</p>${items}</section>`;
}

export default async function DelistedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') params.set(key, value);
  }

  const isDemo = params.get('demo') === '1';
  const data = await getPreservedRecords(
    process.env.NEXT_PUBLIC_DATA_SOURCE,
    isDemo,
  );

  if (!isDemo && data.status === 'unavailable') {
    redirect('/delisted/?demo=1');
  }

  const q = (params.get('q') ?? '').slice(0, 250);
  const stateParam = params.get('state') ?? '';
  const platformParam = params.get('platform') ?? '';
  const selectedParam = (params.get('record') ?? '').slice(0, 250);

  const initialEndState = END_STATES.includes(stateParam as EndState)
    ? (stateParam as EndState)
    : '';
  const initialPlatform = PLATFORMS.includes(platformParam as Platform)
    ? (platformParam as Platform)
    : '';

  const available = data.status === 'illustrative' || data.status === 'catalog';

  return (
    <>
      <ChronicleClient
        data={data}
        initialQuery={q}
        initialEndState={initialEndState}
        initialPlatform={initialPlatform}
        initialSelected={selectedParam}
        isDemo={isDemo}
      />
      {available && (
        /*
         * The no-JavaScript register is emitted as one pre-built string.
         * Rendered as elements, a page of records exceeds React's progressive
         * chunk size and is streamed as segments whose completion scripts
         * look up ids inside <noscript> — inert in a JS-enabled browser — and
         * throw. A single string cannot be segmented.
         */
        <noscript
          dangerouslySetInnerHTML={{
            __html: noscriptRegister(
              data.status === 'illustrative' ? 'Illustrative records' : 'Preserved records',
              selectRecordPage(data.records, readRegisterState(params)).records,
            ),
          }}
        />
      )}
    </>
  );
}
