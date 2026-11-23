import { brandIds } from "@salon-demos/tokens";
import { Icon } from "@salon-demos/ui";
import { directionsHref, formatTime12 } from "@salon-demos/ui/lib";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brandHref, brands, getBrand } from "@/content";
import type { AnalyticsContext } from "@/lib/analytics";
import { formatDateShort } from "@/lib/booking/availability";
import { readConfirmation } from "@/lib/booking/confirmation";
import { priceText, selectionEntries, type SearchParams } from "@/lib/booking/flow";
import { googleCalendarHref, outlookCalendarHref } from "@/lib/booking/ics";
import { readDone } from "@/lib/booking/session";
import styles from "../booking.module.css";
import { ContactLinks } from "../_components/ContactLinks";
import { CompleteTracker, SuccessHeading } from "../_components/SuccessClient";

type Props = {
  params: Promise<{ brand: string }>;
  searchParams: Promise<SearchParams>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return brandIds.map((brand) => ({ brand }));
}

export const metadata: Metadata = {
  title: "Booking confirmed",
  robots: { index: false, follow: false },
};

const duration = (minutes: number) =>
  minutes >= 60
    ? `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ""}`
    : `${minutes} min`;

/** Success state (brief §6.6). The URL carries the booking; the name comes from a short-lived cookie. */
export default async function ConfirmedPage({ params, searchParams }: Props) {
  const brand = getBrand((await params).brand);
  if (!brand) notFound();
  const confirmation = readConfirmation(brand, await searchParams);
  if (!confirmation) notFound();

  const { ref, selection, outlet, service, quote: q, event } = confirmation;
  const done = readDone(await cookies());
  const firstName = done?.ref === ref ? done.firstName : undefined;
  const member = brand.team.find((m) => m.slug === selection.staff);

  const query = new URLSearchParams([["ref", ref], ...selectionEntries(selection)]).toString();
  const icsHref = `/${brand.id}/book/calendar?${query}`;
  const context: AnalyticsContext = {
    brand: brand.id,
    page_type: "booking_confirmation",
    outlet_id: outlet.slug,
    service_id: service.slug,
    campaign_id: selection.offer,
  };
  const whatsappText = `Hi ${brand.shortName} ${outlet.area}, it's about my booking ${ref}: ${service.title} on ${formatDateShort(selection.date)}, ${formatTime12(selection.time)}. Sent from the website (demo).`;

  return (
    <main id="main" tabIndex={-1} className={styles.main}>
      <div className={styles.container}>
        <div className={styles.success}>
          <div aria-live="polite">
            <span className={styles.successIcon} aria-hidden="true">
              <Icon name="check" size={28} />
            </span>
            <SuccessHeading>You&apos;re booked{firstName ? `, ${firstName}` : ""}.</SuccessHeading>
          </div>
          <p className={styles.lead}>
            We&apos;d now send your confirmation by WhatsApp or SMS. This is a portfolio demo, so no
            real booking is made and no message is sent.
          </p>

          <div className={styles.successFacts}>
            <p>
              <span>
                <strong>{service.title}</strong> ·{" "}
                {q.offerLabel
                  ? `${priceText(q.payable, q.varies)} ${q.offerLabel.toLowerCase()}`
                  : priceText(q.payable, q.varies)}
              </span>
            </p>
            <p className={styles.fact}>
              <Icon name="clock" size={18} />
              <span>
                {formatDateShort(selection.date)} · {formatTime12(selection.time)} (
                {duration(service.durationMin)})
              </span>
            </p>
            <p className={styles.fact}>
              <Icon name="pin" size={18} />
              <span>
                {brand.shortName} · {outlet.area}, {outlet.address}{" "}
                <a
                  className={styles.inlineLink}
                  href={directionsHref(`${outlet.address}, Singapore ${outlet.postalCode}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directions<span className={styles.vh}> (opens Google Maps)</span>
                </a>
              </span>
            </p>
            {member ? <p>With {member.name}</p> : null}
            <p>
              Ref: <span className={styles.ref}>{ref}</span>
            </p>
          </div>

          <div className={styles.successActions}>
            <details className={styles.calendar}>
              <summary className={styles.calendarSummary}>
                <Icon name="plus" />
                Add to calendar
                <Icon name="chevronDown" />
              </summary>
              <ul className={styles.calendarMenu}>
                <li>
                  <a href={googleCalendarHref(event)} target="_blank" rel="noopener noreferrer">
                    Google Calendar<span className={styles.vh}> (opens in a new tab)</span>
                  </a>
                </li>
                <li>
                  <a href={icsHref} download={`${brand.id}-${ref}.ics`}>
                    Apple Calendar (.ics)
                  </a>
                </li>
                <li>
                  <a href={icsHref} download={`${brand.id}-${ref}.ics`}>
                    Outlook (.ics)
                  </a>
                </li>
                <li>
                  <a href={outlookCalendarHref(event)} target="_blank" rel="noopener noreferrer">
                    Outlook.com<span className={styles.vh}> (opens in a new tab)</span>
                  </a>
                </li>
              </ul>
            </details>
            <ContactLinks
              phone={outlet.phone}
              whatsapp={outlet.whatsapp}
              whatsappText={whatsappText}
              whatsappLabel="WhatsApp us about this booking"
              location="success"
              context={context}
            />
          </div>

          <section className={styles.expect} aria-labelledby="expect-title">
            <h2 id="expect-title">What to expect</h2>
            <ul>
              <li>Arrive 10 minutes early so there&apos;s time to settle in.</li>
              <li>Getting there: {outlet.mrt}.</li>
              <li>
                Need to change? WhatsApp us; changes and cancellations are free up to 24 hours
                before.
              </li>
            </ul>
          </section>

          <section className={styles.sister} aria-labelledby="sister-title">
            <h2 id="sister-title">While you&apos;re here</h2>
            <ul>
              {brands
                .filter((b) => b.id !== brand.id)
                .map((b) => (
                  <li key={b.id}>
                    <Link className={styles.inlineLink} href={brandHref(b.id)}>
                      {b.name}: {b.tagline} <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </div>

      <CompleteTracker bookingRef={ref} context={context} value={q.payable} isTrial={q.isTrial} />
    </main>
  );
}
