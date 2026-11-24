import type { Brand, Outlet, Service } from "@/content";
import { isIsoDate, isTime } from "./availability";
import {
  first,
  parseSelection,
  quote,
  type Quote,
  type SearchParams,
  type Selection,
} from "./flow";
import type { CalendarEvent } from "./ics";
import { REF_PATTERN } from "./session";

export type Confirmation = {
  ref: string;
  selection: Selection & { date: string; time: string };
  outlet: Outlet;
  service: Service;
  quote: Quote;
  event: CalendarEvent;
};

/**
 * Rebuilds a confirmed booking from the success URL (no persistence: the URL is
 * the record). Returns undefined when anything is missing or not in the content.
 */
export function readConfirmation(brand: Brand, params: SearchParams): Confirmation | undefined {
  const ref = first(params.ref);
  if (!ref || !REF_PATTERN.test(ref)) return undefined;
  const selection = parseSelection(brand, params);
  const outlet = brand.outlets.find((o) => o.slug === selection.outlet);
  const service = brand.services.find((s) => s.slug === selection.service);
  const { date, time } = selection;
  if (!outlet || !service || !date || !time || !isIsoDate(date) || !isTime(time)) return undefined;

  const q = quote(brand, service, selection.offer);
  return {
    ref,
    selection: { ...selection, date, time },
    outlet,
    service,
    quote: q,
    event: {
      uid: `${ref}@orrin-collective.demo`,
      title: `${service.title} at ${brand.shortName} ${outlet.area} (demo)`,
      description: `Booking ref ${ref}. Demo booking: no real appointment is made. Questions? WhatsApp ${outlet.whatsapp}.`,
      location: `${brand.name}, ${outlet.address}, Singapore ${outlet.postalCode}`,
      date,
      time,
      durationMin: service.durationMin,
    },
  };
}
