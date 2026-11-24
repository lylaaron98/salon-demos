"use client";

import Form from "next/form";
import type { FormEvent, ReactNode } from "react";
import type { StepId } from "@/lib/booking/flow";
import styles from "../booking.module.css";

type Props = {
  brandId: string;
  /** Choices from other steps, carried forward as search params. */
  hidden: [string, string][];
  nextStep: StepId;
  /** Fields this step sets. Written into the current URL on submit, so Back returns to the choice. */
  choiceNames: string[];
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
};

/**
 * Before moving on, record this step's choice in the current history entry
 * (replaceState integrates with the Next.js router), so the browser's Back
 * button lands on the step with the choice still selected.
 */
function rememberChoice(form: HTMLFormElement, names: string[]) {
  const data = new FormData(form);
  const url = new URL(window.location.href);
  for (const name of names) {
    const value = data.get(name);
    if (typeof value === "string" && value !== "") url.searchParams.set(name, value);
  }
  if (url.href !== window.location.href) window.history.replaceState(null, "", url);
}

/**
 * GET form for steps 1–3. With JavaScript, next/form turns the submit into a
 * client-side navigation to `?step=<next>&...`; without it, the browser does the
 * same as a normal page load. Either way each step is its own URL, so back and
 * forward work.
 */
export function StepForm({ brandId, hidden, nextStep, choiceNames, onSubmit, children }: Props) {
  return (
    <Form
      action={`/${brandId}/book`}
      onSubmit={(event) => {
        rememberChoice(event.currentTarget, choiceNames);
        onSubmit?.(event);
      }}
      className={styles.form}
      aria-labelledby="step-title"
    >
      {hidden.map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <input type="hidden" name="step" value={nextStep} />
      {children}
    </Form>
  );
}
