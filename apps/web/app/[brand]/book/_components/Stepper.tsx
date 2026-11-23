import { Icon } from "@salon-demos/ui";
import Link from "next/link";
import { STEPS } from "@/lib/booking/flow";
import styles from "../booking.module.css";

type Props = {
  index: number;
  complete: boolean[];
  /** Link for each step, used for completed steps (click to edit). */
  hrefs: string[];
};

/**
 * Progress indicator (brief §4.12). Desktop: five labelled steps in a row, where
 * completed steps link back for editing. Mobile: "Step 3 of 5 · Date & time"
 * and a progress bar.
 */
export function Stepper({ index, complete, hrefs }: Props) {
  const current = STEPS[index]!;
  const percent = Math.round(((index + 1) / STEPS.length) * 100);
  return (
    <nav className={styles.stepper} aria-label="Booking progress">
      <p className={styles.stepCount}>
        Step {index + 1} of {STEPS.length} · {current.label}
      </p>
      <div className={styles.progress} aria-hidden="true">
        <span className={styles.progressBar} style={{ width: `${percent}%` }} />
      </div>
      <ol className={styles.steps}>
        {STEPS.map((step, i) => {
          const done = i < index && complete[i];
          const content = (
            <>
              <span className={styles.stepNumber} aria-hidden="true">
                {done ? <Icon name="check" size={16} /> : i + 1}
              </span>
              <span className={styles.stepLabel}>{step.label}</span>
              {done ? <span className={styles.vh}> (completed, edit)</span> : null}
              {i === index ? <span className={styles.vh}> (current step)</span> : null}
            </>
          );
          return (
            <li
              key={step.id}
              className={styles.step}
              data-state={done ? "done" : i === index ? "current" : "todo"}
              aria-current={i === index ? "step" : undefined}
            >
              {done ? (
                <Link className={styles.stepInner} href={hrefs[i]!}>
                  {content}
                </Link>
              ) : (
                <span className={styles.stepInner}>{content}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
