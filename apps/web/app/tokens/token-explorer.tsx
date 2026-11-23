"use client";

import { cssVars, themeIds, themeNames, themes, type ThemeId } from "@salon-demos/tokens";
import { contrastRatio } from "@salon-demos/tokens/contrast";
import { useState } from "react";
import styles from "./tokens.module.css";

const COLOR_GROUPS = [
  { label: "Backgrounds", prefix: "--color-bg-" },
  { label: "Text", prefix: "--color-text-" },
  { label: "Action", prefix: "--color-action-" },
  { label: "Borders and focus", prefix: ["--color-border-", "--color-focus-"] },
  {
    label: "Decor and status",
    prefix: ["--color-decor-", "--color-error", "--color-success", "--color-warning"],
  },
  { label: "Contact buttons", prefix: ["--color-whatsapp-", "--color-call-"] },
] as const;

const TYPE_SCALE = ["5xl", "4xl", "3xl", "2xl", "xl", "lg", "md", "sm", "xs"] as const;
const RADII = ["button", "card", "input", "chip"] as const;
const SHADOWS = ["sm", "md", "lg"] as const;
const SPACE = ["1", "2", "3", "4", "6", "8", "12", "16", "24"] as const;

type Colors = (typeof themes)[ThemeId]["color"];
const PAIRS: { label: string; fg: (c: Colors) => string; bg: (c: Colors) => string }[] = [
  { label: "Body on page", fg: (c) => c.text.primary, bg: (c) => c.bg.page },
  { label: "Muted on page", fg: (c) => c.text.muted, bg: (c) => c.bg.page },
  { label: "Accent on page", fg: (c) => c.text.accent, bg: (c) => c.bg.page },
  { label: "Primary button", fg: (c) => c.action.text, bg: (c) => c.action.bg },
  { label: "Button hover", fg: (c) => c.action.text, bg: (c) => c.action["bg-hover"] },
  { label: "Outline button", fg: (c) => c.action["secondary-text"], bg: (c) => c.bg.page },
  { label: "On accent", fg: (c) => c.text["on-accent"], bg: (c) => c.bg.accent },
  { label: "Inverse", fg: (c) => c.text.inverse, bg: (c) => c.bg.inverse },
];

function colorVars(theme: ThemeId, prefix: string | readonly string[]) {
  const prefixes = typeof prefix === "string" ? [prefix] : prefix;
  return Object.entries(cssVars[theme]).filter(([name]) =>
    prefixes.some((p) => name.startsWith(p)),
  );
}

export function TokenExplorer() {
  const [theme, setTheme] = useState<ThemeId>("sable");
  const colors = themes[theme].color;

  return (
    <>
      <div className={styles.switcher} role="group" aria-label="Theme">
        {themeIds.map((id) => (
          <button
            key={id}
            type="button"
            className={styles.switch}
            aria-pressed={theme === id}
            onClick={() => setTheme(id)}
          >
            {themeNames[id]}
          </button>
        ))}
      </div>

      <div className={styles.preview} data-brand={theme}>
        <p className={styles.visuallyHidden} role="status">
          Showing tokens for {themeNames[theme]}.
        </p>

        <section className={styles.section} aria-labelledby="sample-heading">
          <p className={styles.eyebrow}>Sample</p>
          <h2 id="sample-heading" className={styles.display}>
            {themeNames[theme]}
          </h2>
          <p className={styles.body}>
            Body copy in the brand&apos;s body font at <code>--font-size-md</code>. Headings use the
            display font, weight and tracking set by the brand tier.
          </p>
          <div className={styles.actions}>
            <a className={styles.buttonPrimary} href="#sample-heading">
              Book now
            </a>
            <a className={styles.buttonSecondary} href="#sample-heading">
              View services
            </a>
            <span className={styles.chip}>First trial</span>
          </div>
          <label className={styles.field}>
            <span className={styles.label}>Mobile number</span>
            <input className={styles.input} type="tel" inputMode="tel" placeholder="8123 4567" />
          </label>
        </section>

        <section className={styles.section} aria-labelledby="colour-heading">
          <h2 id="colour-heading" className={styles.sectionTitle}>
            Colour
          </h2>
          {COLOR_GROUPS.map((group) => (
            <div key={group.label} className={styles.colorGroup}>
              <h3 className={styles.groupTitle}>{group.label}</h3>
              <ul className={styles.swatches}>
                {colorVars(theme, group.prefix).map(([name, value]) => (
                  <li key={name} className={styles.swatch}>
                    <span className={styles.chipColor} style={{ background: `var(${name})` }} />
                    <code className={styles.varName}>{name}</code>
                    <span className={styles.varValue}>{String(value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className={styles.section} aria-labelledby="contrast-heading">
          <h2 id="contrast-heading" className={styles.sectionTitle}>
            Contrast (WCAG AA 4.5:1)
          </h2>
          <ul className={styles.pairs}>
            {PAIRS.map(({ label, fg, bg }) => {
              const ratio = contrastRatio(fg(colors), bg(colors));
              return (
                <li key={label} className={styles.pair}>
                  <span
                    className={styles.pairSample}
                    style={{ color: fg(colors), background: bg(colors) }}
                  >
                    Aa
                  </span>
                  <span className={styles.pairLabel}>{label}</span>
                  <span className={styles.pairRatio}>
                    {ratio.toFixed(2)}:1 {ratio >= 4.5 ? "pass" : "fail"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="type-heading">
          <h2 id="type-heading" className={styles.sectionTitle}>
            Type scale
          </h2>
          <ul className={styles.typeScale}>
            {TYPE_SCALE.map((step) => (
              <li key={step} className={styles.typeRow}>
                <code className={styles.varName}>--font-size-{step}</code>
                <span
                  className={step.endsWith("xl") ? styles.typeDisplay : styles.typeBody}
                  style={{
                    fontSize: `var(--font-size-${step})`,
                    lineHeight: `var(--line-height-${step})`,
                  }}
                >
                  Cut with intent
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="shape-heading">
          <h2 id="shape-heading" className={styles.sectionTitle}>
            Radius, shadow and spacing
          </h2>
          <ul className={styles.shapes}>
            {RADII.map((r) => (
              <li key={r} className={styles.shape} style={{ borderRadius: `var(--radius-${r})` }}>
                <code>--radius-{r}</code>
              </li>
            ))}
            {SHADOWS.map((s) => (
              <li key={s} className={styles.shape} style={{ boxShadow: `var(--shadow-${s})` }}>
                <code>--shadow-{s}</code>
              </li>
            ))}
          </ul>
          <ul className={styles.spacing}>
            {SPACE.map((s) => (
              <li key={s} className={styles.spaceRow}>
                <code className={styles.varName}>--space-{s}</code>
                <span className={styles.spaceBar} style={{ width: `var(--space-${s})` }} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
