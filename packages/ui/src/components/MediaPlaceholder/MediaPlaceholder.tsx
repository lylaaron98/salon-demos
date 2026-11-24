import type { CSSProperties, ReactNode } from "react";
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
  /**
   * The real image, e.g. a `next/image` with `fill`. It covers the frame, and the
   * gradient stays underneath as the loading state. Without it this is a placeholder.
   */
  children?: ReactNode;
};

/**
 * Fixed-ratio media frame. Reserves the slot's space (no layout shift) and shows a
 * token-coloured gradient, either as a placeholder or as the loading state behind
 * an image passed as `children`. Decorative unless `label` is given.
 */
export function MediaPlaceholder({
  ratio,
  tone = "subtle",
  label,
  className,
  children,
}: MediaPlaceholderProps) {
  const style = ratio ? ({ "--_ratio": ratio } as CSSProperties) : undefined;
  const classes = cx(styles.media, styles[tone], children ? styles.filled : undefined, className);
  if (children) {
    // The image carries its own alt text (empty when decorative).
    return (
      <div className={classes} style={style}>
        {children}
      </div>
    );
  }
  return label ? (
    <div className={classes} style={style} role="img" aria-label={label} />
  ) : (
    <div className={classes} style={style} aria-hidden="true" />
  );
}
