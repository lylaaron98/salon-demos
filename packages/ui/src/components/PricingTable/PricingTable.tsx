"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "../../icons/Icon";
import { cx } from "../../lib/cx";
import { formatPrice } from "../../lib/format";
import { rovingIndex } from "../../lib/keyboard";
import { ButtonLink } from "../Button/Button";
import styles from "./PricingTable.module.css";

export type PricingRow = {
  service: string;
  /** One price per tier column, in S$. null = not offered at that tier. */
  prices: (number | null)[];
  /** Adds "from" to every price in the row. */
  from?: boolean;
};

export type PricingMenuProps = {
  variant: "menu";
  caption: string;
  /** Column headings, e.g. ["Stylist", "Senior", "Creative director"]. At most 4. */
  tiers: string[];
  categories: { name: string; rows: PricingRow[] }[];
  /** Label for the mobile tier switcher. */
  tierLabel?: string;
  note?: string;
};

export type PricingPlan = {
  name: string;
  price: number;
  /** e.g. "per session", "for 3 sessions", "a month". */
  unit: string;
  description: string;
  features: string[];
  featured?: boolean;
  featuredLabel?: string;
  cta: { label: string; href: string };
};

export type PricingTiersProps = {
  variant: "tiers";
  plans: PricingPlan[];
  headingLevel?: 3 | 4;
  note?: string;
};

export type PricingTableProps = PricingMenuProps | PricingTiersProps;

const GST_NOTE = "Prices include 9% GST.";

export function PricingTable(props: PricingTableProps) {
  return props.variant === "menu" ? <MenuList {...props} /> : <Tiers {...props} />;
}

function MenuList({
  caption,
  tiers,
  categories,
  tierLabel = "Choose a level",
  note = GST_NOTE,
}: PricingMenuProps) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabId = (i: number) => `${id}-tab-${i}`;
  const panelId = `${id}-panel`;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = rovingIndex(event.key, active, tiers.length);
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={styles.menu} data-active={active}>
      <div className={styles.tabs} role="tablist" aria-label={tierLabel}>
        {tiers.map((tier, i) => (
          <button
            key={tier}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            id={tabId(i)}
            type="button"
            role="tab"
            className={styles.tab}
            aria-selected={active === i}
            aria-controls={panelId}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
          >
            {tier}
          </button>
        ))}
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(active)} className={styles.panel}>
        <table className={styles.table}>
          <caption className={styles.caption}>{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className={styles.serviceCol}>
                Service
              </th>
              {tiers.map((tier, i) => (
                <th key={tier} scope="col" data-tier={i} className={styles.priceCol}>
                  {tier}
                </th>
              ))}
            </tr>
          </thead>
          {categories.map((category) => (
            <tbody key={category.name}>
              <tr>
                <th scope="colgroup" colSpan={tiers.length + 1} className={styles.category}>
                  {category.name}
                </th>
              </tr>
              {category.rows.map((row) => (
                <tr key={row.service} className={styles.row}>
                  <th scope="row" className={styles.service}>
                    {row.service}
                  </th>
                  {tiers.map((tier, i) => {
                    const price = row.prices[i];
                    return (
                      <td key={tier} data-tier={i} className={styles.price}>
                        {price === null || price === undefined ? (
                          <span aria-label="Not offered">–</span>
                        ) : price === 0 ? (
                          "Free"
                        ) : (
                          formatPrice(price, { from: row.from })
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}

function Tiers({ plans, headingLevel = 3, note = GST_NOTE }: PricingTiersProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div>
      <ul className={styles.plans}>
        {plans.map((plan) => (
          <li key={plan.name} className={cx(styles.plan, plan.featured && styles.featured)}>
            {plan.featured ? (
              <span className={styles.planBadge}>{plan.featuredLabel ?? "Most popular"}</span>
            ) : null}
            <Heading className={styles.planName}>{plan.name}</Heading>
            <p className={styles.planPrice}>
              <span className={styles.planAmount}>{formatPrice(plan.price)}</span>{" "}
              <span className={styles.planUnit}>{plan.unit}</span>
            </p>
            <p className={styles.planDescription}>{plan.description}</p>
            <ul className={styles.features}>
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Icon name="check" size={18} />
                  {feature}
                </li>
              ))}
            </ul>
            <ButtonLink
              href={plan.cta.href}
              variant={plan.featured ? "primary" : "secondary"}
              fullWidth
              className={styles.planCta}
            >
              {plan.cta.label}
            </ButtonLink>
          </li>
        ))}
      </ul>
      {note ? <p className={styles.note}>{note}</p> : null}
    </div>
  );
}
