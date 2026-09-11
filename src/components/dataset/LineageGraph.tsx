"use client";

import { useId, useState } from "react";
import type { LineageGraph as Graph, LineageStage } from "@/lib/types";
import { fmtDate, safeExternalUrl } from "@/lib/utils";
import { EvidenceDot } from "./EvidenceDot";
import styles from "./lineage.module.css";

const labels: Record<LineageStage, string> = { source: "Original source", scrape: "Acquisition", clean: "Cleaning", annotate: "Annotation", embed: "Embedding", current: "Current version" };
export function LineageGraph({ lineage }: { lineage: Graph }) {
  const [selectedId, setSelectedId] = useState<string | null>(lineage.nodes.at(-1)?.id ?? null);
  const arrowId = useId().replaceAll(":", "");
  const active = lineage.nodes.find((node) => node.id === selectedId) ?? lineage.nodes[0];
  if (!lineage.nodes.length) return <p className={styles.empty}>No lineage record is available. Archivum has not inferred a processing workflow for this dataset.</p>;
  const width = Math.max(640, lineage.nodes.length * 160);
  const positions = new Map(lineage.nodes.map((node, index) => [node.id, { x: lineage.nodes.length === 1 ? width / 2 : 80 + index * (width - 160) / (lineage.nodes.length - 1), y: index % 2 === 0 ? 90 : 134 }]));
  const validEdges = lineage.edges.filter((edge) => positions.has(edge.from) && positions.has(edge.to));
  const sourceUrl = safeExternalUrl(active.url);
  return <div className={styles.layout}>
    <div className={styles.graph}>
      <div className={styles.bar}><span>Recorded connections</span><span>{lineage.nodes.length} nodes · {validEdges.length} connections</span></div>
      <div className={styles.scroll} role="region" aria-label="Lineage connections" tabIndex={0}>
        <div className={styles.stage} style={{ width }}>
          <svg width={width} height="220" aria-hidden>
            <defs><marker id={arrowId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="none" stroke="var(--muted-foreground)" /></marker></defs>
            {validEdges.map((edge, index) => {
              const a = positions.get(edge.from)!; const b = positions.get(edge.to)!;
              return <path key={`${edge.from}-${edge.to}-${index}`} d={`M${a.x} ${a.y} C${a.x + 56} ${a.y - 54} ${b.x - 56} ${b.y - 54} ${b.x - 14} ${b.y - 4}`} fill="none" stroke="var(--muted-foreground)" strokeWidth="1" strokeDasharray={edge.evidence === "documented" ? undefined : "4 5"} markerEnd={`url(#${arrowId})`} opacity=".6" />;
            })}
          </svg>
          {lineage.nodes.map((node) => {
            const p = positions.get(node.id)!;
            return <button key={node.id} type="button" className={styles.node} style={{ left: p.x, top: p.y }} aria-pressed={active.id === node.id} onClick={() => setSelectedId(node.id)} aria-label={`Inspect ${node.label}`}><span className={styles.dot} /><span className={styles.nodeName}>{node.label}</span><span className={styles.nodeStage}>{labels[node.stage]}</span></button>;
          })}
        </div>
      </div>
      {lineage.undocumentedStages.length > 0 && <p className={styles.gaps}>Undocumented stages supplied by the record: {lineage.undocumentedStages.map((stage) => labels[stage]).join(", ")}.</p>}
      <details className={styles.connections}><summary>Read connections as a list</summary><ul>{validEdges.length ? validEdges.map((edge, index) => <li key={index}>{lineage.nodes.find((node) => node.id === edge.from)?.label} → {lineage.nodes.find((node) => node.id === edge.to)?.label} <EvidenceDot label={edge.evidence} /></li>) : <li>No connections were supplied between these nodes.</li>}</ul></details>
    </div>
    <div className={styles.inspector} aria-live="polite">
      <EvidenceDot label={active.evidence} /><h4>{active.label}</h4><p>{active.description || "No description supplied."}</p>
      <dl><div><dt>Actor</dt><dd>{active.actor || "Not stated"}</dd></div><div><dt>Observed</dt><dd>{fmtDate(active.timestamp)}</dd></div></dl>
      {active.hash && <details><summary>Recorded fingerprint</summary><code>{active.hash}</code></details>}
      {sourceUrl && <a href={sourceUrl} rel="noopener noreferrer">Open supplied evidence ↗</a>}
    </div>
  </div>;
}
