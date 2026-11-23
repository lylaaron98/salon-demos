"use client";

import { ButtonLink } from "@salon-demos/ui";
import { telHref, whatsappHref } from "@salon-demos/ui/lib";
import { track, type AnalyticsContext } from "@/lib/analytics";
import styles from "../booking.module.css";

type Props = {
  phone: string;
  whatsapp: string;
  whatsappText: string;
  /** `contact_click.location` (brief §6.7). */
  location: "booking_header" | "booking_empty" | "booking_error" | "success";
  context: AnalyticsContext;
  variant?: "buttons" | "inline";
  whatsappLabel?: string;
};

/**
 * WhatsApp and call fallbacks (brief §6.4): plain wa.me and tel: links, no widget
 * scripts. The number stays visible as text so desktop users can copy it.
 */
export function ContactLinks({
  phone,
  whatsapp,
  whatsappText,
  location,
  context,
  variant = "buttons",
  whatsappLabel = "WhatsApp us",
}: Props) {
  const onClick = (method: "whatsapp" | "call") => () =>
    track("contact_click", context, { method, location });
  const wa = whatsappHref(whatsapp, whatsappText);

  if (variant === "inline") {
    return (
      <>
        <a
          className={styles.inlineLink}
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick("whatsapp")}
        >
          {whatsappLabel}
          <span className={styles.vh}> (opens WhatsApp)</span>
        </a>
        <a className={styles.inlineLink} href={telHref(phone)} onClick={onClick("call")}>
          Call {phone}
        </a>
      </>
    );
  }

  return (
    <div className={styles.contactRow}>
      <ButtonLink
        href={wa}
        variant="whatsapp"
        icon="chat"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick("whatsapp")}
      >
        {whatsappLabel}
        <span className={styles.vh}> (opens WhatsApp)</span>
      </ButtonLink>
      <ButtonLink href={telHref(phone)} variant="secondary" icon="phone" onClick={onClick("call")}>
        Call {phone}
      </ButtonLink>
    </div>
  );
}
