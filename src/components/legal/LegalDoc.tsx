import type { ReactNode } from "react";

export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 md:px-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Legal</p>
      <h1 className="mt-4 font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-accent md:text-5xl">
        {title}
      </h1>
      <p className="mt-3 font-mono text-[12px] text-muted-foreground">Last updated {updated}</p>
      <div className="legal-prose mt-12 space-y-10 text-[15px] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-serif text-2xl tracking-[-0.02em] text-foreground">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
