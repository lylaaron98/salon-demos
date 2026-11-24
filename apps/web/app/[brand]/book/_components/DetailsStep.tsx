"use client";

import { Icon } from "@salon-demos/ui";
import { useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { track, type AnalyticsContext } from "@/lib/analytics";
import {
  ANALYTICS_FIELD,
  DETAILS_FIELDS,
  MESSAGES,
  errorType,
  suggestEmail,
  validateDetails,
  validateField,
  type DetailsField,
  type FieldErrors,
} from "@/lib/booking/schema";
import { saveDetails, type DetailsState } from "../actions";
import styles from "../booking.module.css";
import { ContactLinks } from "./ContactLinks";
import { StepActions } from "./StepActions";

type TextField = Exclude<DetailsField, "consent">;

type Props = {
  brandId: string;
  brandName: string;
  hidden: [string, string][];
  backHref: string;
  /** Prefill for a returning guest (from the short-lived details cookie). */
  defaults?: {
    firstName: string;
    mobile: string;
    email: string;
    notes: string;
    marketing: boolean;
  };
  contact: { phone: string; whatsapp: string; whatsappText: string };
  context: AnalyticsContext;
};

const LABELS: Record<DetailsField, string> = {
  firstName: "First name",
  mobile: "Mobile number",
  email: "Email",
  notes: "Anything we should know?",
  consent: "Consent",
};

const countMessage = (count: number) =>
  count === 0 ? "" : `${count} ${count === 1 ? "field needs" : "fields need"} attention.`;

/**
 * Step 4: guest details (brief §6.2, §6.3). Minimal fields, labels always
 * visible, validation on blur and then live once a field is in error. The same
 * zod schema runs here and in the `saveDetails` server action; without
 * JavaScript the form posts straight to the action.
 */
export function DetailsStep({
  brandId,
  brandName,
  hidden,
  backHref,
  defaults,
  contact,
  context,
}: Props) {
  const [state, formAction, pending] = useActionState<DetailsState, FormData>(saveDetails, {
    errors: {},
    values: {},
  });

  const [values, setValues] = useState<Record<TextField, string>>(() => ({
    firstName: state.values.firstName ?? defaults?.firstName ?? "",
    mobile: state.values.mobile ?? defaults?.mobile ?? "",
    email: state.values.email ?? defaults?.email ?? "",
    notes: state.values.notes ?? defaults?.notes ?? "",
  }));
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(
    () => state.values.marketing === "on" || (defaults?.marketing ?? false),
  );
  const [errors, setErrors] = useState<FieldErrors>(state.errors);
  const [dirty, setDirty] = useState<Set<DetailsField>>(() => new Set());
  const [corrected, setCorrected] = useState<Set<DetailsField>>(() => new Set());
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [announcement, setAnnouncement] = useState(() =>
    countMessage(Object.keys(state.errors).length),
  );
  const [formError, setFormError] = useState(state.formError);

  // Server errors (a submit that skipped client validation) replace local ones.
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    setErrors(state.errors);
    setFormError(state.formError);
    setAnnouncement(countMessage(Object.keys(state.errors).length));
  }

  const formRef = useRef<HTMLFormElement>(null);

  const focusFirstInvalid = (fieldErrors: FieldErrors) => {
    const field = DETAILS_FIELDS.find((f) => fieldErrors[f]);
    if (field) formRef.current?.querySelector<HTMLElement>(`#${field}`)?.focus();
  };

  // After a server round trip with errors: focus the first one and report them.
  useEffect(() => {
    if (Object.keys(state.errors).length === 0) return;
    focusFirstInvalid(state.errors);
    for (const field of DETAILS_FIELDS) {
      const message = state.errors[field];
      if (message) {
        track("form_error", context, {
          field: ANALYTICS_FIELD[field],
          error_type: errorType(field, state.values[field] ?? "", message),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the action returns
  }, [state]);

  const valueOf = (field: DetailsField) =>
    field === "consent" ? (consent ? "on" : "") : values[field];

  const check = (field: DetailsField, value: string, reportToAnalytics: boolean) => {
    const message = validateField(field, value);
    const hadError = !!errors[field];
    setErrors((prev) => ({ ...prev, [field]: message }));
    // Report each new error once (not every keystroke while it stays the same).
    if (message && reportToAnalytics && message !== errors[field]) {
      track("form_error", context, {
        field: ANALYTICS_FIELD[field],
        error_type: errorType(field, value, message),
      });
    }
    if (!message && hadError) setCorrected((prev) => new Set(prev).add(field));
    if (message) {
      setCorrected((prev) => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  };

  const onChange = (field: TextField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setDirty((prev) => (prev.has(field) ? prev : new Set(prev).add(field)));
    // Live validation only once the field is already in error.
    if (errors[field]) check(field, value, true);
  };

  const onBlur = (field: TextField) => {
    if (field === "email") setEmailBlurred(true);
    if (dirty.has(field) || errors[field]) check(field, values[field], true);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      event.preventDefault();
      setFormError(MESSAGES.network);
      return;
    }
    const result = validateDetails({
      ...values,
      consent: consent ? "on" : "",
      marketing: marketing ? "on" : "",
      company: "",
    });
    if (!result.ok) {
      event.preventDefault();
      setErrors(result.errors);
      // Re-announce even if the count is unchanged.
      const message = countMessage(Object.keys(result.errors).length);
      setAnnouncement((prev) => (prev === message ? `${message} ` : message));
      focusFirstInvalid(result.errors);
      for (const field of DETAILS_FIELDS) {
        const msg = result.errors[field];
        if (msg) {
          track("form_error", context, {
            field: ANALYTICS_FIELD[field],
            error_type: errorType(field, valueOf(field), msg),
          });
        }
      }
      return;
    }
    setFormError(undefined);
    track("details_submit", context, { marketing_opt_in: marketing, returning: !!defaults });
  };

  const describedBy = (field: DetailsField, ...extra: string[]) =>
    [errors[field] ? `${field}-error` : undefined, ...extra].filter(Boolean).join(" ") || undefined;

  const fieldError = (field: DetailsField) =>
    errors[field] ? (
      <p id={`${field}-error`} className={styles.error}>
        <Icon name="close" size={16} />
        {errors[field]}
      </p>
    ) : corrected.has(field) ? (
      <p className={styles.fixed}>
        <Icon name="check" size={16} />
        Looks good
      </p>
    ) : null;

  const emailSuggestion = emailBlurred && !errors.email ? suggestEmail(values.email) : undefined;
  const errorList = DETAILS_FIELDS.filter((field) => errors[field]);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      noValidate
      className={styles.form}
      aria-labelledby="step-title"
    >
      <input type="hidden" name="brand" value={brandId} />
      {hidden.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div
        aria-live="assertive"
        role="alert"
        className={errorList.length ? styles.errorSummary : undefined}
      >
        {errorList.length > 0 ? (
          <>
            <p>{announcement}</p>
            <ul>
              {errorList.map((field) => (
                <li key={field}>
                  <a href={`#${field}`}>{LABELS[field]}</a>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {defaults ? (
        <p className={styles.hint}>
          Welcome back, we&apos;ve kept your details.{" "}
          <button
            type="button"
            className={styles.textButton}
            onClick={() => {
              setValues({ firstName: "", mobile: "", email: "", notes: "" });
              setMarketing(false);
              formRef.current?.querySelector<HTMLElement>("#firstName")?.focus();
            }}
          >
            Not you?
          </button>
        </p>
      ) : null}

      <div className={styles.fields}>
        <div className={styles.field} data-invalid={!!errors.firstName}>
          <label className={styles.label} htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            name="firstName"
            className={styles.input}
            autoComplete="given-name"
            maxLength={50}
            value={values.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            onBlur={() => onBlur("firstName")}
            aria-invalid={!!errors.firstName || undefined}
            aria-describedby={describedBy("firstName")}
            required
          />
          {fieldError("firstName")}
        </div>

        <div className={styles.field} data-invalid={!!errors.mobile}>
          <label className={styles.label} htmlFor="mobile">
            Mobile number
          </label>
          <div className={styles.prefixed}>
            <span className={styles.prefix} id="mobile-prefix">
              +65
            </span>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              className={styles.input}
              maxLength={16}
              value={values.mobile}
              onChange={(e) => onChange("mobile", e.target.value)}
              onBlur={() => onBlur("mobile")}
              aria-invalid={!!errors.mobile || undefined}
              aria-describedby={describedBy("mobile", "mobile-prefix", "mobile-hint")}
              required
            />
          </div>
          <p id="mobile-hint" className={styles.hint}>
            We&apos;ll WhatsApp or SMS your confirmation.
          </p>
          {fieldError("mobile")}
        </div>

        <div className={styles.field} data-invalid={!!errors.email}>
          <label className={styles.label} htmlFor="email">
            Email <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={styles.input}
            maxLength={254}
            value={values.email}
            onChange={(e) => onChange("email", e.target.value)}
            onBlur={() => onBlur("email")}
            aria-invalid={!!errors.email || undefined}
            aria-describedby={describedBy("email", "email-hint")}
          />
          <p id="email-hint" className={styles.hint}>
            For your receipt and reminders.
          </p>
          {fieldError("email")}
          {emailSuggestion ? (
            <p className={styles.suggestion} role="status">
              Did you mean {emailSuggestion}?
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  setValues((prev) => ({ ...prev, email: emailSuggestion }));
                  setEmailBlurred(false);
                }}
              >
                Use this
              </button>
            </p>
          ) : null}
        </div>

        <div className={styles.field} data-invalid={!!errors.notes}>
          <label className={styles.label} htmlFor="notes">
            Anything we should know? <span className={styles.optional}>(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className={styles.textarea}
            maxLength={500}
            value={values.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            onBlur={() => onBlur("notes")}
            aria-invalid={!!errors.notes || undefined}
            aria-describedby={describedBy("notes", "notes-hint")}
          />
          <p id="notes-hint" className={styles.hint}>
            Allergies, sensitivities or preferences.
          </p>
          {fieldError("notes")}
        </div>

        <div className={styles.field} data-invalid={!!errors.consent}>
          <label className={styles.check}>
            <input
              id="consent"
              type="checkbox"
              name="consent"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (errors.consent) check("consent", e.target.checked ? "on" : "", false);
              }}
              aria-invalid={!!errors.consent || undefined}
              aria-describedby={describedBy("consent")}
              required
            />
            <span>
              I agree to Orrin Collective contacting me about this booking, in line with the privacy
              policy.
            </span>
          </label>
          {fieldError("consent")}
        </div>

        <label className={styles.check}>
          <input
            type="checkbox"
            name="marketing"
            checked={marketing}
            onChange={(e) => setMarketing(e.target.checked)}
          />
          <span>
            Send me occasional offers from {brandName}.{" "}
            <span className={styles.optional}>(optional)</span>
          </span>
        </label>

        <div className={styles.honeypot} aria-hidden="true">
          <label htmlFor="company">Company (leave this empty)</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>
      </div>

      {formError ? (
        <div className={styles.alert} role="alert">
          <p>{formError}</p>
          <ContactLinks {...contact} location="booking_error" context={context} />
        </div>
      ) : null}

      <StepActions backHref={backHref} pending={pending} />
    </form>
  );
}
