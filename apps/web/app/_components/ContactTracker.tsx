"use client";

import { brandIds } from "@salon-demos/tokens";
import { useEffect } from "react";
import {
  contactMethod,
  pageContext,
  track,
  type AnalyticsContext,
  type ContactLocation,
} from "@/lib/analytics";

/**
 * `contact_click` for every tel: and WhatsApp link on the site, including the ones
 * inside shared UI components (header, footer, outlet cards, sticky bar), with one
 * delegated listener instead of an onClick on each link.
 *
 * - location: the nearest `data-contact-location`, else header / footer, else "page"
 * - outlet_id: the nearest `data-outlet-id`
 * - links marked `data-analytics="manual"` track themselves (booking ContactLinks)
 */
export function ContactTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.dataset.analytics === "manual") return;
      const method = contactMethod(link.href);
      if (!method) return;

      const page = pageContext(window.location.pathname, brandIds);
      const scopedBrand = link.closest<HTMLElement>("[data-brand]")?.dataset.brand;
      const context: AnalyticsContext = {
        ...page,
        brand: scopedBrand && scopedBrand !== "orrin" ? scopedBrand : page.brand,
        outlet_id: link.closest<HTMLElement>("[data-outlet-id]")?.dataset.outletId,
      };
      track("contact_click", context, { method, location: locationOf(link) });
    };
    // Capture phase: runs even if a component stops propagation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

function locationOf(link: Element): ContactLocation {
  const tagged = link.closest<HTMLElement>("[data-contact-location]")?.dataset.contactLocation;
  if (tagged) return tagged as ContactLocation;
  if (link.closest("header")) return "header";
  if (link.closest("footer")) return "footer";
  return "page";
}
