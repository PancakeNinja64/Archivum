'use client';

import { useEffect, useState } from 'react';

export type StageMode = 'choreography' | 'flow';

/** Scroll choreography needs room and permission; everything else reads in document flow. */
/** Keep in sync with the media query in AtlasStage.module.css and RecordPlate.module.css. */
export const CHOREOGRAPHY_QUERY = '(min-width: 1180px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)';

/**
 * Null until mounted (the server cannot know the viewport), then tracks the
 * media query live so a resize or a motion-preference change re-composes.
 */
export function useStageMode(): StageMode | null {
  const [mode, setMode] = useState<StageMode | null>(null);
  useEffect(() => {
    const media = matchMedia(CHOREOGRAPHY_QUERY);
    const apply = () => setMode(media.matches ? 'choreography' : 'flow');
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);
  return mode;
}
