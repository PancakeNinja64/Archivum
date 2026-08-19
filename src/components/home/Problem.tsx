"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CoverageSectionKey } from "@/lib/coverage/rules";
import { RISK_PROBES } from "@/lib/home/specimen";
import { SpecimenLattice } from "./SpecimenLattice";
import { SpecimenReport } from "./SpecimenReport";
import { Button } from "../ui/Button";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The problem.
 *
 * Previously this asserted three risks and showed no evidence for any of them,
 * and the history-report metaphor was never paid off — the reader was told
 * about a document they never saw.
 *
 * Now the document appears, mostly struck through, and each of the three claims
 * points at the named checks that would have caught it.
 */
export function Problem() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<CoverageSectionKey | null>(null);

  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay: i * 0.06, ease: EASE },
  });

  return (
    <section ref={sectionRef} className="border-t border-border py-16 sm:py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:gap-14 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div className="max-sm:min-w-0">
          <motion.p
            {...rise(0)}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            The problem
          </motion.p>
          <motion.h2
            {...rise(1)}
            className="mt-5 font-serif text-[2.1rem] leading-[1.1] tracking-[-0.03em] text-accent sm:text-4xl md:text-5xl"
          >
            You wouldn&rsquo;t buy a used car without the history report.
          </motion.h2>
          <motion.p
            {...rise(2)}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            You can see the dataset. You can&rsquo;t see whether it was scraped legally,
            who touched it, when it was last real, or whether using it commercially
            will get you sued. Teams spend weeks hunting for data, then still can&rsquo;t
            answer those questions.
          </motion.p>

          {/* Each claim points at the checks that bear on it. */}
          <ul className="mt-9 border-t border-border">
            {RISK_PROBES.map((risk, i) => {
              const on = active === risk.section;
              return (
                <motion.li key={risk.id} {...rise(3 + i)} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => setActive(on ? null : risk.section)}
                    aria-pressed={on}
                    className={`w-full py-5 text-left transition-colors ${
                      on ? "" : "hover:opacity-90"
                    }`}
                  >
                    <span className="flex items-baseline gap-3">
                      <span
                        aria-hidden
                        className={`mt-1 h-3 w-px shrink-0 transition-colors ${
                          on ? "bg-accent" : "bg-border-strong"
                        }`}
                      />
                      <span className="flex-1">
                        <span
                          className={`block text-lg tracking-[-0.01em] transition-colors ${
                            on ? "text-accent" : "text-foreground"
                          }`}
                        >
                          {risk.title}
                        </span>
                        <span className="mt-1.5 block max-w-md text-[15px] leading-relaxed text-muted-foreground">
                          {risk.body}
                        </span>
                        {on && (
                          <span className="mt-2.5 block font-mono text-[11px] leading-relaxed text-accent">
                            {risk.connection}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>

          <motion.p
            {...rise(6)}
            className="mt-9 border-l-2 border-accent pl-5 font-serif text-[1.35rem] italic leading-snug text-accent-strong dark:text-accent sm:text-2xl md:text-[1.7rem]"
          >
            Archivum is the history report.
          </motion.p>

          <motion.div {...rise(7)} className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Button href="/explore/" className="max-sm:min-h-11 max-sm:w-full">
              Run these checks on any dataset
            </Button>
            <Button href="/docs/#methodology" variant="secondary" className="max-sm:min-h-11 max-sm:w-full">
              How the checks work
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="max-sm:min-w-0 lg:sticky lg:top-24 lg:self-start"
        >
          {/* Desktop: the cage is the visible object, the list stays in the DOM
              as the SSR, keyboard and screen-reader surface. Below lg the
              lattice is not mounted at all — a cage you cannot hover is
              decoration, and 28 rows are the better small-screen object. */}
          <div className="hidden lg:block">
            <SpecimenLattice sectionRef={sectionRef} activeSection={active} />
            <SpecimenReport activeSection={active} visual="sr" />
          </div>
          <div className="lg:hidden">
            <SpecimenReport activeSection={active} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
