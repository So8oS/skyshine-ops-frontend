import { useRef } from "react";

/**
 * True only if this component instance's first render observed isLoading=true —
 * i.e. there was no cached data and content arrives asynchronously after the
 * page is already visible. False when data was already warm in the cache, so
 * the component renders its final content immediately.
 *
 * Route transitions now unmount/remount page components on every navigation,
 * so a plain "have I mounted before" ref would fire on every visit. This
 * instead distinguishes a genuine cold load (worth animating) from a warm
 * remount (where the route-level transition already communicates arrival).
 */
export function useStartedLoading(isLoading: boolean): boolean {
  return useRef(isLoading).current;
}
