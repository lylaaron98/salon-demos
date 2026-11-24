"use client";

import { Button } from "@salon-demos/ui";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  ACCEPT_ALL,
  REJECT_ALL,
  applyConsent,
  readConsent,
  type ConsentChoice,
} from "@/lib/consent";
import styles from "./consent.module.css";

/** Links with this hash reopen the banner (the footers carry one). */
export const COOKIE_SETTINGS_HASH = "#cookie-settings";

type View = "summary" | "customise";

/**
 * Cookie consent banner (Consent Mode v2).
 *
 * - Server-rendered and shown by CSS while `<html data-consent="unset">`, which the
 *   inline consent script sets before first paint: no flash for returning visitors
 *   and no late insertion. It is `position: fixed`, so it never shifts the layout.
 * - Accept all, Reject all and Customise carry equal weight.
 * - Non-modal: it sits first in the DOM so keyboard users reach it first, but it
 *   does not trap or steal focus on load. Opening Customise moves focus to its
 *   heading; closing returns focus to whatever opened it, or to the main content.
 * - Reopened by any link to #cookie-settings.
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("summary");
  const [draft, setDraft] = useState<ConsentChoice>(REJECT_ALL);
  const rootRef = useRef<HTMLElement>(null);
  const panelHeadingRef = useRef<HTMLParagraphElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const reopen = useCallback(() => {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDraft(readConsent() ?? REJECT_ALL);
    setView("customise");
    setOpen(true);
  }, []);

  // Reopen from any #cookie-settings link.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (link?.getAttribute("href") !== COOKIE_SETTINGS_HASH) return;
      event.preventDefault();
      reopen();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [reopen]);

  // Customise: move focus to the panel heading so screen readers announce it.
  useEffect(() => {
    if (view === "customise" && (open || isUnset())) panelHeadingRef.current?.focus();
  }, [view, open]);

  const close = (choice: ConsentChoice) => {
    const hadFocus = rootRef.current?.contains(document.activeElement) ?? false;
    applyConsent(choice);
    setOpen(false);
    setView("summary");
    if (!hadFocus) return;
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target?.isConnected && !rootRef.current?.contains(target)) {
      target.focus();
    } else {
      focusMain();
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Escape") return;
    if (view === "customise" && isUnset()) {
      setView("summary");
      return;
    }
    // Reopened from settings: Escape keeps the saved choice.
    const saved = readConsent();
    if (open && saved) close(saved);
  };

  return (
    <section
      ref={rootRef}
      className={styles.banner}
      data-open={open || undefined}
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
    >
      <div className={styles.inner}>
        <div className={styles.text}>
          {/* Not a heading: the banner precedes each page's h1 in the DOM. */}
          <p id={titleId} className={styles.title}>
            Cookies on this demo
          </p>
          <p className={styles.body}>
            We&apos;d like to use analytics cookies to see which pages help people book, and
            marketing cookies to measure campaigns. Nothing is set unless you allow it.
          </p>
        </div>

        {view === "customise" ? (
          <div className={styles.panel}>
            <p ref={panelHeadingRef} tabIndex={-1} className={styles.panelTitle}>
              Choose which cookies to allow
            </p>
            <fieldset className={styles.options}>
              <legend className={styles.vh}>Cookie categories</legend>
              <label className={styles.option}>
                <input type="checkbox" checked disabled />
                <span>
                  <strong>Strictly necessary</strong>
                  <span className={styles.hint}>Remembers this choice. Always on.</span>
                </span>
              </label>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  checked={draft.analytics}
                  onChange={(e) => setDraft((d) => ({ ...d, analytics: e.target.checked }))}
                />
                <span>
                  <strong>Analytics</strong>
                  <span className={styles.hint}>Google Analytics, no personal details.</span>
                </span>
              </label>
              <label className={styles.option}>
                <input
                  type="checkbox"
                  checked={draft.marketing}
                  onChange={(e) => setDraft((d) => ({ ...d, marketing: e.target.checked }))}
                />
                <span>
                  <strong>Marketing</strong>
                  <span className={styles.hint}>Ad measurement and personalisation.</span>
                </span>
              </label>
            </fieldset>
          </div>
        ) : null}

        <div className={styles.actions}>
          {view === "customise" ? (
            <Button size="sm" onClick={() => close(draft)}>
              Save choices
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDraft(readConsent() ?? REJECT_ALL);
                setView("customise");
              }}
            >
              Customise
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => close(REJECT_ALL)}>
            Reject all
          </Button>
          <Button size="sm" onClick={() => close(ACCEPT_ALL)}>
            Accept all
          </Button>
        </div>
      </div>
    </section>
  );
}

function isUnset(): boolean {
  return document.documentElement.dataset.consent !== "set";
}

function focusMain() {
  const main = document.getElementById("main") ?? document.querySelector("main");
  if (!main) return;
  if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
  main.focus({ preventScroll: true });
}
