import { Outlet, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { drillForward, drillBack } from "@/lib/motion";
import { useNavigationDirection } from "@/hooks/use-navigation-direction";

export function DrillLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const direction = useNavigationDirection();
  const reduced = useReducedMotion();

  const preset = direction === 'forward' ? drillForward : drillBack;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduced ? false : preset.initial}
        animate={preset.animate}
        exit={reduced ? {} : preset.exit}
        transition={reduced ? { duration: 0.01 } : preset.transition}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
