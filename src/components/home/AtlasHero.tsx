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
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-background">
      <AtlasField field={field} />

      {/* Scrim: holds headline contrast whatever rotates behind it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(to right, var(--background) 0%, color-mix(in srgb, var(--background) 92%, transparent) 26%, transparent 55%)',
        }}
      />

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 md:px-8 md:pt-32">
        <div className="max-w-[34rem]">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            The record of public AI data
          </p>
          <h1 className="mt-6 font-serif text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.04] tracking-[-0.035em] text-foreground">
            Know where your
            <br />
            data came from.
          </h1>
          <p className="mt-7 text-lg leading-relaxed text-muted-foreground">
            Every dataset your model learns from has a history. Archivum indexes what&rsquo;s
            already public and keeps one consistent record of each dataset &mdash; origin,
            licensing, lineage, and exactly how much of it the source documents.
          </p>
          <div className="pointer-events-auto mt-10 flex flex-wrap items-center gap-3">
            <Button href="/explore/">Explore datasets</Button>
            <Button href="/docs/#methodology" variant="secondary">
              Read the methodology
            </Button>
          </div>
          <p className="tnum mt-8 font-mono text-[12px] text-muted-foreground">
            {datasets} dataset{catalogCount === 1 ? '' : 's'} indexed
            {platformCount > 0 ? ` · ${platforms} platform${platformCount === 1 ? '' : 's'}` : ''}
            {' · '}independent of every one of them
          </p>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-8 w-full max-w-6xl px-6 pb-8 md:px-8">
        <AtlasLegend />
      </div>
    </section>
  );
}
