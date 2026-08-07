import type { DatasetSummary } from "@/lib/types";
import { Button } from "../ui/Button";
import { HeroPassport } from "./HeroPassport";

export function Hero({
  featured,
  catalogCount,
  platformCount,
}: {
  featured: DatasetSummary[];
  catalogCount: number;
  platformCount: number;
}) {
  const datasets = catalogCount.toLocaleString();
  const platforms = platformCount.toLocaleString();
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pb-20 pt-28 md:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -10%, var(--accent-wash) 0%, transparent 60%)",
        }}
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            The record of public AI data
          </p>
          <h1 className="mt-6 font-serif text-[2.75rem] leading-[1.04] tracking-[-0.035em] text-accent sm:text-6xl lg:text-[4.75rem]">
            Know where your
            <br />
            data came from.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Every dataset your model learns from has a history. Archivum indexes
            what&rsquo;s already public and keeps one consistent record of each dataset — origin,
            licensing, lineage, and exactly how much of it the source documents.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button href="/explore/">Explore datasets</Button>
            <Button href="/docs/#methodology" variant="secondary">Read the methodology</Button>
          </div>
          <p className="tnum mt-8 font-mono text-[12px] text-muted-foreground">
            {datasets} dataset{catalogCount === 1 ? "" : "s"} indexed
            {platformCount > 0 ? ` · ${platforms} platform${platformCount === 1 ? "" : "s"}` : ""}
            {" · "}independent of every one of them
          </p>
        </div>
        <HeroPassport datasets={featured.slice(0, 4)} />
      </div>
    </section>
  );
}
