// AUTO-AUTHORED dashboard mock data. Demo only - no auth, nothing persists.

import type { ActivityEvent, WatchedDataset } from './types';

export const ACTIVITY: ActivityEvent[] = [
  {
    "id": "evt_001",
    "type": "license-change",
    "severity": "critical",
    "datasetSlug": "press-archive-multi",
    "datasetName": "Multilingual News Archive",
    "message": "License terms changed to Unspecified. Commercial use is no longer supported.",
    "timestamp": "2026-08-03T23:00:00Z"
  },
  {
    "id": "evt_002",
    "type": "score-drop",
    "severity": "warning",
    "datasetSlug": "findata-credit-risk",
    "datasetName": "Credit Risk Tabular Set",
    "message": "Trust score fell 9 points after the source registry stopped responding.",
    "timestamp": "2026-08-03T21:07:00Z"
  },
  {
    "id": "evt_003",
    "type": "new-version",
    "severity": "info",
    "datasetSlug": "biomed-abstracts-open",
    "datasetName": "Biomedical Abstracts (Open Access)",
    "message": "Version v5.0 published. 168,435 rows added, 16,843 removed.",
    "timestamp": "2026-08-03T19:14:00Z"
  },
  {
    "id": "evt_004",
    "type": "lineage-updated",
    "severity": "info",
    "datasetSlug": "multilingual-instruct-2m",
    "datasetName": "Multilingual Instruction Pairs 2M",
    "message": "Annotation stage documented. Lineage completeness rose to 100%.",
    "timestamp": "2026-08-03T17:21:00Z"
  },
  {
    "id": "evt_005",
    "type": "score-drop",
    "severity": "warning",
    "datasetSlug": "consumer-reviews-multi",
    "datasetName": "Consumer Product Reviews",
    "message": "Trust score fell 6 points after 14 months without an update.",
    "timestamp": "2026-08-02T15:28:00Z"
  },
  {
    "id": "evt_006",
    "type": "deprecated",
    "severity": "critical",
    "datasetSlug": "legal-qa-pairs",
    "datasetName": "Legal Question Answering Pairs",
    "message": "Publisher marked this dataset as unmaintained.",
    "timestamp": "2026-08-02T13:35:00Z"
  },
  {
    "id": "evt_007",
    "type": "new-version",
    "severity": "info",
    "datasetSlug": "commons-python-permissive",
    "datasetName": "Permissive Python Repositories",
    "message": "Version v5.0 published. Per-file license attestation re-verified.",
    "timestamp": "2026-08-02T11:42:00Z"
  },
  {
    "id": "evt_008",
    "type": "license-change",
    "severity": "warning",
    "datasetSlug": "radiology-chest-xray",
    "datasetName": "Chest Radiograph Study Set",
    "message": "Share-alike clause added. Derivatives must carry the same terms.",
    "timestamp": "2026-08-02T09:49:00Z"
  },
  {
    "id": "evt_009",
    "type": "lineage-updated",
    "severity": "info",
    "datasetSlug": "us-contract-clauses",
    "datasetName": "US Commercial Contract Clauses",
    "message": "Cleaning stage re-verified against the source registry.",
    "timestamp": "2026-08-01T07:56:00Z"
  },
  {
    "id": "evt_010",
    "type": "score-drop",
    "severity": "info",
    "datasetSlug": "terra-landcover-tiles",
    "datasetName": "Satellite Land Cover Tiles",
    "message": "Trust score fell 2 points on update-frequency decay.",
    "timestamp": "2026-08-01T05:03:00Z"
  }
];

export const WATCHLIST: WatchedDataset[] = [
  {
    "slug": "biomed-abstracts-open",
    "name": "Biomedical Abstracts (Open Access)",
    "publisher": "Meridian Health Data Collective",
    "trustScore": 95,
    "scoreDelta": 3,
    "licenseStatus": "ok",
    "lastVerified": "2026-08-03T00:00:00Z",
    "scoreHistory": [
      92,
      96,
      96,
      95,
      99,
      98,
      96,
      100,
      100,
      99,
      97,
      95
    ]
  },
  {
    "slug": "multilingual-instruct-2m",
    "name": "Multilingual Instruction Pairs 2M",
    "publisher": "Polyglot Research Group",
    "trustScore": 91,
    "scoreDelta": 2,
    "licenseStatus": "ok",
    "lastVerified": "2026-08-03T00:00:00Z",
    "scoreHistory": [
      89,
      88,
      85,
      83,
      80,
      77,
      77,
      77,
      74,
      78,
      80,
      91
    ]
  },
  {
    "slug": "commons-python-permissive",
    "name": "Permissive Python Repositories",
    "publisher": "Commons Code Index",
    "trustScore": 90,
    "scoreDelta": 3,
    "licenseStatus": "ok",
    "lastVerified": "2026-08-03T00:00:00Z",
    "scoreHistory": [
      87,
      88,
      92,
      89,
      87,
      91,
      92,
      95,
      93,
      94,
      96,
      90
    ]
  },
  {
    "slug": "us-contract-clauses",
    "name": "US Commercial Contract Clauses",
    "publisher": "Lex Corpus Project",
    "trustScore": 88,
    "scoreDelta": 7,
    "licenseStatus": "ok",
    "lastVerified": "2026-08-01T00:00:00Z",
    "scoreHistory": [
      81,
      79,
      77,
      80,
      78,
      79,
      82,
      80,
      77,
      74,
      74,
      88
    ]
  },
  {
    "slug": "wiki-qa-multilingual",
    "name": "Encyclopedic QA (Multilingual)",
    "publisher": "Encyclopedic Data Trust",
    "trustScore": 88,
    "scoreDelta": 4,
    "licenseStatus": "ok",
    "lastVerified": "2026-08-01T00:00:00Z",
    "scoreHistory": [
      84,
      87,
      90,
      88,
      88,
      89,
      91,
      89,
      90,
      92,
      89,
      88
    ]
  },
  {
    "slug": "arxiv-cs-fulltext",
    "name": "Preprint Full Text (Computer Science)",
    "publisher": "Open Preprint Archive",
    "trustScore": 86,
    "scoreDelta": 2,
    "licenseStatus": "ok",
    "lastVerified": "2026-08-03T00:00:00Z",
    "scoreHistory": [
      84,
      82,
      79,
      76,
      80,
      84,
      83,
      83,
      87,
      87,
      86,
      86
    ]
  },
  {
    "slug": "financial-filings-10k",
    "name": "Annual Report Filings (10-K)",
    "publisher": "Ledger Archive Group",
    "trustScore": 83,
    "scoreDelta": 8,
    "licenseStatus": "ok",
    "lastVerified": "2026-08-01T00:00:00Z",
    "scoreHistory": [
      75,
      78,
      81,
      81,
      78,
      79,
      80,
      77,
      77,
      76,
      79,
      83
    ]
  },
  {
    "slug": "common-crawl-en-clean",
    "name": "English Web Corpus (Filtered)",
    "publisher": "Atlas Web Data",
    "trustScore": 82,
    "scoreDelta": 2,
    "licenseStatus": "ok",
    "lastVerified": "2026-08-01T00:00:00Z",
    "scoreHistory": [
      80,
      84,
      85,
      82,
      84,
      85,
      88,
      86,
      84,
      82,
      82,
      82
    ]
  },
  {
    "slug": "speech-commands-40",
    "name": "Spoken Command Audio (40 classes)",
    "publisher": "Acoustic Research Collective",
    "trustScore": 80,
    "scoreDelta": 7,
    "licenseStatus": "ok",
    "lastVerified": "2026-08-03T00:00:00Z",
    "scoreHistory": [
      73,
      75,
      79,
      78,
      82,
      81,
      84,
      83,
      82,
      83,
      83,
      80
    ]
  }
];
