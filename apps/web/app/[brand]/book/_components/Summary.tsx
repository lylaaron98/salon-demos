import Link from "next/link";
import styles from "../booking.module.css";

export type SummaryRow = {
  label: string;
  value: string;
  detail?: string;
  editHref?: string;
  editLabel?: string;
};

type Props = {
  rows: SummaryRow[];
  total?: { label: string; value: string };
  note?: string;
  headingLevel?: "h2" | "p";
};

/** Booking summary: the desktop rail and the mobile summary chip share it. */
export function Summary({ rows, total, note, headingLevel = "h2" }: Props) {
  const Heading = headingLevel;
  return (
    <div className={styles.summaryCard}>
      <Heading className={styles.summaryTitle}>Your booking</Heading>
      {rows.length > 0 ? (
        <dl className={styles.summaryList}>
          {rows.map((row) => (
            <div key={row.label} className={styles.summaryItem}>
              <dt>{row.label}</dt>
              <dd>
                {row.value}
                {row.detail ? (
                  <>
                    <br />
                    <span className={styles.summaryNote}>{row.detail}</span>
                  </>
                ) : null}
              </dd>
              {row.editHref ? (
                <dd className={styles.summaryEdit}>
                  <Link href={row.editHref}>
                    Edit
                    <span className={styles.vh}> {row.editLabel ?? row.label.toLowerCase()}</span>
                  </Link>
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      ) : (
        <p className={styles.summaryNote}>Your choices will appear here.</p>
      )}
      {total ? (
        <p className={styles.summaryTotal}>
          <span>{total.label}</span>
          <span>{total.value}</span>
        </p>
      ) : null}
      {note ? <p className={styles.summaryNote}>{note}</p> : null}
    </div>
  );
}
