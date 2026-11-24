import type { BrandId } from "@salon-demos/tokens";
import { detailsSchema, mobileDigits, type BookingDetails } from "./schema.ts";

/**
 * Short-lived, httpOnly cookies that carry the guest's details from step 4 to
 * step 5, and their first name to the success page, so personal data never goes
 * in a URL or the analytics layer. Nothing is persisted: the cookies expire after
 * 30 and 10 minutes, and the details cookie is cleared once the booking is sent.
 */

export const DETAILS_COOKIE = "orn_booking_details";
export const DONE_COOKIE = "orn_booking_done";

type CookieReader = { get(name: string): { value: string } | undefined };

export const cookieOptions = (brandId: BrandId, maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: `/${brandId}/book`,
  maxAge,
});

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

function decode(value: string | undefined): unknown {
  if (!value) return undefined;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return undefined;
  }
}

export const encodeDetails = (details: BookingDetails) => encode(details);

/** The saved details, re-validated with the shared schema, or undefined. */
export function readDetails(cookies: CookieReader): BookingDetails | undefined {
  const raw = decode(cookies.get(DETAILS_COOKIE)?.value);
  if (!raw || typeof raw !== "object") return undefined;
  const value = raw as Record<string, unknown>;
  const str = (key: string) => (typeof value[key] === "string" ? (value[key] as string) : "");
  const result = detailsSchema.safeParse({
    firstName: str("firstName"),
    mobile: mobileDigits(str("mobile")),
    email: str("email"),
    notes: str("notes"),
    consent: value.consent === true ? "on" : "",
    marketing: value.marketing === true ? "on" : "",
    company: "",
  });
  return result.success ? result.data : undefined;
}

export type DoneCookie = { ref: string; firstName: string };

export const encodeDone = (done: DoneCookie) => encode(done);

export function readDone(cookies: CookieReader): DoneCookie | undefined {
  const raw = decode(cookies.get(DONE_COOKIE)?.value);
  if (!raw || typeof raw !== "object") return undefined;
  const { ref, firstName } = raw as Record<string, unknown>;
  return typeof ref === "string" && typeof firstName === "string" ? { ref, firstName } : undefined;
}

// No 0/O or 1/I, so a reference read out over the phone is unambiguous.
const REF_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const REF_PATTERN = /^ORN-[2-9A-HJ-NP-Z]{4}$/;

/** A fake booking reference such as "ORN-7K3Q". */
export function makeRef(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return `ORN-${Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join("")}`;
}
