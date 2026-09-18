"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandWordmark } from "@/components/brand/Brand";
import { Appearance } from "./Appearance";
import styles from "./Shell.module.css";
export function Footer() {
  const pathname = usePathname();
  if (["/workspace", "/collections", "/compare"].some(route => pathname.startsWith(route))) return null;
  return <footer className={styles.footer}>
    <div className={styles.footerTop}>
      <div><Link className={styles.brand} href="/" aria-label="Archivum home"><BrandWordmark /></Link><p>Evidence for a more intelligent tomorrow.</p></div>
      <nav aria-label="Footer"><Link href="/workspace/">Research workspace</Link><Link href="/delisted/?demo=1">Delisted</Link><Link href="/docs/">Documentation</Link><Link href="/publish/">Submit a dataset</Link><a href="mailto:business@archivum.tech">Contact</a></nav>
      <Appearance />
    </div>
    <div className={styles.footerBottom}><p>Archivum indexes public metadata. Dataset files remain with their publishers. Documentation coverage describes available evidence.</p><div><Link href="/terms/">Terms</Link><Link href="/privacy/">Privacy</Link><Link href="/disclaimer/">Disclaimer</Link><span>© {new Date().getFullYear()} Archivum LLC</span></div></div>
  </footer>;
}
