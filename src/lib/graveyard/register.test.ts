import { describe, expect, it } from 'vitest';
import { DELISTED_FIXTURE } from './fixture';
import { DELISTED_EXAMPLE_AS_OF, getPreservedRecords } from './provider';
import { observationAge, readRegisterState, safeSourceUrl, selectRecordPage } from './register';
import { computeCoverage } from '@/lib/coverage/rules';
import { decodeChecks } from './types';

describe('preserved record availability', () => {
  it('does not substitute fictional history in live mode', async () => {
    const result = await getPreservedRecords('supabase');
    expect(result.status).toBe('unavailable');
    expect(result).not.toHaveProperty('records');
  });
  it('marks explicit and local examples and uses a fixed example clock', async () => {
    for (const result of [await getPreservedRecords('supabase', true), await getPreservedRecords('mock')]) {
      expect(result.status).toBe('illustrative');
      if (result.status !== 'illustrative') throw new Error('Expected examples');
      expect(result.asOf).toBe(DELISTED_EXAMPLE_AS_OF);
      expect(result.records.every(record => record.publisher.startsWith('Example Research '))).toBe(true);
      expect(result.records.every(record => record.dependentModels === null && record.dependentPapers === null)).toBe(true);
    }
  });
  it('preserves the actual weighted coverage arithmetic in fixtures', () => {
    for (const record of DELISTED_FIXTURE.records) {
      expect(computeCoverage(decodeChecks(record.checksAtLastCheck)).total).toBe(record.coverageTotal);
    }
  });
});

describe('register and field shared state', () => {
  it('validates unsupported state, platform, page and view values', () => {
    expect(readRegisterState(new URLSearchParams('state=bad&platform=constructor&page=Infinity&view=bad'))).toEqual({ query: '', state: '', platform: '', page: 1, view: '', selected: '' });
  });
  it('paginates 24 records, newest first, without mutating the input', () => {
    const original = DELISTED_FIXTURE.records.map(record => record.slug);
    const first = selectRecordPage(DELISTED_FIXTURE.records, readRegisterState(new URLSearchParams()));
    const second = selectRecordPage(DELISTED_FIXTURE.records, readRegisterState(new URLSearchParams('page=2&view=register')));
    expect(first.records).toHaveLength(24);
    expect(second.records).toHaveLength(24);
    expect(first.records.some(record => second.records.includes(record))).toBe(false);
    expect(first.records.map(record => record.lastConfirmed)).toEqual(first.records.map(record => record.lastConfirmed).sort().reverse());
    expect(DELISTED_FIXTURE.records.map(record => record.slug)).toEqual(original);
  });
  it('clears selection when filters exclude the record, and clamps out-of-range pages', () => {
    const selected = DELISTED_FIXTURE.records[0];
    const result = selectRecordPage(DELISTED_FIXTURE.records, readRegisterState(new URLSearchParams(`q=nomatchingrecord&record=${selected.slug}&page=99`)));
    expect(result.total).toBe(0);
    expect(result.selected).toBe(null);
    expect(result.page).toBe(1);
  });
  it('intersects state/platform/search and keeps the same selection across views', () => {
    const record = DELISTED_FIXTURE.records[0];
    const params = new URLSearchParams({ q: record.name, state: record.endState, platform: record.platform, record: record.slug, view: 'field' });
    const field = selectRecordPage(DELISTED_FIXTURE.records, readRegisterState(params));
    params.set('view', 'register');
    expect(selectRecordPage(DELISTED_FIXTURE.records, readRegisterState(params))).toEqual(field);
    expect(field.selected?.slug).toBe(record.slug);
  });
  it('treats absent links and invalid dates as unavailable instead of invented facts', () => {
    expect(safeSourceUrl()).toBeUndefined();
    expect(safeSourceUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeSourceUrl('/datasets/guess')).toBeUndefined();
    expect(safeSourceUrl('https://example.com/source')).toBe('https://example.com/source');
    expect(observationAge('bad date', DELISTED_EXAMPLE_AS_OF)).toBeNull();
  });
});
