"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBrand } from "@/content";
import { getSlots } from "@/lib/booking/availability";
import { bookUrl, parseSelection, resolveFlow, selectionEntries } from "@/lib/booking/flow";
import {
  MESSAGES,
  readDetailsForm,
  validateDetails,
  type DetailsInput,
  type FieldErrors,
} from "@/lib/booking/schema";
import {
  DETAILS_COOKIE,
  DONE_COOKIE,
  cookieOptions,
  encodeDetails,
  encodeDone,
  makeRef,
  readDetails,
} from "@/lib/booking/session";

/**
 * Server actions for the booking flow. Both re-validate everything with the same
 * zod schema the client uses, and both work without JavaScript (plain form POST,
 * then a redirect). This is a demo: nothing is stored and no booking is made.
 */

export type DetailsState = {
  errors: FieldErrors;
  /** Echoed back so a no-JS submit keeps what was typed (never the consent tick). */
  values: Partial<DetailsInput>;
  formError?: string;
};

export type ConfirmState = { formError?: string };

function formSelection(formData: FormData) {
  const brand = getBrand(String(formData.get("brand") ?? ""));
  if (!brand) return undefined;
  const params: Record<string, string> = {};
  for (const key of ["outlet", "service", "date", "time", "staff", "offer"]) {
    const value = formData.get(key);
    if (typeof value === "string") params[key] = value;
  }
  return { brand, selection: parseSelection(brand, params) };
}

export async function saveDetails(_prev: DetailsState, formData: FormData): Promise<DetailsState> {
  const input = readDetailsForm(formData);
  const values = { ...input, consent: "", company: "" };
  const context = formSelection(formData);
  if (!context) return { errors: {}, values, formError: MESSAGES.network };

  const result = validateDetails(input);
  if (!result.ok) {
    // A filled honeypot gets a generic failure, not a hint about why.
    if (result.spam) return { errors: {}, values, formError: MESSAGES.network };
    return { errors: result.errors, values };
  }

  const { brand, selection } = context;
  const store = await cookies();
  store.set(DETAILS_COOKIE, encodeDetails(result.data), cookieOptions(brand.id, 30 * 60));
  redirect(bookUrl(brand.id, selection, "confirm"));
}

export async function submitBooking(
  _prev: ConfirmState,
  formData: FormData,
): Promise<ConfirmState> {
  const context = formSelection(formData);
  if (!context) return { formError: MESSAGES.network };
  const { brand } = context;
  const now = new Date();
  const store = await cookies();
  const details = readDetails(store);
  const flow = resolveFlow({
    brand,
    selection: context.selection,
    requested: "confirm",
    hasDetails: !!details,
    now,
  });

  const { selection, outlet, service } = flow;
  // The slot may have gone since step 3 (the brief's "409" race): back to the
  // time step with the nearest alternatives.
  if (
    outlet &&
    service &&
    selection.date &&
    selection.time &&
    !flow.complete[2] &&
    !getSlots({
      outletSlug: outlet.slug,
      hours: outlet.hours,
      date: selection.date,
      durationMin: service.durationMin,
      now,
    }).includes(selection.time)
  ) {
    const { time, ...rest } = selection;
    redirect(`${bookUrl(brand.id, rest, "time")}&taken=${encodeURIComponent(time)}`);
  }
  if (flow.step !== "confirm" || !details) redirect(bookUrl(brand.id, selection, flow.step));

  const ref = makeRef();
  store.set(
    DONE_COOKIE,
    encodeDone({ ref, firstName: details.firstName }),
    cookieOptions(brand.id, 10 * 60),
  );
  store.delete({ name: DETAILS_COOKIE, path: `/${brand.id}/book` });

  const params = new URLSearchParams([["ref", ref], ...selectionEntries(selection)]);
  redirect(`/${brand.id}/book/confirmed?${params.toString()}`);
}
