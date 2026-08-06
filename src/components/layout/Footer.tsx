import Link from "next/link";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Explore datasets", href: "/explore/" },
      { label: "Coverage methodology", href: "/docs/#methodology" },
      { label: "Lineage", href: "/docs/#lineage" },
      { label: "Pricing", href: "/pricing/" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs/" },
      { label: "API reference", href: "/docs/#api" },
      { label: "Publish a dataset", href: "/publish/" },
      { label: "Dashboard", href: "/dashboard/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Methodology", href: "/docs/#methodology" },
      { label: "Contact", href: "mailto:hello@archivum.ai" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-[1] border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <span className="text-accent"><Logo height={24} /></span>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">The record of public AI data.</p>
            <p className="tnum mt-3 font-mono text-[11px] text-muted-foreground">
              Indexing 12,400+ datasets across 4 platforms
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href.startsWith("mailto:") ? (
                        <a href={l.href} className="link-underline text-sm text-foreground/80 hover:text-foreground">{l.label}</a>
                      ) : (
                        <Link href={l.href} className="link-underline text-sm text-foreground/80 hover:text-foreground">{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Archivum LLC.</p>
          <p className="font-mono text-[11px] text-muted-foreground">Every dataset has a history.</p>
        </div>
      </div>
    </footer>
  );
}
