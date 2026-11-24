/**
 * Typed dataLayer helper: the one way the app talks to GTM. Event names and
 * parameters follow the design brief §6.7 so the three builds (Next.js, Elementor,
 * Divi) report into one GA4 funnel:
 * booking_start -> select_outlet -> select_service -> select_slot ->
 * details_submit -> booking_complete.
 *
 * The full taxonomy is in the README ("Analytics and consent"). Consent Mode
 * commands (`gtag('consent', ...)`) go through `lib/consent.ts`, which pushes to the
 * same dataLayer.
 *
 * PII rule: never push a name, phone number or email. Only ids, counts, booleans
 * and a hashed booking reference go in.
 */

export type AnalyticsEvent =
  | "contact_click"
  | "booking_start"
  | "booking_step_view"
  | "select_outlet"
  | "select_service"
  | "select_slot"
  | "no_slots_shown"
  | "details_submit"
  | "form_error"
  | "booking_confirm"
  | "booking_complete"
  | "booking_abandon";

export type PageType = "group_home" | "brand_home" | "booking" | "booking_confirmation" | "utility";

/** Common parameters on every event (brief §6.7). */
export type AnalyticsContext = {
  /** sable | dewlab | rootwell, or "orrin" on group pages. */
  brand: string;
  page_type: PageType;
  /** Defaults to "booking" on booking pages and null elsewhere. */
  flow?: "booking" | "enquiry" | null;
  outlet_id?: string;
  service_id?: string;
  campaign_id?: string;
};

/** Where a contact link sits (`contact_click.location`). */
export type ContactLocation =
  | "header"
  | "footer"
  | "sticky"
  | "outlet_card"
  | "cta_band"
  | "page"
  | "booking_header"
  | "booking_empty"
  | "booking_error"
  | "success";

type Primitive = string | number | boolean | null;

declare global {
  interface Window {
    // Entries are event objects or gtag `arguments` objects.
    dataLayer?: unknown[];
  }
}

/** Low-level push, shared by `track()` and the consent helpers. */
export function pushDataLayer(entry: unknown): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(entry);
}

/** The full dataLayer object for an event (exported for tests). */
export function buildEvent(
  event: AnalyticsEvent,
  context: AnalyticsContext,
  params: Record<string, Primitive> = {},
): Record<string, Primitive> {
  const flow =
    context.flow !== undefined
      ? context.flow
      : context.page_type.startsWith("booking")
        ? "booking"
        : null;
  return {
    event,
    brand: context.brand,
    site_platform: "nextjs",
    page_type: context.page_type,
    outlet_id: context.outlet_id ?? null,
    service_id: context.service_id ?? null,
    campaign_id: context.campaign_id ?? null,
    flow,
    ...params,
  };
}

export function track(
  event: AnalyticsEvent,
  context: AnalyticsContext,
  params: Record<string, Primitive> = {},
): void {
  pushDataLayer(buildEvent(event, context, params));
}

/** "call" for tel: links, "whatsapp" for wa.me / api.whatsapp.com links, else null. */
export function contactMethod(href: string): "call" | "whatsapp" | null {
  if (/^tel:/i.test(href)) return "call";
  try {
    const url = new URL(href);
    if (url.hostname === "wa.me" || /(^|\.)whatsapp\.com$/.test(url.hostname)) return "whatsapp";
  } catch {
    // Relative or malformed: not a contact link.
  }
  return null;
}

/** Page type and brand from a pathname ("/dewlab/book" -> booking, dewlab). */
export function pageContext(
  pathname: string,
  brandIds: readonly string[],
): Pick<AnalyticsContext, "brand" | "page_type"> {
  const [first, second, third] = pathname.split("/").filter(Boolean);
  if (!first) return { brand: "orrin", page_type: "group_home" };
  if (!brandIds.includes(first)) return { brand: "orrin", page_type: "utility" };
  if (!second) return { brand: first, page_type: "brand_home" };
  if (second === "book")
    return { brand: first, page_type: third === "confirmed" ? "booking_confirmation" : "booking" };
  return { brand: first, page_type: "utility" };
}

/** SHA-256 of the booking reference, first 16 hex characters (brief: `booking_ref` hashed). */
export async function hashRef(ref: string): Promise<string> {
  const data = new TextEncoder().encode(ref);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

/** sessionStorage that never throws (private mode, blocked storage). */
export const safeSession = {
  get(key: string): string | null {
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Storage unavailable: dedupe falls back to once per page view.
    }
  },
  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
