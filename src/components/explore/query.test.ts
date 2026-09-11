import { describe, expect, it } from 'vitest';
import { readCatalogQuery, updateCatalogQuery } from './query';

describe('catalog links', () => {
  it('accepts historic list views without losing filters or page', () => {
    for (const view of ['grid', 'table', 'list']) {
      const state = readCatalogQuery(new URLSearchParams(`view=${view}&q=FineWeb&platform=huggingface&page=2`));
      expect(state.view).toBe('list');
      expect(state.filters).toMatchObject({ query: 'FineWeb', platform: ['huggingface'], page: 2 });
    }
  });

  it('keeps the identical result query when switching to Atlas', () => {
    const original = new URLSearchParams('q=wiki&domain=language&page=3&sort=recent');
    const changed = new URLSearchParams(updateCatalogQuery(original, { view: 'atlas' }, true));
    expect(readCatalogQuery(changed).view).toBe('atlas');
    expect(readCatalogQuery(changed).filters).toEqual(readCatalogQuery(original).filters);
  });

  it('handles malformed incoming filter and pagination values safely', () => {
    const result = readCatalogQuery(new URLSearchParams('page=Infinity&min=Infinity&sort=bad&platform=github,garbage,github&modality=text,unknown'));
    expect(result.filters).toMatchObject({ page: 1, minCoverage: 0, sort: 'coverage', platform: ['github'], modality: ['text'] });
    expect(readCatalogQuery(new URLSearchParams('page=-7&min=170')).filters).toMatchObject({ page: 1, minCoverage: 100 });
    expect(readCatalogQuery(new URLSearchParams('page=2.7&min=-30')).filters).toMatchObject({ page: 2, minCoverage: 0 });
  });

  it('resets pagination on filter changes while retaining view and other filters', () => {
    const result = new URLSearchParams(updateCatalogQuery(new URLSearchParams('q=old&page=5&view=atlas&license=MIT'), { q: 'new' }));
    expect(result.get('page')).toBeNull();
    expect(result.get('view')).toBe('atlas');
    expect(result.get('license')).toBe('MIT');
    expect(result.get('q')).toBe('new');
  });
});
