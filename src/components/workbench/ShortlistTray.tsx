'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { recordHref } from '@/lib/workbench/query';
import { describeStorageStatus } from '@/lib/workbench/shortlist';
import { useShortlist } from '@/lib/workbench/useShortlist';
import { useBriefExport } from '@/lib/workbench/useBriefExport';
import { Glyph } from './Glyph';
import { publisherName } from './recordMeta';
import { trayCompare, trayCountLabel, trayEmptyHint, trayMode, type TraySurface } from './trayModel';
import { useSingleColumn } from './useSingleColumn';
import desk from './desk.module.css';
import styles from './tray.module.css';

/**
 * The persistent shortlist. Same store on every desk surface; the label is
 * the honest one — these records live in this browser and nowhere else.
 *
 * Empty, it is one compact line. Filled, it expands to the saved records and
 * the controls that make a shortlist useful. On phones the record chips fold
 * behind a toggle so the bar stays short, and the tray's measured height is
 * published as `--wb-tray` on its parent so focus targets scroll clear of it.
 */
export function ShortlistTray({ currentSlug = null, surface }: { currentSlug?: string | null; surface: TraySurface }) {
  const shortlist = useShortlist();
  const exporter = useBriefExport();
  const reduced = useReducedMotion();
  const trayRef = useRef<HTMLElement>(null);
  const storageNote = describeStorageStatus(shortlist.status);
  const slugs = shortlist.items.map((item) => item.slug);
  const count = shortlist.items.length;
  const mode = trayMode(shortlist);
  const compare = trayCompare(slugs, surface);

  /* Phones start folded. A save made while this page is open unfolds the chips so the new one is seen;
     opening a different record folds them again so they never sit over the record's own actions. */
  const singleColumn = useSingleColumn();
  const [override, setOverride] = useState<boolean | null>(null);
  const [seen, setSeen] = useState({ hydrated: shortlist.hydrated, count, currentSlug });
  if (seen.hydrated !== shortlist.hydrated || seen.count !== count || seen.currentSlug !== currentSlug) {
    if (seen.hydrated && shortlist.hydrated && count > seen.count) setOverride(true);
    else if (seen.currentSlug !== currentSlug) setOverride(null);
    setSeen({ hydrated: shortlist.hydrated, count, currentSlug });
  }
  const expanded = override ?? !singleColumn;

  /* Publish the tray's height so the surface above can keep focus targets clear of it. */
  useEffect(() => {
    const tray = trayRef.current;
    const host = tray?.parentElement;
    if (!tray || !host) return;
    const publish = () => host.style.setProperty('--wb-tray', `${Math.ceil(tray.getBoundingClientRect().height)}px`);
    publish();
    if (typeof ResizeObserver === 'undefined') return () => host.style.removeProperty('--wb-tray');
    const observer = new ResizeObserver(publish);
    observer.observe(tray);
    return () => { observer.disconnect(); host.style.removeProperty('--wb-tray'); };
  }, []);

  const exportButton = (format: 'md' | 'json') => (
    <button
      type="button"
      className={`${desk.buttonQuiet} ${desk.buttonSmall}`}
      disabled={count === 0 || exporter.busy !== null}
      onClick={() => exporter.run(shortlist.items, 'shortlist', format)}
      aria-label={`Download the saved records as a ${format === 'md' ? 'Markdown' : 'JSON'} research brief`}
    >
      <Glyph name="download" size={13} />{exporter.busy === format ? 'Writing…' : format === 'md' ? 'Markdown' : 'JSON'}
    </button>
  );

  return (
    <aside ref={trayRef} className={styles.tray} data-mode={mode} data-expanded={expanded} aria-label="Saved on this device">
      <div className={styles.label}>
        <strong>Saved on this device</strong>
        <span className={styles.count} aria-live="polite">{trayCountLabel(mode, count)}</span>
      </div>

      {mode === 'empty' && <p className={styles.hint}>{trayEmptyHint(surface)}</p>}
      {mode === 'reading' && <p className={styles.hint}>Reading the records saved in this browser…</p>}

      {mode === 'filled' && (
        <div id={`${surface}-tray-items`} className={styles.items}>
          <AnimatePresence initial={false}>
            {shortlist.items.map((item) => (
              <motion.div
                key={item.slug}
                className={styles.item}
                data-current={item.slug === currentSlug || undefined}
                layout={!reduced}
                initial={reduced ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={recordHref(item.slug)} aria-current={item.slug === currentSlug ? 'true' : undefined} title={`${item.name} · ${publisherName(item.publisher)}`}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemWho}>{publisherName(item.publisher)}</span>
                </Link>
                <button type="button" onClick={() => shortlist.remove(item.slug)} aria-label={`Remove ${item.name} from records saved on this device`}><Glyph name="close" size={13} /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {mode === 'filled' && (
        <div className={styles.primary}>
          {compare.kind === 'link' && <Link className={`${desk.button} ${desk.buttonSmall}`} href={compare.href}><Glyph name="compare" size={14} />Compare {compare.count}</Link>}
          {compare.kind === 'disabled' && <button type="button" className={`${desk.button} ${desk.buttonSmall}`} disabled title={compare.reason}><Glyph name="compare" size={14} />Compare</button>}
          <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall} ${styles.toggle}`} aria-expanded={expanded} aria-controls={`${surface}-tray-items`} onClick={() => setOverride(!expanded)}>
            {expanded ? 'Hide' : 'Show'} <Glyph name="chevron" size={13} />
          </button>
        </div>
      )}

      {(mode === 'filled' || surface !== 'collections') && (
        <div className={styles.secondary}>
          {mode === 'filled' && (
            <div className={styles.brief} role="group" aria-label="Download the saved records as a research brief">
              <span>Brief</span>
              {exportButton('md')}
              {exportButton('json')}
            </div>
          )}
          {surface !== 'collections' && <Link className={`${desk.buttonQuiet} ${desk.buttonSmall}`} href="/collections/">Shelf <Glyph name="arrow" size={13} /></Link>}
        </div>
      )}

      {(storageNote || exporter.notice) && (
        <p className={styles.status} role="status" aria-live="polite" data-tone={exporter.notice?.tone === 'error' || shortlist.status.kind !== 'ok' ? 'error' : 'ok'}>
          {exporter.notice?.text ?? storageNote}
        </p>
      )}
    </aside>
  );
}
