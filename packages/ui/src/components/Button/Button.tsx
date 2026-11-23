import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "../../icons/Icon";
import { cx } from "../../lib/cx";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "whatsapp" | "call";
export type ButtonSize = "sm" | "md" | "lg";

type SharedProps = {
  variant?: ButtonVariant;
  /** sm 44px, md 48px (token --button-height), lg 56px. Every size meets the 44px target. */
  size?: ButtonSize;
  /** Stretch to the container width (mobile drawer, sticky bar). */
  fullWidth?: boolean;
  /** Use on dark surfaces (bg-inverse): swaps to light fills and the inverse focus ring. */
  onInverse?: boolean;
  /** Leading icon. */
  icon?: IconName;
  /** Icon-only button: the children become a visually hidden label. */
  iconOnly?: boolean;
  children: ReactNode;
};

function classes({
  variant = "primary",
  size = "md",
  fullWidth,
  onInverse,
  iconOnly,
  className,
}: Omit<SharedProps, "children" | "icon"> & { className?: string }) {
  return cx(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    onInverse && styles.onInverse,
    iconOnly && styles.iconOnly,
    className,
  );
}

function Content({
  icon,
  iconOnly,
  loading,
  children,
}: Pick<SharedProps, "icon" | "iconOnly" | "children"> & { loading?: boolean }) {
  return (
    <>
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {icon && !loading ? <Icon name={icon} /> : null}
      <span className={iconOnly ? styles.visuallyHidden : styles.label}>{children}</span>
    </>
  );
}

export type ButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    /** Shows a spinner, sets aria-busy and blocks clicks while an action runs. */
    loading?: boolean;
  };

export function Button({
  variant,
  size,
  fullWidth,
  onInverse,
  icon,
  iconOnly,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classes({ variant, size, fullWidth, onInverse, iconOnly, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading || undefined}
      {...rest}
    >
      <Content icon={icon} iconOnly={iconOnly} loading={loading}>
        {children}
      </Content>
    </button>
  );
}

export type ButtonLinkProps = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
  };

/** A link styled as a button, for navigation (Book now, View services, WhatsApp). */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  onInverse,
  icon,
  iconOnly,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a className={classes({ variant, size, fullWidth, onInverse, iconOnly, className })} {...rest}>
      <Content icon={icon} iconOnly={iconOnly}>
        {children}
      </Content>
    </a>
  );
}
