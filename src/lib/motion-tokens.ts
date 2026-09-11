export const motionTokens = {
  duration: {
    instant: 0.12,
    fast: 0.2,
    normal: 0.42,
    slow: 0.68,
  },
  easing: {
    quick: [0.16, 1, 0.3, 1] as const,
    smooth: [0.22, 1, 0.36, 1] as const,
  },
  distance: {
    sm: 8,
    md: 20,
    lg: 40,
    xl: 72,
  },
  scale: {
    press: 0.98,
    subtle: 0.985,
    pop: 1.015,
  },
} as const;

export const springs = {
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.8 } as const,
  gentle: { type: "spring", stiffness: 220, damping: 28, mass: 0.9 } as const,
} as const;

export const archiveScroll = {
  atlasExit: [0.08, 0.48] as const,
  preservedEnter: [0.32, 0.7] as const,
  sceneLift: [0, 1] as const,
  chapters: [0, 0.27, 0.53, 0.78] as const,
} as const;
