import { formatPrice, formatTime12 } from "@salon-demos/ui/lib";
import type { BrandId } from "@salon-demos/tokens";
import type { Brand, Outlet, Service, TeamMember } from "@/content";
import { bookingDates, formatDateShort, getSlots, isIsoDate, isTime } from "./availability.ts";

/**
 * Booking flow state. Every step is its own URL (`?step=time`), and every choice
 * so far rides along in the search params, so the back button, refresh and
 * shared links all work. Personal details never go in the URL.
 */

export const STEPS = [
  { id: "outlet", label: "Outlet", title: "Choose an outlet" },
  { id: "service", label: "Service", title: "Choose a service" },
  { id: "time", label: "Date & time", title: "Pick a date and time" },
  { id: "details", label: "Your details", title: "Your details" },
  { id: "confirm", label: "Confirm", title: "Review and confirm" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export const isStepId = (value: string | undefined): value is StepId =>
  STEPS.some((step) => step.id === value);

export const stepIndex = (step: StepId) => STEPS.findIndex((s) => s.id === step);

export type SearchParams = Record<string, string | string[] | undefined>;

/** Choices so far. Only values that exist in the brand's content survive parsing. */
export type Selection = {
  outlet?: string;
  service?: string;
  date?: string;
  time?: string;
  /** "any" or a team member slug. */
  staff: string;
  /** Offer id, e.g. "first-visit". */
  offer?: string;
};

export const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export function parseSelection(brand: Brand, params: SearchParams): Selection {
  const outlet = first(params.outlet);
  const service = first(params.service);
  const date = first(params.date);
  const time = first(params.time);
  // `stylist` is what staff cards on the brand home link with.
  const staff = first(params.staff) ?? first(params.stylist);
  const offer = first(params.offer);
  return {
    outlet: brand.outlets.some((o) => o.slug === outlet) ? outlet : undefined,
    service: brand.services.some((s) => s.slug === service) ? service : undefined,
    date: date && isIsoDate(date) ? date : undefined,
    time: time && isTime(time) ? time : undefined,
    staff: staff && brand.team.some((m) => m.slug === staff) ? staff : "any",
    offer: offer && brand.offer?.id === offer ? offer : undefined,
  };
}

/** Search params for a selection, in a stable order. */
export function selectionEntries(selection: Selection): [string, string][] {
  const entries: [string, string][] = [];
  if (selection.outlet) entries.push(["outlet", selection.outlet]);
  if (selection.service) entries.push(["service", selection.service]);
  if (selection.date) entries.push(["date", selection.date]);
  if (selection.time) entries.push(["time", selection.time]);
  if (selection.staff !== "any") entries.push(["staff", selection.staff]);
  if (selection.offer) entries.push(["offer", selection.offer]);
  return entries;
}

export function bookUrl(brandId: BrandId, selection: Selection, step?: StepId): string {
  const params = new URLSearchParams(selectionEntries(selection));
  if (step) params.set("step", step);
  const query = params.toString();
  return `/${brandId}/book${query ? `?${query}` : ""}`;
}

export type Quote = {
  /** Listed price (S$). */
  list: number;
  /** What the client pays at the outlet (S$). */
  payable: number;
  varies: boolean;
  offerLabel?: string;
  isTrial: boolean;
};

export function quote(brand: Brand, service: Service, offerId?: string): Quote {
  const offer = brand.offer;
  const applies = !!offer && offer.id === offerId && offer.services.includes(service.slug);
  let payable = service.priceFrom;
  if (applies && offer.price !== undefined) payable = offer.price;
  else if (applies && offer.percentOff)
    payable = Math.round(service.priceFrom * (1 - offer.percentOff / 100));
  return {
    list: service.priceFrom,
    payable,
    varies: service.priceVaries && !(applies && offer.price !== undefined),
    offerLabel: applies ? offer.label : undefined,
    isTrial: applies && offer.price !== undefined,
  };
}

export function priceText(amount: number, varies = false): string {
  return amount === 0 ? "Free" : formatPrice(amount, { from: varies });
}

export function staffFor(brand: Brand, outlet?: Outlet): TeamMember[] {
  return outlet ? brand.team.filter((member) => member.outlet === outlet.area) : [];
}

export type ResolvedFlow = {
  step: StepId;
  index: number;
  /** Which of outlet, service, time and details are complete. */
  complete: [boolean, boolean, boolean, boolean];
  /** The user asked for a later step than they can be on (no-JS submit without a choice). */
  blocked: boolean;
  selection: Selection;
  outlet?: Outlet;
  service?: Service;
  quote?: Quote;
};

/**
 * Works out which step to show. A step can only be shown when every step before
 * it is complete; asking for a later one shows the first incomplete step. With no
 * `step` param (a deep link), the flow skips straight past whatever is preselected.
 */
export function resolveFlow({
  brand,
  selection,
  requested,
  hasDetails,
  now,
}: {
  brand: Brand;
  selection: Selection;
  requested?: string;
  hasDetails: boolean;
  now: Date;
}): ResolvedFlow {
  const outlet = brand.outlets.find((o) => o.slug === selection.outlet);
  const service = brand.services.find((s) => s.slug === selection.service);
  const staffOk =
    selection.staff === "any" || staffFor(brand, outlet).some((m) => m.slug === selection.staff);
  const cleaned: Selection = { ...selection, staff: staffOk ? selection.staff : "any" };
  if (cleaned.date && !bookingDates(now).includes(cleaned.date)) {
    cleaned.date = undefined;
    cleaned.time = undefined;
  }

  const slotOk =
    !!outlet &&
    !!service &&
    !!cleaned.date &&
    !!cleaned.time &&
    getSlots({
      outletSlug: outlet.slug,
      hours: outlet.hours,
      date: cleaned.date,
      durationMin: service.durationMin,
      now,
    }).includes(cleaned.time);

  const complete: ResolvedFlow["complete"] = [!!outlet, !!service, slotOk, hasDetails];
  const firstIncomplete = complete.indexOf(false);
  const furthest = firstIncomplete === -1 ? STEPS.length - 1 : firstIncomplete;
  const wanted = isStepId(requested) ? stepIndex(requested) : furthest;
  const index = Math.min(wanted, furthest);

  return {
    step: STEPS[index]!.id,
    index,
    complete,
    blocked: wanted > furthest,
    selection: cleaned,
    outlet,
    service,
    quote: service ? quote(brand, service, cleaned.offer) : undefined,
  };
}

/** Why a later step was refused, shown when `blocked`. */
export const BLOCKED_MESSAGES: Record<StepId, string> = {
  outlet: "Choose an outlet to continue.",
  service: "Choose a service to continue.",
  time: "Choose a time to continue.",
  details: "Add your details to continue.",
  confirm: "",
};

/** "Wed 26 Nov, 2:30 pm" */
export function slotText(date: string, time: string): string {
  return `${formatDateShort(date)}, ${formatTime12(time)}`;
}

/**
 * Prefilled WhatsApp message built from the booking so far (brief §6.4), e.g.
 * "Hi Dewlab Novena, I'd like to book the Hydra-Glow signature facial (S$48 trial)
 * on Wed 26 Nov, around 2:30 pm. Sent from the website (demo)."
 */
export function bookingWhatsappText(
  brand: Brand,
  flow: Pick<ResolvedFlow, "outlet" | "service" | "quote" | "selection">,
): string {
  const { outlet, service, quote: q, selection } = flow;
  let text = `Hi ${brand.shortName}${outlet ? ` ${outlet.area}` : ""}, I'd like to book`;
  if (service) {
    text += ` the ${service.title}`;
    if (q?.offerLabel) text += ` (${priceText(q.payable)} ${q.isTrial ? "trial" : "offer"})`;
  } else {
    text += " an appointment";
  }
  if (selection.date) {
    text += ` on ${formatDateShort(selection.date)}`;
    if (selection.time) text += `, around ${formatTime12(selection.time)}`;
  }
  return `${text}. Sent from the website (demo).`;
}

/** `booking_start.entry_source` (brief §6.7), from the params the link carried. */
export function entrySource(params: SearchParams): string {
  if (first(params.offer)) return "promo";
  if (first(params.stylist)) return "staff_card";
  if (first(params.service)) return "service_rail";
  if (first(params.outlet)) return "outlet_card";
  return "nav";
}
