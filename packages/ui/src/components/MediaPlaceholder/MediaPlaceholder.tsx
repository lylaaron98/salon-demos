import type { CSSProperties } from "react";
import { cx } from "../../lib/cx";
import styles from "./MediaPlaceholder.module.css";

export type MediaTone = "accent" | "subtle" | "inverse" | "decor";

export type MediaPlaceholderProps = {
  /**
   * CSS aspect ratio, e.g. "4 / 3". Reserves space so there is no layout shift.
   * Omit to let a parent class set `--_ratio` (for art-directed ratios per breakpoint).
   */
  ratio?: string;
  tone?: MediaTone;
  /** Accessible description. Omit for decorative media (the default). */
  label?: string;
  className?: string;
};

/**
 * Stand-in for photography until licensed images are added: a token-coloured
 * gradient at the slot's real aspect ratio. Decorative unless `label` is given.
 */
export function MediaPlaceholder({
  ratio,
  tone = "subtle",
  label,
  className,
}: MediaPlaceholderProps) {
  const style = ratio ? ({ "--_ratio": ratio } as CSSProperties) : undefined;
  return label ? (
    <div
      className={cx(styles.media, styles[tone], className)}
      style={style}
      role="img"
      aria-label={label}
    />
  ) : (
    <div className={cx(styles.media, styles[tone], className)} style={style} aria-hidden="true" />
  );
}
