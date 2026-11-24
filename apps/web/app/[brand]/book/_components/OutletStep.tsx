"use client";

import { Icon } from "@salon-demos/ui";
import { track, type AnalyticsContext } from "@/lib/analytics";
import styles from "../booking.module.css";
import { StepActions } from "./StepActions";
import { StepForm } from "./StepForm";
import { useRememberedChoice } from "./use-remembered-choice";

export type OutletOption = {
  slug: string;
  name: string;
  address: string;
  mrt: string;
  hours: string;
};

type Props = {
  brandId: string;
  outlets: OutletOption[];
  selected?: string;
  hidden: [string, string][];
  context: AnalyticsContext;
};

/** Step 1: outlet radio cards, alphabetical (no geolocation in the demo). */
export function OutletStep({ brandId, outlets, selected, hidden, context }: Props) {
  const [value, setValue] = useRememberedChoice(
    "outlet",
    selected,
    outlets.map((o) => o.slug),
  );

  return (
    <StepForm
      brandId={brandId}
      hidden={hidden}
      choiceNames={["outlet"]}
      nextStep="service"
      onSubmit={() =>
        track(
          "select_outlet",
          { ...context, outlet_id: value },
          { selection_method: value === selected ? "default" : "list" },
        )
      }
    >
      <fieldset className={styles.fieldset}>
        <legend className={styles.vh}>Outlet</legend>
        <ul className={styles.options}>
          {outlets.map((outlet) => (
            <li key={outlet.slug}>
              <label className={styles.option}>
                <input
                  type="radio"
                  name="outlet"
                  value={outlet.slug}
                  checked={value === outlet.slug}
                  onChange={() => setValue(outlet.slug)}
                  required
                />
                <span className={styles.optionBody}>
                  <span className={styles.optionTitle}>{outlet.name}</span>
                  <span className={styles.optionMeta}>
                    <Icon name="pin" size={16} />
                    {outlet.address}
                  </span>
                  <span className={styles.optionMeta}>
                    <Icon name="train" size={16} />
                    {outlet.mrt}
                  </span>
                  <span className={styles.optionMeta}>
                    <Icon name="clock" size={16} />
                    {outlet.hours}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <StepActions canContinue={value !== ""} helper="Choose an outlet to continue." />
    </StepForm>
  );
}
