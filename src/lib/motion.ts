export const MOTION = {
  duration: {
    fast: 0.15,
    base: 0.22,
    slow: 0.35,
  },
  ease: {
    out:   [0.16, 1, 0.3, 1]    as const,
    in:    [0.7, 0, 0.84, 0]    as const,
    inOut: [0.65, 0, 0.35, 1]   as const,
  },
} as const;

export const fadeSlideUp = {
  initial:    { opacity: 0, y: 6 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -4 },
  transition: { duration: MOTION.duration.base, ease: MOTION.ease.out },
};
