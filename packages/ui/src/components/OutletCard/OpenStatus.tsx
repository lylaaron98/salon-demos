"use client";

import { useSyncExternalStore } from "react";
import { getOpenStatus, type OpeningHours } from "../../lib/hours";
import styles from "./OutletCard.module.css";

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

/**
 * "Open now · closes 9 pm", computed in the browser (Singapore time) so static
 * pages never show a stale status. Text, not colour alone, carries the state.
 */
export function OpenStatus({ hours }: { hours: OpeningHours }) {
  const status = useSyncExternalStore(
    subscribe,
    () => {
      const s = getOpenStatus(hours, new Date());
      return `${s.open ? "open" : "closed"}|${s.label}`;
    },
    () => null,
  );

  if (!status) {
    return <span className={styles.status}>Opening hours below</span>;
  }
  const [state, label] = status.split("|");
  return (
    <span className={styles.status} data-state={state}>
      <span className={styles.statusDot} aria-hidden="true" />
      {label}
    </span>
  );
}
