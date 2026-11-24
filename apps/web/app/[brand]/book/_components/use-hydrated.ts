import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during SSR and the hydration pass, true after. Lets the flow render
 * no-JS-safe markup first (an enabled Continue button the server validates) and
 * then switch to the enhanced behaviour (disabled until a choice is made).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
