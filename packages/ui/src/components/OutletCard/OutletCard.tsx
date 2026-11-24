import type { ReactNode } from "react";
import { Icon } from "../../icons/Icon";
import { cx } from "../../lib/cx";
import { directionsHref, telHref, whatsappHref } from "../../lib/format";
import { summariseHours, type OpeningHours } from "../../lib/hours";
import { ButtonLink } from "../Button/Button";
import { MediaPlaceholder } from "../MediaPlaceholder/MediaPlaceholder";
import { OpenStatus } from "./OpenStatus";
import styles from "./OutletCard.module.css";

export type OutletCardProps = {
  /** e.g. "Sable & Shear · Tiong Bahru". */
  name: string;
  /** Street address with unit number, e.g. "12 Example Road, #01-08". */
  address: string;
  postalCode: string;
  /** e.g. "3 min walk from Tiong Bahru MRT (EW17)". */
  mrt?: string;
  hours: OpeningHours;
  phone: string;
  whatsapp?: string;
  /** Prefilled WhatsApp message. */
  whatsappText?: string;
  bookHref: string;
  /** `list`: 3:2 image and weekly hours. `compact`: no weekly hours, and an image only if passed. */
  variant?: "list" | "compact";
  headingLevel?: 3 | 4;
  /** Outlet photo, e.g. a `next/image` with `fill`. The `list` variant always has the 3:2 frame; `compact` shows it only when given. */
  image?: ReactNode;
};

export function OutletCard({
  name,
  address,
  postalCode,
  mrt,
  hours,
  phone,
  whatsapp,
  whatsappText,
  bookHref,
  variant = "list",
  headingLevel = 3,
  image,
}: OutletCardProps) {
  const Heading = `h${headingLevel}` as const;
  const fullAddress = `${address}, Singapore ${postalCode}`;

  return (
    <article className={cx(styles.card, styles[variant])}>
      {variant === "list" || image ? (
        <MediaPlaceholder ratio="3 / 2" tone="subtle">
          {image}
        </MediaPlaceholder>
      ) : null}
      <div className={styles.body}>
        <Heading className={styles.name}>{name}</Heading>
        <OpenStatus hours={hours} />
        <address className={styles.address}>
          <Icon name="pin" size={18} />
          <span>{fullAddress}</span>
        </address>
        {mrt ? (
          <p className={styles.mrt}>
            <Icon name="train" size={16} />
            {mrt}
          </p>
        ) : null}
        {variant === "list" || image ? (
          <dl className={styles.hours}>
            {summariseHours(hours).map((row) => (
              <div key={row.days}>
                <dt>{row.days}</dt>
                <dd>{row.time}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div className={styles.actions}>
          <ButtonLink href={bookHref} fullWidth className={styles.book}>
            Book at this outlet
          </ButtonLink>
          <ButtonLink
            href={directionsHref(`${name}, ${fullAddress}`)}
            variant="secondary"
            size="sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Directions
          </ButtonLink>
          <ButtonLink href={telHref(phone)} variant="secondary" size="sm" icon="phone">
            Call
          </ButtonLink>
          {whatsapp ? (
            <ButtonLink
              href={whatsappHref(whatsapp, whatsappText)}
              variant="whatsapp"
              size="sm"
              icon="chat"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </article>
  );
}
