"use client";

import { useEffect, useState } from "react";
import { Icon } from "../../icons/Icon";
import { telHref, whatsappHref } from "../../lib/format";
import styles from "./StickyBookBar.module.css";

export type StickyBookBarProps = {
  bookLabel?: string;
  bookHref: string;
  phone: string;
  whatsapp: string;
  whatsappText?: string;
  /** id of the hero CTA. The bar appears once it scrolls out of view. */
  watchId?: string;
  /** id of the footer (or booking form). The bar hides while it is in view. */
  hideNearId?: string;
  /**
   * Render a 64px spacer so content is never hidden behind the bar. Turn off when the
   * page reserves the space itself (for example as footer padding).
   */
  spacer?: boolean;
};

/**
 * Mobile-only (<1024px) quick booking bar: WhatsApp, Call and Book now. Takes over
 * from the hero CTA and steps aside at the footer to avoid duplicate CTAs.
 */
export function StickyBookBar({
  bookLabel = "Book now",
  bookHref,
  phone,
  whatsapp,
  whatsappText,
  watchId = "hero-cta",
  hideNearId = "site-footer",
  spacer = true,
}: StickyBookBarProps) {
  const [ctaVisible, setCtaVisible] = useState(true);
  const [endVisible, setEndVisible] = useState(false);

  useEffect(() => {
    const cta = document.getElementById(watchId);
    const end = document.getElementById(hideNearId);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === cta) setCtaVisible(entry.isIntersecting);
        if (entry.target === end) setEndVisible(entry.isIntersecting);
      }
    });
    if (cta) observer.observe(cta);
    if (end) observer.observe(end);
    // No hero CTA on this page: show the bar straight away.
    const frame = cta ? 0 : window.requestAnimationFrame(() => setCtaVisible(false));
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [watchId, hideNearId]);

  const visible = !ctaVisible && !endVisible;

  return (
    <>
      {spacer ? <div className={styles.spacer} aria-hidden="true" /> : null}
      <nav aria-label="Quick booking" className={styles.bar} data-visible={visible || undefined}>
        <a
          className={styles.iconAction}
          data-kind="whatsapp"
          href={whatsappHref(whatsapp, whatsappText)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="chat" size={22} />
          <span className={styles.iconLabel}>WhatsApp</span>
        </a>
        <a className={styles.iconAction} data-kind="call" href={telHref(phone)}>
          <Icon name="phone" size={22} />
          <span className={styles.iconLabel}>Call</span>
        </a>
        <a className={styles.book} href={bookHref}>
          {bookLabel}
        </a>
      </nav>
    </>
  );
}
