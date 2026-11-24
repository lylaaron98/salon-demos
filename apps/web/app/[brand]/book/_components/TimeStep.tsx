"use client";

import { formatTime12 } from "@salon-demos/ui/lib";
import Link from "next/link";
import { useEffect, useState } from "react";
import { track, type AnalyticsContext } from "@/lib/analytics";
import { DAYPART_LABELS, daypart, groupByDaypart } from "@/lib/booking/availability";
import { MESSAGES } from "@/lib/booking/schema";
import styles from "../booking.module.css";
import { ContactLinks } from "./ContactLinks";
import { StepActions } from "./StepActions";
import { StepForm } from "./StepForm";
import { useRememberedChoice } from "./use-remembered-choice";

export type DateChip = {
  date: string;
  weekday: string;
  day: string;
  /** "Wednesday 26 November 2026" */
  label: string;
  closed: boolean;
  href: string;
};

type Props = {
  brandId: string;
  hidden: [string, string][];
  backHref: string;
  dates: DateChip[];
  rangeText: string;
  selectedDate: string;
  /** "Wed 26 Nov" */
  selectedDateText: string;
  daysAhead: number;
  slots: string[];
  selectedTime?: string;
  taken?: { time: string; alternatives: { time: string; href: string }[] };
  staff: { slug: string; name: string; role: string }[];
  selectedStaff: string;
  priceText: string;
  /** "Therapist", "Stylist", "Scalp coach". */
  staffLabel: string;
  contact: { phone: string; whatsapp: string; whatsappText: string };
  context: AnalyticsContext;
};

/**
 * Step 3: date chips for the next 14 days (links, so each date is a URL), then
 * free slots grouped Morning / Afternoon / Evening. Taken slots are hidden, not
 * greyed out; a day with none shows the WhatsApp/call empty state.
 */
export function TimeStep(props: Props) {
  const { slots, selectedDate, context, taken } = props;
  const [time, setTime] = useRememberedChoice("time", props.selectedTime, slots);
  const [staff, setStaff] = useState(props.selectedStaff);
  const groups = groupByDaypart(slots);

  useEffect(() => {
    if (slots.length === 0) track("no_slots_shown", context, { date: selectedDate });
  }, [slots.length, selectedDate, context]);

  useEffect(() => {
    if (taken) track("form_error", context, { field: "slot", error_type: "server_409" });
  }, [taken, context]);

  return (
    <StepForm
      brandId={props.brandId}
      hidden={props.hidden}
      choiceNames={["date", "time", "staff"]}
      nextStep="details"
      onSubmit={() => {
        if (!time) return;
        track("select_slot", context, {
          days_ahead: props.daysAhead,
          daypart: daypart(time),
          staff_pref: staff === "any" ? "any" : "specific",
        });
      }}
    >
      <input type="hidden" name="date" value={selectedDate} />

      {taken ? (
        <div className={styles.alert} role="alert">
          <p>Sorry, {formatTime12(taken.time)} was just booked. Here are the nearest times:</p>
          <ul className={styles.slots}>
            {taken.alternatives.map((alt) => (
              <li key={alt.time}>
                <Link className={styles.slot} href={alt.href} scroll={false} replace>
                  {formatTime12(alt.time)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <h2 className={styles.legend} id="date-heading">
        Date
      </h2>
      <p className={styles.dateRange}>{props.rangeText}</p>
      <ul className={styles.dates} aria-labelledby="date-heading">
        {props.dates.map((chip) => {
          const current = chip.date === selectedDate;
          const body = (
            <>
              <span className={styles.dateWeekday}>{chip.weekday}</span>
              <span className={styles.dateDay}>{chip.day}</span>
              {chip.closed ? <span className={styles.dateNote}>Closed</span> : null}
            </>
          );
          return (
            <li key={chip.date}>
              {chip.closed ? (
                <span
                  className={styles.dateChip}
                  aria-disabled="true"
                  aria-label={`${chip.label}, closed`}
                >
                  {body}
                </span>
              ) : (
                <Link
                  className={styles.dateChip}
                  href={chip.href}
                  scroll={false}
                  replace
                  aria-current={current ? "date" : undefined}
                  aria-label={chip.label}
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <p className={styles.vh} aria-live="polite">
        {slots.length === 0
          ? `No times left on ${props.selectedDateText}.`
          : `${slots.length} times available on ${props.selectedDateText}.`}
      </p>
      <div>
        {groups.length > 0 ? (
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Times on {props.selectedDateText}</legend>
            <div className={styles.dayparts}>
              {groups.map((group) => (
                <fieldset key={group.part} className={styles.fieldset}>
                  <legend className={styles.daypartTitle}>{DAYPART_LABELS[group.part]}</legend>
                  <ul className={styles.slots}>
                    {group.slots.map((slot) => (
                      <li key={slot}>
                        <label className={styles.slot}>
                          <input
                            type="radio"
                            name="time"
                            value={slot}
                            checked={time === slot}
                            onChange={() => setTime(slot)}
                            required
                          />
                          {formatTime12(slot)}
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              ))}
            </div>
          </fieldset>
        ) : (
          <div className={styles.empty}>
            <h2>No times left on {props.selectedDateText}</h2>
            <p>Try another date, or message us and we&apos;ll find a time that works.</p>
            <ContactLinks {...props.contact} location="booking_empty" context={context} />
          </div>
        )}
      </div>

      {props.staff.length > 0 ? (
        <div className={`${styles.field} ${styles.staffField}`}>
          <label className={styles.label} htmlFor="staff">
            {props.staffLabel}
          </label>
          <select
            id="staff"
            name="staff"
            className={styles.select}
            value={staff}
            onChange={(event) => setStaff(event.target.value)}
          >
            <option value="any">Any available</option>
            {props.staff.map((member) => (
              <option key={member.slug} value={member.slug}>
                {member.name}, {member.role}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="staff" value="any" />
      )}

      {groups.length > 0 ? (
        <div className={styles.fallback}>
          <p>Can&apos;t find a slot?</p>
          <ContactLinks
            {...props.contact}
            location="booking_empty"
            context={context}
            variant="inline"
          />
        </div>
      ) : null}

      <StepActions
        backHref={props.backHref}
        canContinue={time !== ""}
        helper={MESSAGES.slot}
        summary={`${props.priceText} · ${props.selectedDateText}${time ? `, ${formatTime12(time)}` : ""}`}
      />
    </StepForm>
  );
}
