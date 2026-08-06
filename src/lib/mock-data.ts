// AUTO-AUTHORED MOCK DATA — the demo catalog served when NEXT_PUBLIC_DATA_SOURCE=mock.
// Publishers are fictional. Coverage figures were generated through the same
// section arithmetic as src/lib/coverage/rules.ts. See src/lib/types.ts for shapes.

import type { Dataset } from './types';

export const DATASETS: Dataset[] = [
  {
    "slug": "biomed-abstracts-open",
    "name": "Biomedical Abstracts (Open Access)",
    "publisher": "Meridian Health Data Collective",
    "publisherSlug": "meridian-health-data-collective",
    "description": "Peer-reviewed biomedical abstracts with structured metadata, deduplicated and normalized against source registries.",
    "platform": "academic",
    "platformUrl": "https://example.org/academic/biomed-abstracts-open",
    "domain": [
      "medical",
      "nlp"
    ],
    "languages": [
      "en"
    ],
    "modality": "text",
    "sizeRows": 4210883,
    "sizeBytes": 18400000000,
    "license": {
      "spdx": "CC-BY-4.0",
      "commercialUse": "permitted",
      "attribution": true,
      "shareAlike": false,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2021-03-14T00:00:00Z",
    "lastUpdated": "2026-07-22T00:00:00Z",
    "contentHash": "sha256:c11d…683a",
    "version": "v5.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:a40e…2e44",
          "timestamp": "2021-03-14T00:00:00Z",
          "url": "https://example.org/biomed-abstracts-open",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:a3b3…839c",
          "timestamp": "2026-07-22T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:9db7…3e80",
          "timestamp": "2026-07-22T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:698d…f0ca",
          "timestamp": "2026-07-22T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:a00c…69a2",
          "timestamp": "2026-07-22T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:6e7b…12f7",
          "timestamp": "2026-07-22T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "documented"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "documented"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v5.0",
        "date": "2026-07-22",
        "rowsAdded": 168435,
        "rowsRemoved": 16843,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 95
      },
      {
        "version": "v4.0",
        "date": "2024-11-11",
        "rowsAdded": 210544,
        "rowsRemoved": 33687,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 92
      },
      {
        "version": "v3.0",
        "date": "2023-09-12",
        "rowsAdded": 252652,
        "rowsRemoved": 50530,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 89
      },
      {
        "version": "v2.0",
        "date": "2023-07-13",
        "rowsAdded": 294761,
        "rowsRemoved": 67374,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 86
      },
      {
        "version": "v1.0",
        "date": "2022-05-14",
        "rowsAdded": 336870,
        "rowsRemoved": 84217,
        "note": "Initial indexed release",
        "author": "publisher",
        "coverageTotal": 83
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "multilingual-instruct-2m",
      "us-contract-clauses",
      "wiki-qa-multilingual"
    ],
    "coverageTotal": 95,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 100,
        "documented": 7,
        "reported": 0,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "maintainer_contact_listed": "documented",
      "collection_timeframe_stated": "documented",
      "upstream_sources_declared": "documented",
      "annotation_process_described": "documented",
      "publisher_identified": "documented",
      "collection_method_described": "documented",
      "publisher_is_organisation": "documented",
      "commercial_terms_stated": "documented",
      "attribution_terms_stated": "documented",
      "license_spdx_recognised": "documented",
      "upstream_license_noted": "documented",
      "license_file_present": "documented",
      "license_declared": "documented",
      "redistribution_terms_stated": "reported",
      "splits_documented": "documented",
      "row_count_available": "documented",
      "file_sizes_available": "documented",
      "schema_documented": "documented",
      "sample_records_available": "documented",
      "description_present": "documented",
      "file_manifest_available": "reported",
      "release_notes_available": "documented",
      "version_history_available": "documented",
      "known_limitations_documented": "documented",
      "last_modified_known": "documented",
      "usage_statistics_available": "documented",
      "intended_use_documented": "documented",
      "citation_provided": "reported"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "multilingual-instruct-2m",
    "name": "Multilingual Instruction Pairs 2M",
    "publisher": "Polyglot Research Group",
    "publisherSlug": "polyglot-research-group",
    "description": "Human-reviewed instruction and response pairs across seven languages, with per-record translation provenance.",
    "platform": "huggingface",
    "platformUrl": "https://example.org/huggingface/multilingual-instruct-2m",
    "domain": [
      "nlp",
      "instruction"
    ],
    "languages": [
      "en",
      "es",
      "fr",
      "de",
      "zh",
      "hi",
      "ar"
    ],
    "modality": "text",
    "sizeRows": 2048000,
    "sizeBytes": 6900000000,
    "license": {
      "spdx": "Apache-2.0",
      "commercialUse": "permitted",
      "attribution": false,
      "shareAlike": false,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2023-01-09T00:00:00Z",
    "lastUpdated": "2026-06-30T00:00:00Z",
    "contentHash": "sha256:a674…e084",
    "version": "v5.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:fa11…312e",
          "timestamp": "2023-01-09T00:00:00Z",
          "url": "https://example.org/multilingual-instruct-2m",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:5e0d…0dba",
          "timestamp": "2026-06-30T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:230b…6af9",
          "timestamp": "2026-06-30T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:2425…d552",
          "timestamp": "2026-06-30T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:d1db…1ad8",
          "timestamp": "2026-06-30T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:294a…f4b0",
          "timestamp": "2026-06-30T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "documented"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "documented"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v5.0",
        "date": "2026-06-30",
        "rowsAdded": 81920,
        "rowsRemoved": 8192,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 91
      },
      {
        "version": "v4.0",
        "date": "2024-11-11",
        "rowsAdded": 102400,
        "rowsRemoved": 16384,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 88
      },
      {
        "version": "v3.0",
        "date": "2023-09-12",
        "rowsAdded": 122880,
        "rowsRemoved": 24576,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 85
      },
      {
        "version": "v2.0",
        "date": "2023-07-13",
        "rowsAdded": 143360,
        "rowsRemoved": 32768,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 82
      },
      {
        "version": "v1.0",
        "date": "2022-05-14",
        "rowsAdded": 163840,
        "rowsRemoved": 40960,
        "note": "Initial indexed release",
        "author": "publisher",
        "coverageTotal": 79
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "us-contract-clauses",
      "wiki-qa-multilingual"
    ],
    "coverageTotal": 93,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "publisher_is_organisation": "documented",
      "upstream_sources_declared": "documented",
      "collection_method_described": "documented",
      "publisher_identified": "documented",
      "collection_timeframe_stated": "documented",
      "maintainer_contact_listed": "documented",
      "annotation_process_described": "reported",
      "commercial_terms_stated": "documented",
      "attribution_terms_stated": "documented",
      "upstream_license_noted": "documented",
      "redistribution_terms_stated": "documented",
      "license_file_present": "documented",
      "license_spdx_recognised": "documented",
      "license_declared": "reported",
      "row_count_available": "documented",
      "file_manifest_available": "documented",
      "schema_documented": "documented",
      "splits_documented": "documented",
      "sample_records_available": "documented",
      "file_sizes_available": "documented",
      "description_present": "reported",
      "citation_provided": "documented",
      "usage_statistics_available": "documented",
      "intended_use_documented": "documented",
      "version_history_available": "documented",
      "known_limitations_documented": "documented",
      "release_notes_available": "documented",
      "last_modified_known": "reported"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "commons-python-permissive",
    "name": "Permissive Python Repositories",
    "publisher": "Commons Code Index",
    "publisherSlug": "commons-code-index",
    "description": "Python source files from repositories carrying verified permissive licenses, with per-file license attestation.",
    "platform": "github",
    "platformUrl": "https://example.org/github/commons-python-permissive",
    "domain": [
      "code"
    ],
    "languages": [
      "en"
    ],
    "modality": "text",
    "sizeRows": 1180442,
    "sizeBytes": 42000000000,
    "license": {
      "spdx": "MIT",
      "commercialUse": "permitted",
      "attribution": false,
      "shareAlike": false,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2022-05-02T00:00:00Z",
    "lastUpdated": "2026-07-28T00:00:00Z",
    "contentHash": "sha256:9bdf…a732",
    "version": "v5.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:093f…5c92",
          "timestamp": "2022-05-02T00:00:00Z",
          "url": "https://example.org/commons-python-permissive",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:cf00…b806",
          "timestamp": "2026-07-28T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:a06e…db73",
          "timestamp": "2026-07-28T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:d90c…5c76",
          "timestamp": "2026-07-28T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:8197…a004",
          "timestamp": "2026-07-28T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:3381…abf6",
          "timestamp": "2026-07-28T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "documented"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "documented"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v5.0",
        "date": "2026-07-28",
        "rowsAdded": 47217,
        "rowsRemoved": 4721,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 90
      },
      {
        "version": "v4.0",
        "date": "2024-11-11",
        "rowsAdded": 59022,
        "rowsRemoved": 9443,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 87
      },
      {
        "version": "v3.0",
        "date": "2023-09-12",
        "rowsAdded": 70826,
        "rowsRemoved": 14165,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 84
      },
      {
        "version": "v2.0",
        "date": "2023-07-13",
        "rowsAdded": 82630,
        "rowsRemoved": 18887,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 81
      },
      {
        "version": "v1.0",
        "date": "2022-05-14",
        "rowsAdded": 94435,
        "rowsRemoved": 23608,
        "note": "Initial indexed release",
        "author": "publisher",
        "coverageTotal": 78
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "code-review-comments"
    ],
    "coverageTotal": 91,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 86,
        "documented": 6,
        "reported": 0,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "upstream_sources_declared": "documented",
      "collection_method_described": "documented",
      "annotation_process_described": "documented",
      "publisher_is_organisation": "documented",
      "maintainer_contact_listed": "documented",
      "publisher_identified": "documented",
      "collection_timeframe_stated": "reported",
      "license_spdx_recognised": "documented",
      "attribution_terms_stated": "documented",
      "license_declared": "documented",
      "redistribution_terms_stated": "documented",
      "upstream_license_noted": "documented",
      "commercial_terms_stated": "documented",
      "license_file_present": "reported",
      "file_manifest_available": "documented",
      "schema_documented": "documented",
      "file_sizes_available": "documented",
      "description_present": "documented",
      "splits_documented": "documented",
      "row_count_available": "documented",
      "sample_records_available": "not_found",
      "known_limitations_documented": "documented",
      "last_modified_known": "documented",
      "citation_provided": "documented",
      "intended_use_documented": "documented",
      "release_notes_available": "documented",
      "usage_statistics_available": "documented",
      "version_history_available": "reported"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "us-contract-clauses",
    "name": "US Commercial Contract Clauses",
    "publisher": "Lex Corpus Project",
    "publisherSlug": "lex-corpus-project",
    "description": "Clause-segmented commercial agreements from public filings, annotated by clause type and governing law.",
    "platform": "academic",
    "platformUrl": "https://example.org/academic/us-contract-clauses",
    "domain": [
      "legal",
      "nlp"
    ],
    "languages": [
      "en"
    ],
    "modality": "text",
    "sizeRows": 812004,
    "sizeBytes": 3100000000,
    "license": {
      "spdx": "CC-BY-4.0",
      "commercialUse": "permitted",
      "attribution": true,
      "shareAlike": false,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2022-11-18T00:00:00Z",
    "lastUpdated": "2026-05-11T00:00:00Z",
    "contentHash": "sha256:21fa…eb22",
    "version": "v5.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:1cc0…4757",
          "timestamp": "2022-11-18T00:00:00Z",
          "url": "https://example.org/us-contract-clauses",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:680d…59bd",
          "timestamp": "2026-05-11T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:24de…e0f1",
          "timestamp": "2026-05-11T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:7094…b14f",
          "timestamp": "2026-05-11T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:f816…b6ad",
          "timestamp": "2026-05-11T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:3bcf…7855",
          "timestamp": "2026-05-11T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "documented"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "documented"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v5.0",
        "date": "2026-05-11",
        "rowsAdded": 32480,
        "rowsRemoved": 3248,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 88
      },
      {
        "version": "v4.0",
        "date": "2024-11-11",
        "rowsAdded": 40600,
        "rowsRemoved": 6496,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 85
      },
      {
        "version": "v3.0",
        "date": "2023-09-12",
        "rowsAdded": 48720,
        "rowsRemoved": 9744,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 82
      },
      {
        "version": "v2.0",
        "date": "2023-07-13",
        "rowsAdded": 56840,
        "rowsRemoved": 12992,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 79
      },
      {
        "version": "v1.0",
        "date": "2022-05-14",
        "rowsAdded": 64960,
        "rowsRemoved": 16240,
        "note": "Initial indexed release",
        "author": "publisher",
        "coverageTotal": 76
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "multilingual-instruct-2m",
      "wiki-qa-multilingual"
    ],
    "coverageTotal": 91,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 86,
        "documented": 6,
        "reported": 0,
        "notFound": 1,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "maintainer_contact_listed": "documented",
      "annotation_process_described": "documented",
      "upstream_sources_declared": "documented",
      "collection_timeframe_stated": "documented",
      "publisher_identified": "documented",
      "publisher_is_organisation": "documented",
      "collection_method_described": "reported",
      "redistribution_terms_stated": "documented",
      "upstream_license_noted": "documented",
      "commercial_terms_stated": "documented",
      "license_spdx_recognised": "documented",
      "license_declared": "documented",
      "attribution_terms_stated": "documented",
      "license_file_present": "reported",
      "splits_documented": "documented",
      "schema_documented": "documented",
      "file_manifest_available": "documented",
      "row_count_available": "documented",
      "file_sizes_available": "documented",
      "sample_records_available": "documented",
      "description_present": "reported",
      "citation_provided": "documented",
      "last_modified_known": "documented",
      "known_limitations_documented": "documented",
      "release_notes_available": "documented",
      "version_history_available": "documented",
      "usage_statistics_available": "documented",
      "intended_use_documented": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "wiki-qa-multilingual",
    "name": "Encyclopedic QA (Multilingual)",
    "publisher": "Encyclopedic Data Trust",
    "publisherSlug": "encyclopedic-data-trust",
    "description": "Question and answer pairs derived from encyclopedic articles, with section-level source anchors.",
    "platform": "huggingface",
    "platformUrl": "https://example.org/huggingface/wiki-qa-multilingual",
    "domain": [
      "nlp",
      "general"
    ],
    "languages": [
      "en",
      "de",
      "fr",
      "es",
      "ja",
      "pt"
    ],
    "modality": "text",
    "sizeRows": 3400119,
    "sizeBytes": 9200000000,
    "license": {
      "spdx": "CC-BY-SA-3.0",
      "commercialUse": "permitted",
      "attribution": true,
      "shareAlike": true,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2020-08-27T00:00:00Z",
    "lastUpdated": "2026-07-04T00:00:00Z",
    "contentHash": "sha256:4af2…5b6b",
    "version": "v5.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:139b…593c",
          "timestamp": "2020-08-27T00:00:00Z",
          "url": "https://example.org/wiki-qa-multilingual",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:a1d4…6725",
          "timestamp": "2026-07-04T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:14f8…1b59",
          "timestamp": "2026-07-04T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:8aaf…4e97",
          "timestamp": "2026-07-04T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:25ad…44a8",
          "timestamp": "2026-07-04T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:45e5…3338",
          "timestamp": "2026-07-04T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "documented"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "documented"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v5.0",
        "date": "2026-07-04",
        "rowsAdded": 136004,
        "rowsRemoved": 13600,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 88
      },
      {
        "version": "v4.0",
        "date": "2024-11-11",
        "rowsAdded": 170005,
        "rowsRemoved": 27200,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 85
      },
      {
        "version": "v3.0",
        "date": "2023-09-12",
        "rowsAdded": 204007,
        "rowsRemoved": 40801,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 82
      },
      {
        "version": "v2.0",
        "date": "2023-07-13",
        "rowsAdded": 238008,
        "rowsRemoved": 54401,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 79
      },
      {
        "version": "v1.0",
        "date": "2022-05-14",
        "rowsAdded": 272009,
        "rowsRemoved": 68002,
        "note": "Initial indexed release",
        "author": "publisher",
        "coverageTotal": 76
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "multilingual-instruct-2m",
      "us-contract-clauses"
    ],
    "coverageTotal": 88,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 86,
        "documented": 6,
        "reported": 0,
        "notFound": 1,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "upstream_sources_declared": "documented",
      "annotation_process_described": "documented",
      "collection_timeframe_stated": "documented",
      "publisher_identified": "documented",
      "publisher_is_organisation": "documented",
      "maintainer_contact_listed": "documented",
      "collection_method_described": "reported",
      "license_spdx_recognised": "documented",
      "license_declared": "documented",
      "upstream_license_noted": "documented",
      "redistribution_terms_stated": "documented",
      "commercial_terms_stated": "documented",
      "license_file_present": "documented",
      "attribution_terms_stated": "reported",
      "splits_documented": "documented",
      "file_sizes_available": "documented",
      "description_present": "documented",
      "schema_documented": "documented",
      "file_manifest_available": "documented",
      "row_count_available": "reported",
      "sample_records_available": "not_found",
      "intended_use_documented": "documented",
      "last_modified_known": "documented",
      "usage_statistics_available": "documented",
      "version_history_available": "documented",
      "citation_provided": "documented",
      "known_limitations_documented": "documented",
      "release_notes_available": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "arxiv-cs-fulltext",
    "name": "Preprint Full Text (Computer Science)",
    "publisher": "Open Preprint Archive",
    "publisherSlug": "open-preprint-archive",
    "description": "Parsed full text of computer science preprints with equation and citation structure preserved.",
    "platform": "academic",
    "platformUrl": "https://example.org/academic/arxiv-cs-fulltext",
    "domain": [
      "academic",
      "nlp"
    ],
    "languages": [
      "en"
    ],
    "modality": "text",
    "sizeRows": 684220,
    "sizeBytes": 27500000000,
    "license": {
      "spdx": "CC-BY-4.0",
      "commercialUse": "permitted",
      "attribution": true,
      "shareAlike": false,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2021-06-30T00:00:00Z",
    "lastUpdated": "2026-07-19T00:00:00Z",
    "contentHash": "sha256:2cf9…c89d",
    "version": "v5.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:6b16…bae2",
          "timestamp": "2021-06-30T00:00:00Z",
          "url": "https://example.org/arxiv-cs-fulltext",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:cb5c…b52c",
          "timestamp": "2026-07-19T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:c732…9456",
          "timestamp": "2026-07-19T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:6410…8596",
          "timestamp": "2026-07-19T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:7551…052b",
          "timestamp": "2026-07-19T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:fd7f…59f7",
          "timestamp": "2026-07-19T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "documented"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "documented"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v5.0",
        "date": "2026-07-19",
        "rowsAdded": 27368,
        "rowsRemoved": 2736,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 86
      },
      {
        "version": "v4.0",
        "date": "2024-11-11",
        "rowsAdded": 34211,
        "rowsRemoved": 5473,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 83
      },
      {
        "version": "v3.0",
        "date": "2023-09-12",
        "rowsAdded": 41053,
        "rowsRemoved": 8210,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 80
      },
      {
        "version": "v2.0",
        "date": "2023-07-13",
        "rowsAdded": 47895,
        "rowsRemoved": 10947,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 77
      },
      {
        "version": "v1.0",
        "date": "2022-05-14",
        "rowsAdded": 54737,
        "rowsRemoved": 13684,
        "note": "Initial indexed release",
        "author": "publisher",
        "coverageTotal": 74
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "multilingual-instruct-2m",
      "us-contract-clauses"
    ],
    "coverageTotal": 90,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 86,
        "documented": 6,
        "reported": 0,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 86,
        "documented": 6,
        "reported": 0,
        "notFound": 1,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "collection_method_described": "documented",
      "publisher_identified": "documented",
      "publisher_is_organisation": "documented",
      "maintainer_contact_listed": "documented",
      "collection_timeframe_stated": "documented",
      "annotation_process_described": "documented",
      "upstream_sources_declared": "reported",
      "license_file_present": "documented",
      "redistribution_terms_stated": "documented",
      "license_declared": "documented",
      "attribution_terms_stated": "documented",
      "upstream_license_noted": "documented",
      "commercial_terms_stated": "documented",
      "license_spdx_recognised": "reported",
      "sample_records_available": "documented",
      "file_manifest_available": "documented",
      "description_present": "documented",
      "row_count_available": "documented",
      "file_sizes_available": "documented",
      "schema_documented": "documented",
      "splits_documented": "not_found",
      "version_history_available": "documented",
      "last_modified_known": "documented",
      "release_notes_available": "documented",
      "usage_statistics_available": "documented",
      "known_limitations_documented": "documented",
      "intended_use_documented": "documented",
      "citation_provided": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "financial-filings-10k",
    "name": "Annual Report Filings (10-K)",
    "publisher": "Ledger Archive Group",
    "publisherSlug": "ledger-archive-group",
    "description": "Section-segmented annual report filings from public regulatory disclosures, normalized across filing years.",
    "platform": "kaggle",
    "platformUrl": "https://example.org/kaggle/financial-filings-10k",
    "domain": [
      "finance"
    ],
    "languages": [
      "en"
    ],
    "modality": "text",
    "sizeRows": 148902,
    "sizeBytes": 5800000000,
    "license": {
      "spdx": "Public-Domain",
      "commercialUse": "permitted",
      "attribution": false,
      "shareAlike": false,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2022-02-15T00:00:00Z",
    "lastUpdated": "2026-04-08T00:00:00Z",
    "contentHash": "sha256:e167…b973",
    "version": "v5.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:f74a…5ecb",
          "timestamp": "2022-02-15T00:00:00Z",
          "url": "https://example.org/financial-filings-10k",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:074a…a9ac",
          "timestamp": "2026-04-08T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:5c38…03da",
          "timestamp": "2026-04-08T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:fc8b…0ac7",
          "timestamp": "2026-04-08T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:57fa…ee68",
          "timestamp": "2026-04-08T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:06e0…d4fb",
          "timestamp": "2026-04-08T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "reported"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v5.0",
        "date": "2026-04-08",
        "rowsAdded": 5956,
        "rowsRemoved": 595,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 83
      },
      {
        "version": "v4.0",
        "date": "2024-11-11",
        "rowsAdded": 7445,
        "rowsRemoved": 1191,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 80
      },
      {
        "version": "v3.0",
        "date": "2023-09-12",
        "rowsAdded": 8934,
        "rowsRemoved": 1786,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 77
      },
      {
        "version": "v2.0",
        "date": "2023-07-13",
        "rowsAdded": 10423,
        "rowsRemoved": 2382,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 74
      },
      {
        "version": "v1.0",
        "date": "2022-05-14",
        "rowsAdded": 11912,
        "rowsRemoved": 2978,
        "note": "Initial indexed release",
        "author": "publisher",
        "coverageTotal": 71
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "findata-credit-risk"
    ],
    "coverageTotal": 86,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "maintainer_contact_listed": "documented",
      "collection_timeframe_stated": "documented",
      "annotation_process_described": "documented",
      "publisher_identified": "documented",
      "publisher_is_organisation": "documented",
      "collection_method_described": "documented",
      "upstream_sources_declared": "reported",
      "attribution_terms_stated": "documented",
      "commercial_terms_stated": "documented",
      "upstream_license_noted": "documented",
      "license_file_present": "documented",
      "license_spdx_recognised": "documented",
      "license_declared": "documented",
      "redistribution_terms_stated": "reported",
      "schema_documented": "documented",
      "file_manifest_available": "documented",
      "description_present": "documented",
      "file_sizes_available": "documented",
      "sample_records_available": "documented",
      "row_count_available": "reported",
      "splits_documented": "not_found",
      "version_history_available": "documented",
      "known_limitations_documented": "documented",
      "citation_provided": "documented",
      "last_modified_known": "documented",
      "release_notes_available": "documented",
      "usage_statistics_available": "reported",
      "intended_use_documented": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "common-crawl-en-clean",
    "name": "English Web Corpus (Filtered)",
    "publisher": "Atlas Web Data",
    "publisherSlug": "atlas-web-data",
    "description": "Large-scale web text filtered for quality, boilerplate, and personal information, with per-shard filter reports.",
    "platform": "huggingface",
    "platformUrl": "https://example.org/huggingface/common-crawl-en-clean",
    "domain": [
      "general",
      "nlp"
    ],
    "languages": [
      "en"
    ],
    "modality": "text",
    "sizeRows": 91400000,
    "sizeBytes": 340000000000,
    "license": {
      "spdx": "CC-BY-4.0",
      "commercialUse": "permitted",
      "attribution": true,
      "shareAlike": false,
      "label": "reported",
      "notes": []
    },
    "firstPublished": "2021-09-01T00:00:00Z",
    "lastUpdated": "2026-06-12T00:00:00Z",
    "contentHash": "sha256:0a7c…97ff",
    "version": "v5.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:b098…4981",
          "timestamp": "2021-09-01T00:00:00Z",
          "url": "https://example.org/common-crawl-en-clean",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:d761…b1a4",
          "timestamp": "2026-06-12T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:a1cd…418e",
          "timestamp": "2026-06-12T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:3e2a…d13a",
          "timestamp": "2026-06-12T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:ab85…0ce2",
          "timestamp": "2026-06-12T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:3ec3…85c4",
          "timestamp": "2026-06-12T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "reported"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v5.0",
        "date": "2026-06-12",
        "rowsAdded": 3656000,
        "rowsRemoved": 365600,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 82
      },
      {
        "version": "v4.0",
        "date": "2024-11-11",
        "rowsAdded": 4570000,
        "rowsRemoved": 731200,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 79
      },
      {
        "version": "v3.0",
        "date": "2023-09-12",
        "rowsAdded": 5484000,
        "rowsRemoved": 1096800,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 76
      },
      {
        "version": "v2.0",
        "date": "2023-07-13",
        "rowsAdded": 6398000,
        "rowsRemoved": 1462400,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 73
      },
      {
        "version": "v1.0",
        "date": "2022-05-14",
        "rowsAdded": 7312000,
        "rowsRemoved": 1828000,
        "note": "Initial indexed release",
        "author": "publisher",
        "coverageTotal": 70
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "multilingual-instruct-2m",
      "us-contract-clauses"
    ],
    "coverageTotal": 79,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 86,
        "documented": 6,
        "reported": 0,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 64,
        "documented": 4,
        "reported": 1,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 86,
        "documented": 6,
        "reported": 0,
        "notFound": 1,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "maintainer_contact_listed": "documented",
      "publisher_is_organisation": "documented",
      "publisher_identified": "documented",
      "collection_timeframe_stated": "documented",
      "upstream_sources_declared": "documented",
      "annotation_process_described": "documented",
      "collection_method_described": "not_found",
      "commercial_terms_stated": "documented",
      "license_declared": "documented",
      "attribution_terms_stated": "documented",
      "upstream_license_noted": "documented",
      "license_file_present": "reported",
      "redistribution_terms_stated": "not_found",
      "license_spdx_recognised": "not_found",
      "file_manifest_available": "documented",
      "sample_records_available": "documented",
      "splits_documented": "documented",
      "row_count_available": "documented",
      "description_present": "documented",
      "file_sizes_available": "reported",
      "schema_documented": "not_found",
      "version_history_available": "documented",
      "intended_use_documented": "documented",
      "release_notes_available": "documented",
      "usage_statistics_available": "documented",
      "citation_provided": "documented",
      "known_limitations_documented": "documented",
      "last_modified_known": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "speech-commands-40",
    "name": "Spoken Command Audio (40 classes)",
    "publisher": "Acoustic Research Collective",
    "publisherSlug": "acoustic-research-collective",
    "description": "Short spoken command clips recorded under consent, labeled by keyword with speaker demographic distribution.",
    "platform": "huggingface",
    "platformUrl": "https://example.org/huggingface/speech-commands-40",
    "domain": [
      "audio",
      "speech"
    ],
    "languages": [
      "en"
    ],
    "modality": "audio",
    "sizeRows": 214800,
    "sizeBytes": 12100000000,
    "license": {
      "spdx": "CC-BY-4.0",
      "commercialUse": "permitted",
      "attribution": true,
      "shareAlike": false,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2022-07-11T00:00:00Z",
    "lastUpdated": "2026-01-30T00:00:00Z",
    "contentHash": "sha256:7baa…dc49",
    "version": "v5.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:0a26…5ce9",
          "timestamp": "2022-07-11T00:00:00Z",
          "url": "https://example.org/speech-commands-40",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:8707…7ac1",
          "timestamp": "2026-01-30T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:9ba5…b538",
          "timestamp": "2026-01-30T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:6c90…c8bf",
          "timestamp": "2026-01-30T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:dcc3…9d6d",
          "timestamp": "2026-01-30T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:8376…1fb1",
          "timestamp": "2026-01-30T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "reported"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v5.0",
        "date": "2026-01-30",
        "rowsAdded": 8592,
        "rowsRemoved": 859,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 80
      },
      {
        "version": "v4.0",
        "date": "2024-11-11",
        "rowsAdded": 10740,
        "rowsRemoved": 1718,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 77
      },
      {
        "version": "v3.0",
        "date": "2023-09-12",
        "rowsAdded": 12888,
        "rowsRemoved": 2577,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 74
      },
      {
        "version": "v2.0",
        "date": "2023-07-13",
        "rowsAdded": 15036,
        "rowsRemoved": 3436,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 71
      },
      {
        "version": "v1.0",
        "date": "2022-05-14",
        "rowsAdded": 17184,
        "rowsRemoved": 4296,
        "note": "Initial indexed release",
        "author": "publisher",
        "coverageTotal": 68
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "audio_path",
        "type": "string",
        "nullable": false,
        "description": "Relative path to the clip"
      },
      {
        "name": "transcript",
        "type": "string",
        "nullable": true,
        "description": "Reference transcript"
      },
      {
        "name": "duration_ms",
        "type": "int",
        "nullable": false,
        "description": "Clip length in milliseconds"
      },
      {
        "name": "sample_rate",
        "type": "int",
        "nullable": false,
        "description": "Samples per second"
      },
      {
        "name": "speaker_id",
        "type": "string",
        "nullable": true,
        "description": "Pseudonymous speaker key"
      }
    ],
    "sampleRecords": [
      {
        "id": "aud_000001",
        "audio_path": "clips/0001.wav",
        "transcript": "forward",
        "duration_ms": 1000,
        "sample_rate": 16000,
        "speaker_id": "spk_41a"
      },
      {
        "id": "aud_000002",
        "audio_path": "clips/0002.wav",
        "transcript": "stop",
        "duration_ms": 980,
        "sample_rate": 16000,
        "speaker_id": "spk_41a"
      },
      {
        "id": "aud_000003",
        "audio_path": "clips/0003.wav",
        "transcript": "left",
        "duration_ms": 1020,
        "sample_rate": 16000,
        "speaker_id": "spk_7c2"
      },
      {
        "id": "aud_000004",
        "audio_path": "clips/0004.wav",
        "transcript": "right",
        "duration_ms": 990,
        "sample_rate": 16000,
        "speaker_id": "spk_7c2"
      },
      {
        "id": "aud_000005",
        "audio_path": "clips/0005.wav",
        "transcript": null,
        "duration_ms": 1010,
        "sample_rate": 16000,
        "speaker_id": "spk_9f0"
      }
    ],
    "relatedSlugs": [],
    "coverageTotal": 84,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 86,
        "documented": 6,
        "reported": 0,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 86,
        "documented": 6,
        "reported": 0,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 71,
        "documented": 5,
        "reported": 0,
        "notFound": 2,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "publisher_identified": "documented",
      "collection_timeframe_stated": "documented",
      "annotation_process_described": "documented",
      "collection_method_described": "documented",
      "publisher_is_organisation": "documented",
      "upstream_sources_declared": "documented",
      "maintainer_contact_listed": "not_found",
      "commercial_terms_stated": "documented",
      "redistribution_terms_stated": "documented",
      "license_file_present": "documented",
      "attribution_terms_stated": "documented",
      "license_spdx_recognised": "documented",
      "upstream_license_noted": "documented",
      "license_declared": "reported",
      "file_manifest_available": "documented",
      "splits_documented": "documented",
      "description_present": "documented",
      "sample_records_available": "documented",
      "file_sizes_available": "documented",
      "schema_documented": "documented",
      "row_count_available": "not_found",
      "last_modified_known": "documented",
      "citation_provided": "documented",
      "usage_statistics_available": "documented",
      "release_notes_available": "documented",
      "known_limitations_documented": "documented",
      "version_history_available": "not_found",
      "intended_use_documented": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "legislative-transcripts-us",
    "name": "Legislative Session Transcripts",
    "publisher": "Civic Record Project",
    "publisherSlug": "civic-record-project",
    "description": "Speaker-attributed transcripts of public legislative proceedings, aligned to official session records.",
    "platform": "github",
    "platformUrl": "https://example.org/github/legislative-transcripts-us",
    "domain": [
      "legal",
      "civic"
    ],
    "languages": [
      "en"
    ],
    "modality": "text",
    "sizeRows": 402119,
    "sizeBytes": 2400000000,
    "license": {
      "spdx": "Public-Domain",
      "commercialUse": "permitted",
      "attribution": false,
      "shareAlike": false,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2023-04-20T00:00:00Z",
    "lastUpdated": "2026-03-17T00:00:00Z",
    "contentHash": "sha256:0241…86aa",
    "version": "v4.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:5728…33ce",
          "timestamp": "2023-04-20T00:00:00Z",
          "url": "https://example.org/legislative-transcripts-us",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:9e48…0300",
          "timestamp": "2026-03-17T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:c85d…f262",
          "timestamp": "2026-03-17T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:916e…5522",
          "timestamp": "2026-03-17T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:d2a9…fbf4",
          "timestamp": "2026-03-17T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:ae7b…0846",
          "timestamp": "2026-03-17T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "reported"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v4.0",
        "date": "2026-03-17",
        "rowsAdded": 16084,
        "rowsRemoved": 1608,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 79
      },
      {
        "version": "v3.0",
        "date": "2024-11-11",
        "rowsAdded": 20105,
        "rowsRemoved": 3216,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 76
      },
      {
        "version": "v2.0",
        "date": "2023-09-12",
        "rowsAdded": 24127,
        "rowsRemoved": 4825,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 73
      },
      {
        "version": "v1.0",
        "date": "2023-07-13",
        "rowsAdded": 28148,
        "rowsRemoved": 6433,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 70
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "us-contract-clauses",
      "legal-qa-pairs"
    ],
    "coverageTotal": 84,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 86,
        "documented": 6,
        "reported": 0,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "upstream_sources_declared": "documented",
      "publisher_is_organisation": "documented",
      "publisher_identified": "documented",
      "annotation_process_described": "documented",
      "maintainer_contact_listed": "documented",
      "collection_method_described": "documented",
      "collection_timeframe_stated": "not_found",
      "upstream_license_noted": "documented",
      "license_file_present": "documented",
      "license_spdx_recognised": "documented",
      "license_declared": "documented",
      "commercial_terms_stated": "documented",
      "attribution_terms_stated": "documented",
      "redistribution_terms_stated": "reported",
      "row_count_available": "documented",
      "file_sizes_available": "documented",
      "schema_documented": "documented",
      "description_present": "documented",
      "sample_records_available": "documented",
      "file_manifest_available": "reported",
      "splits_documented": "not_found",
      "known_limitations_documented": "documented",
      "usage_statistics_available": "documented",
      "citation_provided": "documented",
      "last_modified_known": "documented",
      "release_notes_available": "documented",
      "version_history_available": "reported",
      "intended_use_documented": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "terra-landcover-tiles",
    "name": "Satellite Land Cover Tiles",
    "publisher": "Terra Observation Consortium",
    "publisherSlug": "terra-observation-consortium",
    "description": "Labeled satellite tiles for land cover classification, with acquisition date and sensor metadata per tile.",
    "platform": "kaggle",
    "platformUrl": "https://example.org/kaggle/terra-landcover-tiles",
    "domain": [
      "geospatial",
      "vision"
    ],
    "languages": [
      "en"
    ],
    "modality": "image",
    "sizeRows": 1940000,
    "sizeBytes": 210000000000,
    "license": {
      "spdx": "CC-BY-4.0",
      "commercialUse": "permitted",
      "attribution": true,
      "shareAlike": false,
      "label": "reported",
      "notes": []
    },
    "firstPublished": "2022-10-05T00:00:00Z",
    "lastUpdated": "2025-12-02T00:00:00Z",
    "contentHash": "sha256:458a…70ea",
    "version": "v4.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:37ae…e895",
          "timestamp": "2022-10-05T00:00:00Z",
          "url": "https://example.org/terra-landcover-tiles",
          "evidence": "documented"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:a71a…8646",
          "timestamp": "2025-12-02T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:81d5…921c",
          "timestamp": "2025-12-02T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "annotate",
          "stage": "annotate",
          "label": "Annotation",
          "description": "Labels or structural annotations added and reviewed.",
          "actor": "review-team",
          "hash": "sha256:59bf…0c3b",
          "timestamp": "2025-12-02T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:7d75…97f2",
          "timestamp": "2025-12-02T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:2400…6d3c",
          "timestamp": "2025-12-02T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "documented"
        },
        {
          "from": "clean",
          "to": "annotate",
          "evidence": "reported"
        },
        {
          "from": "annotate",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 100,
      "undocumentedStages": []
    },
    "versions": [
      {
        "version": "v4.0",
        "date": "2025-12-02",
        "rowsAdded": 77600,
        "rowsRemoved": 7760,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 75
      },
      {
        "version": "v3.0",
        "date": "2024-11-11",
        "rowsAdded": 97000,
        "rowsRemoved": 15520,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 72
      },
      {
        "version": "v2.0",
        "date": "2023-09-12",
        "rowsAdded": 116400,
        "rowsRemoved": 23280,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 69
      },
      {
        "version": "v1.0",
        "date": "2023-07-13",
        "rowsAdded": 135800,
        "rowsRemoved": 31040,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 66
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "image_path",
        "type": "string",
        "nullable": false,
        "description": "Relative path to the image file"
      },
      {
        "name": "label",
        "type": "string",
        "nullable": true,
        "description": "Primary class label"
      },
      {
        "name": "width",
        "type": "int",
        "nullable": false,
        "description": "Pixel width"
      },
      {
        "name": "height",
        "type": "int",
        "nullable": false,
        "description": "Pixel height"
      },
      {
        "name": "captured_at",
        "type": "timestamp",
        "nullable": true,
        "description": "Capture time where recorded"
      }
    ],
    "sampleRecords": [
      {
        "id": "img_000001",
        "image_path": "tiles/0001.png",
        "label": "cropland",
        "width": 512,
        "height": 512,
        "captured_at": "2025-06-11T00:00:00Z"
      },
      {
        "id": "img_000002",
        "image_path": "tiles/0002.png",
        "label": "urban",
        "width": 512,
        "height": 512,
        "captured_at": "2025-06-11T00:00:00Z"
      },
      {
        "id": "img_000003",
        "image_path": "tiles/0003.png",
        "label": "forest",
        "width": 512,
        "height": 512,
        "captured_at": "2025-06-12T00:00:00Z"
      },
      {
        "id": "img_000004",
        "image_path": "tiles/0004.png",
        "label": "water",
        "width": 512,
        "height": 512,
        "captured_at": "2025-06-12T00:00:00Z"
      },
      {
        "id": "img_000005",
        "image_path": "tiles/0005.png",
        "label": "barren",
        "width": 512,
        "height": 512,
        "captured_at": null
      }
    ],
    "relatedSlugs": [
      "radiology-chest-xray"
    ],
    "coverageTotal": 73,
    "coverageBand": "partial",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 64,
        "documented": 4,
        "reported": 1,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 71,
        "documented": 5,
        "reported": 0,
        "notFound": 2,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "publisher_is_organisation": "documented",
      "publisher_identified": "documented",
      "upstream_sources_declared": "documented",
      "collection_timeframe_stated": "documented",
      "maintainer_contact_listed": "documented",
      "collection_method_described": "reported",
      "annotation_process_described": "not_found",
      "redistribution_terms_stated": "documented",
      "commercial_terms_stated": "documented",
      "license_spdx_recognised": "documented",
      "attribution_terms_stated": "documented",
      "upstream_license_noted": "reported",
      "license_file_present": "not_found",
      "license_declared": "not_found",
      "description_present": "documented",
      "row_count_available": "documented",
      "splits_documented": "documented",
      "sample_records_available": "documented",
      "file_sizes_available": "documented",
      "schema_documented": "reported",
      "file_manifest_available": "not_found",
      "usage_statistics_available": "documented",
      "citation_provided": "documented",
      "release_notes_available": "documented",
      "known_limitations_documented": "documented",
      "version_history_available": "documented",
      "last_modified_known": "not_found",
      "intended_use_documented": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "code-review-comments",
    "name": "Code Review Comment Threads",
    "publisher": "Commons Code Index",
    "publisherSlug": "commons-code-index",
    "description": "Review comments paired with the diffs they reference, from repositories with permissive licensing.",
    "platform": "github",
    "platformUrl": "https://example.org/github/code-review-comments",
    "domain": [
      "code",
      "nlp"
    ],
    "languages": [
      "en"
    ],
    "modality": "text",
    "sizeRows": 3120887,
    "sizeBytes": 4400000000,
    "license": {
      "spdx": "Apache-2.0",
      "commercialUse": "permitted",
      "attribution": false,
      "shareAlike": false,
      "label": "reported",
      "notes": []
    },
    "firstPublished": "2023-02-27T00:00:00Z",
    "lastUpdated": "2026-02-14T00:00:00Z",
    "contentHash": "sha256:d20b…ff99",
    "version": "v4.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:57f9…b8b3",
          "timestamp": "2023-02-27T00:00:00Z",
          "url": "https://example.org/code-review-comments",
          "evidence": "reported"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:391d…cfbd",
          "timestamp": "2026-02-14T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:483c…d835",
          "timestamp": "2026-02-14T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:ce9c…2f6c",
          "timestamp": "2026-02-14T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:0357…9151",
          "timestamp": "2026-02-14T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "reported"
        },
        {
          "from": "clean",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 83,
      "undocumentedStages": [
        "annotate"
      ]
    },
    "versions": [
      {
        "version": "v4.0",
        "date": "2026-02-14",
        "rowsAdded": 124835,
        "rowsRemoved": 12483,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 74
      },
      {
        "version": "v3.0",
        "date": "2024-11-11",
        "rowsAdded": 156044,
        "rowsRemoved": 24967,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 71
      },
      {
        "version": "v2.0",
        "date": "2023-09-12",
        "rowsAdded": 187253,
        "rowsRemoved": 37450,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 68
      },
      {
        "version": "v1.0",
        "date": "2023-07-13",
        "rowsAdded": 218462,
        "rowsRemoved": 49934,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 65
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "multilingual-instruct-2m",
      "commons-python-permissive"
    ],
    "coverageTotal": 71,
    "coverageBand": "partial",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 64,
        "documented": 4,
        "reported": 1,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 71,
        "documented": 5,
        "reported": 0,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 71,
        "documented": 5,
        "reported": 0,
        "notFound": 2,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "publisher_identified": "documented",
      "maintainer_contact_listed": "documented",
      "annotation_process_described": "documented",
      "collection_method_described": "documented",
      "publisher_is_organisation": "documented",
      "collection_timeframe_stated": "reported",
      "upstream_sources_declared": "not_found",
      "license_declared": "documented",
      "license_file_present": "documented",
      "redistribution_terms_stated": "documented",
      "upstream_license_noted": "documented",
      "attribution_terms_stated": "reported",
      "commercial_terms_stated": "not_found",
      "license_spdx_recognised": "not_found",
      "description_present": "documented",
      "sample_records_available": "documented",
      "file_sizes_available": "documented",
      "splits_documented": "documented",
      "file_manifest_available": "documented",
      "row_count_available": "not_found",
      "schema_documented": "not_found",
      "known_limitations_documented": "documented",
      "last_modified_known": "documented",
      "citation_provided": "documented",
      "release_notes_available": "documented",
      "usage_statistics_available": "documented",
      "intended_use_documented": "not_found",
      "version_history_available": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "support-transcripts-anon",
    "name": "Customer Support Transcripts (Anonymized)",
    "publisher": "Helix Service Labs",
    "publisherSlug": "helix-service-labs",
    "description": "Anonymized support conversations with resolution labels; anonymization method documented but not independently audited.",
    "platform": "huggingface",
    "platformUrl": "https://example.org/huggingface/support-transcripts-anon",
    "domain": [
      "nlp",
      "commercial"
    ],
    "languages": [
      "en",
      "es"
    ],
    "modality": "text",
    "sizeRows": 680400,
    "sizeBytes": 1900000000,
    "license": {
      "spdx": "CC-BY-SA-4.0",
      "commercialUse": "permitted",
      "attribution": true,
      "shareAlike": true,
      "label": "reported",
      "notes": []
    },
    "firstPublished": "2023-09-12T00:00:00Z",
    "lastUpdated": "2026-05-29T00:00:00Z",
    "contentHash": "sha256:b49c…5da9",
    "version": "v4.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:e515…d7bc",
          "timestamp": "2023-09-12T00:00:00Z",
          "url": "https://example.org/support-transcripts-anon",
          "evidence": "reported"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:daf1…80b5",
          "timestamp": "2026-05-29T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:1465…659e",
          "timestamp": "2026-05-29T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:79d0…673d",
          "timestamp": "2026-05-29T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:4bf4…862b",
          "timestamp": "2026-05-29T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "reported"
        },
        {
          "from": "clean",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 83,
      "undocumentedStages": [
        "annotate"
      ]
    },
    "versions": [
      {
        "version": "v4.0",
        "date": "2026-05-29",
        "rowsAdded": 27216,
        "rowsRemoved": 2721,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 72
      },
      {
        "version": "v3.0",
        "date": "2024-11-11",
        "rowsAdded": 34020,
        "rowsRemoved": 5443,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 69
      },
      {
        "version": "v2.0",
        "date": "2023-09-12",
        "rowsAdded": 40824,
        "rowsRemoved": 8164,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 66
      },
      {
        "version": "v1.0",
        "date": "2023-07-13",
        "rowsAdded": 47628,
        "rowsRemoved": 10886,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 63
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "multilingual-instruct-2m",
      "us-contract-clauses"
    ],
    "coverageTotal": 71,
    "coverageBand": "partial",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 71,
        "documented": 5,
        "reported": 0,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 64,
        "documented": 4,
        "reported": 1,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 71,
        "documented": 5,
        "reported": 0,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "collection_timeframe_stated": "documented",
      "collection_method_described": "documented",
      "annotation_process_described": "documented",
      "publisher_is_organisation": "documented",
      "maintainer_contact_listed": "documented",
      "publisher_identified": "not_found",
      "upstream_sources_declared": "not_found",
      "attribution_terms_stated": "documented",
      "license_spdx_recognised": "documented",
      "redistribution_terms_stated": "documented",
      "license_declared": "documented",
      "upstream_license_noted": "reported",
      "license_file_present": "not_found",
      "commercial_terms_stated": "not_found",
      "sample_records_available": "documented",
      "row_count_available": "documented",
      "description_present": "documented",
      "file_manifest_available": "documented",
      "splits_documented": "documented",
      "schema_documented": "not_found",
      "file_sizes_available": "not_found",
      "citation_provided": "documented",
      "last_modified_known": "documented",
      "usage_statistics_available": "documented",
      "version_history_available": "documented",
      "known_limitations_documented": "documented",
      "intended_use_documented": "reported",
      "release_notes_available": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "clinical-notes-deid",
    "name": "De-identified Clinical Notes",
    "publisher": "Meridian Health Data Collective",
    "publisherSlug": "meridian-health-data-collective",
    "description": "Clinical notes processed through a documented de-identification pipeline. Research use only; commercial use prohibited.",
    "platform": "direct",
    "platformUrl": "https://example.org/direct/clinical-notes-deid",
    "domain": [
      "medical"
    ],
    "languages": [
      "en"
    ],
    "modality": "text",
    "sizeRows": 310004,
    "sizeBytes": 880000000,
    "license": {
      "spdx": "Proprietary",
      "commercialUse": "restricted",
      "attribution": false,
      "shareAlike": false,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2023-06-01T00:00:00Z",
    "lastUpdated": "2026-04-25T00:00:00Z",
    "contentHash": "sha256:d1e2…8075",
    "version": "v4.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:8269…dd02",
          "timestamp": "2023-06-01T00:00:00Z",
          "url": "https://example.org/clinical-notes-deid",
          "evidence": "reported"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:5f79…dca6",
          "timestamp": "2026-04-25T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:2697…6d61",
          "timestamp": "2026-04-25T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:601b…20b4",
          "timestamp": "2026-04-25T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:25d1…f675",
          "timestamp": "2026-04-25T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "reported"
        },
        {
          "from": "clean",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 83,
      "undocumentedStages": [
        "annotate"
      ]
    },
    "versions": [
      {
        "version": "v4.0",
        "date": "2026-04-25",
        "rowsAdded": 12400,
        "rowsRemoved": 1240,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 70
      },
      {
        "version": "v3.0",
        "date": "2024-11-11",
        "rowsAdded": 15500,
        "rowsRemoved": 2480,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 67
      },
      {
        "version": "v2.0",
        "date": "2023-09-12",
        "rowsAdded": 18600,
        "rowsRemoved": 3720,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 64
      },
      {
        "version": "v1.0",
        "date": "2023-07-13",
        "rowsAdded": 21700,
        "rowsRemoved": 4960,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 61
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "radiology-chest-xray"
    ],
    "coverageTotal": 79,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 64,
        "documented": 4,
        "reported": 1,
        "notFound": 2,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "publisher_identified": "documented",
      "upstream_sources_declared": "documented",
      "collection_timeframe_stated": "documented",
      "maintainer_contact_listed": "documented",
      "collection_method_described": "documented",
      "publisher_is_organisation": "reported",
      "annotation_process_described": "not_found",
      "attribution_terms_stated": "documented",
      "redistribution_terms_stated": "documented",
      "upstream_license_noted": "documented",
      "license_file_present": "documented",
      "license_spdx_recognised": "documented",
      "commercial_terms_stated": "documented",
      "license_declared": "reported",
      "sample_records_available": "documented",
      "file_sizes_available": "documented",
      "file_manifest_available": "documented",
      "description_present": "documented",
      "schema_documented": "documented",
      "splits_documented": "reported",
      "row_count_available": "not_found",
      "known_limitations_documented": "documented",
      "release_notes_available": "documented",
      "citation_provided": "documented",
      "version_history_available": "documented",
      "last_modified_known": "reported",
      "intended_use_documented": "not_found",
      "usage_statistics_available": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "recipe-nutrition-db",
    "name": "Recipes with Nutritional Estimates",
    "publisher": "Culinary Data Group",
    "publisherSlug": "culinary-data-group",
    "description": "Recipe records with ingredient parsing and estimated nutritional values. Estimates are model-derived, not measured.",
    "platform": "kaggle",
    "platformUrl": "https://example.org/kaggle/recipe-nutrition-db",
    "domain": [
      "general",
      "tabular"
    ],
    "languages": [
      "en"
    ],
    "modality": "tabular",
    "sizeRows": 2204990,
    "sizeBytes": 740000000,
    "license": {
      "spdx": "CC-BY-4.0",
      "commercialUse": "permitted",
      "attribution": true,
      "shareAlike": false,
      "label": "reported",
      "notes": []
    },
    "firstPublished": "2022-04-18T00:00:00Z",
    "lastUpdated": "2025-11-08T00:00:00Z",
    "contentHash": "sha256:ef09…7e3b",
    "version": "v4.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:cc39…29a6",
          "timestamp": "2022-04-18T00:00:00Z",
          "url": "https://example.org/recipe-nutrition-db",
          "evidence": "reported"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:e6df…0028",
          "timestamp": "2025-11-08T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:b9e9…be79",
          "timestamp": "2025-11-08T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:c8ce…3af5",
          "timestamp": "2025-11-08T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:5a2b…1a68",
          "timestamp": "2025-11-08T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "reported"
        },
        {
          "from": "clean",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 83,
      "undocumentedStages": [
        "annotate"
      ]
    },
    "versions": [
      {
        "version": "v4.0",
        "date": "2025-11-08",
        "rowsAdded": 88199,
        "rowsRemoved": 8819,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 65
      },
      {
        "version": "v3.0",
        "date": "2024-11-11",
        "rowsAdded": 110249,
        "rowsRemoved": 17639,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 62
      },
      {
        "version": "v2.0",
        "date": "2023-09-12",
        "rowsAdded": 132299,
        "rowsRemoved": 26459,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 59
      },
      {
        "version": "v1.0",
        "date": "2023-07-13",
        "rowsAdded": 154349,
        "rowsRemoved": 35279,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 56
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "features",
        "type": "json",
        "nullable": false,
        "description": "Feature vector as key-value pairs"
      },
      {
        "name": "target",
        "type": "float",
        "nullable": true,
        "description": "Supervised target where present"
      },
      {
        "name": "split",
        "type": "string",
        "nullable": false,
        "description": "train / validation / test"
      },
      {
        "name": "recorded_at",
        "type": "timestamp",
        "nullable": true,
        "description": "Record timestamp where available"
      }
    ],
    "sampleRecords": [
      {
        "id": "row_000001",
        "features": {
          "age_band": "35-44",
          "tenure_months": 54,
          "utilization": 0.31
        },
        "target": 0.0,
        "split": "train",
        "recorded_at": "2024-01-14T00:00:00Z"
      },
      {
        "id": "row_000002",
        "features": {
          "age_band": "25-34",
          "tenure_months": 11,
          "utilization": 0.78
        },
        "target": 1.0,
        "split": "train",
        "recorded_at": "2024-01-14T00:00:00Z"
      },
      {
        "id": "row_000003",
        "features": {
          "age_band": "45-54",
          "tenure_months": 132,
          "utilization": 0.12
        },
        "target": 0.0,
        "split": "validation",
        "recorded_at": null
      },
      {
        "id": "row_000004",
        "features": {
          "age_band": "18-24",
          "tenure_months": 4,
          "utilization": 0.91
        },
        "target": 1.0,
        "split": "test",
        "recorded_at": "2024-02-02T00:00:00Z"
      },
      {
        "id": "row_000005",
        "features": {
          "age_band": "55-64",
          "tenure_months": 201,
          "utilization": 0.08
        },
        "target": null,
        "split": "test",
        "recorded_at": null
      }
    ],
    "relatedSlugs": [
      "wiki-qa-multilingual",
      "common-crawl-en-clean",
      "findata-credit-risk"
    ],
    "coverageTotal": 66,
    "coverageBand": "partial",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 71,
        "documented": 5,
        "reported": 0,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 64,
        "documented": 4,
        "reported": 1,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 64,
        "documented": 4,
        "reported": 1,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 64,
        "documented": 4,
        "reported": 1,
        "notFound": 2,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "collection_method_described": "documented",
      "collection_timeframe_stated": "documented",
      "publisher_is_organisation": "documented",
      "upstream_sources_declared": "documented",
      "maintainer_contact_listed": "documented",
      "publisher_identified": "not_found",
      "annotation_process_described": "not_found",
      "attribution_terms_stated": "documented",
      "redistribution_terms_stated": "documented",
      "license_declared": "documented",
      "upstream_license_noted": "documented",
      "license_file_present": "reported",
      "commercial_terms_stated": "not_found",
      "license_spdx_recognised": "not_found",
      "file_sizes_available": "documented",
      "description_present": "documented",
      "row_count_available": "documented",
      "file_manifest_available": "documented",
      "sample_records_available": "reported",
      "splits_documented": "not_found",
      "schema_documented": "not_found",
      "known_limitations_documented": "documented",
      "intended_use_documented": "documented",
      "citation_provided": "documented",
      "usage_statistics_available": "documented",
      "last_modified_known": "reported",
      "version_history_available": "not_found",
      "release_notes_available": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "radiology-chest-xray",
    "name": "Chest Radiograph Study Set",
    "publisher": "Radiology Data Commons",
    "publisherSlug": "radiology-data-commons",
    "description": "Radiograph studies with radiologist-assigned findings. Non-commercial and share-alike terms apply to all derivatives.",
    "platform": "academic",
    "platformUrl": "https://example.org/academic/radiology-chest-xray",
    "domain": [
      "medical",
      "vision"
    ],
    "languages": [
      "en"
    ],
    "modality": "image",
    "sizeRows": 224316,
    "sizeBytes": 94000000000,
    "license": {
      "spdx": "CC-BY-NC-SA-4.0",
      "commercialUse": "restricted",
      "attribution": true,
      "shareAlike": true,
      "label": "documented",
      "notes": []
    },
    "firstPublished": "2021-12-03T00:00:00Z",
    "lastUpdated": "2025-08-19T00:00:00Z",
    "contentHash": "sha256:eeeb…4eeb",
    "version": "v4.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:2c4a…5023",
          "timestamp": "2021-12-03T00:00:00Z",
          "url": "https://example.org/radiology-chest-xray",
          "evidence": "reported"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:0603…ac21",
          "timestamp": "2025-08-19T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:0555…5096",
          "timestamp": "2025-08-19T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:a4c8…0447",
          "timestamp": "2025-08-19T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:3f3c…ef14",
          "timestamp": "2025-08-19T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "reported"
        },
        {
          "from": "clean",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 83,
      "undocumentedStages": [
        "annotate"
      ]
    },
    "versions": [
      {
        "version": "v4.0",
        "date": "2025-08-19",
        "rowsAdded": 8972,
        "rowsRemoved": 897,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 69
      },
      {
        "version": "v3.0",
        "date": "2024-11-11",
        "rowsAdded": 11215,
        "rowsRemoved": 1794,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 66
      },
      {
        "version": "v2.0",
        "date": "2023-09-12",
        "rowsAdded": 13458,
        "rowsRemoved": 2691,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 63
      },
      {
        "version": "v1.0",
        "date": "2023-07-13",
        "rowsAdded": 15702,
        "rowsRemoved": 3589,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 60
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "image_path",
        "type": "string",
        "nullable": false,
        "description": "Relative path to the image file"
      },
      {
        "name": "label",
        "type": "string",
        "nullable": true,
        "description": "Primary class label"
      },
      {
        "name": "width",
        "type": "int",
        "nullable": false,
        "description": "Pixel width"
      },
      {
        "name": "height",
        "type": "int",
        "nullable": false,
        "description": "Pixel height"
      },
      {
        "name": "captured_at",
        "type": "timestamp",
        "nullable": true,
        "description": "Capture time where recorded"
      }
    ],
    "sampleRecords": [
      {
        "id": "img_000001",
        "image_path": "tiles/0001.png",
        "label": "cropland",
        "width": 512,
        "height": 512,
        "captured_at": "2025-06-11T00:00:00Z"
      },
      {
        "id": "img_000002",
        "image_path": "tiles/0002.png",
        "label": "urban",
        "width": 512,
        "height": 512,
        "captured_at": "2025-06-11T00:00:00Z"
      },
      {
        "id": "img_000003",
        "image_path": "tiles/0003.png",
        "label": "forest",
        "width": 512,
        "height": 512,
        "captured_at": "2025-06-12T00:00:00Z"
      },
      {
        "id": "img_000004",
        "image_path": "tiles/0004.png",
        "label": "water",
        "width": 512,
        "height": 512,
        "captured_at": "2025-06-12T00:00:00Z"
      },
      {
        "id": "img_000005",
        "image_path": "tiles/0005.png",
        "label": "barren",
        "width": 512,
        "height": 512,
        "captured_at": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "terra-landcover-tiles",
      "clinical-notes-deid"
    ],
    "coverageTotal": 75,
    "coverageBand": "extensive",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 79,
        "documented": 5,
        "reported": 1,
        "notFound": 1,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 93,
        "documented": 6,
        "reported": 1,
        "notFound": 0,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 71,
        "documented": 5,
        "reported": 0,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 57,
        "documented": 4,
        "reported": 0,
        "notFound": 3,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "upstream_sources_declared": "documented",
      "collection_timeframe_stated": "documented",
      "publisher_identified": "documented",
      "publisher_is_organisation": "documented",
      "maintainer_contact_listed": "documented",
      "annotation_process_described": "reported",
      "collection_method_described": "not_found",
      "commercial_terms_stated": "documented",
      "upstream_license_noted": "documented",
      "license_spdx_recognised": "documented",
      "license_declared": "documented",
      "attribution_terms_stated": "documented",
      "redistribution_terms_stated": "documented",
      "license_file_present": "reported",
      "file_manifest_available": "documented",
      "row_count_available": "documented",
      "schema_documented": "documented",
      "sample_records_available": "documented",
      "description_present": "documented",
      "splits_documented": "not_found",
      "file_sizes_available": "not_found",
      "known_limitations_documented": "documented",
      "citation_provided": "documented",
      "intended_use_documented": "documented",
      "last_modified_known": "documented",
      "release_notes_available": "not_found",
      "usage_statistics_available": "not_found",
      "version_history_available": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "consumer-reviews-multi",
    "name": "Consumer Product Reviews",
    "publisher": "Consumer Signal Lab",
    "publisherSlug": "consumer-signal-lab",
    "description": "Product reviews with rating and category labels. Collection method partially documented; non-commercial license.",
    "platform": "kaggle",
    "platformUrl": "https://example.org/kaggle/consumer-reviews-multi",
    "domain": [
      "commercial",
      "nlp"
    ],
    "languages": [
      "en",
      "de",
      "fr"
    ],
    "modality": "text",
    "sizeRows": 8900120,
    "sizeBytes": 3300000000,
    "license": {
      "spdx": "CC-BY-NC-4.0",
      "commercialUse": "restricted",
      "attribution": true,
      "shareAlike": false,
      "label": "reported",
      "notes": []
    },
    "firstPublished": "2022-01-22T00:00:00Z",
    "lastUpdated": "2025-09-14T00:00:00Z",
    "contentHash": "sha256:9f9b…3b7b",
    "version": "v4.0",
    "lineage": {
      "nodes": [
        {
          "id": "source",
          "stage": "source",
          "label": "Original source",
          "description": "Origin registry or repository the records were first published to.",
          "actor": "publisher",
          "hash": "sha256:b9a9…bc71",
          "timestamp": "2022-01-22T00:00:00Z",
          "url": "https://example.org/consumer-reviews-multi",
          "evidence": "reported"
        },
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:76d6…0cc5",
          "timestamp": "2025-09-14T00:00:00Z",
          "url": null,
          "evidence": "documented"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:70ae…73cf",
          "timestamp": "2025-09-14T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "embed",
          "stage": "embed",
          "label": "Embedding generation",
          "description": "Vector representations generated for retrieval use.",
          "actor": "job:embed-batch",
          "hash": "sha256:d132…5d01",
          "timestamp": "2025-09-14T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:5cea…733b",
          "timestamp": "2025-09-14T00:00:00Z",
          "url": null,
          "evidence": "documented"
        }
      ],
      "edges": [
        {
          "from": "source",
          "to": "scrape",
          "evidence": "documented"
        },
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "reported"
        },
        {
          "from": "clean",
          "to": "embed",
          "evidence": "reported"
        },
        {
          "from": "embed",
          "to": "current",
          "evidence": "documented"
        }
      ],
      "completeness": 83,
      "undocumentedStages": [
        "annotate"
      ]
    },
    "versions": [
      {
        "version": "v4.0",
        "date": "2025-09-14",
        "rowsAdded": 356004,
        "rowsRemoved": 35600,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 60
      },
      {
        "version": "v3.0",
        "date": "2024-11-11",
        "rowsAdded": 445006,
        "rowsRemoved": 71200,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 57
      },
      {
        "version": "v2.0",
        "date": "2023-09-12",
        "rowsAdded": 534007,
        "rowsRemoved": 106801,
        "note": "Corrected annotation drift in three subsets",
        "author": "archivum-ingest",
        "coverageTotal": 54
      },
      {
        "version": "v1.0",
        "date": "2023-07-13",
        "rowsAdded": 623008,
        "rowsRemoved": 142401,
        "note": "Filtered personal information from earlier shards",
        "author": "publisher",
        "coverageTotal": 51
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "multilingual-instruct-2m",
      "us-contract-clauses"
    ],
    "coverageTotal": 60,
    "coverageBand": "partial",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 64,
        "documented": 4,
        "reported": 1,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 64,
        "documented": 4,
        "reported": 1,
        "notFound": 2,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 57,
        "documented": 4,
        "reported": 0,
        "notFound": 3,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 57,
        "documented": 4,
        "reported": 0,
        "notFound": 3,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "collection_timeframe_stated": "documented",
      "upstream_sources_declared": "documented",
      "publisher_is_organisation": "documented",
      "maintainer_contact_listed": "documented",
      "annotation_process_described": "reported",
      "publisher_identified": "not_found",
      "collection_method_described": "not_found",
      "upstream_license_noted": "documented",
      "license_file_present": "documented",
      "redistribution_terms_stated": "documented",
      "commercial_terms_stated": "documented",
      "attribution_terms_stated": "reported",
      "license_spdx_recognised": "not_found",
      "license_declared": "not_found",
      "file_manifest_available": "documented",
      "row_count_available": "documented",
      "sample_records_available": "documented",
      "description_present": "documented",
      "splits_documented": "not_found",
      "schema_documented": "not_found",
      "file_sizes_available": "not_found",
      "last_modified_known": "documented",
      "known_limitations_documented": "documented",
      "version_history_available": "documented",
      "citation_provided": "documented",
      "intended_use_documented": "not_found",
      "release_notes_available": "not_found",
      "usage_statistics_available": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "legal-qa-pairs",
    "name": "Legal Question Answering Pairs",
    "publisher": "Independent contributor",
    "publisherSlug": "independent-contributor",
    "description": "Legal questions paired with answers. No license declared and upstream sources are not enumerated — verify before use.",
    "platform": "huggingface",
    "platformUrl": "https://example.org/huggingface/legal-qa-pairs",
    "domain": [
      "legal",
      "nlp"
    ],
    "languages": [
      "en"
    ],
    "modality": "text",
    "sizeRows": 94220,
    "sizeBytes": 310000000,
    "license": {
      "spdx": "Not stated",
      "commercialUse": "not_stated",
      "attribution": false,
      "shareAlike": false,
      "label": "not_found",
      "notes": [
        "Upstream source terms are unresolved at the record level."
      ]
    },
    "firstPublished": "2024-03-08T00:00:00Z",
    "lastUpdated": "2025-05-30T00:00:00Z",
    "contentHash": "sha256:7e15…a639",
    "version": "v2.0",
    "lineage": {
      "nodes": [
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:7f89…0fbb",
          "timestamp": "2025-05-30T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "clean",
          "stage": "clean",
          "label": "Cleaning",
          "description": "Deduplication, normalization, and personal-information filtering applied.",
          "actor": "pipeline:normalize@3.4",
          "hash": "sha256:c011…3d35",
          "timestamp": "2025-05-30T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:0c79…e65a",
          "timestamp": "2025-05-30T00:00:00Z",
          "url": null,
          "evidence": "reported"
        }
      ],
      "edges": [
        {
          "from": "scrape",
          "to": "clean",
          "evidence": "reported"
        },
        {
          "from": "clean",
          "to": "current",
          "evidence": "reported"
        }
      ],
      "completeness": 50,
      "undocumentedStages": [
        "source",
        "annotate",
        "embed"
      ]
    },
    "versions": [
      {
        "version": "v2.0",
        "date": "2025-05-30",
        "rowsAdded": 3768,
        "rowsRemoved": 376,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 47
      },
      {
        "version": "v1.0",
        "date": "2024-11-11",
        "rowsAdded": 4711,
        "rowsRemoved": 753,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 44
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "multilingual-instruct-2m",
      "us-contract-clauses"
    ],
    "coverageTotal": 39,
    "coverageBand": "minimal",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 50,
        "documented": 3,
        "reported": 1,
        "notFound": 3,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 14,
        "documented": 1,
        "reported": 0,
        "notFound": 6,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 43,
        "documented": 3,
        "reported": 0,
        "notFound": 4,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 50,
        "documented": 3,
        "reported": 1,
        "notFound": 3,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "publisher_is_organisation": "documented",
      "upstream_sources_declared": "documented",
      "publisher_identified": "documented",
      "maintainer_contact_listed": "reported",
      "collection_method_described": "not_found",
      "collection_timeframe_stated": "not_found",
      "annotation_process_described": "not_found",
      "license_declared": "documented",
      "license_spdx_recognised": "not_found",
      "upstream_license_noted": "not_found",
      "redistribution_terms_stated": "not_found",
      "commercial_terms_stated": "not_found",
      "license_file_present": "not_found",
      "attribution_terms_stated": "not_found",
      "file_manifest_available": "documented",
      "sample_records_available": "documented",
      "file_sizes_available": "documented",
      "splits_documented": "not_found",
      "row_count_available": "not_found",
      "schema_documented": "not_found",
      "description_present": "not_found",
      "last_modified_known": "documented",
      "citation_provided": "documented",
      "version_history_available": "documented",
      "intended_use_documented": "reported",
      "release_notes_available": "not_found",
      "known_limitations_documented": "not_found",
      "usage_statistics_available": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "press-archive-multi",
    "name": "Multilingual News Archive",
    "publisher": "Press Index Project",
    "publisherSlug": "press-index-project",
    "description": "Archived news articles across four languages. Publisher terms vary by source and are not resolved at the record level.",
    "platform": "direct",
    "platformUrl": "https://example.org/direct/press-archive-multi",
    "domain": [
      "news",
      "nlp"
    ],
    "languages": [
      "en",
      "fr",
      "es",
      "it"
    ],
    "modality": "text",
    "sizeRows": 12400880,
    "sizeBytes": 8800000000,
    "license": {
      "spdx": "Not stated",
      "commercialUse": "not_stated",
      "attribution": false,
      "shareAlike": false,
      "label": "not_found",
      "notes": [
        "Upstream source terms are unresolved at the record level."
      ]
    },
    "firstPublished": "2021-05-19T00:00:00Z",
    "lastUpdated": "2024-10-11T00:00:00Z",
    "contentHash": "sha256:98dd…d5ac",
    "version": "v2.0",
    "lineage": {
      "nodes": [
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:9dc2…7c7f",
          "timestamp": "2024-10-11T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:a353…e815",
          "timestamp": "2024-10-11T00:00:00Z",
          "url": null,
          "evidence": "reported"
        }
      ],
      "edges": [
        {
          "from": "scrape",
          "to": "current",
          "evidence": "reported"
        }
      ],
      "completeness": 33,
      "undocumentedStages": [
        "source",
        "clean",
        "annotate",
        "embed"
      ]
    },
    "versions": [
      {
        "version": "v2.0",
        "date": "2024-10-11",
        "rowsAdded": 496035,
        "rowsRemoved": 49603,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 40
      },
      {
        "version": "v1.0",
        "date": "2024-11-11",
        "rowsAdded": 620044,
        "rowsRemoved": 99207,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 37
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "text",
        "type": "string",
        "nullable": false,
        "description": "Primary text content"
      },
      {
        "name": "source_url",
        "type": "string",
        "nullable": true,
        "description": "Origin URL where available"
      },
      {
        "name": "language",
        "type": "string",
        "nullable": false,
        "description": "ISO 639-1 language code"
      },
      {
        "name": "collected_at",
        "type": "timestamp",
        "nullable": false,
        "description": "Acquisition time"
      },
      {
        "name": "license",
        "type": "string",
        "nullable": true,
        "description": "Record-level license if it differs"
      }
    ],
    "sampleRecords": [
      {
        "id": "rec_000001",
        "text": "Randomized trials of the intervention reported a modest reduction in recurrence.",
        "source_url": "https://example.org/a/1",
        "language": "en",
        "collected_at": "2026-05-02T09:14:00Z",
        "license": null
      },
      {
        "id": "rec_000002",
        "text": "Le protocole a été appliqué à une cohorte de 1 240 participants.",
        "source_url": "https://example.org/a/2",
        "language": "fr",
        "collected_at": "2026-05-02T09:14:03Z",
        "license": "CC-BY-4.0"
      },
      {
        "id": "rec_000003",
        "text": "Section 4.2 governs assignment and change of control.",
        "source_url": null,
        "language": "en",
        "collected_at": "2026-05-02T09:14:07Z",
        "license": null
      },
      {
        "id": "rec_000004",
        "text": "The measured latency improved by roughly eleven percent across both regions.",
        "source_url": "https://example.org/a/4",
        "language": "en",
        "collected_at": "2026-05-02T09:14:11Z",
        "license": null
      },
      {
        "id": "rec_000005",
        "text": "Die Auswertung erfolgte anhand von drei unabhängigen Kennzahlen.",
        "source_url": "https://example.org/a/5",
        "language": "de",
        "collected_at": "2026-05-02T09:14:15Z",
        "license": null
      }
    ],
    "relatedSlugs": [
      "biomed-abstracts-open",
      "multilingual-instruct-2m",
      "us-contract-clauses"
    ],
    "coverageTotal": 34,
    "coverageBand": "minimal",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 43,
        "documented": 3,
        "reported": 0,
        "notFound": 4,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 14,
        "documented": 1,
        "reported": 0,
        "notFound": 6,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 43,
        "documented": 3,
        "reported": 0,
        "notFound": 4,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 36,
        "documented": 2,
        "reported": 1,
        "notFound": 4,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "collection_method_described": "documented",
      "publisher_is_organisation": "documented",
      "annotation_process_described": "documented",
      "maintainer_contact_listed": "not_found",
      "collection_timeframe_stated": "not_found",
      "upstream_sources_declared": "not_found",
      "publisher_identified": "not_found",
      "commercial_terms_stated": "documented",
      "attribution_terms_stated": "not_found",
      "redistribution_terms_stated": "not_found",
      "upstream_license_noted": "not_found",
      "license_file_present": "not_found",
      "license_spdx_recognised": "not_found",
      "license_declared": "not_found",
      "file_manifest_available": "documented",
      "row_count_available": "documented",
      "description_present": "documented",
      "splits_documented": "not_found",
      "file_sizes_available": "not_found",
      "sample_records_available": "not_found",
      "schema_documented": "not_found",
      "usage_statistics_available": "documented",
      "release_notes_available": "documented",
      "intended_use_documented": "reported",
      "version_history_available": "not_found",
      "last_modified_known": "not_found",
      "citation_provided": "not_found",
      "known_limitations_documented": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  },
  {
    "slug": "findata-credit-risk",
    "name": "Credit Risk Tabular Set",
    "publisher": "FinData Exchange",
    "publisherSlug": "findata-exchange",
    "description": "Anonymized credit application records. Origin is undeclared, no update since 2024, and the lineage chain is incomplete.",
    "platform": "kaggle",
    "platformUrl": "https://example.org/kaggle/findata-credit-risk",
    "domain": [
      "finance",
      "tabular"
    ],
    "languages": [
      "en"
    ],
    "modality": "tabular",
    "sizeRows": 1204000,
    "sizeBytes": 420000000,
    "license": {
      "spdx": "Not stated",
      "commercialUse": "not_stated",
      "attribution": false,
      "shareAlike": false,
      "label": "not_found",
      "notes": [
        "Upstream source terms are unresolved at the record level."
      ]
    },
    "firstPublished": "2023-07-14T00:00:00Z",
    "lastUpdated": "2024-02-27T00:00:00Z",
    "contentHash": "sha256:96ba…c943",
    "version": "v2.0",
    "lineage": {
      "nodes": [
        {
          "id": "scrape",
          "stage": "scrape",
          "label": "Raw acquisition",
          "description": "Records retrieved and stored with request-time fingerprints.",
          "actor": "archivum-ingest",
          "hash": "sha256:f1c4…c2eb",
          "timestamp": "2024-02-27T00:00:00Z",
          "url": null,
          "evidence": "reported"
        },
        {
          "id": "current",
          "stage": "current",
          "label": "Current version",
          "description": "The version available for download today.",
          "actor": "archivum-index",
          "hash": "sha256:c49f…0cba",
          "timestamp": "2024-02-27T00:00:00Z",
          "url": null,
          "evidence": "reported"
        }
      ],
      "edges": [
        {
          "from": "scrape",
          "to": "current",
          "evidence": "reported"
        }
      ],
      "completeness": 33,
      "undocumentedStages": [
        "source",
        "clean",
        "annotate",
        "embed"
      ]
    },
    "versions": [
      {
        "version": "v2.0",
        "date": "2024-02-27",
        "rowsAdded": 48160,
        "rowsRemoved": 4816,
        "note": "Re-verified upstream licenses",
        "author": "data-ops",
        "coverageTotal": 33
      },
      {
        "version": "v1.0",
        "date": "2024-11-11",
        "rowsAdded": 60200,
        "rowsRemoved": 9632,
        "note": "Expanded coverage and re-ran deduplication",
        "author": "review-team",
        "coverageTotal": 30
      }
    ],
    "schema": [
      {
        "name": "id",
        "type": "string",
        "nullable": false,
        "description": "Stable record identifier"
      },
      {
        "name": "features",
        "type": "json",
        "nullable": false,
        "description": "Feature vector as key-value pairs"
      },
      {
        "name": "target",
        "type": "float",
        "nullable": true,
        "description": "Supervised target where present"
      },
      {
        "name": "split",
        "type": "string",
        "nullable": false,
        "description": "train / validation / test"
      },
      {
        "name": "recorded_at",
        "type": "timestamp",
        "nullable": true,
        "description": "Record timestamp where available"
      }
    ],
    "sampleRecords": [
      {
        "id": "row_000001",
        "features": {
          "age_band": "35-44",
          "tenure_months": 54,
          "utilization": 0.31
        },
        "target": 0.0,
        "split": "train",
        "recorded_at": "2024-01-14T00:00:00Z"
      },
      {
        "id": "row_000002",
        "features": {
          "age_band": "25-34",
          "tenure_months": 11,
          "utilization": 0.78
        },
        "target": 1.0,
        "split": "train",
        "recorded_at": "2024-01-14T00:00:00Z"
      },
      {
        "id": "row_000003",
        "features": {
          "age_band": "45-54",
          "tenure_months": 132,
          "utilization": 0.12
        },
        "target": 0.0,
        "split": "validation",
        "recorded_at": null
      },
      {
        "id": "row_000004",
        "features": {
          "age_band": "18-24",
          "tenure_months": 4,
          "utilization": 0.91
        },
        "target": 1.0,
        "split": "test",
        "recorded_at": "2024-02-02T00:00:00Z"
      },
      {
        "id": "row_000005",
        "features": {
          "age_band": "55-64",
          "tenure_months": 201,
          "utilization": 0.08
        },
        "target": null,
        "split": "test",
        "recorded_at": null
      }
    ],
    "relatedSlugs": [
      "financial-filings-10k",
      "recipe-nutrition-db"
    ],
    "coverageTotal": 29,
    "coverageBand": "minimal",
    "coverageSections": [
      {
        "key": "origin",
        "label": "Origin & Sourcing",
        "score": 36,
        "documented": 2,
        "reported": 1,
        "notFound": 4,
        "applicable": 7
      },
      {
        "key": "licensing",
        "label": "Licensing & Terms",
        "score": 14,
        "documented": 1,
        "reported": 0,
        "notFound": 6,
        "applicable": 7
      },
      {
        "key": "composition",
        "label": "Composition & Structure",
        "score": 36,
        "documented": 2,
        "reported": 1,
        "notFound": 4,
        "applicable": 7
      },
      {
        "key": "maintenance",
        "label": "Maintenance & Usage",
        "score": 29,
        "documented": 2,
        "reported": 0,
        "notFound": 5,
        "applicable": 7
      }
    ],
    "coverageDetail": {
      "publisher_identified": "documented",
      "publisher_is_organisation": "documented",
      "upstream_sources_declared": "reported",
      "annotation_process_described": "not_found",
      "collection_method_described": "not_found",
      "maintainer_contact_listed": "not_found",
      "collection_timeframe_stated": "not_found",
      "redistribution_terms_stated": "documented",
      "upstream_license_noted": "not_found",
      "commercial_terms_stated": "not_found",
      "attribution_terms_stated": "not_found",
      "license_spdx_recognised": "not_found",
      "license_declared": "not_found",
      "license_file_present": "not_found",
      "schema_documented": "documented",
      "row_count_available": "documented",
      "file_manifest_available": "reported",
      "sample_records_available": "not_found",
      "file_sizes_available": "not_found",
      "description_present": "not_found",
      "splits_documented": "not_found",
      "citation_provided": "documented",
      "known_limitations_documented": "documented",
      "intended_use_documented": "not_found",
      "last_modified_known": "not_found",
      "usage_statistics_available": "not_found",
      "release_notes_available": "not_found",
      "version_history_available": "not_found"
    },
    "coverageVersion": "1.0",
    "coverageCheckedAt": "2026-08-01T09:00:00Z"
  }
] as unknown as Dataset[];
