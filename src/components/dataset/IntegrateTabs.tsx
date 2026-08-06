"use client";

import { useState } from "react";

export function IntegrateTabs({ slug, version }: { slug: string; version: string }) {
  const tabs = {
    Python: `from archivum import Client\n\nclient = Client()\nds = client.pull("${slug}", version="${version}")\n\nprint(ds.coverage.total)     # % documented\nprint(ds.license.spdx)       # licence as published\nds.export("llamaindex")      # provenance travels with the data`,
    TypeScript: `import { Archivum } from "@archivum/sdk";\n\nconst client = new Archivum();\nconst ds = await client.pull("${slug}", { version: "${version}" });\n\nconsole.log(ds.coverage.total);\nawait ds.export("langchain");`,
    CLI: `archivum pull ${slug}@${version}\narchivum trace ${slug}          # full lineage in the terminal\narchivum export ${slug} --to llamaindex`,
    REST: `GET https://api.archivum.example/v1/datasets/${slug}\nGET https://api.archivum.example/v1/datasets/${slug}/lineage\nGET https://api.archivum.example/v1/datasets/${slug}/versions`,
  };
  const names = Object.keys(tabs) as (keyof typeof tabs)[];
  const [tab, setTab] = useState<keyof typeof tabs>("Python");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(tabs[tab]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border pr-2">
        <div role="tablist" aria-label="Integration examples" className="flex">
          {names.map((n) => (
            <button
              key={n}
              role="tab"
              aria-selected={tab === n}
              onClick={() => setTab(n)}
              className={`px-4 py-2.5 font-mono text-[12px] ${tab === n ? "border-b-2 border-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {n}
            </button>
          ))}
        </div>
        <button type="button" onClick={copy} className="rounded px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground">
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-foreground">
{tabs[tab]}
      </pre>
    </div>
  );
}
