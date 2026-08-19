'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  COVERAGE_CHECKS,
  COVERAGE_SECTIONS,
  computeCoverage,
  type CoverageSectionKey,
} from '@/lib/coverage/rules';
import { RESULT_PRESENTATION, SPECIMEN_DETAIL } from '@/lib/home/specimen';

const STEP_MS = 45;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The specimen report.
 *
 * The section says you cannot see a dataset's history. This shows it: the
 * twenty-eight real checks run against a composite record, most of them coming
 * back struck through. The card hollows out as it fills in, which is why the
 * reveal is sequential rather than a single fade.
 *
 * Labels and methods are imported from COVERAGE_CHECKS and the score comes from
 * computeCoverage(), so this cannot drift from the published methodology.
 */
export function SpecimenReport({
  activeSection,
  visual = 'list',
}: {
  activeSection: CoverageSectionKey | null;
  /**
   * 'sr' renders the same content visually hidden. The lattice is aria-hidden
   * decoration, so this stays the SSR surface, the keyboard path and the
   * screen-reader path even when the canvas is the visible element.
   */
  visual?: 'list' | 'sr';
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [isNarrow, setIsNarrow] = useState(false);
  const [openSections, setOpenSections] = useState<CoverageSectionKey[]>([]);

  const result = useMemo(() => computeCoverage(SPECIMEN_DETAIL), []);
  const documented = useMemo(
    () => result.sections.reduce((n, s) => n + s.documented, 0),
    [result],
  );

  const grouped = useMemo(() => {
    const keys = Object.keys(COVERAGE_SECTIONS) as CoverageSectionKey[];
    let cursor = 0;
    return keys.map((key) => {
      const checks = COVERAGE_CHECKS.filter((c) => c.section === key).map((c) => ({
        ...c,
        order: cursor++,
      }));
      return { key, meta: COVERAGE_SECTIONS[key], checks };
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /* Counter ticks up alongside the passes rather than snapping at the end. */
  const [progress, setProgress] = useState(0);
  const shown = reduce ? result.total : progress;
  useEffect(() => {
    if (reduce || !inView) return;
    const duration = COVERAGE_CHECKS.length * STEP_MS + 300;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(Math.round(result.total * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, result.total]);

  /* Without this a probe can highlight a section that is scrolled out of the
     card, and clicking it looks like nothing happened. On phones the list is
     not internally scrolled, so the page brings the section into view instead. */
  useEffect(() => {
    if (!activeSection || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-section="${activeSection}"]`);
    if (!(el instanceof HTMLElement)) return;
    const behavior = reduce ? 'auto' : 'smooth';
    if (scrollRef.current.scrollHeight > scrollRef.current.clientHeight + 1) {
      scrollRef.current.scrollTo({
        top: el.offsetTop - scrollRef.current.offsetTop,
        behavior,
      });
    } else {
      el.scrollIntoView({ block: 'nearest', behavior });
    }
  }, [activeSection, reduce]);

  const sectionScore = (key: CoverageSectionKey) =>
    result.sections.find((s) => s.key === key);

  if (visual === 'sr') {
    return (
      <div className="sr-only">
        <p>
          Example record, composite. {documented} of {COVERAGE_CHECKS.length} checks documented,{' '}
          {result.total}% coverage.
        </p>
        <ul>
          {grouped.map(({ key, meta, checks }) => (
            <li key={key}>
              {meta.label} — {sectionScore(key)?.documented} of {sectionScore(key)?.applicable}{' '}
              documented
              <ul>
                {checks.map((check) => {
                  const outcome = (SPECIMEN_DETAIL[check.id] ?? 'not_found') as
                    | 'documented'
                    | 'reported'
                    | 'not_found';
                  return (
                    <li key={check.id}>
                      {check.label} — {RESULT_PRESENTATION[outcome].label} — {check.method}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={ref} className="border border-border-strong bg-surface/40">
      <div className="flex flex-col gap-1 border-b border-border px-4 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 sm:px-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Example record · composite
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {COVERAGE_CHECKS.length} checks
        </span>
      </div>

      <div ref={scrollRef} className="max-h-none overflow-visible sm:max-h-[24rem] sm:overflow-y-auto md:max-h-[30rem]">
        {grouped.map(({ key, meta, checks }) => {
          const s = sectionScore(key);
          const dimmed = activeSection !== null && activeSection !== key;
          const open = !isNarrow || openSections.includes(key);
          return (
            <motion.section
              key={key}
              data-section={key}
              animate={{ opacity: dimmed ? 0.25 : 1 }}
              transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenSections((prev) =>
                    prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
                  )
                }
                aria-expanded={open}
                className="flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-3 text-left sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 sm:px-5 sm:py-2.5 md:pointer-events-none"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {meta.label}
                </span>
                <span className="tnum font-mono text-[10px] text-muted-foreground">
                  {s ? `${s.documented} of ${s.applicable} documented` : ''}
                </span>
              </button>

              {open && (
                <ul>
                  {checks.map((check) => {
                    const outcome = (SPECIMEN_DETAIL[check.id] ?? 'not_found') as
                      | 'documented'
                      | 'reported'
                      | 'not_found';
                    const pres = RESULT_PRESENTATION[outcome];
                    const delay = reduce ? 0 : check.order * (STEP_MS / 1000);
                    return (
                      <li key={check.id}>
                        <div
                          tabIndex={0}
                          className="group relative flex items-start gap-3 border-b border-border/60 px-4 py-2.5 focus:outline-none focus-visible:bg-surface-elevated sm:items-center sm:px-5 sm:py-1.5"
                        >
                          <motion.span
                            initial={reduce ? false : { opacity: 0 }}
                            animate={inView || reduce ? { opacity: 1 } : {}}
                            transition={{ duration: 0.22, delay, ease: EASE }}
                            className="flex shrink-0 items-center"
                            aria-hidden
                          >
                            <svg width="9" height="9" viewBox="0 0 10 10">
                              {outcome === 'documented' && (
                                <circle cx="5" cy="5" r="4" fill={`var(${pres.token})`} />
                              )}
                              {outcome === 'reported' && (
                                <>
                                  <circle
                                    cx="5"
                                    cy="5"
                                    r="3.6"
                                    fill="none"
                                    stroke={`var(${pres.token})`}
                                    strokeWidth="1.4"
                                  />
                                  <path d="M5 1.4 A3.6 3.6 0 0 1 5 8.6 Z" fill={`var(${pres.token})`} />
                                </>
                              )}
                              {outcome === 'not_found' && (
                                <circle
                                  cx="5"
                                  cy="5"
                                  r="3.6"
                                  fill="none"
                                  stroke={`var(${pres.token})`}
                                  strokeWidth="1.5"
                                />
                              )}
                            </svg>
                          </motion.span>

                          <span className="relative min-w-0 flex-1">
                            <span className="relative block">
                              <motion.span
                                initial={reduce ? false : { opacity: 0 }}
                                animate={inView || reduce ? { opacity: 1 } : {}}
                                transition={{ duration: 0.22, delay, ease: EASE }}
                                className={`block text-[13px] leading-snug sm:truncate ${
                                  pres.struck
                                    ? 'text-muted-foreground/45'
                                    : 'text-foreground/90'
                                }`}
                              >
                                {check.label}
                              </motion.span>
                              {pres.struck && (
                                <motion.span
                                  aria-hidden
                                  initial={reduce ? false : { scaleX: 0 }}
                                  animate={inView || reduce ? { scaleX: 1 } : {}}
                                  transition={{ duration: 0.18, delay: delay + 0.08, ease: EASE }}
                                  style={{ originX: 0 }}
                                  className="absolute left-0 top-1/2 h-px w-full bg-muted-foreground/45"
                                />
                              )}
                            </span>
                            <span aria-hidden className="mt-1 block font-mono text-[11px] leading-relaxed text-muted-foreground sm:hidden">
                              <span style={{ color: `var(${pres.token})` }}>{pres.label}</span>
                              {' — '}
                              {check.method}
                            </span>
                          </span>

                          <span className="sr-only">{pres.label}. </span>
                          <span className="sr-only">{check.method}</span>

                          {/* Method sentence — the credibility argument. Hover/focus on sm+. */}
                          <span className="pointer-events-none absolute left-5 right-5 top-full z-10 hidden rounded-none border border-border-strong bg-surface-elevated px-3 py-2 font-mono text-[10px] leading-relaxed text-muted-foreground sm:group-hover:block sm:group-focus-visible:block">
                            <span style={{ color: `var(${pres.token})` }}>{pres.label}</span> —{' '}
                            {check.method}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.section>
          );
        })}
      </div>

      <div className="flex items-baseline justify-between gap-4 border-t border-border px-4 py-4 sm:px-5">
        <span className="tnum font-mono text-[11px] text-muted-foreground">
          {documented} of {COVERAGE_CHECKS.length} documented
        </span>
        <span className="tnum font-mono text-[15px] text-tier-asserted">{shown}%</span>
      </div>

      <p className="border-t border-border px-4 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground sm:px-5 sm:text-[9px]">
        A composite representative of a typical source card, not a specific published dataset.
        Scored with the same method as the catalog.
      </p>
    </div>
  );
}
