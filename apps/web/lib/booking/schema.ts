import { z } from "zod";

/**
 * Booking details schema, shared by the client (inline validation on blur) and the
 * server action (the trusted check). Microcopy follows the design brief §6.3.
 * Deliberately minimal (brief §6.2): first name, SG mobile, optional email and
 * notes, PDPA consent. No NRIC/FIN, date of birth, gender or address.
 */

export const MESSAGES = {
  firstName: "Please enter your first name.",
  mobile: "Enter an 8-digit Singapore mobile number, e.g. 9123 4567.",
  landline: "This looks like a landline. We'll need a mobile number to send your confirmation.",
  email: "Enter an email like name@example.com.",
  notes: "Please keep this under 500 characters.",
  consent: "Please agree so we can contact you about your booking.",
  slot: "Choose a time to continue.",
  network:
    "We couldn't send that. Check your connection and try again, or WhatsApp us and we'll book it for you.",
} as const;

export const DETAILS_FIELDS = ["firstName", "mobile", "email", "notes", "consent"] as const;
export type DetailsField = (typeof DETAILS_FIELDS)[number];

/** Raw string values as they come from the form. */
export type DetailsInput = Record<DetailsField | "marketing" | "company", string>;

/** Analytics names for each field (brief §6.7 `form_error.field`). */
export const ANALYTICS_FIELD: Record<DetailsField, string> = {
  firstName: "first_name",
  mobile: "mobile",
  email: "email",
  notes: "notes",
  consent: "consent",
};

// Letters (any script, so CJK and Tamil names pass), combining marks, spaces and ' - .
const NAME_PATTERN = /^[\p{L}\p{M}' .-]+$/u;
// RFC-light: something@something.tld, no spaces.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/** "9123 4567", "+65 9123-4567" or "6591234567" -> "91234567". */
export function mobileDigits(raw: string): string {
  const digits = raw.replace(/[\s()-]/g, "").replace(/^\+/, "");
  return digits.length === 10 && digits.startsWith("65") ? digits.slice(2) : digits;
}

/** E.164 for a local SG number: "91234567" -> "+6591234567". */
export const toE164 = (local: string) => `+65${local}`;

/** "91234567" -> "9123 4567", for display. */
export function formatMobile(value: string): string {
  const local = mobileDigits(value);
  return /^\d{8}$/.test(local) ? `${local.slice(0, 4)} ${local.slice(4)}` : value;
}

export const firstNameField = z
  .string()
  .trim()
  .min(1, MESSAGES.firstName)
  .max(50, MESSAGES.firstName)
  .regex(NAME_PATTERN, MESSAGES.firstName);

export const mobileField = z
  .string()
  .transform(mobileDigits)
  .superRefine((value, ctx) => {
    if (/^6\d{7}$/.test(value)) ctx.addIssue({ code: "custom", message: MESSAGES.landline });
    else if (!/^[89]\d{7}$/.test(value)) ctx.addIssue({ code: "custom", message: MESSAGES.mobile });
  })
  .transform(toE164);

export const emailField = z
  .string()
  .trim()
  .max(254, MESSAGES.email)
  .refine((value) => value === "" || EMAIL_PATTERN.test(value), MESSAGES.email);

export const notesField = z.string().trim().max(500, MESSAGES.notes);

export const consentField = z
  .string()
  .refine((value) => value === "on", MESSAGES.consent)
  .transform(() => true);

export const detailsSchema = z.object({
  firstName: firstNameField,
  mobile: mobileField,
  email: emailField,
  notes: notesField,
  consent: consentField,
  marketing: z.string().transform((value) => value === "on"),
  // Honeypot: hidden from people, so any value means a bot filled the form.
  company: z.string().max(0),
});

export type BookingDetails = z.output<typeof detailsSchema>;

const FIELD_SCHEMAS: Record<DetailsField, z.ZodType> = {
  firstName: firstNameField,
  mobile: mobileField,
  email: emailField,
  notes: notesField,
  consent: consentField,
};

/** Validates one field (on blur). Returns the error message, or undefined when valid. */
export function validateField(field: DetailsField, value: string): string | undefined {
  const result = FIELD_SCHEMAS[field].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export type FieldErrors = Partial<Record<DetailsField, string>>;

/** Validates the whole form. Errors are keyed by field, in form order. */
export function validateDetails(
  input: DetailsInput,
): { ok: true; data: BookingDetails } | { ok: false; errors: FieldErrors; spam: boolean } {
  const result = detailsSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const errors: FieldErrors = {};
  let spam = false;
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (field === "company") spam = true;
    if (isDetailsField(field) && !errors[field]) errors[field] = issue.message;
  }
  // Keep form order so "first invalid field" is predictable.
  const ordered: FieldErrors = {};
  for (const field of DETAILS_FIELDS) if (errors[field]) ordered[field] = errors[field];
  return { ok: false, errors: ordered, spam };
}

function isDetailsField(value: unknown): value is DetailsField {
  return typeof value === "string" && (DETAILS_FIELDS as readonly string[]).includes(value);
}

/** Reads the details fields from FormData as plain strings. */
export function readDetailsForm(formData: FormData): DetailsInput {
  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  return {
    firstName: get("firstName"),
    mobile: get("mobile"),
    email: get("email"),
    notes: get("notes"),
    consent: get("consent"),
    marketing: get("marketing"),
    company: get("company"),
  };
}

/** `form_error.error_type` for analytics (brief §6.7). */
export function errorType(field: DetailsField, value: string, message: string) {
  if (message === MESSAGES.landline) return "landline";
  if (field === "consent" || value.trim() === "") return "empty";
  return "format";
}

const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "outlok.com": "outlook.com",
  "outllook.com": "outlook.com",
  "icloud.co": "icloud.com",
};

/** Suggests a fix for common email domain typos: "mei@gmial.com" -> "mei@gmail.com". */
export function suggestEmail(email: string): string | undefined {
  const at = email.trim().lastIndexOf("@");
  if (at < 1) return undefined;
  const fix =
    DOMAIN_TYPOS[
      email
        .trim()
        .slice(at + 1)
        .toLowerCase()
    ];
  return fix ? `${email.trim().slice(0, at)}@${fix}` : undefined;
}
