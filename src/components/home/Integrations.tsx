const sources = ["Hugging Face", "Kaggle", "GitHub", "Zenodo", "Papers with Code", "Institutional repositories"];
const targets = ["LlamaIndex", "LangChain", "Pinecone", "Qdrant", "Weaviate", "Chroma", "S3", "Snowflake"];

export function Integrations() {
  return (
    <section className="border-t border-border py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Integrations</p>
        <h2 className="mt-5 max-w-2xl font-serif text-[2.1rem] leading-[1.1] tracking-[-0.03em] text-accent sm:text-4xl md:text-5xl">
          Archivum sits under the stack you already use.
        </h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Index datasets from the platforms where they already live. Export them,
          with provenance attached, into the tools you already build with.
        </p>

        <div className="mt-10 grid items-stretch gap-6 sm:mt-14 lg:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Sources indexed</p>
            <ul className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-border bg-border sm:grid-cols-2">
              {sources.map((s) => (
                <li key={s} className="flex min-h-[64px] items-center justify-center bg-surface px-3 py-4 text-center text-sm text-muted-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center lg:flex-col">
            <div className="flex items-center gap-3 rounded-[10px] border border-accent-soft bg-accent-wash px-6 py-4 max-sm:max-w-full max-sm:flex-col max-sm:px-4 lg:flex-col lg:py-8">
              <svg viewBox="0 0 40 14" className="h-3 w-8 text-accent lg:rotate-90" aria-hidden>
                <path d="M2 10 Q20 4 38 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M34 7l4 3-5 1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.16em] text-accent-strong max-sm:whitespace-normal max-sm:text-center dark:text-accent">
                Archivum · index, record, trace
              </p>
              <svg viewBox="0 0 40 14" className="h-3 w-8 text-accent lg:rotate-90" aria-hidden>
                <path d="M2 10 Q20 4 38 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M34 7l4 3-5 1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Export targets</p>
            <ul className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-border bg-border sm:grid-cols-2">
              {targets.map((s) => (
                <li key={s} className="flex min-h-[64px] items-center justify-center bg-surface px-3 py-4 text-center text-sm text-muted-foreground">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
          Platform names are shown to indicate where Archivum indexes from and exports to.
          They do not indicate partnership, sponsorship, or endorsement. All trademarks
          belong to their respective owners.
        </p>
      </div>
    </section>
  );
}
