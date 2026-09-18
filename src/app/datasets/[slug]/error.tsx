"use client";
import Link from "next/link";
import styles from "@/components/dataset/passport.module.css";
export default function DatasetError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className={styles.page}><p className={styles.kicker}>RECORD UNAVAILABLE</p><h1 className={styles.title}>This record could not be loaded.</h1><p className={styles.description}>The catalog request failed. The dataset may still be available; try loading its record again.</p><div className={styles.actions}><button type="button" className={styles.secondary} onClick={reset}>Try again</button><Link href="/workspace/" className={styles.secondary}>Back to Workspace</Link></div></div>;
}
