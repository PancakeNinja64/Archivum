import { Suspense } from "react";
import type { Metadata } from "next";
import { DelistedClient } from "@/components/graveyard/DelistedClient";
import { decayIndex } from "@/lib/graveyard/decay";
import { DELISTED_FIXTURE } from "@/lib/graveyard/fixture";
import { END_STATE_LABEL, lightAge } from "@/lib/graveyard/types";

export const metadata: Metadata = {
  title: "Delisted",
  description:
    "Datasets whose sources no longer answer. Each entry is the record as it stood the last time Archivum could retrieve it.",
};

/**
 * Server-rendered fallback register.
 *
 * The board is an aria-hidden canvas and the client register needs JS, so the
 * crawler and any no-JS reader get the full set here. Losing an indexable page
 * to a canvas would be a net loss.
 */
function NoScriptRegister() {
  return (
    <ul className="sr-only">
      {DELISTED_FIXTURE.records.map((r) => {
        const decay = decayIndex(r);
        return (
          <li key={r.slug}>
            {r.name} — {r.publisher} — {END_STATE_LABEL[r.endState]} — last confirmed{" "}
            {r.lastConfirmed} — {lightAge(r.lastConfirmed)} days — decay index{" "}
            {decay.index.toFixed(1)} from {decay.signalsUsed} of {decay.signalsTotal} signals —{" "}
            {r.coverageTotal}% documented at last check — {r.license}
          </li>
        );
      })}
    </ul>
  );
}

export default function DelistedPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-6 pt-28 md:px-8">
        <header className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Delisted
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-foreground md:text-5xl">
            The record outlives the data
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            The source is gone. The training runs aren&rsquo;t. Each column is a dataset as
            Archivum last retrieved it. Height and colour are the decay index: how long it has
            been missing, and the checks that went into the number.
          </p>
        </header>
      </div>
      <NoScriptRegister />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-6 pt-28 md:px-8">
            <p className="font-mono text-sm text-muted-foreground">Loading the register…</p>
          </div>
        }
      >
        <DelistedClient />
      </Suspense>
    </>
  );
}
