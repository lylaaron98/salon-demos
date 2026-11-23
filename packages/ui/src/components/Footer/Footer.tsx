"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Icon, type IconName } from "../../icons/Icon";
import { telHref } from "../../lib/format";
import { Button } from "../Button/Button";
import styles from "./Footer.module.css";

export type FooterLink = { label: string; href: string };

export type FooterProps = {
  brandName: string;
  homeHref: string;
  blurb: string;
  social?: (FooterLink & { icon: IconName })[];
  services: FooterLink[];
  outlets: { name: string; phone: string }[];
  /** e.g. ["Mon–Fri 10 am–9 pm", "Sat–Sun 9 am–7 pm"]. */
  hours: string[];
  signupTitle?: string;
  group: FooterLink;
  sisterBrands: FooterLink[];
  legal: FooterLink[];
  /** Small print at the very bottom. */
  copyright: string;
  /** Used by the sticky book bar to hide while the footer is in view. */
  id?: string;
};

/** Footer column that is an accordion below 768px and a plain column above. */
function Column({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={styles.column}>
      <h2 className={styles.columnTitle}>{title}</h2>
      <button
        type="button"
        className={styles.columnToggle}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        <Icon name="chevronDown" size={20} className={styles.chevron} />
      </button>
      <div id={id} className={styles.columnBody} data-open={open || undefined}>
        {children}
      </div>
    </div>
  );
}

export function Footer({
  brandName,
  homeHref,
  blurb,
  social = [],
  services,
  outlets,
  hours,
  signupTitle = "Join for S$10 off",
  group,
  sisterBrands,
  legal,
  copyright,
  id = "site-footer",
}: FooterProps) {
  const [joined, setJoined] = useState(false);
  const emailId = useId();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (event.currentTarget.reportValidity()) setJoined(true);
  };

  return (
    <footer id={id} className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <a className={styles.logo} href={homeHref}>
              {brandName}
              <span className={styles.logoDot} aria-hidden="true" />
            </a>
            <p className={styles.blurb}>{blurb}</p>
            {social.length > 0 ? (
              <ul className={styles.social}>
                {social.map((item) => (
                  <li key={item.href}>
                    <a className={styles.socialLink} href={item.href}>
                      <Icon name={item.icon} size={20} />
                      <span className={styles.visuallyHidden}>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <Column title="Services">
            <ul className={styles.links}>
              {services.map((link) => (
                <li key={link.href}>
                  <a className={styles.link} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Column>

          {/* Outlets and contact stay open on mobile. */}
          <div className={styles.column}>
            <h2 className={styles.columnTitleAlways}>Outlets</h2>
            <ul className={styles.outlets}>
              {outlets.map((outlet) => (
                <li key={outlet.name}>
                  <span className={styles.outletName}>{outlet.name}</span>
                  <a className={styles.link} href={telHref(outlet.phone)}>
                    {outlet.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <Column title={signupTitle}>
            {joined ? (
              <p className={styles.joined} role="status">
                Thanks. This is a demo, so no email will be sent.
              </p>
            ) : (
              <form className={styles.signup} onSubmit={onSubmit}>
                <label htmlFor={emailId} className={styles.signupLabel}>
                  Email address
                </label>
                <div className={styles.signupRow}>
                  <input
                    id={emailId}
                    className={styles.input}
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                  />
                  <Button type="submit" onInverse>
                    Join
                  </Button>
                </div>
              </form>
            )}
            <p className={styles.hoursTitle}>Opening hours</p>
            <ul className={styles.hours}>
              {hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Column>
        </div>

        <div className={styles.bottom}>
          <nav aria-label="Sister studios" className={styles.group}>
            <span>
              An{" "}
              <a className={styles.link} href={group.href}>
                {group.label}
              </a>{" "}
              studio.
            </span>
            <ul className={styles.inlineLinks}>
              {sisterBrands.map((link) => (
                <li key={link.href}>
                  <a className={styles.link} href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ul className={styles.inlineLinks}>
            {legal.map((link) => (
              <li key={link.label}>
                <a className={styles.link} href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.copyright}>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
