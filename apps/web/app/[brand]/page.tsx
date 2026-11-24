import {
  ButtonLink,
  FAQ,
  Hero,
  OutletCard,
  PricingTable,
  PromoBanner,
  ServiceCard,
  StaffCard,
  StickyBookBar,
  Testimonial,
} from "@salon-demos/ui";
import { whatsappHref } from "@salon-demos/ui/lib";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { bookHref, brandHref, getBrand, group, whatsappText } from "@/content";
import { type Photo, photos } from "@/content/media";
import { brandGraph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "../_components/JsonLd";
import styles from "./brand.module.css";

type Props = { params: Promise<{ brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = getBrand((await params).brand);
  if (!brand) return {};
  const title = `${brand.name}: ${brand.tagline}`;
  return pageMetadata({
    title: `${title} | ${group.name} (demo)`,
    absoluteTitle: true,
    socialTitle: title,
    description: brand.description,
    path: brandHref(brand.id),
  });
}

function Section({
  id,
  title,
  intro,
  action,
  tone,
  narrow,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  action?: { label: string; href: string };
  tone?: "subtle";
  narrow?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={tone === "subtle" ? styles.sectionSubtle : styles.section}
    >
      <div className={narrow ? styles.containerNarrow : styles.container}>
        <div className={styles.sectionHead}>
          <div>
            <h2 id={`${id}-title`} className={styles.sectionTitle}>
              {title}
            </h2>
            {intro ? <p className={styles.sectionIntro}>{intro}</p> : null}
          </div>
          {action ? (
            <a className={styles.sectionAction} href={action.href}>
              {action.label} <span aria-hidden="true">→</span>
            </a>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Brand home, following the brief's home template (section 5.1). */
export default async function BrandHomePage({ params }: Props) {
  const brand = getBrand((await params).brand);
  if (!brand) notFound();

  const home = brandHref(brand.id);
  const book = bookHref(brand.id);
  const media = photos[brand.id];

  return (
    <>
      <main id="main" tabIndex={-1} className={styles.main}>
        <JsonLd data={brandGraph(SITE_URL, group, brand)} />
        <Hero
          eyebrow={brand.hero.eyebrow}
          title={brand.hero.title}
          lead={brand.hero.lead}
          primaryCta={{ label: brand.primaryCta, href: book }}
          secondaryCta={{ label: brand.hero.secondaryCta, href: `${home}#pricing` }}
          trust={brand.hero.trust}
          media={
            <Image
              src={media.hero.id}
              alt={media.hero.alt}
              fill
              preload
              quality={65}
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          }
        />

        <div id="offer" className={styles.anchor}>
          <PromoBanner
            eyebrow={brand.promo.eyebrow}
            title={brand.promo.title}
            body={brand.promo.body}
            cta={{ label: brand.promo.cta, href: bookHref(brand.id, { offer: "first-visit" }) }}
          />
        </div>

        <Section
          id="services"
          title="Signature services"
          action={{ label: "View all prices", href: `${home}#pricing` }}
        >
          <ul className={styles.serviceGrid}>
            {brand.services.map((service) => (
              <li key={service.slug}>
                <ServiceCard
                  title={service.title}
                  description={service.summary}
                  durationMin={service.durationMin}
                  priceFrom={service.priceFrom}
                  priceVaries={service.priceVaries}
                  href={`${home}#pricing`}
                  bookHref={bookHref(brand.id, { service: service.slug })}
                  badge={service.badge}
                  image={photoOf(media.services[service.slug], SERVICE_SIZES)}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="pricing" title={brand.pricing.title} intro={brand.pricing.intro} tone="subtle">
          <PricingTable {...brand.pricing.table} />
        </Section>

        <Section id="why" title={`Why ${brand.shortName}`}>
          <ul className={styles.whyGrid}>
            {brand.whyUs.map((item, index) => (
              <li key={item.title} className={styles.why}>
                <span className={styles.whyMark} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyBody}>{item.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="team"
          title="Meet the team"
          intro="Every name is fictional (demo team). Photos are free stock images."
        >
          <ul className={styles.teamRail} aria-label={`Our ${brand.teamNoun}`}>
            {brand.team.map((member) => (
              <li key={member.slug}>
                <StaffCard
                  name={member.name}
                  role={member.role}
                  specialities={member.specialities}
                  languages={member.languages}
                  outlet={member.outlet}
                  bookHref={bookHref(brand.id, { stylist: member.slug })}
                  image={photoOf(media.team[member.slug], TEAM_SIZES)}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="reviews" title="What clients say" tone="subtle">
          <ul className={styles.threeGrid}>
            {brand.testimonials.map((t) => (
              <li key={t.name}>
                <Testimonial quote={t.quote} name={t.name} service={t.service} rating={t.rating} />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="outlets" title="Outlets" intro="Fictional addresses for this demo.">
          <ul className={styles.threeGrid}>
            {brand.outlets.map((outlet) => (
              <li
                key={outlet.slug}
                data-contact-location="outlet_card"
                data-outlet-id={outlet.slug}
              >
                <OutletCard
                  variant="compact"
                  name={`${brand.shortName} · ${outlet.area}`}
                  address={outlet.address}
                  postalCode={outlet.postalCode}
                  mrt={outlet.mrt}
                  hours={outlet.hours}
                  phone={outlet.phone}
                  whatsapp={outlet.whatsapp}
                  whatsappText={whatsappText(brand, outlet.area)}
                  bookHref={bookHref(brand.id, { outlet: outlet.slug })}
                  image={photoOf(media.outlets[outlet.slug], THREE_UP_SIZES)}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section id="faq" title="Questions, answered" narrow>
          <FAQ items={brand.faqs} variant="compact" />
        </Section>

        <section className={styles.ctaBand} aria-labelledby="closing-title">
          <div className={styles.container} data-contact-location="cta_band">
            <h2 id="closing-title" className={styles.ctaTitle}>
              {brand.closing.title}
            </h2>
            <p className={styles.ctaBody}>{brand.closing.body}</p>
            <div className={styles.ctaActions}>
              <ButtonLink href={book} onInverse size="lg">
                Book now
              </ButtonLink>
              <ButtonLink
                href={whatsappHref(brand.contact.whatsapp, whatsappText(brand))}
                variant="whatsapp"
                icon="chat"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp us
              </ButtonLink>
            </div>
          </div>
        </section>
      </main>

      {/* display: contents, so the bar stays fixed to the viewport. */}
      <div data-contact-location="sticky" style={{ display: "contents" }}>
        <StickyBookBar
          bookHref={book}
          phone={brand.contact.phone}
          whatsapp={brand.contact.whatsapp}
          whatsappText={whatsappText(brand)}
          spacer={false}
        />
      </div>
    </>
  );
}

/** Grid widths, so the browser picks the smallest file that stays sharp. */
const SERVICE_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";
const TEAM_SIZES = "(min-width: 1024px) 25vw, 70vw";
const THREE_UP_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

/**
 * A card photo below the fold: lazy-loaded, with empty alt because the card's
 * heading already names the service, person or outlet. No photo, no image: the
 * card keeps its gradient placeholder.
 */
function photoOf(photo: Photo | undefined, sizes: string): ReactNode {
  return photo ? <Image src={photo.id} alt="" fill sizes={sizes} /> : undefined;
}
