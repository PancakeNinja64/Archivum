/**
 * Archivum — curated launch catalog.
 *
 * Fifty-two real, public dataset records chosen for SPREAD, not for quality.
 * The catalog is only interesting if it contains thinly documented entries
 * alongside exemplary ones — that contrast is the product.
 *
 * The `expected` bands below are my estimate, not a measurement. The real
 * distribution only emerges once the importer has run — which is the point.
 *
 * `expected` is a sanity hint for the admin reviewing an import run, never
 * a stored value. The real figure always comes from computeCoverage().
 *
 * Some identifiers will 404 or return 401 (gated). That is expected and
 * intentional: the importer must record the run as `skipped` with the reason
 * and move on. Never let one bad identifier abort a batch.
 */

export type SeedPlatform = 'huggingface' | 'github';

export interface SeedEntry {
  platform: SeedPlatform;
  /** owner/name exactly as the platform API expects it. */
  id: string;
  /** Editorial hints. Used for the initial `domain` array; refine after import. */
  domain: string[];
  modality: 'text' | 'image' | 'audio' | 'tabular' | 'multimodal';
  /** Rough band we expect, for spot-checking the importer. Not persisted. */
  expected: 'Extensive' | 'Partial' | 'Minimal';
  note?: string;
}

export const CURATED_DATASETS: SeedEntry[] = [
  // ===== Hugging Face — text / NLP =====================================
  { platform: 'huggingface', id: 'rajpurkar/squad',                    domain: ['nlp', 'question-answering'], modality: 'text', expected: 'Extensive', note: 'Benchmark-grade card. Use as the high-water mark.' },
  { platform: 'huggingface', id: 'rajpurkar/squad_v2',                 domain: ['nlp', 'question-answering'], modality: 'text', expected: 'Extensive' },
  { platform: 'huggingface', id: 'nyu-mll/glue',                       domain: ['nlp', 'benchmark'],          modality: 'text', expected: 'Extensive' },
  { platform: 'huggingface', id: 'stanfordnlp/imdb',                   domain: ['nlp', 'sentiment'],          modality: 'text', expected: 'Extensive' },
  { platform: 'huggingface', id: 'stanfordnlp/snli',                   domain: ['nlp', 'inference'],          modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'nyu-mll/multi_nli',                  domain: ['nlp', 'inference'],          modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'fancyzhx/ag_news',                   domain: ['nlp', 'classification'],     modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'dair-ai/emotion',                    domain: ['nlp', 'sentiment'],          modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'cardiffnlp/tweet_eval',              domain: ['nlp', 'social-media'],       modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'eriktks/conll2003',                  domain: ['nlp', 'named-entities'],     modality: 'text', expected: 'Partial', note: 'Licensing is historically ambiguous — a good demonstration of "not found".' },
  { platform: 'huggingface', id: 'abisee/cnn_dailymail',               domain: ['nlp', 'summarization'],      modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'EdinburghNLP/xsum',                  domain: ['nlp', 'summarization'],      modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'Salesforce/wikitext',                domain: ['nlp', 'language-modeling'],  modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'Yelp/yelp_review_full',              domain: ['nlp', 'reviews'],            modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'openai/gsm8k',                       domain: ['nlp', 'reasoning', 'math'],  modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'tatsu-lab/alpaca',                   domain: ['nlp', 'instruction-tuning'], modality: 'text', expected: 'Partial', note: 'Model-generated. Upstream terms are worth surfacing.' },
  { platform: 'huggingface', id: 'databricks/databricks-dolly-15k',    domain: ['nlp', 'instruction-tuning'], modality: 'text', expected: 'Extensive' },
  { platform: 'huggingface', id: 'Anthropic/hh-rlhf',                  domain: ['nlp', 'alignment'],          modality: 'text', expected: 'Partial' },
  { platform: 'huggingface', id: 'OpenAssistant/oasst1',               domain: ['nlp', 'conversational'],     modality: 'text', expected: 'Extensive' },
  { platform: 'huggingface', id: 'HuggingFaceFW/fineweb',              domain: ['nlp', 'web-crawl'],          modality: 'text', expected: 'Extensive', note: 'Very large. Manifest only — never fetch contents.' },
  { platform: 'huggingface', id: 'allenai/c4',                         domain: ['nlp', 'web-crawl'],          modality: 'text', expected: 'Partial' },

  // ===== Hugging Face — image ==========================================
  { platform: 'huggingface', id: 'uoft-cs/cifar10',                    domain: ['vision', 'classification'],  modality: 'image', expected: 'Extensive' },
  { platform: 'huggingface', id: 'ylecun/mnist',                       domain: ['vision', 'classification'],  modality: 'image', expected: 'Extensive' },
  { platform: 'huggingface', id: 'zalando-datasets/fashion_mnist',     domain: ['vision', 'classification'],  modality: 'image', expected: 'Partial' },
  { platform: 'huggingface', id: 'ethz/food101',                       domain: ['vision', 'classification'],  modality: 'image', expected: 'Partial' },
  { platform: 'huggingface', id: 'AI-Lab-Makerere/beans',              domain: ['vision', 'agriculture'],     modality: 'image', expected: 'Partial' },
  { platform: 'huggingface', id: 'microsoft/cats_vs_dogs',             domain: ['vision', 'classification'],  modality: 'image', expected: 'Minimal' },

  // ===== Hugging Face — audio ==========================================
  { platform: 'huggingface', id: 'openslr/librispeech_asr',            domain: ['speech', 'transcription'],   modality: 'audio', expected: 'Extensive' },
  { platform: 'huggingface', id: 'google/fleurs',                      domain: ['speech', 'multilingual'],    modality: 'audio', expected: 'Partial' },
  { platform: 'huggingface', id: 'google/speech_commands',             domain: ['speech', 'keyword-spotting'], modality: 'audio', expected: 'Partial' },
  { platform: 'huggingface', id: 'mozilla-foundation/common_voice_11_0', domain: ['speech', 'multilingual'],  modality: 'audio', expected: 'Extensive', note: 'Gated. Expect a 401 — record it as gated, do not fail the run.' },

  // ===== Hugging Face — tabular & multimodal ===========================
  { platform: 'huggingface', id: 'scikit-learn/adult-census-income',   domain: ['tabular', 'socioeconomic'],  modality: 'tabular', expected: 'Minimal', note: 'Sensitive attributes, thin documentation. Exactly the gap worth showing.' },
  { platform: 'huggingface', id: 'scikit-learn/iris',                  domain: ['tabular', 'classic'],        modality: 'tabular', expected: 'Minimal' },
  { platform: 'huggingface', id: 'inria-soda/tabular-benchmark',       domain: ['tabular', 'benchmark'],      modality: 'tabular', expected: 'Partial' },
  { platform: 'huggingface', id: 'nlphuji/flickr30k',                  domain: ['vision', 'captioning'],      modality: 'multimodal', expected: 'Partial' },

  // ===== GitHub =========================================================
  { platform: 'github', id: 'CSSEGISandData/COVID-19',                 domain: ['public-health', 'timeseries'], modality: 'tabular', expected: 'Partial', note: 'Archived. Good demonstration of a stale maintenance section.' },
  { platform: 'github', id: 'nytimes/covid-19-data',                   domain: ['public-health', 'timeseries'], modality: 'tabular', expected: 'Extensive', note: 'Unusually clear terms of use. High licensing coverage.' },
  { platform: 'github', id: 'owid/covid-19-data',                      domain: ['public-health', 'timeseries'], modality: 'tabular', expected: 'Partial' },
  { platform: 'github', id: 'fivethirtyeight/data',                    domain: ['journalism', 'mixed'],         modality: 'tabular', expected: 'Partial' },
  { platform: 'github', id: 'rfordatascience/tidytuesday',             domain: ['education', 'mixed'],          modality: 'tabular', expected: 'Partial' },
  { platform: 'github', id: 'vega/vega-datasets',                      domain: ['visualization', 'mixed'],      modality: 'tabular', expected: 'Partial' },
  { platform: 'github', id: 'plotly/datasets',                         domain: ['visualization', 'mixed'],      modality: 'tabular', expected: 'Minimal', note: 'Almost no documentation. The low end of the spread.' },
  { platform: 'github', id: 'selva86/datasets',                        domain: ['education', 'mixed'],          modality: 'tabular', expected: 'Minimal' },
  { platform: 'github', id: 'jbrownlee/Datasets',                      domain: ['education', 'mixed'],          modality: 'tabular', expected: 'Minimal' },
  { platform: 'github', id: 'openai/grade-school-math',                domain: ['nlp', 'reasoning', 'math'],    modality: 'text', expected: 'Partial' },
  { platform: 'github', id: 'allenai/natural-instructions',            domain: ['nlp', 'instruction-tuning'],   modality: 'text', expected: 'Extensive' },
  { platform: 'github', id: 'google-deepmind/mathematics_dataset',     domain: ['nlp', 'math'],                 modality: 'text', expected: 'Partial' },
  { platform: 'github', id: 'facebookresearch/anli',                   domain: ['nlp', 'inference'],            modality: 'text', expected: 'Partial' },
  { platform: 'github', id: 'google-research-datasets/conceptual-captions', domain: ['vision', 'captioning'],   modality: 'multimodal', expected: 'Partial' },
  { platform: 'github', id: 'mwaskom/seaborn-data',                    domain: ['visualization', 'mixed'],      modality: 'tabular', expected: 'Minimal', note: 'Widely used, almost no provenance documentation.' },
  { platform: 'github', id: 'datasciencedojo/datasets',                domain: ['education', 'mixed'],          modality: 'tabular', expected: 'Minimal' },
  { platform: 'github', id: 'zygmuntz/goodbooks-10k',                  domain: ['recommendation', 'books'],     modality: 'tabular', expected: 'Minimal' },
];

/** Import in this order. Documented entries first, so a partial run still looks good. */
export const SEED_BATCH_SIZE = 5;
