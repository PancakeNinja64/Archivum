"use client";

import { useEffect, useState } from "react";
import styles from "./passport.module.css";

const sections = ["Overview", "Evidence", "History", "Structure"] as const;
export function PassportNav() {
  const [active, setActive] = useState("overview");
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: "-135px 0px -55% 0px", threshold: 0 });
    sections.forEach((section) => {
      const element = document.getElementById(section.toLowerCase());
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  return <nav aria-label="Record sections" className={styles.nav}>
    {sections.map((section) => <a key={section} href={`#${section.toLowerCase()}`} aria-current={active === section.toLowerCase() ? "location" : undefined} onClick={() => setActive(section.toLowerCase())}>{section}</a>)}
  </nav>;
}
