import type { SVGProps } from "react";

/**
 * Small inline icon set (24px grid, 1.5px stroke, currentColor), drawn for this
 * project. Decorative by default: pass `label` to expose an accessible name.
 */
const PATHS = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  phone: (
    <path d="M6.6 3.5h2.6l1.4 4-2 1.3a12 12 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a1.8 1.8 0 0 1-1.9 1.8A16.5 16.5 0 0 1 4.8 5.4 1.8 1.8 0 0 1 6.6 3.5z" />
  ),
  chat: (
    <>
      <path d="M12 3.8a8.2 8.2 0 0 0-7.1 12.3L3.8 20.2l4.2-1.1A8.2 8.2 0 1 0 12 3.8z" />
      <path d="M8.8 10.5h6.4M8.8 13.5h4" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  train: (
    <>
      <rect x="6" y="3.5" width="12" height="13" rx="3" />
      <path d="M6 11h12M9 20l-1.5-3.5M15 20l1.5-3.5M9.5 14h.01M14.5 14h.01" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  star: (
    <path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.6z" />
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </>
  ),
  camera: (
    <>
      <rect x="3.5" y="6.5" width="17" height="13" rx="3" />
      <circle cx="12" cy="13" r="3.5" />
      <path d="M8.5 6.5l1.5-2h4l1.5 2" />
    </>
  ),
  play: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="3.5" />
      <path d="M10.5 9.5v5l4-2.5-4-2.5z" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  /** Pixel size of the square icon. Default 20. */
  size?: number;
  /** Accessible name. Omit for decorative icons next to visible text. */
  label?: string;
  /** Fill the shape (used for rating stars). */
  filled?: boolean;
};

export function Icon({ name, size = 20, label, filled = false, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
