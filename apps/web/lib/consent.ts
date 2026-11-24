/**
 * Google Consent Mode v2. Every storage type defaults to "denied" before any tag
 * loads; the cookie banner records the visitor's choice and sends
 * `gtag('consent', 'update', …)`. The choice is remembered for a year in
 * localStorage (no cookie is set until the visitor opts in to something).
 */
import { pushDataLayer } from "./analytics.ts";

export const CONSENT_STORAGE_KEY = "orn_consent";
/** Bump to ask everyone again (for example when a new purpose is added). */
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

/** What the visitor chose. Strictly necessary storage needs no consent. */
export type ConsentChoice = { analytics: boolean; marketing: boolean };
export type StoredConsent = ConsentChoice & { v: number; ts: number };

type ConsentValue = "granted" | "denied";
export type GtagConsent = {
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
  analytics_storage: ConsentValue;
};

export const CONSENT_DEFAULTS: GtagConsent = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};

export const ACCEPT_ALL: ConsentChoice = { analytics: true, marketing: true };
export const REJECT_ALL: ConsentChoice = { analytics: false, marketing: false };

const value = (on: boolean): ConsentValue => (on ? "granted" : "denied");

/** Map a choice onto the four Consent Mode v2 signals. */
export function toGtagConsent(choice: ConsentChoice): GtagConsent {
  return {
    ad_storage: value(choice.marketing),
    ad_user_data: value(choice.marketing),
    ad_personalization: value(choice.marketing),
    analytics_storage: value(choice.analytics),
  };
}

/** A stored choice, or null when missing, malformed, from an older version or expired. */
export function parseStoredConsent(raw: string | null, now = Date.now()): ConsentChoice | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<StoredConsent>;
    if (data.v !== CONSENT_VERSION || typeof data.ts !== "number") return null;
    if (now - data.ts > CONSENT_MAX_AGE_MS || data.ts > now) return null;
    if (typeof data.analytics !== "boolean" || typeof data.marketing !== "boolean") return null;
    return { analytics: data.analytics, marketing: data.marketing };
  } catch {
    return null;
  }
}

export function readConsent(): ConsentChoice | null {
  try {
    return parseStoredConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** gtag() as GTM expects it: the `arguments` object, not an array. */
export function gtag(..._args: unknown[]): void {
  // eslint-disable-next-line prefer-rest-params
  pushDataLayer(arguments);
}

/** Save, apply and announce a choice. */
export function applyConsent(choice: ConsentChoice): void {
  const stored: StoredConsent = { ...choice, v: CONSENT_VERSION, ts: Date.now() };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
  const signals = toGtagConsent(choice);
  gtag("consent", "update", signals);
  // A custom event so GTM triggers can re-evaluate tags after the update.
  pushDataLayer({ event: "consent_update", ...signals });
  document.documentElement.dataset.consent = "set";
}

/**
 * Inline script for <head>, run before GTM and before the banner paints:
 * 1. sets the Consent Mode v2 defaults (all denied),
 * 2. re-applies a remembered choice, so returning visitors' tags fire on load,
 * 3. sets `<html data-consent="unset|set">`, which shows or hides the banner in CSS
 *    with no flash and no layout shift.
 * Built from the same constants as the module above; tested in test/consent.test.ts.
 */
export function consentBootstrapScript(): string {
  const defaults = JSON.stringify({ ...CONSENT_DEFAULTS, wait_for_update: 500 });
  return [
    "(function(){",
    "var w=window,d=document;w.dataLayer=w.dataLayer||[];",
    "function gtag(){w.dataLayer.push(arguments)}",
    `gtag('consent','default',${defaults});`,
    "gtag('set','ads_data_redaction',true);",
    "var state='unset';",
    "try{",
    `var c=JSON.parse(w.localStorage.getItem(${JSON.stringify(CONSENT_STORAGE_KEY)})||'null'),n=Date.now();`,
    `if(c&&c.v===${CONSENT_VERSION}&&typeof c.ts==='number'&&c.ts<=n&&n-c.ts<=${CONSENT_MAX_AGE_MS}`,
    "&&typeof c.analytics==='boolean'&&typeof c.marketing==='boolean'){",
    "state='set';var m=c.marketing?'granted':'denied';",
    "gtag('consent','update',{ad_storage:m,ad_user_data:m,ad_personalization:m,",
    "analytics_storage:c.analytics?'granted':'denied'});",
    "}}catch(e){}",
    "d.documentElement.setAttribute('data-consent',state);",
    "})();",
  ].join("");
}

/** GTM container ids look like GTM-XXXXXXX; anything else is ignored. */
export function validGtmId(id: string | undefined): string | null {
  const trimmed = id?.trim();
  return trimmed && /^GTM-[A-Z0-9]{4,12}$/.test(trimmed) ? trimmed : null;
}
