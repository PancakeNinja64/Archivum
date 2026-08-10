'use client';

import type { AtlasNode } from '@/lib/atlas/types';

/**
 * The canvas is aria-hidden, so the field needs a real DOM equivalent.
 *
 * One focusable button per node, ordered by Documentation Coverage descending.
 * Focusing one drives the reticle on the canvas; Enter opens the record. This
 * is the keyboard path and the screen-reader path, not a fallback.
 */
export function AtlasA11y({
  nodes,
  onFocusNode,
  onActivate,
}: {
  nodes: AtlasNode[];
  onFocusNode: (slug: string | null) => void;
  onActivate: (slug: string) => void;
}) {
  const ordered = [...nodes].sort((a, b) => b.coverageTotal - a.coverageTotal);
  return (
    <ul className="sr-only">
      {ordered.map((n) => (
        <li key={n.slug}>
          <button
            type="button"
            data-atlas-node={n.slug}
            onFocus={() => onFocusNode(n.slug)}
            onBlur={() => onFocusNode(null)}
            onClick={() => onActivate(n.slug)}
          >
            {n.name} — {n.publisher} — {n.coverageTotal}% documented — {n.license}
          </button>
        </li>
      ))}
    </ul>
  );
}
