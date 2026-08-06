"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo, LogoMark } from "./Logo";
import { ThemeToggle } from "../ThemeToggle";
import { WaitlistModal } from "./WaitlistModal";
import { AuthMenu } from "./AuthMenu";

const links = [
  { href: "/explore/", label: "Explore" },
  { href: "/docs/", label: "Docs" },
  { href: "/pricing/", label: "Pricing" },
  { href: "/publish/", label: "Publish" },
  { href: "/dashboard/", label: "Dashboard" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [waitlist, setWaitlist] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on route change.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes; focus moves into the drawer while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-200 ease-out ${
          scrolled || open
            ? "border-b border-border bg-background/85 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-8"
        >
          <Link href="/" className="text-accent transition-opacity duration-200 hover:opacity-80" aria-label="Archivum home">
            <span className="hidden sm:inline-flex"><Logo height={22} /></span>
            <span className="sm:hidden"><LogoMark height={24} /></span>
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`link-underline text-[13px] transition-colors duration-200 ${
                    isActive(l.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthMenu />
            {process.env.NEXT_PUBLIC_DATA_SOURCE !== "supabase" && (
              <button
                type="button"
                onClick={() => setWaitlist(true)}
                className="hidden rounded-md bg-accent-strong px-3.5 py-2 text-[13px] font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 sm:inline-flex"
              >
                Join the waitlist
              </button>
            )}
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground lg:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                {open ? (
                  <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                ) : (
                  <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          ref={drawerRef}
          className="fixed inset-0 z-40 flex flex-col bg-background pt-20 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <ul className="flex flex-col gap-1 px-6">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`block rounded-md px-3 py-3 text-lg ${
                    isActive(l.href) ? "bg-muted text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 border-t border-border p-6">
            <AuthMenu variant="mobile" />
            {process.env.NEXT_PUBLIC_DATA_SOURCE !== "supabase" && (
              <button
                type="button"
                onClick={() => { setOpen(false); setWaitlist(true); }}
                className="rounded-md bg-accent-strong px-5 py-3 text-sm font-medium text-white"
              >
                Join the waitlist
              </button>
            )}
          </div>
        </div>
      )}

      <WaitlistModal open={waitlist} onClose={() => setWaitlist(false)} />
    </>
  );
}
