import { Icon } from "../../icons/Icon";
import { cx } from "../../lib/cx";
import { formatPrice } from "../../lib/format";
import { MediaPlaceholder, type MediaTone } from "../MediaPlaceholder/MediaPlaceholder";
import styles from "./ServiceCard.module.css";

export type ServiceCardProps = {
  title: string;
  /** Two lines at most; longer text is clamped. */
  description: string;
  durationMin: number;
  /** Starting price in S$. 0 shows "Free". */
  priceFrom: number;
  /** Whether the price varies (adds "from"). Default true. */
  priceVaries?: boolean;
  href: string;
  /**
   * `responsive` (default): horizontal list card below 768px, vertical grid card above.
   * `featured`: accent background with a badge.
   */
  variant?: "responsive" | "vertical" | "horizontal" | "featured";
  badge?: string;
  /** Optional second action, e.g. straight to booking. */
  bookHref?: string;
  headingLevel?: 2 | 3 | 4;
  mediaTone?: MediaTone;
};

export function ServiceCard({
  title,
  description,
  durationMin,
  priceFrom,
  priceVaries = true,
  href,
  variant = "responsive",
  badge,
  bookHref,
  headingLevel = 3,
  mediaTone = "subtle",
}: ServiceCardProps) {
  const Heading = `h${headingLevel}` as const;
  const price = priceFrom === 0 ? "Free" : formatPrice(priceFrom, { from: priceVaries });

  return (
    <article className={cx(styles.card, styles[variant])}>
      <div className={styles.media}>
        <MediaPlaceholder
          tone={variant === "featured" ? "decor" : mediaTone}
          className={styles.image}
        />
      </div>
      <div className={styles.body}>
        {badge ? <span className={styles.badge}>{badge}</span> : null}
        <Heading className={styles.title}>
          <a className={styles.link} href={href}>
            {title}
          </a>
        </Heading>
        <p className={styles.description}>{description}</p>
        <div className={styles.meta}>
          <span className={styles.chip}>
            <Icon name="clock" size={14} />
            {durationMin} min
          </span>
          <span className={styles.price}>{price}</span>
        </div>
        <span className={styles.more} aria-hidden="true">
          View details
          <Icon name="arrowRight" size={16} />
        </span>
      </div>
      {bookHref ? (
        <a className={styles.book} href={bookHref}>
          <Icon name="plus" size={18} />
          <span className={styles.visuallyHidden}>Book {title}</span>
        </a>
      ) : null}
    </article>
  );
}
