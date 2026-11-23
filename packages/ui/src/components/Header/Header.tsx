"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "../../icons/Icon";
import { cx } from "../../lib/cx";
import { telHref, whatsappHref } from "../../lib/format";
import { getFocusable, trapIndex } from "../../lib/keyboard";
import { ButtonLink } from "../Button/Button";
import styles from "./Header.module.css";

export type HeaderLink = {
  label: string;
  href: string;
  /** Marks the link with aria-current="page". */
  current?: boolean;
};

export type HeaderProps = {
  /** Brand wordmark text, e.g. "Sable & Shear". */
  brandName: string;
  homeHref: string;
  nav: HeaderLink[];
  cta: { label: string; href: string };
  /** Display phone number, e.g. "+65 6100 0000". */
  phone: string;
  /** WhatsApp number (display format). Shown in the mobile drawer. */
  whatsapp?: string;
  /** Group switcher in the utility bar and drawer. */
  group: { name: string; href: string };
  brands: HeaderLink[];
  findOutletHref?: string;
  /** Target of the "Skip to content" link. */
  skipTo?: string;
};

const DESKTOP_QUERY = "(min-width: 1024px)";

export function Header({
  brandName,
  homeHref,
  nav,
  cta,
  phone,
  whatsapp,
  group,
  brands,
  findOutletHref,
  skipTo = "#main",
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerId = useId();
  const titleId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  const close = useCallback(() => setOpen(false), []);

  // Solid header with a shadow once the page scrolls past 24px.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The drawer only exists below 1024px: close it if the viewport grows.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Open: focus the close button, trap Tab, close on Esc, lock page scroll.
  // Close: return focus to the menu button.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) menuButtonRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    closeRef.current?.focus();

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = getFocusable(panelRef.current);
      const active = focusable.indexOf(document.activeElement as HTMLElement);
      const next = trapIndex(event.shiftKey, active, focusable.length);
      if (next !== null) {
        event.preventDefault();
        focusable[next]?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <a className={styles.skip} href={skipTo}>
        Skip to content
      </a>

      <header className={styles.header} data-scrolled={scrolled || undefined}>
        <div className={styles.utility}>
          <div className={styles.utilityInner}>
            <nav aria-label="Orrin Collective studios" className={styles.switcher}>
              <a className={styles.utilityLink} href={group.href}>
                {group.name}
              </a>
              <span aria-hidden="true" className={styles.sep}>
                ·
              </span>
              <ul className={styles.switcherList}>
                {brands.map((brand) => (
                  <li key={brand.href}>
                    <a
                      className={styles.utilityLink}
                      href={brand.href}
                      aria-current={brand.current ? "page" : undefined}
                    >
                      {brand.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={styles.utilityEnd}>
              {findOutletHref ? (
                <a className={styles.utilityLink} href={findOutletHref}>
                  <Icon name="pin" size={16} />
                  Find an outlet
                </a>
              ) : null}
              <a className={styles.utilityLink} href={telHref(phone)}>
                <Icon name="phone" size={16} />
                {phone}
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bar}>
          <button
            ref={menuButtonRef}
            type="button"
            className={cx(styles.iconButton, styles.menuButton)}
            aria-expanded={open}
            aria-controls={drawerId}
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" size={24} />
            <span className={styles.visuallyHidden}>Menu</span>
          </button>

          <a className={styles.logo} href={homeHref}>
            {brandName}
            <span className={styles.logoDot} aria-hidden="true" />
          </a>

          <nav aria-label="Main" className={styles.nav}>
            <ul className={styles.navList}>
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    className={styles.navLink}
                    href={item.href}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <ButtonLink className={styles.cta} href={cta.href}>
            {cta.label}
          </ButtonLink>

          <a className={cx(styles.iconButton, styles.phoneButton)} href={telHref(phone)}>
            <Icon name="phone" size={22} />
            <span className={styles.visuallyHidden}>Call {phone}</span>
          </a>
        </div>
      </header>

      <div className={styles.drawerRoot} data-open={open || undefined}>
        {/* Pointer-only dismiss: keyboard users close with Esc or the close button. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className={styles.scrim} onClick={close} />
        <div
          ref={panelRef}
          id={drawerId}
          className={styles.drawer}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div className={styles.drawerHead}>
            <p id={titleId} className={styles.drawerTitle}>
              {brandName} menu
            </p>
            <button ref={closeRef} type="button" className={styles.iconButton} onClick={close}>
              <Icon name="close" size={24} />
              <span className={styles.visuallyHidden}>Close menu</span>
            </button>
          </div>

          <nav aria-label="Main (menu)">
            <ul className={styles.drawerNav}>
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    className={styles.drawerLink}
                    href={item.href}
                    aria-current={item.current ? "page" : undefined}
                    onClick={close}
                  >
                    {item.label}
                    <Icon name="chevronRight" size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.drawerActions}>
            <ButtonLink href={cta.href} fullWidth onClick={close}>
              {cta.label}
            </ButtonLink>
            {whatsapp ? (
              <ButtonLink
                href={whatsappHref(whatsapp)}
                variant="whatsapp"
                icon="chat"
                fullWidth
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp us
              </ButtonLink>
            ) : null}
            <ButtonLink href={telHref(phone)} variant="secondary" icon="phone" fullWidth>
              Call {phone}
            </ButtonLink>
          </div>

          <nav aria-label="Orrin Collective studios (menu)" className={styles.drawerBrands}>
            <p className={styles.drawerEyebrow}>
              <a href={group.href} className={styles.drawerGroupLink}>
                {group.name}
              </a>
            </p>
            <ul className={styles.drawerBrandList}>
              {brands.map((brand) => (
                <li key={brand.href}>
                  <a
                    className={styles.drawerBrandLink}
                    href={brand.href}
                    aria-current={brand.current ? "page" : undefined}
                  >
                    {brand.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
