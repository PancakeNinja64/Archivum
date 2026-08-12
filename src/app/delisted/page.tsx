import { Suspense } from "react";
import type { Metadata } from "next";
import { DelistedClient } from "@/components/graveyard/DelistedClient";
import { decayIndex } from "@/lib/graveyard/decay";
import { DELISTED_FIXTURE } from "@/lib/graveyard/fixture";
import { END_STATE_LABEL, lightAge } from "@/lib/graveyard/types";

export const metadata: Metadata = {
  title: "Delisted",
  description:
    "Datasets that stopped being retrievable — removed repositories, endpoints returning errors, records gated after publication, and corpora still cited by work in production. Each entry as it stood at the final successful check.",
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
            Delisted · no longer retrievable
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-foreground md:text-5xl">
            The record outlives the data
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Models trained on these datasets are still in production. Each column is one record as
            it stood at the final successful check. Height and colour are its decay index — how far
            it has moved from retrievable — computed from what Archivum observed, and shown with
            the signals that produced it.
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
