/** Hairline glyphs for the desk. Decorative by default; text carries the meaning. */
const PATHS = {
  search: 'M10.5 4a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm5 11.5L21 21',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  external: 'M7 17 17 7M8 7h9v9',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  check: 'm5 12 4.5 4.5L19 7',
  chevron: 'm6 9 6 6 6-6',
  bookmark: 'M6 4h12v17l-6-4-6 4z',
  download: 'M12 4v11m-5-4 5 5 5-5M5 20h14',
  compare: 'M4 6h7v12H4zM13 6h7v12h-7z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 6.8M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5',
} as const;

export function Glyph({ name, size = 16 }: { name: keyof typeof PATHS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      <path d={PATHS[name]} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Evidence marks: filled = documented, half = reported, ring = not found, dash = not applicable. Shape carries the meaning. */
export function EvidenceMark({ result }: { result: 'documented' | 'reported' | 'not_found' | 'n/a' | 'unavailable' }) {
  return (
    <svg width="11" height="11" viewBox="0 0 10 10" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      {result === 'documented' && <circle cx="5" cy="5" r="4" fill="currentColor" />}
      {result === 'reported' && <><circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M5 1.4A3.6 3.6 0 0 1 5 8.6Z" fill="currentColor" /></>}
      {result === 'not_found' && <circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.5" />}
      {result === 'n/a' && <path d="M1.5 5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
      {result === 'unavailable' && <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />}
    </svg>
  );
}
