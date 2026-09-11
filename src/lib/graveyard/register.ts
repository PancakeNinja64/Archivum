import type { Platform } from '@/lib/types';
import { END_STATES, type DelistedRecord, type EndState } from './types';

export const RECORDS_PER_PAGE = 24;
export const PLATFORM_LABELS: Record<Platform, string> = {
  huggingface: 'Hugging Face', kaggle: 'Kaggle', github: 'GitHub', academic: 'Academic', direct: 'Direct',
};
export interface RegisterState {
  query: string;
  state: EndState | '';
  platform: Platform | '';
  page: number;
  view: 'field' | 'register' | '';
  selected: string;
}
export function readRegisterState(params: URLSearchParams): RegisterState {
  const state = params.get('state') ?? params.get('endState') ?? '';
  const platform = params.get('platform') ?? '';
  const page = Number(params.get('page') ?? 1);
  const view = params.get('view');
  return {
    query: (params.get('q') ?? '').slice(0, 250),
    state: END_STATES.includes(state as EndState) ? state as EndState : '',
    platform: Object.hasOwn(PLATFORM_LABELS, platform) ? platform as Platform : '',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    view: view === 'field' || view === 'register' ? view : '',
    selected: (params.get('record') ?? '').slice(0, 250),
  };
}
export function selectRecordPage(records: DelistedRecord[], state: RegisterState) {
  const query = state.query.trim().toLowerCase();
  const filtered = records.filter(record =>
    (!query || `${record.name} ${record.publisher} ${record.license}`.toLowerCase().includes(query)) &&
    (!state.state || record.endState === state.state) &&
    (!state.platform || record.platform === state.platform),
  ).sort((a, b) => b.lastConfirmed.localeCompare(a.lastConfirmed) || a.slug.localeCompare(b.slug));
  const pages = Math.max(1, Math.ceil(filtered.length / RECORDS_PER_PAGE));
  const page = Math.min(state.page, pages);
  const shown = filtered.slice((page - 1) * RECORDS_PER_PAGE, page * RECORDS_PER_PAGE);
  return { records: shown, total: filtered.length, page, pages, selected: shown.find(record => record.slug === state.selected) ?? null };
}
export function formatRecordDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not recorded' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
}
export function observationAge(lastConfirmed: string, asOf: string): number | null {
  const elapsed = Date.parse(asOf) - Date.parse(lastConfirmed);
  return Number.isFinite(elapsed) ? Math.max(0, Math.floor(elapsed / 86_400_000)) : null;
}
export function safeSourceUrl(value?: string): string | undefined {
  if (!value) return;
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined; } catch { return; }
}
