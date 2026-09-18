import { describe, expect, it } from 'vitest';
import {
  compareHref, isSlug, parseCompareSlugs, parseWorkspaceQuery, patchWorkspaceQuery, recordHref,
  resultsKey, serializeWorkspaceQuery, toFilters, workspaceHref, EMPTY_WORKSPACE_QUERY, WORKSPACE_PAGE_SIZE,
} from './query';

describe('workspace URL contract', () => {
  it('reads a full desk state from a shared link', () => {
    const query = parseWorkspaceQuery(new URLSearchParams('q=clinical&dataset=Clinical-Notes-Deid&platform=huggingface,github&domain=medical,nlp&modality=text,image&license=CC-BY-4.0,Not+stated&commercial=1&min=75&sort=recent&page=2&tab=evidence'));
    expect(query).toEqual({
      q: 'clinical', dataset: 'clinical-notes-deid', platform: ['huggingface', 'github'], domain: ['medical', 'nlp'],
      modality: ['text', 'image'], license: ['CC-BY-4.0', 'Not stated'], commercial: true,
      min: 75, sort: 'recent', page: 2, tab: 'evidence',
    });
    expect(toFilters(query)).toEqual({ query: 'clinical', platform: ['huggingface', 'github'], domain: ['medical', 'nlp'], modality: ['text', 'image'], license: ['CC-BY-4.0', 'Not stated'], commercialOnly: true, minCoverage: 75, sort: 'recent', page: 2, pageSize: WORKSPACE_PAGE_SIZE });
  });

  it('refuses malformed values instead of forwarding them to the adapter', () => {
    const query = parseWorkspaceQuery(new URLSearchParams('dataset=../etc/passwd&platform=garbage,kaggle,kaggle&modality=video,audio&commercial=yes&min=Infinity&sort=drop&page=-4&tab=nope'));
    expect(query.dataset).toBeNull();
    expect(query.platform).toEqual(['kaggle']);
    expect(query.modality).toEqual(['audio']);
    expect(query.commercial).toBe(false);
    expect(query.min).toBe(0);
    expect(query.sort).toBe('coverage');
    expect(query.page).toBe(1);
    expect(query.tab).toBe('overview');
    expect(parseWorkspaceQuery(new URLSearchParams('min=140&page=3.9')).min).toBe(100);
    expect(parseWorkspaceQuery(new URLSearchParams('min=140&page=3.9')).page).toBe(3);
    expect(toFilters(EMPTY_WORKSPACE_QUERY)).toEqual({ query: undefined, platform: undefined, domain: undefined, modality: undefined, license: undefined, commercialOnly: undefined, minCoverage: undefined, sort: 'coverage', page: 1, pageSize: WORKSPACE_PAGE_SIZE });
  });

  it('round-trips through serialisation without defaults leaking into links', () => {
    const query = parseWorkspaceQuery(new URLSearchParams('q=wiki&license=CC-BY-4.0,MIT&commercial=1&dataset=wiki-qa-multilingual&tab=history&sort=coverage&page=1'));
    const serialized = serializeWorkspaceQuery(query);
    expect(serialized).toBe('q=wiki&license=CC-BY-4.0%2CMIT&commercial=1&dataset=wiki-qa-multilingual&tab=history');
    expect(parseWorkspaceQuery(new URLSearchParams(serialized))).toEqual(query);
    expect(serializeWorkspaceQuery(EMPTY_WORKSPACE_QUERY)).toBe('');
    // A tab without a record is meaningless and is not written.
    expect(serializeWorkspaceQuery({ ...EMPTY_WORKSPACE_QUERY, tab: 'evidence' })).toBe('');
  });

  it('resets the page when the result set changes and keeps it otherwise', () => {
    const base = parseWorkspaceQuery(new URLSearchParams('q=a&page=4&dataset=biomed-abstracts-open&tab=structure'));
    expect(patchWorkspaceQuery(base, { q: 'b' }).page).toBe(1);
    expect(patchWorkspaceQuery(base, { platform: ['github'] }).page).toBe(1);
    expect(patchWorkspaceQuery(base, { license: ['MIT'] }).page).toBe(1);
    expect(patchWorkspaceQuery(base, { commercial: true }).page).toBe(1);
    expect(patchWorkspaceQuery(base, { dataset: 'legal-qa-pairs' }).page).toBe(4);
    expect(patchWorkspaceQuery(base, { tab: 'evidence' }).page).toBe(4);
    expect(patchWorkspaceQuery(base, { q: 'a' }).page).toBe(4);
    expect(patchWorkspaceQuery(base, { dataset: null }).tab).toBe('overview');
    expect(resultsKey(patchWorkspaceQuery(base, { dataset: 'legal-qa-pairs' }))).toBe(resultsKey(base));
    expect(resultsKey(patchWorkspaceQuery(base, { min: 40 }))).not.toBe(resultsKey(base));
  });

  it('builds record links in the documented shape', () => {
    expect(recordHref('legal-qa-pairs')).toBe('/workspace/?dataset=legal-qa-pairs');
    expect(recordHref('legal-qa-pairs', 'evidence')).toBe('/workspace/?dataset=legal-qa-pairs&tab=evidence');
    expect(workspaceHref({ q: 'a b', platform: ['github'] })).toBe('/workspace/?q=a+b&platform=github');
    expect(workspaceHref({})).toBe('/workspace/');
  });

  it('validates slugs strictly', () => {
    expect(isSlug('biomed-abstracts-open')).toBe(true);
    expect(isSlug('huggingface-org-name_v2.1')).toBe(true);
    expect(isSlug('')).toBe(false);
    expect(isSlug('-leading')).toBe(false);
    expect(isSlug('has space')).toBe(false);
    expect(isSlug('javascript:alert(1)')).toBe(false);
    expect(isSlug('a'.repeat(161))).toBe(false);
    expect(isSlug(42)).toBe(false);
  });
});

describe('compare URL contract', () => {
  it('accepts comma lists and repeated keys, de-duplicating and lower-casing', () => {
    expect(parseCompareSlugs(new URLSearchParams('datasets=A-one,b-two&datasets=a-one,c-three'))).toEqual({ slugs: ['a-one', 'b-two', 'c-three'], invalid: [], overflow: 0 });
  });

  it('caps at four and reports what it dropped', () => {
    const result = parseCompareSlugs(new URLSearchParams('datasets=a,b,c,d,e,f,%20,bad%20slug'));
    expect(result.slugs).toEqual(['a', 'b', 'c', 'd']);
    expect(result.overflow).toBe(2);
    expect(result.invalid).toEqual(['bad slug']);
    expect(parseCompareSlugs(new URLSearchParams(''))).toEqual({ slugs: [], invalid: [], overflow: 0 });
  });

  it('serialises a clean compare link', () => {
    expect(compareHref(['b-two', 'a-one', 'a-one', 'not ok'])).toBe('/compare/?datasets=b-two%2Ca-one');
    expect(parseCompareSlugs(new URLSearchParams(compareHref(['x', 'y', 'z', 'w', 'v']).split('?')[1])).slugs).toEqual(['x', 'y', 'z', 'w']);
    expect(compareHref([])).toBe('/compare/');
  });
});
