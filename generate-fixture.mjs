// Deterministic fixture generator. NOT COMMITTED — run once, paste the output.
// Seeded so the same fixture regenerates byte-identically.

const CHECKS = [
  ['publisher_identified','origin'],['publisher_is_organisation','origin'],['upstream_sources_declared','origin'],
  ['collection_method_described','origin'],['collection_timeframe_stated','origin'],['annotation_process_described','origin'],
  ['maintainer_contact_listed','origin'],
  ['license_declared','licensing'],['license_file_present','licensing'],['license_spdx_recognised','licensing'],
  ['commercial_terms_stated','licensing'],['attribution_terms_stated','licensing'],['redistribution_terms_stated','licensing'],
  ['upstream_license_noted','licensing'],
  ['description_present','composition'],['schema_documented','composition'],['splits_documented','composition'],
  ['row_count_available','composition'],['file_manifest_available','composition'],['file_sizes_available','composition'],
  ['sample_records_available','composition'],
  ['last_modified_known','maintenance'],['version_history_available','maintenance'],['release_notes_available','maintenance'],
  ['citation_provided','maintenance'],['usage_statistics_available','maintenance'],['known_limitations_documented','maintenance'],
  ['intended_use_documented','maintenance'],
];
const POINTS = { documented: 1, reported: 0.5, not_found: 0 };
const SECTIONS = ['origin','licensing','composition','maintenance'];

function computeTotal(codes) {
  const results = codes.split('').map(c => ({ d:'documented', r:'reported', n:'not_found', x:'n/a' }[c]));
  const scores = SECTIONS.map(sec => {
    let pts = 0, app = 0;
    CHECKS.forEach(([, s], i) => {
      if (s !== sec) return;
      const r = results[i];
      if (r === 'n/a') return;
      app += 1; pts += POINTS[r];
    });
    return { app, score: app === 0 ? 0 : Math.round((pts / app) * 100) };
  });
  const usable = scores.filter(s => s.app > 0);
  return usable.length === 0 ? 0
    : Math.round(usable.reduce((a, s) => a + s.score * 25, 0) / usable.reduce((a) => a + 25, 0));
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260811);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const PUBLISHERS = [
  ['EleutherAI','huggingface'],['LAION','huggingface'],['BigScience','huggingface'],['Cohere For AI','huggingface'],
  ['Together AI','huggingface'],['Hugging Face','huggingface'],['NVIDIA','huggingface'],
  ['Stanford CRFM','academic'],['Allen Institute for AI','academic'],['Zenodo Archive','academic'],
  ['MIT CSAIL','academic'],['ETH Zurich','academic'],
  ['MLCommons','direct'],['Mozilla Foundation','direct'],['Common Crawl','direct'],
  ['OpenDataLab','kaggle'],['Kaggle Community','kaggle'],
  ['PyTorch Hub','github'],['TensorFlow Datasets','github'],['Papers With Code','github'],
];
const HEAD = ['Atlas','Pile','Ledger','Stack','Quarry','Mesh','Corpus','Beacon','Slate','Vault','Prism','Anchor','Relay','Harbor','Lattice','Fathom','Cinder','Marrow','Tessera','Kiln','Drift','Cairn'];
const MID = ['News','Law','Code','Chat','Edu','Web','Fin','Audio','Image','Bio','Med','Civic','Patent','Speech','Video','Wiki','Forum','Recipe','Court','Genome'];
const TAIL = ['V2','V3','Subset','Curated','Dedup','Mini','Instruct','Pairs','Abstracts','Corpus','Raw','Filtered','Sample','Extended','Core','Aligned','Balanced','Tagged'];
const LICENSES = ['MIT','Apache-2.0','CC-BY-4.0','CC-BY-SA-4.0','CC-BY-NC-4.0','CC0-1.0','ODC-By-1.0','BSD-3-Clause','GPL-3.0','Not stated','Custom terms'];

// End-state mix: unreachable 40%, withdrawn 25%, gated 20%, superseded 15%.
const N = 96;
const plan = [
  ...Array(39).fill('unreachable'),
  ...Array(24).fill('withdrawn'),
  ...Array(19).fill('gated'),
  ...Array(14).fill('superseded'),
];

// Cohorts: H1 2021 .. H1 2026, weighted toward recent. No future dates.
const COHORTS = [];
for (let y = 2021; y <= 2026; y++) for (const h of [1, 2]) {
  if (y === 2026 && h === 2) continue;
  COHORTS.push([y, h]);
}
const weights = COHORTS.map((_, i) => 1 + i * 0.45);
function pickCohort() {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rnd() * total;
  for (let i = 0; i < COHORTS.length; i++) { r -= weights[i]; if (r <= 0) return COHORTS[i]; }
  return COHORTS[COHORTS.length - 1];
}

const usedNames = new Set();
function name() {
  for (let i = 0; i < 200; i++) {
    const n = `${pick(HEAD)} ${pick(MID)} ${pick(TAIL)}`;
    if (!usedNames.has(n)) { usedNames.add(n); return n; }
  }
  throw new Error('name space exhausted');
}
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function iso(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Documentation profile per record. Skewed so the board has real range.
function checks(quality) {
  return CHECKS.map(([id]) => {
    const r = rnd();
    // A handful of checks legitimately do not apply on some platforms.
    if (rnd() < 0.03 && (id === 'annotation_process_described' || id === 'splits_documented')) return 'x';
    if (r < quality * 0.72) return 'd';
    if (r < quality * 0.72 + 0.22) return 'r';
    return 'n';
  }).join('');
}

const cohortAssign = [];
// Guarantee every cohort has at least one record.
COHORTS.forEach((c) => cohortAssign.push(c));
while (cohortAssign.length < N) cohortAssign.push(pickCohort());

// Shuffle plan and cohorts together, deterministically.
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
shuffle(plan); shuffle(cohortAssign);

const records = [];
for (let i = 0; i < N; i++) {
  const [publisher, platform] = pick(PUBLISHERS);
  const nm = name();
  const endState = plan[i];
  const [cy, ch] = cohortAssign[i];
  const month = ch === 1 ? 1 + Math.floor(rnd() * 6) : 7 + Math.floor(rnd() * 6);
  const day = 1 + Math.floor(rnd() * 27);
  const lastConfirmed = iso(cy, month, day);
  // Observed for 4 to 40 months before the final check.
  const span = 4 + Math.floor(rnd() * 36);
  const fo = new Date(Date.UTC(cy, month - 1, day));
  fo.setUTCMonth(fo.getUTCMonth() - span);
  const firstObserved = fo.toISOString().slice(0, 10);

  const quality = 0.25 + rnd() * 0.72;
  const code = checks(quality);
  const total = computeTotal(code);
  const band = total >= 75 ? 'extensive' : total >= 40 ? 'partial' : 'minimal';

  const magnitude = Math.floor(rnd() * 6);
  const sizeRows = Math.floor((1 + rnd() * 9) * Math.pow(10, 3 + magnitude));

  records.push({
    slug: slugify(nm), name: nm, publisher, platform,
    coverageTotal: total, coverageBand: band,
    license: pick(LICENSES),
    sizeRows, versions: 1 + Math.floor(rnd() * 11),
    checksAtLastCheck: code,
    endState, firstObserved, lastConfirmed,
    consecutiveFailures: endState === 'unreachable' ? 3 + Math.floor(rnd() * 9) : endState === 'withdrawn' ? 3 + Math.floor(rnd() * 5) : 0,
    dependentModels: null, dependentPapers: null,
  });
}

// Every superseded record names a successor that exists in the set.
const pool = records.filter(r => r.endState !== 'superseded');
records.filter(r => r.endState === 'superseded').forEach((r, i) => {
  r.supersededBy = pool[(i * 7 + 3) % pool.length].slug;
});

const order = { superseded: 0, gated: 1, withdrawn: 2, unreachable: 3 };
records.sort((a, b) => order[a.endState] - order[b.endState] || a.lastConfirmed.localeCompare(b.lastConfirmed));

const lines = records.map(r => {
  const parts = [
    `slug: ${JSON.stringify(r.slug)}`, `name: ${JSON.stringify(r.name)}`,
    `publisher: ${JSON.stringify(r.publisher)}`, `platform: ${JSON.stringify(r.platform)}`,
    `coverageTotal: ${r.coverageTotal}`, `coverageBand: ${JSON.stringify(r.coverageBand)}`,
    `license: ${JSON.stringify(r.license)}`, `sizeRows: ${r.sizeRows}`, `versions: ${r.versions}`,
    `checksAtLastCheck: ${JSON.stringify(r.checksAtLastCheck)}`,
    `endState: ${JSON.stringify(r.endState)}`,
    `firstObserved: ${JSON.stringify(r.firstObserved)}`, `lastConfirmed: ${JSON.stringify(r.lastConfirmed)}`,
    `consecutiveFailures: ${r.consecutiveFailures}`,
  ];
  if (r.supersededBy) parts.push(`supersededBy: ${JSON.stringify(r.supersededBy)}`);
  parts.push('dependentModels: null', 'dependentPapers: null');
  return `  { ${parts.join(', ')} },`;
}).join('\n');

console.log(lines);
console.error(`records=${records.length} cohorts=${new Set(records.map(r=>r.lastConfirmed.slice(0,4)+'H'+(Number(r.lastConfirmed.slice(5,7))<7?1:2))).size} coverage=${Math.min(...records.map(r=>r.coverageTotal))}..${Math.max(...records.map(r=>r.coverageTotal))}`);
