export const MOTION = {
  duration: {
    fast: 0.2,   // micro-interactions: hover, tap, badge flash
    base: 0.32,  // default: dialogs, list items
    page: 0.45,  // route/page transitions — deliberate, not instant
    slow: 0.5,   // large layout shifts only — use sparingly
  },
  ease: {
    out:   [0.22, 1, 0.36, 1]  as const,  // softened expo-out
    in:    [0.64, 0, 0.78, 0]  as const,
    inOut: [0.65, 0, 0.35, 1]  as const,
  },
} as const;

export const fadeSlideUp = {
  initial:    { opacity: 0, y: 6 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -4 },
  transition: { duration: MOTION.duration.base, ease: MOTION.ease.out },
};

export const pageTransition = {
  initial:    { opacity: 0, y: 10 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -6 },
  transition: { duration: MOTION.duration.page, ease: MOTION.ease.inOut },
};

export const drillForward = {
  initial:    { opacity: 0, x: 24 },
  animate:    { opacity: 1, x: 0 },
  exit:       { opacity: 0, x: -16 },
  transition: { duration: MOTION.duration.page, ease: MOTION.ease.inOut },
};

export const drillBack = {
  initial:    { opacity: 0, x: -24 },
  animate:    { opacity: 1, x: 0 },
  exit:       { opacity: 0, x: 16 },
  transition: { duration: MOTION.duration.page, ease: MOTION.ease.inOut },
};
