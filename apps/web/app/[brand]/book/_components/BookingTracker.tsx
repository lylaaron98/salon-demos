"use client";

import { useEffect, useRef } from "react";
import { safeSession, track, type AnalyticsContext } from "@/lib/analytics";

type Props = {
  context: AnalyticsContext;
  stepNumber: number;
  stepName: string;
  entrySource: string;
};

export const startedKey = (brand: string) => `orn_booking_started_${brand}`;

/**
 * Flow-level analytics and focus management:
 * - `booking_start` once per flow (first step rendered, including deep links)
 * - `booking_step_view` on every step
 * - `booking_abandon` when the page is hidden before the confirm step
 * - moves focus to the step heading after a step change (not on first load)
 */
export function BookingTracker({ context, stepNumber, stepName, entrySource }: Props) {
  const previousStep = useRef<string | null>(null);
  const contextRef = useRef(context);

  useEffect(() => {
    contextRef.current = context;
  });

  useEffect(() => {
    const ctx = contextRef.current;
    if (!safeSession.get(startedKey(ctx.brand))) {
      safeSession.set(startedKey(ctx.brand), "1");
      track("booking_start", ctx, { entry_step: stepName, entry_source: entrySource });
    }
    track("booking_step_view", ctx, { step_number: stepNumber, step_name: stepName });

    if (previousStep.current !== null && previousStep.current !== stepName) {
      document.getElementById("step-title")?.focus();
    }
    previousStep.current = stepName;
  }, [stepName, stepNumber, entrySource]);

  useEffect(() => {
    if (stepNumber >= 5) return;
    let sent = false;
    const onHide = (event: Event) => {
      if (sent) return;
      if (event.type === "visibilitychange" && document.visibilityState !== "hidden") return;
      sent = true;
      track("booking_abandon", contextRef.current, { last_step: stepNumber });
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
    };
  }, [stepNumber]);

  return null;
}
