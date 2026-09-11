import Link from "next/link";
import type { Dataset } from "@/lib/types";
import { dataMode } from "@/lib/api/client";
import { COVERAGE_CHECKS, COVERAGE_SECTIONS } from "@/lib/coverage/rules";
import { fmtDate, safeExternalUrl } from "@/lib/utils";
import { EvidenceDot } from "./EvidenceDot";
import styles from "./evidence.module.css";

export function CoveragePanel({ d }: { d: Dataset }) {
  const sourceUrl = dataMode === "catalog" ? safeExternalUrl(d.platformUrl) : null;
  if (!d.coverageSections.length) return <div className={styles.empty}>The individual checks for this observation are unavailable. The catalog reports {d.coverageTotal}% documentation coverage, checked {fmtDate(d.coverageCheckedAt)}.</div>;
  return <div>
    <div className={styles.grid}>
      {d.coverageSections.map((section, index) => {
        const checks = COVERAGE_CHECKS.filter((check) => check.section === section.key);
        return <details className={styles.section} key={section.key}>
          <summary className={styles.summary}>
            <span className={styles.number}>0{index + 1}</span>
            <span className={styles.heading}>{section.label}<small>{section.documented} documented · {section.reported} reported</small></span>
            <span className={styles.score}>{section.score}<small>%</small></span>
            <span className={styles.toggle} aria-hidden>+</span>
          </summary>
          <div className={styles.content}>
            <p>{COVERAGE_SECTIONS[section.key].question}</p>
            <ul className={styles.checks}>{checks.map((check) => {
              const result = d.coverageDetail[check.id];
              return <li key={check.id}><details>
                <summary><span>{check.label}</span>{result ? <EvidenceDot label={result} /> : <span className={styles.unavailable}>Unavailable</span>}</summary>
                <div className={styles.method}><p>{check.method}</p><p>Observation: {fmtDate(d.coverageCheckedAt)}</p>{result === "n/a" && <p>This check is excluded from the coverage calculation.</p>}{sourceUrl && <a href={sourceUrl} rel="noopener noreferrer">General source record ↗</a>}<p className={styles.footnote}>Individual artifact links are not supplied with this record.</p></div>
              </details></li>;
            })}</ul>
          </div>
        </details>;
      })}
    </div>
    <div className={styles.legend}>{(["documented", "reported", "not_found", "n/a"] as const).map((label) => <EvidenceDot key={label} label={label} />)}</div>
    <p className={styles.disclaimer}>Documentation coverage is a weighted measure of applicable checks: Documented counts fully, Reported counts halfway, and Not applicable is excluded. Checked {fmtDate(d.coverageCheckedAt)}. <Link href="/docs/#methodology">Read the methodology ↗</Link></p>
  </div>;
}
