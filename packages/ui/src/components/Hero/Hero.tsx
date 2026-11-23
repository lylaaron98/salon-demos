import type { ReactNode } from "react";
import { Icon } from "../../icons/Icon";
import { cx } from "../../lib/cx";
import { ButtonLink } from "../Button/Button";
import { MediaPlaceholder, type MediaTone } from "../MediaPlaceholder/MediaPlaceholder";
import styles from "./Hero.module.css";

export type HeroProps = {
  /** `split`: copy left, image right (image on top at 4:3 on mobile). `full`: full-bleed image with scrim. */
  variant?: "split" | "full";
  eyebrow?: string;
  /** H1, 8 words or fewer. */
  title: string;
  /** Lead, 25 words or fewer. */
  lead?: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  /** Trust row, e.g. ["4.9 ★ from 1,200+ reviews (demo)", "No hard-selling"]. */
  trust?: string[];
  /** Image slot. Defaults to a token-coloured placeholder at the right ratio. */
  media?: ReactNode;
  mediaTone?: MediaTone;
  /** id on the primary CTA, so the sticky book bar can watch it. */
  ctaId?: string;
  className?: string;
};

export function Hero({
  variant = "split",
  eyebrow,
  title,
  lead,
  primaryCta,
  secondaryCta,
  trust = [],
  media,
  mediaTone = "inverse",
  ctaId = "hero-cta",
  className,
}: HeroProps) {
  const full = variant === "full";
  return (
    <section
      className={cx(styles.hero, styles[variant], className)}
      aria-labelledby={`${ctaId}-title`}
    >
      <div className={styles.media}>
        {media ?? <MediaPlaceholder tone={mediaTone} className={styles.placeholder} />}
      </div>
      <div className={styles.copy}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 id={`${ctaId}-title`} className={styles.title}>
          {title}
        </h1>
        {lead ? <p className={styles.lead}>{lead}</p> : null}
        <div className={styles.actions}>
          <ButtonLink id={ctaId} href={primaryCta.href} size="lg" onInverse={full}>
            {primaryCta.label}
          </ButtonLink>
          {secondaryCta ? (
            <ButtonLink href={secondaryCta.href} variant="secondary" size="lg" onInverse={full}>
              {secondaryCta.label}
            </ButtonLink>
          ) : null}
        </div>
        {trust.length > 0 ? (
          <ul className={styles.trust}>
            {trust.map((item) => (
              <li key={item} className={styles.trustItem}>
                <Icon name="check" size={16} />
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
