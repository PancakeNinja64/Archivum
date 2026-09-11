"use client";

import { useState } from "react";
import styles from "./passport.module.css";

export function ContentHash({ hash }: { hash: string }) {
  const [status, setStatus] = useState("");
  return <details className={styles.hash}>
    <summary>Metadata fingerprint <code>{hash.slice(0, 14)}…</code><span aria-hidden>+</span></summary>
    <div className={styles.hashValue}>
      <code>{hash}</code>
      <button className={styles.secondary} type="button" onClick={async () => {
        try { await navigator.clipboard.writeText(hash); setStatus("Copied"); }
        catch { setStatus("Copy unavailable. Select the fingerprint to copy it."); }
      }}>Copy fingerprint</button>
    </div>
    <p role="status">{status}</p>
  </details>;
}
