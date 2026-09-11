"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { DELISTED_FIXTURE } from "@/lib/graveyard/fixture";
import {
  END_STATE_LABEL,
  END_STATE_NOTE,
  END_STATES,
  type EndState,
} from "@/lib/graveyard/types";
import { fmtInt } from "@/lib/utils";
import { motionTokens, springs } from "@/lib/motion-tokens";
import { HolographicArchive } from "@/components/home/HolographicArchive";
import styles from "./AfterimageIndex.module.css";

const INSPECTOR_ID = "delisted-afterimage-inspector";

const utcDate = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
});

function formatUtc(iso: string) {
  return utcDate.format(new Date(iso));
}

export function AfterimageIndex() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<EndState | "all">("all");
  const [selectedSlug, setSelectedSlug] = useState(DELISTED_FIXTURE.records[0]?.slug ?? "");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const reducedMotion = useReducedMotion();
  const inspectorRef = useRef<HTMLElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => DELISTED_FIXTURE.records.filter((record) => {
      if (state !== "all" && record.endState !== state) return false;
      if (!deferredQuery) return true;
      return `${record.name} ${record.publisher} ${record.license}`.toLowerCase().includes(deferredQuery);
    }),
    [deferredQuery, state],
  );

  const selected = results.find((record) => record.slug === selectedSlug) ?? results[0];

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing = target?.matches("input, textarea, select, [contenteditable='true']");

      if (event.key === "/" && !isEditing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape" && document.activeElement === searchRef.current && query) {
        event.preventDefault();
        setQuery("");
      }
    };

    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  }, [query]);

  function selectRecord(slug: string) {
    setSelectedSlug(slug);
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    window.requestAnimationFrame(() => {
      inspectorRef.current?.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
      inspectorRef.current?.focus({ preventScroll: true });
    });
  }

  function returnToRegister() {
    registerRef.current?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <HolographicArchive mode="afterimage" className={styles.heroPlate} />
        <div className={styles.heroTopline}>
          <Link href="/#instrument">← Return to Atlas</Link>
          <span>Persistent state / {DELISTED_FIXTURE.total} records</span>
        </div>
        <div className={styles.heroCopy}>
          <p>Afterimage Index / Delisted state</p>
          <h1>The archive after visibility.</h1>
          <p>
            These are not dead datasets. They are the last retrievable coordinates of sources
            that became gated, withdrawn, superseded, or unreachable.
          </p>
        </div>
        <div className={styles.heroReadout}>
          <span>FIELD / PERSISTENT</span>
          <strong>{String(DELISTED_FIXTURE.total).padStart(3, "0")}</strong>
          <span>Observed traces</span>
        </div>
        <div className={styles.heroFoot}>
          <span>Observed facts only</span>
          <span>Final successful state retained</span>
          <span>No judgement inferred</span>
        </div>
      </section>

      <section className={styles.index}>
        <header className={styles.indexHeader}>
          <div>
            <p>Filter the trace</p>
            <h2>{String(results.length).padStart(2, "0")} afterimages</h2>
            <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
              {results.length} {results.length === 1 ? "afterimage" : "afterimages"} in the index.
            </p>
          </div>
          <label className={styles.search}>
            <span>Search</span>
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Dataset, publisher, license"
              type="search"
              aria-keyshortcuts="/"
            />
            <kbd aria-hidden>/</kbd>
          </label>
        </header>

        <div className={styles.filters} role="group" aria-label="Filter by final observed state">
          <button
            type="button"
            aria-pressed={state === "all"}
            className={state === "all" ? styles.activeFilter : undefined}
            onClick={() => setState("all")}
          >
            All <span>{DELISTED_FIXTURE.total}</span>
          </button>
          {END_STATES.map((endState) => {
            const count = DELISTED_FIXTURE.records.filter((record) => record.endState === endState).length;
            return (
              <button
                type="button"
                key={endState}
                aria-pressed={state === endState}
                className={state === endState ? styles.activeFilter : undefined}
                onClick={() => setState(endState)}
              >
                {END_STATE_LABEL[endState]} <span>{count}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.indexBody}>
          <aside
            ref={inspectorRef}
            id={INSPECTOR_ID}
            className={styles.inspector}
            tabIndex={-1}
            aria-labelledby="delisted-selected-record"
          >
            <AnimatePresence mode="wait" initial={false}>
              {selected ? (
                <motion.div
                  key={selected.slug}
                  initial={{ opacity: 0, x: motionTokens.distance.md }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -motionTokens.distance.sm }}
                  transition={springs.gentle}
                >
                  <p className={styles.inspectorKicker}>Persistent trace / {selected.slug}</p>
                  <h3 id="delisted-selected-record">{selected.name}</h3>
                  <p className={styles.stateNote}>{END_STATE_NOTE[selected.endState]}</p>
                  <div className={styles.coverage}>
                    <span>{selected.coverageTotal}</span>
                    <small>/100 documented at last check</small>
                  </div>
                  <dl>
                    <div><dt>Publisher</dt><dd>{selected.publisher}</dd></div>
                    <div><dt>Platform</dt><dd>{selected.platform}</dd></div>
                    <div><dt>License</dt><dd>{selected.license}</dd></div>
                    <div><dt>Rows observed</dt><dd>{fmtInt(selected.sizeRows)}</dd></div>
                    <div><dt>First observed</dt><dd>{formatUtc(selected.firstObserved)}</dd></div>
                    <div><dt>Last confirmed</dt><dd>{formatUtc(selected.lastConfirmed)}</dd></div>
                    {selected.supersededBy ? <div><dt>Successor</dt><dd>{selected.supersededBy}</dd></div> : null}
                  </dl>
                  <p className={styles.inspectorNote}>
                    Archivum retains the evidence available at the final successful check. The
                    state describes retrieval, not the publisher’s intent or conduct.
                  </p>
                  <button type="button" className={styles.returnToRegister} onClick={returnToRegister}>
                    Continue in the register <span aria-hidden>↓</span>
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </aside>

          <div ref={registerRef} id="afterimage-register" className={styles.register}>
            <div className={styles.registerHead}>
              <span>No.</span><span>Record</span><span>Publisher</span><span>State</span><span>Last visible</span>
            </div>
            {results.length ? results.map((record, index) => {
              const isSelected = selected?.slug === record.slug;
              return (
                <motion.button
                  type="button"
                  layout
                  key={record.slug}
                  className={`${styles.row} ${isSelected ? styles.selectedRow : ""}`}
                  aria-pressed={isSelected}
                  aria-controls={INSPECTOR_ID}
                  onClick={() => selectRecord(record.slug)}
                  initial={{ opacity: 0, y: motionTokens.distance.sm }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springs.gentle, delay: Math.min(index * 0.012, 0.22) }}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{record.name}</strong>
                  <span>{record.publisher}</span>
                  <span>{END_STATE_LABEL[record.endState]}</span>
                  <time>{formatUtc(record.lastConfirmed)}</time>
                </motion.button>
              );
            }) : (
              <div className={styles.empty}>
                No preserved record matches that coordinate.
                <button type="button" onClick={() => { setQuery(""); setState("all"); }}>Reset index</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
