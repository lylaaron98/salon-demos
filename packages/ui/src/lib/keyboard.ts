/** Keyboard helpers for roving focus (tabs) and focus traps (drawer). */

/** Next index for a roving-tabindex list (WAI-ARIA tabs: arrows wrap, Home/End jump). */
export function rovingIndex(key: string, current: number, count: number): number | null {
  if (count <= 0) return null;
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return (current + 1) % count;
    case "ArrowLeft":
    case "ArrowUp":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}

/**
 * Where Tab should go inside a focus trap. Returns the index to focus, or null to
 * let the browser move focus normally (focus is not at either edge).
 */
export function trapIndex(shift: boolean, activeIndex: number, count: number): number | null {
  if (count === 0) return null;
  if (activeIndex === -1) return shift ? count - 1 : 0;
  if (shift && activeIndex === 0) return count - 1;
  if (!shift && activeIndex === count - 1) return 0;
  return null;
}

export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/** Visible, focusable descendants of a container, in DOM order. */
export function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("inert") && el.getClientRects().length > 0,
  );
}
