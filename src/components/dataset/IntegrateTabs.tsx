import Link from "next/link";

/** Compatibility component: no copyable invented SDK, API or CLI examples. */
export function IntegrateTabs({ slug }: { slug: string; version: string }) {
  return <div className="rounded-xl border border-border bg-surface p-6 text-sm leading-relaxed text-muted-foreground"><p>Archivum’s SDK and CLI are not available in this release. Use the original platform’s documented download and access instructions.</p><Link href={`/datasets/${encodeURIComponent(slug)}/#integrate`} className="mt-3 inline-flex min-h-11 items-center text-accent">View source access information ↗</Link></div>;
}
