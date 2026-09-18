"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { BrandWordmark } from "@/components/brand/Brand";
import { AuthMenu } from "./AuthMenu";
import styles from "./Shell.module.css";
const links = [{href:"/",label:"Atlas"},{href:"/workspace/",label:"Workspace"},{href:"/collections/",label:"Saved"},{href:"/compare/",label:"Compare"},{href:"/delisted/?demo=1",label:"Delisted"}];
export function Nav() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open,setOpen] = useState(false);
  const isHome = pathname === "/";
  const isImmersive = isHome || pathname.startsWith("/delisted");
  const close = () => { dialog.current?.close(); setOpen(false); };
  const isCurrent = (href: string) => {
    if (href === "/") return isHome;
    const path = href.split("?")[0].replace(/\/$/, "");
    return pathname.startsWith(path);
  };
  return <>
    <header className={`${styles.header} ${isImmersive ? styles.immersive : ""}`}><nav aria-label="Primary" className={styles.nav}>
      <Link href="/" className={styles.brand} aria-label="Archivum home"><BrandWordmark /></Link>
      <span className={styles.edition}>Public data intelligence</span>
      <ul className={styles.links}>{links.map(link => <li key={link.href}><Link href={link.href} aria-current={isCurrent(link.href) ? "page" : undefined}>{link.label}</Link></li>)}</ul>
      <div className={styles.account}><AuthMenu /></div>
      <button className={styles.menu} aria-expanded={open} aria-controls="site-menu" onClick={() => {dialog.current?.showModal();setOpen(true);}}>Menu <span aria-hidden>＋</span></button>
    </nav></header>
    <dialog id="site-menu" aria-label="Site navigation" ref={dialog} className={styles.dialog} onClose={() => setOpen(false)}>
      <div className={styles.dialogTop}><BrandWordmark /><button onClick={close}>Close ×</button></div>
      <nav aria-label="Mobile navigation">{links.map((link,i) => <Link key={link.href} href={link.href} onClick={close}><span>0{i+1}</span>{link.label}<span aria-hidden>↗</span></Link>)}</nav>
      <div className={styles.dialogBottom} onClick={close}><AuthMenu variant="mobile" /><Link href="/docs/">Method & documentation ↗</Link></div>
    </dialog>
  </>;
}
