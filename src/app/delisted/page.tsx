import type { Metadata } from 'next';
import { DelistedClient } from '@/components/graveyard/DelistedClient';
import { getPreservedRecords } from '@/lib/api/client';
import { readRegisterState, selectRecordPage, formatRecordDate } from '@/lib/graveyard/register';
import { END_STATE_LABEL } from '@/lib/graveyard/types';

export const metadata: Metadata = {
  title: 'Delisted — The record outlives the source',
  description: 'Inspect the last recorded state of public AI datasets. A considered archive of preserved provenance, documentation, and source observations.',
};

export default async function DelistedPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) { if (typeof value === 'string') params.set(key, value); }
  const data = await getPreservedRecords(process.env.NEXT_PUBLIC_DATA_SOURCE, params.get('demo') === '1');
  const initialState = readRegisterState(params);
  const available = data.status === 'illustrative' || data.status === 'catalog';
  return <><DelistedClient data={data} initialState={initialState} />{available && <noscript><section style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}><h2>{data.status === 'illustrative' ? 'Illustrative records' : 'Preserved records'} — text register</h2><p>JavaScript is off. The records on this page remain available below.</p>{selectRecordPage(data.records, initialState).records.map(record => <details key={record.slug} style={{ paddingBlock: '16px', borderBottom: '1px solid var(--border)' }}><summary>{record.name} · {END_STATE_LABEL[record.endState]}</summary><p>{record.publisher} · Last confirmed {formatRecordDate(record.lastConfirmed)} · Declared licence: {record.license} · Documentation coverage at last check: {record.coverageTotal}%.</p></details>)}</section></noscript>}</>;
}
