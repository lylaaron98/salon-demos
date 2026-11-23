import { cx } from "../../lib/cx";
import { ButtonLink } from "../Button/Button";
import { MediaPlaceholder, type MediaTone } from "../MediaPlaceholder/MediaPlaceholder";
import styles from "./StaffCard.module.css";

export type StaffCardProps = {
  name: string;
  /** e.g. "Senior stylist". Shown as the level badge on profile cards. */
  role: string;
  specialities?: string[];
  /** e.g. ["English", "中文", "Bahasa Melayu"]. */
  languages?: string[];
  outlet?: string;
  /** Preselects this person in booking (`?stylist=slug`). */
  bookHref?: string;
  /** Defaults to "Book with {first name}". */
  bookLabel?: string;
  /** `profile`: 4:5 portrait with details. `compact`: 64px avatar, name and role. */
  variant?: "profile" | "compact";
  headingLevel?: 3 | 4;
  mediaTone?: MediaTone;
};

/** Team member card. Portraits are placeholders and the team is labelled as demo content. */
export function StaffCard({
  name,
  role,
  specialities = [],
  languages = [],
  outlet,
  bookHref,
  bookLabel,
  variant = "profile",
  headingLevel = 3,
  mediaTone = "decor",
}: StaffCardProps) {
  const Heading = `h${headingLevel}` as const;
  const firstName = name.split(" ")[0] ?? name;

  if (variant === "compact") {
    return (
      <div className={cx(styles.card, styles.compact)}>
        <div className={styles.avatar}>
          <MediaPlaceholder ratio="1" tone={mediaTone} />
        </div>
        <div>
          <Heading className={styles.compactName}>{name}</Heading>
          <p className={styles.role}>{role}</p>
        </div>
      </div>
    );
  }

  return (
    <article className={cx(styles.card, styles.profile)}>
      <div className={styles.portrait}>
        <MediaPlaceholder ratio="4 / 5" tone={mediaTone} className={styles.portraitImage} />
        <span className={styles.demo}>Demo team</span>
      </div>
      <div className={styles.body}>
        <span className={styles.level}>{role}</span>
        <Heading className={styles.name}>{name}</Heading>
        {specialities.length > 0 ? (
          <ul className={styles.chips} aria-label="Specialities">
            {specialities.map((item) => (
              <li key={item} className={styles.chip}>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        <dl className={styles.facts}>
          {languages.length > 0 ? (
            <div>
              <dt>Languages</dt>
              <dd>{languages.join(" · ")}</dd>
            </div>
          ) : null}
          {outlet ? (
            <div>
              <dt>Outlet</dt>
              <dd>{outlet}</dd>
            </div>
          ) : null}
        </dl>
        {bookHref ? (
          <ButtonLink
            href={bookHref}
            variant="secondary"
            size="sm"
            fullWidth
            className={styles.cta}
          >
            {bookLabel ?? `Book with ${firstName}`}
          </ButtonLink>
        ) : null}
      </div>
    </article>
  );
}
