"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Icon } from "../../icons/Icon";
import { cx } from "../../lib/cx";
import { ButtonLink } from "../Button/Button";
import styles from "./PromoBanner.module.css";

export type PromoBannerProps = {
  /**
   * `inline` (default): full-width accent band with headline and CTA.
   * `announcement`: 40px bar at the top of the page, dismissible for 7 days.
   * `card`: sits inside a service grid.
   */
  variant?: "inline" | "announcement" | "card";
  title: string;
  body?: string;
  cta?: { label: string; href: string };
  /** Small label above the title, e.g. "First visit". */
  eyebrow?: string;
  /** Storage key for the dismissible announcement bar. */
  storageKey?: string;
};

const DISMISS_DAYS = 7;
const DISMISS_EVENT = "salon-ui:promo-dismiss";

function readDismissed(key: string): boolean {
  try {
    const until = Number(window.localStorage.getItem(key));
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(DISMISS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(DISMISS_EVENT, onChange);
  };
}

export function PromoBanner({
  variant = "inline",
  title,
  body,
  cta,
  eyebrow,
  storageKey = "salon-ui:promo",
}: PromoBannerProps) {
  // Rendered on the server so the bar reserves its height (no CLS); hidden after
  // hydration only if the visitor dismissed it in the last 7 days.
  const dismissed = useSyncExternalStore(
    subscribe,
    () => variant === "announcement" && readDismissed(storageKey),
    () => false,
  );

  const dismiss = useCallback(() => {
    try {
      const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
      window.localStorage.setItem(storageKey, String(until));
    } catch {
      // Storage blocked: the bar still hides for this page view.
    }
    window.dispatchEvent(new Event(DISMISS_EVENT));
  }, [storageKey]);

  if (variant === "announcement") {
    if (dismissed) return null;
    return (
      <aside className={styles.announcement} aria-label="Offer">
        <p className={styles.announcementText}>
          <strong>{title}</strong>
          {body ? <span className={styles.announcementBody}> {body}</span> : null}
          {cta ? (
            <>
              {" "}
              <a className={styles.announcementLink} href={cta.href}>
                {cta.label}
              </a>
            </>
          ) : null}
        </p>
        <button type="button" className={styles.dismiss} onClick={dismiss}>
          <Icon name="close" size={18} />
          <span className={styles.visuallyHidden}>Dismiss offer</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className={cx(styles.promo, styles[variant])} aria-label={eyebrow ?? "Offer"}>
      <div className={styles.copy}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <p className={styles.title}>{title}</p>
        {body ? <p className={styles.body}>{body}</p> : null}
      </div>
      {cta ? (
        <ButtonLink href={cta.href} variant="secondary" className={styles.cta}>
          {cta.label}
        </ButtonLink>
      ) : null}
    </aside>
  );
}
