"use client";

import { useActionState, useState, type ReactNode } from "react";
import { track, type AnalyticsContext } from "@/lib/analytics";
import { MESSAGES } from "@/lib/booking/schema";
import { submitBooking, type ConfirmState } from "../actions";
import styles from "../booking.module.css";
import { ContactLinks } from "./ContactLinks";
import { StepActions } from "./StepActions";

type Props = {
  brandId: string;
  hidden: [string, string][];
  backHref: string;
  /** Payable at the outlet, for `booking_confirm.value`. */
  value: number;
  summary: string;
  contact: { phone: string; whatsapp: string; whatsappText: string };
  context: AnalyticsContext;
  /** The read-only review list, rendered on the server. */
  children: ReactNode;
};

/**
 * Step 5: read-only review and "Confirm booking". Posts to the `submitBooking`
 * server action, which works without JavaScript and redirects to the success page.
 */
export function ConfirmStep({
  brandId,
  hidden,
  backHref,
  value,
  summary,
  contact,
  context,
  children,
}: Props) {
  const [state, formAction, pending] = useActionState<ConfirmState, FormData>(submitBooking, {});
  const [offline, setOffline] = useState(false);
  const formError = offline ? MESSAGES.network : state.formError;

  return (
    <form
      action={formAction}
      className={styles.form}
      aria-labelledby="step-title"
      onSubmit={(event) => {
        if (navigator.onLine === false) {
          event.preventDefault();
          setOffline(true);
          return;
        }
        setOffline(false);
        track("booking_confirm", context, { value, currency: "SGD" });
      }}
    >
      <input type="hidden" name="brand" value={brandId} />
      {hidden.map(([name, val]) => (
        <input key={name} type="hidden" name={name} value={val} />
      ))}

      {children}

      <p className={styles.policy}>
        Free changes or cancellation up to 24 hours before. Pay at the outlet; no card needed. This
        is a demo, so no real booking is made.
      </p>

      {formError ? (
        <div className={styles.alert} role="alert">
          <p>{formError}</p>
          <ContactLinks {...contact} location="booking_error" context={context} />
        </div>
      ) : null}

      <StepActions
        backHref={backHref}
        continueLabel="Confirm booking"
        pending={pending}
        summary={summary}
      />
    </form>
  );
}
