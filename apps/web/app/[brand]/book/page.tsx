import { brandIds } from "@salon-demos/tokens";
import { Icon } from "@salon-demos/ui";
import { summariseHours } from "@salon-demos/ui/lib";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getBrand, type Brand } from "@/content";
import type { AnalyticsContext } from "@/lib/analytics";
import { BRAND_CARD_ALT, pageMetadata } from "@/lib/seo/metadata";
import {
  bookingDates,
  dateParts,
  daysAhead,
  formatDateLong,
  formatDateShort,
  getSlots,
  isClosed,
  isTime,
  nearestSlots,
} from "@/lib/booking/availability";
import {
  BLOCKED_MESSAGES,
  STEPS,
  bookUrl,
  bookingWhatsappText,
  entrySource,
  first,
  parseSelection,
  priceText,
  quote,
  resolveFlow,
  selectionEntries,
  slotText,
  staffFor,
  type ResolvedFlow,
  type SearchParams,
} from "@/lib/booking/flow";
import { formatMobile } from "@/lib/booking/schema";
import { readDetails } from "@/lib/booking/session";
import styles from "./booking.module.css";
import { BookingTracker } from "./_components/BookingTracker";
import { ConfirmStep } from "./_components/ConfirmStep";
import { ContactLinks } from "./_components/ContactLinks";
import { DetailsStep } from "./_components/DetailsStep";
import { OutletStep } from "./_components/OutletStep";
import { ServiceStep } from "./_components/ServiceStep";
import { Stepper } from "./_components/Stepper";
import { Summary, type SummaryRow } from "./_components/Summary";
import { TimeStep } from "./_components/TimeStep";

type Props = {
  params: Promise<{ brand: string }>;
  searchParams: Promise<SearchParams>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return brandIds.map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = getBrand((await params).brand);
  if (!brand) return {};
  // Every step and selection is a query-string variant of one thin page: keep it out of the index.
  return pageMetadata({
    title: "Book",
    description: `Book an appointment at ${brand.name} (fictional demo, no real bookings).`,
    path: `/${brand.id}/book`,
    noindex: true,
    image: { path: `/${brand.id}/opengraph-image`, alt: BRAND_CARD_ALT },
  });
}

const LEADS: Record<string, string> = {
  outlet: "Every outlet offers the full menu at the same prices.",
  service: "Prices include 9% GST. You pay at the outlet, after your appointment.",
  time: "Times are Singapore time. Only free slots are shown.",
  details: "Just what we need to confirm your booking. No account needed.",
  confirm: "Check everything looks right, then confirm.",
};

const duration = (minutes: number) =>
  minutes >= 60
    ? `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ""}`
    : `${minutes} min`;

/** "Therapist" from "therapists", "Scalp coach" from "scalp coaches". */
const staffLabel = (brand: Brand) => {
  const singular = brand.teamNoun.replace(/(?<=ch|sh|x|s)es$|s$/, "");
  return singular.charAt(0).toUpperCase() + singular.slice(1);
};

function summaryRows(brand: Brand, flow: ResolvedFlow, hrefs: string[]): SummaryRow[] {
  const { outlet, service, quote: q, selection, complete } = flow;
  const rows: SummaryRow[] = [];
  if (outlet) {
    rows.push({
      label: "Outlet",
      value: `${brand.shortName} · ${outlet.area}`,
      detail: outlet.address,
      editHref: hrefs[0],
    });
  }
  if (service && q) {
    rows.push({
      label: "Service",
      value: service.title,
      detail: `${duration(service.durationMin)} · ${priceText(q.list, service.priceVaries)}`,
      editHref: hrefs[1],
    });
    if (q.offerLabel) {
      rows.push({ label: "Offer", value: `${q.offerLabel}: ${priceText(q.payable, q.varies)}` });
    }
  }
  if (complete[2] && selection.date && selection.time) {
    const member = brand.team.find((m) => m.slug === selection.staff);
    rows.push({
      label: "Date and time",
      value: slotText(selection.date, selection.time),
      detail: member ? `with ${member.name}` : `${staffLabel(brand)}: any available`,
      editHref: hrefs[2],
    });
  }
  return rows;
}

export default async function BookPage({ params, searchParams }: Props) {
  const brand = getBrand((await params).brand);
  if (!brand) notFound();

  const query = await searchParams;
  const now = new Date();
  const details = readDetails(await cookies());
  const flow = resolveFlow({
    brand,
    selection: parseSelection(brand, query),
    requested: first(query.step),
    hasDetails: !!details,
    now,
  });
  const { selection, outlet, service, quote: q } = flow;
  const step = STEPS[flow.index]!;
  const hrefs = STEPS.map((s) => bookUrl(brand.id, selection, s.id));
  const backHref = flow.index > 0 ? hrefs[flow.index - 1] : undefined;
  const entries = selectionEntries(selection);
  const without = (...keys: string[]) => entries.filter(([key]) => !keys.includes(key));

  const context: AnalyticsContext = {
    brand: brand.id,
    page_type: "booking",
    outlet_id: selection.outlet,
    service_id: selection.service,
    campaign_id: selection.offer,
  };
  const contact = {
    phone: outlet?.phone ?? brand.contact.phone,
    whatsapp: outlet?.whatsapp ?? brand.contact.whatsapp,
    whatsappText: bookingWhatsappText(brand, flow),
  };

  const rows = summaryRows(brand, flow, hrefs);
  const total = q
    ? { label: "Total payable at outlet", value: priceText(q.payable, q.varies) }
    : undefined;
  const note = "Free cancellation up to 24 h before. Demo only: no real booking is made.";
  const chipText = rows
    .filter((row) => row.label !== "Offer")
    .map((row) => (row.label === "Outlet" ? `${brand.shortName} ${outlet?.area}` : row.value))
    .join(" · ");

  let panel: ReactNode;

  if (step.id === "outlet") {
    panel = (
      <OutletStep
        brandId={brand.id}
        selected={selection.outlet}
        hidden={without("outlet")}
        context={context}
        outlets={[...brand.outlets]
          .sort((a, b) => a.area.localeCompare(b.area))
          .map((o) => ({
            slug: o.slug,
            name: `${brand.shortName} · ${o.area}`,
            address: `${o.address}, Singapore ${o.postalCode}`,
            mrt: o.mrt,
            hours: summariseHours(o.hours)
              .map((r) => `${r.days} ${r.time}`)
              .join(" · "),
          }))}
      />
    );
  } else if (step.id === "service") {
    panel = (
      <ServiceStep
        brandId={brand.id}
        selected={selection.service}
        hidden={without("service")}
        backHref={backHref!}
        context={context}
        services={brand.services.map((s) => {
          const sq = quote(brand, s, selection.offer);
          return {
            slug: s.slug,
            title: s.title,
            category: s.category,
            summary: s.summary,
            duration: duration(s.durationMin),
            price: priceText(sq.payable, sq.varies),
            was: sq.offerLabel ? priceText(sq.list, s.priceVaries) : undefined,
            payable: sq.payable,
            badge: sq.offerLabel ?? s.badge,
          };
        })}
      />
    );
  } else if (step.id === "time" && outlet && service && q) {
    const dates = bookingDates(now);
    const slotsFor = (date: string) =>
      getSlots({
        outletSlug: outlet.slug,
        hours: outlet.hours,
        date,
        durationMin: service.durationMin,
        now,
      });
    const open = dates.filter((d) => !isClosed(outlet.hours, d));
    const selectedDate =
      selection.date && open.includes(selection.date)
        ? selection.date
        : (open.find((d) => slotsFor(d).length > 0) ?? open[0] ?? dates[0]!);
    const slots = slotsFor(selectedDate);
    const takenParam = first(query.taken);
    const taken =
      takenParam && isTime(takenParam) && !slots.includes(takenParam)
        ? {
            time: takenParam,
            alternatives: nearestSlots(slots, takenParam).map((time) => ({
              time,
              href: bookUrl(brand.id, { ...selection, date: selectedDate, time }, "time"),
            })),
          }
        : undefined;

    panel = (
      <TimeStep
        brandId={brand.id}
        hidden={without("date", "time", "staff")}
        backHref={backHref!}
        dates={dates.map((date) => {
          const parts = dateParts(date);
          return {
            date,
            weekday: parts.weekday,
            day: parts.day,
            label: formatDateLong(date),
            closed: isClosed(outlet.hours, date),
            href: bookUrl(brand.id, { ...selection, date, time: undefined }, "time"),
          };
        })}
        rangeText={`Next two weeks: ${formatDateShort(dates[0]!)} to ${formatDateShort(dates.at(-1)!)}`}
        selectedDate={selectedDate}
        selectedDateText={formatDateShort(selectedDate)}
        daysAhead={daysAhead(selectedDate, now)}
        slots={slots}
        selectedTime={selection.date === selectedDate ? selection.time : undefined}
        taken={taken}
        staff={staffFor(brand, outlet).map((m) => ({ slug: m.slug, name: m.name, role: m.role }))}
        selectedStaff={selection.staff}
        staffLabel={staffLabel(brand)}
        priceText={priceText(q.payable, q.varies)}
        contact={contact}
        context={context}
      />
    );
  } else if (step.id === "details") {
    panel = (
      <DetailsStep
        brandId={brand.id}
        brandName={brand.name}
        hidden={entries}
        backHref={backHref!}
        defaults={
          details
            ? {
                firstName: details.firstName,
                mobile: formatMobile(details.mobile),
                email: details.email,
                notes: details.notes,
                marketing: details.marketing,
              }
            : undefined
        }
        contact={contact}
        context={context}
      />
    );
  } else if (step.id === "confirm" && details && q) {
    const review: SummaryRow[] = [
      ...rows,
      {
        label: "Your details",
        value: details.firstName,
        detail: [formatMobile(details.mobile), details.email].filter(Boolean).join(" · "),
        editHref: hrefs[3],
        editLabel: "your details",
      },
    ];
    if (details.notes)
      review.push({ label: "Notes", value: details.notes, editHref: hrefs[3], editLabel: "notes" });
    panel = (
      <ConfirmStep
        brandId={brand.id}
        hidden={entries}
        backHref={backHref!}
        value={q.payable}
        summary={`${priceText(q.payable, q.varies)} · ${selection.date && selection.time ? slotText(selection.date, selection.time) : ""}`}
        contact={contact}
        context={context}
      >
        <dl className={styles.review}>
          {review.map((row) => (
            <div key={row.label} className={styles.reviewRow}>
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
                <dd className={styles.reviewEdit}>
                  <a className={styles.inlineLink} href={row.editHref}>
                    Edit
                    <span className={styles.vh}> {row.editLabel ?? row.label.toLowerCase()}</span>
                  </a>
                </dd>
              ) : null}
            </div>
          ))}
          <div className={styles.reviewRow}>
            <dt>Total payable at outlet</dt>
            <dd>
              {priceText(q.payable, q.varies)}
              <br />
              <span className={styles.summaryNote}>Includes 9% GST</span>
            </dd>
          </div>
        </dl>
      </ConfirmStep>
    );
  }

  return (
    <main id="main" tabIndex={-1} className={styles.main}>
      <div className={styles.container}>
        <div className={styles.flowHead}>
          <p className={styles.eyebrow}>{brand.name} · Online booking (demo)</p>
          <p className={styles.help}>
            Need help?
            <ContactLinks
              {...contact}
              location="booking_header"
              context={context}
              variant="inline"
            />
          </p>
        </div>

        <Stepper index={flow.index} complete={flow.complete} hrefs={hrefs} />

        {rows.length > 0 ? (
          <details className={styles.summaryChip}>
            <summary>
              <span className={styles.summaryChipText}>
                <span className={styles.vh}>Booking summary: </span>
                {chipText}
              </span>
              <Icon name="chevronDown" />
            </summary>
            <Summary rows={rows} total={total} note={note} headingLevel="p" />
          </details>
        ) : null}

        <div className={styles.layout}>
          <section className={styles.panel} aria-labelledby="step-title">
            <h1 id="step-title" className={styles.title} tabIndex={-1}>
              {step.title}
            </h1>
            <p className={styles.lead}>{LEADS[step.id]}</p>
            {flow.blocked ? (
              <p className={styles.notice} role="alert">
                {BLOCKED_MESSAGES[step.id]}
              </p>
            ) : null}
            {panel}
          </section>

          <aside className={styles.summary} aria-label="Booking summary">
            <Summary rows={rows} total={total} note={note} />
          </aside>
        </div>
      </div>

      <BookingTracker
        context={context}
        stepNumber={flow.index + 1}
        stepName={step.id}
        entrySource={entrySource(query)}
      />
    </main>
  );
}
