import { Button } from '../ui/Button';
import { AtlasField } from '../atlas/AtlasField';
import { AtlasLegend } from '../atlas/AtlasLegend';
import { ATLAS_FIXTURE } from '@/lib/atlas/fixture';

/**
 * The landing view: the Atlas takes the viewport, the positioning copy sits
 * over it.
 *
 * Background and canvas tokens follow the site theme (light/dark). The field
 * wrapper reads computed design tokens so the visualization matches the rest
 * of the page without hard-coded colours.
 *
 * The h1, subhead and dataset names are server-rendered. Losing an indexable
 * homepage to a canvas would be a net loss.
 */
export function AtlasHero({
  catalogCount,
  platformCount,
}: {
  catalogCount: number;
  platformCount: number;
}) {
  const field = ATLAS_FIXTURE;
  const datasets = (catalogCount || field.nodeCount).toLocaleString();
  const platforms = (platformCount || field.platformCount).toLocaleString();

  return (
    <section className="relative flex min-h-0 flex-col justify-center overflow-hidden bg-background sm:min-h-[100svh]">
      <AtlasField field={field} />

      {/* Mobile: a heavier wash so the field doesn't compete with the headline. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 sm:hidden"
        style={{
          background:
            'linear-gradient(to bottom, var(--background) 0%, color-mix(in srgb, var(--background) 88%, transparent) 62%, color-mix(in srgb, var(--background) 55%, transparent) 100%)',
        }}
      />

      {/* Scrim: holds headline contrast whatever rotates behind it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 hidden sm:block"
        style={{
          background:
            'linear-gradient(to right, var(--background) 0%, color-mix(in srgb, var(--background) 92%, transparent) 26%, transparent 55%)',
        }}
      />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-20 sm:pb-0 sm:pt-28 md:px-8 md:pt-32">
        <div className="max-w-[34rem]">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            The record of public AI data
          </p>
          <h1 className="mt-4 font-serif text-[2.35rem] leading-[1.04] tracking-[-0.035em] text-foreground sm:mt-6 sm:text-[clamp(2.75rem,6vw,4.5rem)]">
            Know where your
            <br />
            data came from.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:mt-7 sm:text-lg">
            Every dataset your model learns from has a history. Archivum indexes what&rsquo;s
            already public and keeps one consistent record of each dataset &mdash; origin,
            licensing, lineage, and exactly how much of it the source documents.
          </p>
          <div className="pointer-events-auto mt-7 flex flex-col items-stretch gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center">
            <Button href="/explore/" className="max-sm:min-h-11 max-sm:w-full">
              Explore datasets
            </Button>
            <Button href="/docs/#methodology" variant="secondary" className="max-sm:min-h-11 max-sm:w-full">
              Read the methodology
            </Button>
          </div>
          <p className="tnum mt-6 font-mono text-[12px] text-muted-foreground max-sm:break-words max-sm:leading-relaxed sm:mt-8">
            {datasets} dataset{catalogCount === 1 ? '' : 's'} indexed
            {platformCount > 0 ? ` · ${platforms} platform${platformCount === 1 ? '' : 's'}` : ''}
            {' · '}independent of every one of them
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-8 hidden w-full max-w-6xl px-6 pb-8 sm:block md:px-8">
        <AtlasLegend />
      </div>
    </section>
  );
}
