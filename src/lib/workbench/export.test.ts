import { describe, expect, it } from 'vitest';
import { DATASETS } from '@/lib/mock-data';
import type { Dataset } from '@/lib/types';
import { briefFilename, briefToJson, briefToMarkdown, buildBrief, mdInline, COVERAGE_CAVEAT, type BriefOptions } from './export';

const options: BriefOptions = { origin: 'illustrative', scope: 'shortlist', generatedAt: '2026-09-13T14:05:09.000Z', siteOrigin: 'https://archivum.tech' };

const hostile: Dataset = {
  ...DATASETS[2],
  slug: 'hostile-record',
  name: 'Pipes | and *stars* [link](http://x) # heading <b>bold</b>',
  publisher: 'Line\nbreak _publisher_ `code`',
  description: 'First line.\r\nSecond | line with  bell and trailing spaces   ',
  platformUrl: 'javascript:alert(1)',
  sizeRows: null,
  sizeBytes: 0,
  lastUpdated: null,
  firstPublished: null,
  versions: [],
  schema: [],
  sampleRecords: [],
  license: { ...DATASETS[2].license, spdx: 'Not stated', label: 'not_found', attribution: null, shareAlike: null, notes: ['Upstream terms | unresolved'] },
  lineage: { nodes: [], edges: [], completeness: 0, undocumentedStages: [] },
};

describe('research brief JSON', () => {
  it('states its origin, timestamps, record URLs, and keeps unknowns as null', () => {
    const brief = buildBrief([DATASETS[0], hostile], [{ slug: 'missing-one', name: 'Missing', reason: 'Not in the catalog at export time.' }], options);
    expect(brief.origin).toBe('illustrative');
    expect(brief.originNote).toMatch(/fictional/);
    expect(brief.generatedAt).toBe(options.generatedAt);
    expect(brief.caveats).toContain(COVERAGE_CAVEAT);
    expect(brief.caveats.some((c) => /unavailable at export time/.test(c))).toBe(true);
    const [first, second] = brief.records;
    expect(first.recordUrl).toBe('https://archivum.tech/workspace/?dataset=biomed-abstracts-open');
    expect(first.sourceUrl).toBeNull();
    expect(first.coverage.checks).toHaveLength(28);
    expect(first.coverage.sections.map((s) => s.key)).toEqual(['origin', 'licensing', 'composition', 'maintenance']);
    expect(first.gaps).toEqual(first.coverage.checks.filter((c) => c.result === 'not_found').map((c) => c.label));
    expect(second.size).toMatchObject({ rows: null, bytes: 0, rowsLabel: 'Not stated', bytesLabel: '0 B' });
    expect(second.dates).toEqual({ firstPublished: null, sourceUpdated: null, archivumChecked: hostile.coverageCheckedAt });
    expect(second.license.published).toBeNull();
    expect(second.license.lookup.attributionRequired).toBeNull();
    expect(second.lineage).toMatchObject({ recorded: false, completeness: null });
    expect(second.history).toEqual({ versionsObserved: 0, latest: null });
    expect(brief.unavailable).toEqual([{ slug: 'missing-one', name: 'Missing', reason: 'Not in the catalog at export time.' }]);
    const parsed = JSON.parse(briefToJson(brief));
    expect(parsed.format).toBe('archivum-research-brief');
    expect(parsed.records[1].size.rows).toBeNull();
    expect(parsed.comparison).toBeNull();
  });

  it('only carries a source link for live catalog records with an http(s) URL', () => {
    const live = buildBrief([DATASETS[0], hostile], [], { ...options, origin: 'catalog' });
    expect(live.records[0].sourceUrl).toBe(DATASETS[0].platformUrl);
    expect(live.records[1].sourceUrl).toBeNull();
    expect(live.originNote).toMatch(/Live Archivum catalog/);
    expect(live.caveats.some((c) => /illustrative/i.test(c))).toBe(false);
  });

  it('includes aligned comparison rows for a comparison export', () => {
    const brief = buildBrief([DATASETS[0], DATASETS[1]], [], { ...options, scope: 'comparison' });
    expect(brief.comparison).not.toBeNull();
    const rows = brief.comparison!;
    const publisher = rows.find((row) => row.label === 'Publisher')!;
    expect(publisher.values).toEqual([{ slug: DATASETS[0].slug, value: DATASETS[0].publisher }, { slug: DATASETS[1].slug, value: DATASETS[1].publisher }]);
    expect(buildBrief([DATASETS[0]], [], { ...options, scope: 'comparison' }).comparison).toBeNull();
  });
});

describe('research brief Markdown', () => {
  it('escapes hostile text so it cannot open Markdown structure', () => {
    expect(mdInline('a | b')).toBe('a \\| b');
    expect(mdInline('*em* _u_ `c` [l](x) <b> # + ~ { }')).toBe('\\*em\\* \\_u\\_ \\`c\\` \\[l\\](x) \\<b\\> \\# \\+ \\~ \\{ \\}');
    expect(mdInline('line\nbreak\r\ntab\tbell')).toBe('line break tab bell');
    expect(mdInline(null)).toBe('');
    const markdown = briefToMarkdown(buildBrief([hostile], [{ slug: 'x`y', reason: 'bad | reason' }], { ...options, scope: 'record' }));
    expect(markdown).toContain('## 1. Pipes \\| and \\*stars\\* \\[link\\](http://x) \\# heading \\<b\\>bold\\</b\\>');
    expect(markdown).toContain('Line break \\_publisher\\_ \\`code\\`');
    expect(markdown).toContain('> First line. Second \\| line with bell and trailing spaces');
    expect(markdown).not.toContain('javascript:');
    expect(markdown).toContain('- Source: no source link (illustrative record)');
    expect(markdown).toContain('- Size: records not stated · 0 B');
    expect(markdown).toContain('first published Not stated');
    expect(markdown).toContain('- Licence: Not stated (not found)');
    expect(markdown).toContain('attribution required: not established');
    expect(markdown).toContain('- Lineage: not recorded');
    expect(markdown).toContain('(`xy`): bad \\| reason');
    for (const line of markdown.split('\n').filter((l) => l.startsWith('|'))) expect(line.match(/(?<!\\)\|/g)!.length).toBeGreaterThanOrEqual(3);
  });

  it('reads as a brief: origin first, caveat, coverage table, gaps, and record links', () => {
    const markdown = briefToMarkdown(buildBrief([DATASETS[0], DATASETS[7]], [], { ...options, scope: 'comparison' }));
    const lines = markdown.split('\n');
    expect(lines[0]).toBe('# Archivum research brief');
    expect(lines[2]).toBe(`- Generated: ${options.generatedAt}`);
    expect(lines[3]).toMatch(/^- Origin: \*\*Illustrative demo catalog\*\*/);
    expect(markdown).toContain('> These records are illustrative.');
    expect(markdown).toContain('## Side by side');
    expect(markdown).toContain('| **Licence** |');
    expect(markdown).toContain('| Section | Score | Documented | Reported | Not found | Applicable |');
    expect(markdown).toContain('- Documentation gaps (not found at source):');
    expect(markdown).toContain('- Record: <https://archivum.tech/workspace/?dataset=biomed-abstracts-open>');
    expect(markdown).toContain(`## 2. ${DATASETS[7].name}`);
    expect(markdown.trimEnd().endsWith('no data was submitted anywhere to create this file.')).toBe(true);
  });

  it('names files safely and predictably', () => {
    const brief = buildBrief([DATASETS[0]], [], { ...options, scope: 'record' });
    expect(briefFilename(brief, 'json')).toBe('archivum-brief-biomed-abstracts-open-20260913-1405.json');
    expect(briefFilename(buildBrief([hostile], [], { ...options, scope: 'comparison' }), 'md')).toBe('archivum-brief-comparison-20260913-1405.md');
  });
});
