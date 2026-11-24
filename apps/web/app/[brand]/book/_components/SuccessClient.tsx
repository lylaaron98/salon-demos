"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { hashRef, safeSession, track, type AnalyticsContext } from "@/lib/analytics";
import styles from "../booking.module.css";
import { startedKey } from "./BookingTracker";

/** Success heading: focused on load, inside a polite live region (brief §6.6). */
export function SuccessHeading({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <h1 ref={ref} id="success-title" className={styles.title} tabIndex={-1}>
      {children}
    </h1>
  );
}

type Props = { bookingRef: string; context: AnalyticsContext; value: number; isTrial: boolean };

/** Fires `booking_complete` once per booking ref (deduped in sessionStorage). */
export function CompleteTracker({ bookingRef, context, value, isTrial }: Props) {
  useEffect(() => {
    const key = `orn_booking_complete_${bookingRef}`;
    if (safeSession.get(key)) return;
    safeSession.set(key, "1");
    safeSession.remove(startedKey(context.brand));
    void hashRef(bookingRef).then((hashed) =>
      track("booking_complete", context, {
        booking_ref: hashed,
        value,
        currency: "SGD",
        is_trial: isTrial,
      }),
    );
  }, [bookingRef, context, value, isTrial]);
  return null;
}
