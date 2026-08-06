/**
 * Prose signals: the 'reported' half-point tier. A regex hit on a README
 * heading or sentence means the publisher SAID it — never that it is so.
 * Keep these coarse; false negatives are cheaper than false positives.
 */

const has = (text: string, re: RegExp) => re.test(text);

export interface ProseSignals {
  upstreamSources: boolean;
  collectionMethod: boolean;
  collectionTimeframe: boolean;
  annotationProcess: boolean;
  maintainerContact: boolean;
  commercialTerms: boolean;
  attributionTerms: boolean;
  redistributionTerms: boolean;
  upstreamLicense: boolean;
  citation: boolean;
  limitations: boolean;
  intendedUse: boolean;
  licenseMention: boolean;
}

export function readmeSignals(readme: string | null): ProseSignals {
  const t = (readme ?? '').slice(0, 200 * 1024).toLowerCase();
  return {
    upstreamSources:     has(t, /source dataset|derived from|based on|built (up)?on|original(ly)? (data|corpus|dataset)|upstream/),
    collectionMethod:    has(t, /collect(ed|ion)|crawl(ed|ing)?|scrap(ed|ing)|gather(ed|ing)|curation|how (the|this) data(set)? was (made|built|created)|data collection/),
    collectionTimeframe: has(t, /collected (in|between|from|during)|time ?(frame|period|span)|(19|20)\d{2}\s?[-–—]\s?(19|20)\d{2}|as of (19|20)\d{2}/),
    annotationProcess:   has(t, /annotat(ed|ion|ors)|label(l)?(ed|ing|ers)|human review|crowdworkers|mechanical turk|raters|inter-annotator/),
    maintainerContact:   has(t, /contact|mailto:|@.+\.(com|org|edu|io)|discussion(s)? tab|open an issue|issue tracker/),
    commercialTerms:     has(t, /commercial use|non-?commercial|for research (use|purposes) only|business use/),
    attributionTerms:    has(t, /attribution|must credit|cite (this|the) (dataset|work|paper)|give credit/),
    redistributionTerms: has(t, /redistribut|share-?alike|re-?shar(e|ing)|derivative works|remix/),
    upstreamLicense:     has(t, /licen[cs]e(s)? of (the )?(source|original|upstream)|upstream licen[cs]e|original(ly)? licen[cs]ed|inherit(s|ed)? (the )?licen[cs]e/),
    citation:            has(t, /citation|@inproceedings|@article|@misc|bibtex|doi\.org|arxiv\.org|please cite/),
    limitations:         has(t, /limitation|known issues|caveat|bias(es)? (and|,|in)|social impact|out-of-scope|discussion of bias/),
    intendedUse:         has(t, /intended use|use cases|supported tasks|designed (for|to)|purpose of (this|the) dataset|direct use/),
    licenseMention:      has(t, /licen[cs]e|licen[cs]ing/),
  };
}
