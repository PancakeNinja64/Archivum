'use client';

import Link from 'next/link';
import { useState } from 'react';
import { dataMode } from '@/lib/api/client';
import { fmtDate } from '@/lib/utils';
import { compareHref, recordHref } from '@/lib/workbench/query';
import { describeStorageStatus, SHORTLIST_LIMIT } from '@/lib/workbench/shortlist';
import { useShortlist } from '@/lib/workbench/useShortlist';
import { useBriefExport } from '@/lib/workbench/useBriefExport';
import { Glyph } from './Glyph';
import { licenceIdentifier, platformName, publisherName } from './recordMeta';
import { ShortlistTray } from './ShortlistTray';
import desk from './desk.module.css';
import styles from './shelf.module.css';

/**
 * /collections — the records saved on this device, with the actions that
 * make a shortlist useful: open, remove, compare, export. No fake sets, no
 * team features, no cloud.
 */
export function ResearchShelf() {
  const shortlist = useShortlist();
  const exporter = useBriefExport();
  const [confirmClear, setConfirmClear] = useState(false);
  const storageNote = describeStorageStatus(shortlist.status);
  const count = shortlist.items.length;
  const slugs = shortlist.items.map((item) => item.slug);

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <header className={styles.head}>
          <div>
            <p className={desk.eyebrow}>Research shelf · <span className={`${desk.pill} ${dataMode === 'illustrative' ? desk.pillDemo : desk.pillLive}`}>{dataMode === 'illustrative' ? 'Illustrative catalog' : 'Live catalog'}</span></p>
            <h1>Saved on this device.</h1>
            <p>Up to {SHORTLIST_LIMIT} records kept in this browser’s storage — not in an account, not synced anywhere. Each entry stores the record’s slug and a little display metadata from the moment it was saved; open a record to see its current evidence.</p>
          </div>
          {count > 0 && (
            <div className={styles.toolbar}>
              {count >= 2
                ? <Link className={desk.buttonPrimary} href={compareHref(slugs)}><Glyph name="compare" size={15} />Compare all {count}</Link>
                : <button type="button" className={desk.button} disabled title="Save at least two records to compare"><Glyph name="compare" size={15} />Compare</button>}
              <div className={styles.toolGroup} role="group" aria-label="Export the shelf as a research brief">
                <span>Brief</span>
                <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} disabled={exporter.busy !== null} onClick={() => exporter.run(shortlist.items, 'shortlist', 'md')}><Glyph name="download" size={14} />{exporter.busy === 'md' ? 'Writing…' : 'Markdown'}</button>
                <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} disabled={exporter.busy !== null} onClick={() => exporter.run(shortlist.items, 'shortlist', 'json')}><Glyph name="download" size={14} />{exporter.busy === 'json' ? 'Writing…' : 'JSON'}</button>
              </div>
              {confirmClear
                ? <span className={styles.toolGroup}><span>Clear all {count}?</span><button type="button" className={`${desk.button} ${desk.buttonSmall}`} onClick={() => { shortlist.clear(); setConfirmClear(false); }}>Yes, clear</button><button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} onClick={() => setConfirmClear(false)}>Keep</button></span>
                : <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} onClick={() => setConfirmClear(true)}><Glyph name="close" size={13} />Clear shelf</button>}
            </div>
          )}
        </header>

        {(storageNote || exporter.notice) && (
          <div className={styles.notices}>
            {storageNote && <p className={desk.notice} role="status"><strong>Storage:</strong> {storageNote}</p>}
            {exporter.notice && <p className={`${desk.notice} ${exporter.notice.tone === 'error' ? '' : desk.noticeInfo}`} role="status">{exporter.notice.text}</p>}
          </div>
        )}

        {!shortlist.hydrated && <p className={desk.mono} role="status" style={{ marginTop: 24 }}>Reading records saved on this device…</p>}

        {shortlist.hydrated && count === 0 && (
          <section className={styles.empty} aria-labelledby="shelf-empty-title">
            <h2 id="shelf-empty-title">Nothing is saved on this device yet.</h2>
            <p>Open a record in the workspace and choose “Save on this device”. It appears here and in the tray at the bottom of every desk, ready to compare or export.</p>
            <p>The shelf holds {SHORTLIST_LIMIT} records at a time, lives only in this browser, and is not shared through links — comparison links carry record slugs instead.</p>
            <div className={styles.emptyActions}>
              <Link className={desk.buttonPrimary} href="/workspace/"><Glyph name="search" size={15} />Open the workspace</Link>
              <Link className={desk.button} href="/delisted/?demo=1">Browse Delisted <Glyph name="arrow" size={14} /></Link>
            </div>
          </section>
        )}

        {count > 0 && (
          <ol className={styles.list} aria-label="Records saved on this device">
            {shortlist.items.map((item, index) => (
              <li key={item.slug} className={styles.item}>
                <span className={styles.index} aria-hidden="true">0{index + 1}</span>
                <div style={{ minWidth: 0 }}>
                  <Link className={styles.name} href={recordHref(item.slug)}>{item.name}</Link>
                  <p className={styles.meta}>
                    <span className={styles.who}>{publisherName(item.publisher)} · {platformName(item.platform)}</span>
                    <span className={styles.ids}>
                      <span>{licenceIdentifier(item.license)}</span>
                      <span>{item.coverageTotal === null ? 'coverage not recorded' : <>coverage <strong>{item.coverageTotal}%</strong> when saved{item.coverageCheckedAt ? ` (checked ${fmtDate(item.coverageCheckedAt)})` : ''}</>}</span>
                      <span>saved {fmtDate(item.savedAt)}</span>
                    </span>
                  </p>
                </div>
                <div className={styles.itemActions}>
                  <Link className={`${desk.buttonQuiet} ${desk.buttonSmall}`} href={recordHref(item.slug)}><Glyph name="arrow" size={13} />Open</Link>
                  <Link className={`${desk.buttonQuiet} ${desk.buttonSmall}`} href={recordHref(item.slug, 'evidence')}>Evidence</Link>
                  {count >= 2 && <Link className={`${desk.buttonQuiet} ${desk.buttonSmall}`} href={compareHref(slugs.filter((slug) => slug !== item.slug).length >= 1 ? [item.slug, ...slugs.filter((slug) => slug !== item.slug)] : slugs)}><Glyph name="compare" size={13} />Compare</Link>}
                  <button type="button" className={`${desk.buttonQuiet} ${desk.buttonSmall}`} onClick={() => shortlist.remove(item.slug)} aria-label={`Remove ${item.name} from this device`}><Glyph name="close" size={13} />Remove</button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {count > 0 && <p className={styles.foot}>Coverage figures on this shelf are the values recorded when each record was saved. The record itself may have been re-checked since; the workspace shows the current observation. <Link href="/docs/#methodology">How coverage is measured ↗</Link></p>}
      </div>
      <ShortlistTray surface="collections" />
    </div>
  );
}
