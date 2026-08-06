import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  contained?: boolean;
};

export function Section({
  id,
  children,
  className = "",
  contained = true,
}: SectionProps) {
  return (
    <section id={id} className={`relative py-24 md:py-32 lg:py-40 ${className}`}>
      {contained ? (
        <div className="mx-auto w-full max-w-6xl px-6 md:px-8">{children}</div>
      ) : (
        children
      )}
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
      {children}
    </p>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-serif text-4xl leading-[1.1] tracking-[-0.03em] text-accent md:text-5xl lg:text-[3.5rem]">
      {children}
    </h2>
  );
}

export function SectionLead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
      {children}
    </p>
  );
}
