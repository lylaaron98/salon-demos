"use client";

import { useId, useState } from "react";
import { Icon } from "../../icons/Icon";
import { cx } from "../../lib/cx";
import styles from "./FAQ.module.css";

export type FAQItem = { question: string; answer: string };

export type FAQProps = {
  items: FAQItem[];
  /** `compact` caps the list at 5 items (landing pages). */
  variant?: "default" | "compact";
  /** Heading level wrapping each question button. */
  headingLevel?: 3 | 4;
  /** Allow several answers open at once. Default true. */
  multiple?: boolean;
};

/** Accordion built from heading > button[aria-expanded] + region, per the WAI-ARIA pattern. */
export function FAQ({ items, variant = "default", headingLevel = 3, multiple = true }: FAQProps) {
  const id = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set());
  const Heading = `h${headingLevel}` as const;
  const visible = variant === "compact" ? items.slice(0, 5) : items;

  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(multiple ? current : []);
      if (current.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <div className={cx(styles.faq, styles[variant])}>
      {visible.map((item, index) => {
        const expanded = open.has(index);
        const buttonId = `${id}-q${index}`;
        const panelId = `${id}-a${index}`;
        return (
          <div key={item.question} className={styles.item}>
            <Heading className={styles.heading}>
              <button
                id={buttonId}
                type="button"
                className={styles.trigger}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(index)}
              >
                <span>{item.question}</span>
                <span className={styles.icon} aria-hidden="true">
                  <Icon name="plus" size={20} />
                </span>
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={styles.panel}
              hidden={!expanded}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
