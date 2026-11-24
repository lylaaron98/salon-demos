import { useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Initial value for a step's choice. Prefers the value in the current URL, which
 * StepForm writes into the history entry on submit: after the browser's Back
 * button the router restores the step from its cache, and this brings the
 * choice back with it.
 */
export function useRememberedChoice(name: string, selected: string | undefined, valid: string[]) {
  const params = useSearchParams();
  return useState(() => {
    const fromUrl = params.get(name);
    if (fromUrl && valid.includes(fromUrl)) return fromUrl;
    return selected && valid.includes(selected) ? selected : "";
  });
}
