"use client";

import { themeIds, themeNames, type ThemeId } from "@salon-demos/tokens";
import { useState, type ReactNode } from "react";
import styles from "./components.module.css";

/** Re-themes everything inside it by switching `data-brand` on one wrapper. */
export function BrandSwitcher({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>("sable");

  return (
    <>
      <div className={styles.switcher} role="group" aria-label="Brand theme">
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
      <p className={styles.visuallyHidden} role="status">
        Showing components in the {themeNames[theme]} theme.
      </p>
      <div className={styles.preview} data-brand={theme}>
        {children}
      </div>
    </>
  );
}
