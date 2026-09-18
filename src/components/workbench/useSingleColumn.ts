'use client';

import { useSyncExternalStore } from 'react';

export const SINGLE_COLUMN = '(max-width: 899px)';

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(SINGLE_COLUMN);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
const read = () => window.matchMedia(SINGLE_COLUMN).matches;
const readServer = () => false;

/** True below the two-pane breakpoint. The server assumes two panes, the client corrects it on hydration. */
export function useSingleColumn(): boolean {
  return useSyncExternalStore(subscribe, read, readServer);
}
