"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { BrandWordmark } from "@/components/brand/Brand";
import { AuthMenu } from "./AuthMenu";
import styles from "./Shell.module.css";

const links = [
  { href: "/explore/", label: "Explore" },
  { href: "/delisted/", label: "Delisted" },
  { href: "/docs/#methodology", label: "Methodology" },
  { href: "/docs/", label: "Docs" },
];
export function Nav() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => { dialog.current?.close(); setOpen(false); };
  return <>
    <header className={styles.header}>
      <nav aria-label="Primary" className={styles.nav}>
        <Link href="/" className={styles.brand} aria-label="Archivum home"><BrandWordmark /></Link>
        <ul className={styles.links}>{links.map(link => <li key={link.label}><Link href={link.href} aria-current={!link.href.includes("#") && pathname === link.href ? "page" : undefined}>{link.label}</Link></li>)}</ul>
        <div className={styles.account}><AuthMenu /></div>
        <button className={styles.menu} aria-expanded={open} aria-controls="site-menu" onClick={() => { dialog.current?.showModal(); setOpen(true); }}>Menu <span aria-hidden>☰</span></button>
      </nav>
    </header>
    <dialog aria-label="Site menu" id="site-menu" ref={dialog} className={styles.dialog} onClose={() => setOpen(false)}>
      <div className={styles.dialogTop}><span>Navigate Archivum</span><button onClick={close} aria-label="Close menu">Close ×</button></div>
      <nav aria-label="Mobile navigation">{links.map((link, index) => <Link key={link.label} href={link.href} onClick={close}><span>0{index + 1}</span>{link.label}<span aria-hidden>↗</span></Link>)}</nav>
      <div className={styles.dialogBottom} onClick={close}><AuthMenu variant="mobile" /><Link href="/publish/">Submit a dataset ↗</Link></div>
    </dialog>
  </>;
}
