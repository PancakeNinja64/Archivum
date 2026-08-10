import { Suspense } from "react";
import type { Metadata } from "next";
import { DelistedClient } from "@/components/graveyard/DelistedClient";
import { DELISTED_FIXTURE } from "@/lib/graveyard/fixture";
import { END_STATE_LABEL, daysSince } from "@/lib/graveyard/types";

export const metadata: Metadata = {
  title: "Delisted records",
  description:
    "Records no longer retrievable from their source, kept as they stood at the final successful check — end state, licensing, and documentation coverage at last observation.",
};

/**
 * Server-rendered fallback list.
 *
 * The canvas is aria-hidden and the client register needs JS, so the crawler
 * and any no-JS reader get the full set here. Losing an indexable page to a
 * canvas would be a net loss.
 */
function NoScriptRegister() {
  return (
    <ul className="sr-only">
      {DELISTED_FIXTURE.records.map((r) => (
        <li key={r.slug}>
          {r.name} — {r.publisher} — {END_STATE_LABEL[r.endState]} — last confirmed{" "}
          {r.lastConfirmed} — {daysSince(r.lastConfirmed)} days — {r.coverageTotal}% documented at
          last check — {r.license}
        </li>
      ))}
    </ul>
  );
}

export default function DelistedPage() {
  return (
    <>
      {/* Server-rendered. useSearchParams pushes the whole client subtree to the
          Suspense fallback during SSR, so anything that must reach a crawler —
          the h1, the subhead, the record list — has to live out here. */}
      <div className="mx-auto max-w-7xl px-6 pt-28 md:px-8">
        <header className="max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Delisted · no longer retrievable
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-foreground md:text-5xl">
            What the ecosystem stopped keeping.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Models trained on these records are still in production. Each entry is the record
            exactly as it stood at the final successful check, with the state observed at that
            check. Well depth is mass; filtered-out records relax to flat.
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
