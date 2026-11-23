import { Icon } from "../../icons/Icon";
import { cx } from "../../lib/cx";
import styles from "./Testimonial.module.css";

export type TestimonialProps = {
  /** 40 words or fewer. */
  quote: string;
  /** First name and last initial, e.g. "Mei L." */
  name: string;
  /** Service taken, e.g. "Balayage". */
  service?: string;
  /** 1 to 5. Omit to hide the stars. */
  rating?: number;
  /** `card` for grids, `quote` for a single large pull quote. */
  variant?: "card" | "quote";
};

/**
 * Customer quote shown as content only: no Review schema, since self-served
 * reviews are not eligible for rich results.
 */
export function Testimonial({ quote, name, service, rating, variant = "card" }: TestimonialProps) {
  const stars = rating ? Math.max(1, Math.min(5, Math.round(rating))) : 0;
  return (
    <figure className={cx(styles.testimonial, styles[variant])}>
      {stars ? (
        <span className={styles.stars} role="img" aria-label={`Rated ${stars} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Icon key={i} name="star" size={18} filled={i < stars} />
          ))}
        </span>
      ) : null}
      <blockquote className={styles.quote}>
        <p>{quote}</p>
      </blockquote>
      <figcaption className={styles.caption}>
        <span className={styles.avatar} aria-hidden="true">
          {name.charAt(0)}
        </span>
        <span>
          <span className={styles.name}>{name}</span>
          {service ? <span className={styles.service}>{service}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}
