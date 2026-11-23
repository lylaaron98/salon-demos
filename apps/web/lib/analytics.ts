/**
 * Typed dataLayer helper. Event names and parameters follow the design brief §6.7
 * so the three builds (Next.js, Elementor, Divi) report into one GA4 funnel:
 * booking_start -> select_outlet -> select_service -> select_slot ->
 * details_submit -> booking_complete.
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

/** Common parameters on every event (brief §6.7). */
export type AnalyticsContext = {
  brand: string;
  page_type: "booking" | "booking_confirmation";
  outlet_id?: string;
  service_id?: string;
  campaign_id?: string;
};

type Primitive = string | number | boolean | null;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(
  event: AnalyticsEvent,
  context: AnalyticsContext,
  params: Record<string, Primitive> = {},
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event,
    brand: context.brand,
    site_platform: "nextjs",
    page_type: context.page_type,
    outlet_id: context.outlet_id ?? null,
    service_id: context.service_id ?? null,
    campaign_id: context.campaign_id ?? null,
    flow: "booking",
    ...params,
  });
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
