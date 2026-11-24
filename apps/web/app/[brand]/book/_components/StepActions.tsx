"use client";

import { Button, Icon } from "@salon-demos/ui";
import Link from "next/link";
import styles from "../booking.module.css";
import { useHydrated } from "./use-hydrated";

type Props = {
  backHref?: string;
  continueLabel?: string;
  /** False disables Continue once hydrated (without JS the server validates instead). */
  canContinue?: boolean;
  /** Shown under the button while Continue is unavailable. */
  helper?: string;
  /** Running summary on the mobile sticky footer, e.g. "S$48 · Wed 26 Nov, 2:30 pm". */
  summary?: string;
  pending?: boolean;
};

/**
 * One primary action per step. Sticky at the bottom of the viewport on mobile
 * (thumb zone) with a running summary; inline at the end of the panel on desktop.
 */
export function StepActions({
  backHref,
  continueLabel = "Continue",
  canContinue = true,
  helper,
  summary,
  pending = false,
}: Props) {
  const hydrated = useHydrated();
  const disabled = hydrated && !canContinue;
  const showHelper = !canContinue && helper;

  return (
    <div className={styles.actions}>
      {summary ? (
        <p className={styles.actionsSummary} aria-hidden="true">
          {summary}
        </p>
      ) : null}
      <div className={styles.actionsRow}>
        {backHref ? (
          <Link href={backHref} className={styles.back}>
            <Icon name="arrowRight" />
            Back
          </Link>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className={styles.continue}
          disabled={disabled}
          loading={pending}
          aria-describedby={showHelper ? "continue-help" : undefined}
        >
          {continueLabel}
        </Button>
      </div>
      {showHelper ? (
        <p id="continue-help" className={styles.helper}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}
