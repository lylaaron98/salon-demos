"use client";

import { track, type AnalyticsContext } from "@/lib/analytics";
import styles from "../booking.module.css";
import { StepActions } from "./StepActions";
import { StepForm } from "./StepForm";
import { useRememberedChoice } from "./use-remembered-choice";

export type ServiceOption = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  duration: string;
  /** Payable price as text, e.g. "S$48" or "from S$138". */
  price: string;
  /** Listed price as text when an offer lowers it. */
  was?: string;
  payable: number;
  badge?: string;
};

type Props = {
  brandId: string;
  services: ServiceOption[];
  selected?: string;
  hidden: [string, string][];
  backHref: string;
  context: AnalyticsContext;
};

/** Step 2: service radio list with duration and price (offer price when it applies). */
export function ServiceStep({ brandId, services, selected, hidden, backHref, context }: Props) {
  const [value, setValue] = useRememberedChoice(
    "service",
    selected,
    services.map((s) => s.slug),
  );
  const chosen = services.find((s) => s.slug === value);

  return (
    <StepForm
      brandId={brandId}
      hidden={hidden}
      choiceNames={["service"]}
      nextStep="time"
      onSubmit={() => {
        if (!chosen) return;
        track(
          "select_service",
          { ...context, service_id: chosen.slug },
          {
            service_category: chosen.category,
            price: chosen.payable,
            stylist_level: "any",
            addons_count: 0,
          },
        );
      }}
    >
      <fieldset className={styles.fieldset}>
        <legend className={styles.vh}>Service</legend>
        <ul className={styles.options}>
          {services.map((service) => (
            <li key={service.slug}>
              <label className={styles.option}>
                <input
                  type="radio"
                  name="service"
                  value={service.slug}
                  checked={value === service.slug}
                  onChange={() => setValue(service.slug)}
                  required
                />
                <span className={styles.optionBody}>
                  <span className={styles.optionHead}>
                    <span className={styles.optionTitle}>{service.title}</span>
                    <span className={styles.price}>
                      {service.was ? (
                        <s className={styles.was}>
                          <span className={styles.vh}>was </span>
                          {service.was}
                        </s>
                      ) : null}
                      {service.price}
                    </span>
                  </span>
                  {service.badge ? <span className={styles.badge}>{service.badge}</span> : null}
                  <span className={styles.optionMeta}>{service.summary}</span>
                  <span className={styles.optionMeta}>
                    {service.duration} · {service.category}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <StepActions
        backHref={backHref}
        canContinue={value !== ""}
        helper="Choose a service to continue."
        summary={chosen ? `${chosen.price} · ${chosen.title}` : undefined}
      />
    </StepForm>
  );
}
