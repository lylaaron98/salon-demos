import {
  Button,
  ButtonLink,
  FAQ,
  Footer,
  Header,
  Hero,
  OutletCard,
  PricingTable,
  PromoBanner,
  ServiceCard,
  StaffCard,
  StickyBookBar,
  Testimonial,
  type OpeningHours,
} from "@salon-demos/ui";
import type { Metadata } from "next";
import Image from "next/image";
import { group } from "@/content";
import { type Photo, photos } from "@/content/media";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import { GROUP_CARD_ALT, pageMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "../_components/JsonLd";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandSwitcher } from "./brand-switcher";
import styles from "./components.module.css";
import { LoadingDemo } from "./loading-demo";

export const metadata: Metadata = pageMetadata({
  title: "Components",
  description:
    "Every shared UI component from @salon-demos/ui, rendered under a brand switcher. All copy is fictional demo content.",
  path: "/components",
  image: { path: "/opengraph-image", alt: GROUP_CARD_ALT },
});

// Sample content. Every name, number and address is fictional.
const PHONE = "+65 6100 0000";
const WHATSAPP = "+65 8100 0000";

const HOURS: OpeningHours = {
  mon: { open: "10:00", close: "21:00" },
  tue: { open: "10:00", close: "21:00" },
  wed: { open: "10:00", close: "21:00" },
  thu: { open: "10:00", close: "21:00" },
  fri: { open: "10:00", close: "21:00" },
  sat: { open: "09:00", close: "19:00" },
  sun: null,
};

const BRANDS = [
  { label: "Sable & Shear", href: "#header", current: true },
  { label: "Dewlab", href: "#header" },
  { label: "Rootwell", href: "#header" },
];

const NAV = [
  { label: "Services", href: "#services", current: true },
  { label: "Pricing", href: "#pricing" },
  { label: "Our team", href: "#team" },
  { label: "Outlets", href: "#outlets" },
  { label: "Offers", href: "#promo" },
];

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-heading`}>
      <div className={styles.sectionHead}>
        <h2 id={`${id}-heading`} className={styles.sectionTitle}>
          {title}
        </h2>
        {note ? <p className={styles.note}>{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function ComponentsPage() {
  return (
    <main id="showcase" className={styles.page}>
      <JsonLd
        data={graph([
          breadcrumbNode(SITE_URL, [
            { name: group.name, path: "/" },
            { name: "Components", path: "/components" },
          ]),
        ])}
      />
      <header className={styles.intro}>
        <p className={styles.back}>
          <Link href="/">Back to Orrin Collective</Link> · <Link href="/tokens">Design tokens</Link>
        </p>
        <h1 className={styles.title}>Components</h1>
        <p className={styles.lede}>
          Shared components from <code>@salon-demos/ui</code>. They read only semantic token
          variables, so switching <code>data-brand</code> re-themes them with no extra code.
        </p>
      </header>

      <BrandSwitcher>
        <Section
          id="buttons"
          title="Button"
          note="Primary, secondary, ghost, WhatsApp and call; sm 44px, md 48px, lg 56px."
        >
          <div className={styles.row}>
            <Button>Book now</Button>
            <Button variant="secondary">View services</Button>
            <Button variant="ghost">Read more</Button>
            <ButtonLink href="#buttons" variant="whatsapp" icon="chat">
              WhatsApp us
            </ButtonLink>
            <ButtonLink href="#buttons" variant="call" icon="phone">
              Call
            </ButtonLink>
          </div>
          <div className={styles.row}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button icon="phone" iconOnly variant="secondary">
              Call the studio
            </Button>
            <Button loading>Saving</Button>
            <Button disabled>Fully booked</Button>
            <LoadingDemo />
          </div>
          <div className={styles.inverseRow}>
            <Button onInverse>Book now</Button>
            <Button onInverse variant="secondary">
              WhatsApp us
            </Button>
            <Button onInverse variant="ghost">
              Privacy policy
            </Button>
          </div>
        </Section>

        <Section
          id="header"
          title="Header"
          note="Below 1024px: menu button opens a focus-trapped drawer (Esc or scrim to close)."
        >
          <div className={styles.frame}>
            <Header
              brandName="Sable & Shear"
              homeHref="#header"
              nav={NAV}
              cta={{ label: "Book now", href: "#buttons" }}
              phone={PHONE}
              whatsapp={WHATSAPP}
              group={{ name: "Orrin Collective", href: "/" }}
              brands={BRANDS}
              findOutletHref="#outlets"
              skipTo="#hero"
            />
            <div className={styles.frameBody}>Page content scrolls under the header.</div>
          </div>
        </Section>

        <Section
          id="hero"
          title="Hero"
          note="image-split (4:5 desktop, 4:3 mobile) and image-full."
        >
          <div className={styles.frame}>
            <Hero
              eyebrow="Hair atelier"
              title="Cut with intent."
              lead="Precision cuts and considered colour from senior stylists who listen first. Fixed prices, no surprises."
              primaryCta={{ label: "Book a stylist", href: "#buttons" }}
              secondaryCta={{ label: "See prices", href: "#pricing" }}
              trust={["4.9 ★ from 1,200+ reviews (demo)", "No hard-selling", "S$ fixed pricing"]}
              ctaId="showcase-hero-cta"
              media={showcase(photos.sable.hero, "(min-width: 1024px) 50vw, 100vw", true)}
            />
          </div>
          <div className={styles.frame}>
            <Hero
              variant="full"
              eyebrow="First visit"
              title="Your first facial, S$48."
              lead="Skin analysis included. We analyse first, then recommend."
              primaryCta={{ label: "Book my first facial", href: "#buttons" }}
              secondaryCta={{ label: "How it works", href: "#faq" }}
              trust={["Limited to the first 200 sign-ups this month"]}
              ctaId="showcase-hero-full-cta"
              media={showcase(photos.dewlab.hero, "100vw", true)}
            />
          </div>
        </Section>

        <Section
          id="services"
          title="Service card"
          note="Responsive (horizontal under 768px), vertical, featured and horizontal."
        >
          <ul className={styles.grid4}>
            <li>
              <ServiceCard
                title="Precision cut"
                description="Consultation, wash, cut and finish, tailored to how you actually wear your hair."
                durationMin={60}
                priceFrom={88}
                href="#services"
                bookHref="#buttons"
                image={showcase(photos.sable.services["precision-cut"], CARD)}
              />
            </li>
            <li>
              <ServiceCard
                title="Hand-painted balayage"
                description="Soft, lived-in colour painted freehand for a grow-out that looks good for months."
                durationMin={180}
                priceFrom={268}
                href="#services"
                variant="vertical"
                image={showcase(photos.sable.services["hand-painted-balayage"], CARD)}
              />
            </li>
            <li>
              <ServiceCard
                title="Gloss and tone"
                description="A quick refresh of shine and tone between colour appointments."
                durationMin={45}
                priceFrom={98}
                href="#services"
                variant="featured"
                badge="Most booked"
                image={showcase(photos.sable.services["root-colour"], CARD)}
              />
            </li>
            <li>
              <ServiceCard
                title="Scalp check"
                description="Twenty minutes under the scope, then a plain-English summary."
                durationMin={20}
                priceFrom={0}
                href="#services"
                variant="horizontal"
                image={showcase(photos.rootwell.services["scalp-check"], CARD)}
              />
            </li>
          </ul>
        </Section>

        <Section
          id="pricing"
          title="Pricing table"
          note="menu-list (tabs switch tiers on mobile; never scrolls sideways) and tiers."
        >
          <PricingTable
            variant="menu"
            caption="Hair services by stylist level"
            tierLabel="Stylist level"
            tiers={["Stylist", "Senior", "Creative director"]}
            categories={[
              {
                name: "Cut and style",
                rows: [
                  { service: "Precision cut", prices: [88, 118, 158] },
                  { service: "Fringe tidy", prices: [25, 30, 40] },
                ],
              },
              {
                name: "Colour",
                rows: [
                  { service: "Root colour", prices: [168, 198, 248], from: true },
                  { service: "Hand-painted balayage", prices: [268, 328, 398], from: true },
                ],
              },
            ]}
          />
          <div className={styles.spaced}>
            <PricingTable
              variant="tiers"
              plans={[
                {
                  name: "Single",
                  price: 138,
                  unit: "per session",
                  description: "One signature facial with skin analysis.",
                  features: ["75 minutes", "Skin analysis included"],
                  cta: { label: "Book a single", href: "#buttons" },
                },
                {
                  name: "3-session course",
                  price: 368,
                  unit: "for 3 sessions",
                  description: "Best for visible change over six to eight weeks.",
                  features: ["Save S$46", "Progress photos (private)", "Free rescheduling"],
                  featured: true,
                  cta: { label: "Start a course", href: "#buttons" },
                },
                {
                  name: "Membership",
                  price: 118,
                  unit: "a month",
                  description: "One facial every month, cancel any time.",
                  features: ["Members' prices on add-ons", "Priority booking"],
                  cta: { label: "Join", href: "#buttons" },
                },
              ]}
            />
          </div>
        </Section>

        <Section
          id="promo"
          title="Promo banner"
          note="Announcement bar (dismissed for 7 days), inline band and card."
        >
          <div className={styles.stack}>
            <PromoBanner
              variant="announcement"
              title="First visit?"
              body="20% off colour services this month."
              cta={{ label: "See the offer", href: "#promo" }}
              storageKey="showcase:announcement"
            />
            <PromoBanner
              eyebrow="First visit"
              title="20% off colour services"
              body="New clients only, until 31 December. Demo offer."
              cta={{ label: "See offer", href: "#promo" }}
            />
            <div className={styles.narrow}>
              <PromoBanner
                variant="card"
                title="Scalp check, free"
                body="Twenty minutes, no obligation."
                cta={{ label: "Book a free check", href: "#promo" }}
              />
            </div>
          </div>
        </Section>

        <Section
          id="testimonials"
          title="Testimonial"
          note="Grid card and single quote. Content only, no review schema."
        >
          <ul className={styles.grid3}>
            <li>
              <Testimonial
                quote="She asked how I style it on a normal Tuesday, then cut for that. Six weeks on it still falls right."
                name="Mei L."
                service="Precision cut"
                rating={5}
              />
            </li>
            <li>
              <Testimonial
                quote="No upselling at all. They explained what my skin needed and what it did not."
                name="Nadia R."
                service="Signature facial"
                rating={5}
              />
            </li>
            <li>
              <Testimonial
                quote="I was sceptical. The scalp check was quick and the advice was practical."
                name="Arjun K."
                service="Scalp check"
                rating={4}
              />
            </li>
          </ul>
          <div className={styles.spaced}>
            <Testimonial
              variant="quote"
              quote="The calmest hour of my month, and my colour has never looked this considered."
              name="Clara T."
              service="Balayage"
            />
          </div>
        </Section>

        <Section
          id="team"
          title="Staff card"
          note="Profile (4:5 portrait) and compact (64px avatar). Demo team only."
        >
          <ul className={styles.grid4}>
            <li>
              <StaffCard
                name="Elena Tan"
                role="Creative director"
                specialities={["Balayage", "Bridal"]}
                languages={["English", "中文"]}
                outlet="Tiong Bahru"
                bookHref="#buttons"
                image={showcase(photos.sable.team["elena-tan"], CARD)}
              />
            </li>
            <li>
              <StaffCard
                name="Farah Ismail"
                role="Senior stylist"
                specialities={["Curly cuts", "Colour correction"]}
                languages={["English", "Bahasa Melayu"]}
                outlet="Tanjong Pagar"
                bookHref="#buttons"
                image={showcase(photos.sable.team["farah-ismail"], CARD)}
              />
            </li>
          </ul>
          <div className={styles.row}>
            <StaffCard
              variant="compact"
              name="Priya Nair"
              role="Senior therapist"
              image={showcase(photos.dewlab.team["priya-nair"], "64px")}
            />
            <StaffCard
              variant="compact"
              name="Daniel Ong"
              role="Scalp coach"
              image={showcase(photos.rootwell.team["daniel-ong"], "64px")}
            />
          </div>
        </Section>

        <Section
          id="outlets"
          title="Outlet card"
          note="List (3:2 image, weekly hours) and compact. Open status is computed in the browser."
        >
          <ul className={styles.grid3}>
            <li>
              <OutletCard
                name="Sable & Shear · Tiong Bahru"
                address="18 Example Walk, #01-12"
                postalCode="160018"
                mrt="4 min walk from Tiong Bahru MRT (EW17)"
                hours={HOURS}
                phone="+65 6101 0000"
                whatsapp="+65 8101 0000"
                whatsappText="Hi Sable & Shear Tiong Bahru, I'd like to book. Sent from website"
                bookHref="#buttons"
                image={showcase(photos.sable.outlets["tiong-bahru"], CARD)}
              />
            </li>
            <li>
              <OutletCard
                variant="compact"
                name="Sable & Shear · Tanjong Pagar"
                address="72 Sample Street, #02-05"
                postalCode="088472"
                mrt="3 min walk from Tanjong Pagar MRT (EW15)"
                hours={HOURS}
                phone="+65 6102 0000"
                whatsapp="+65 8102 0000"
                bookHref="#buttons"
              />
            </li>
          </ul>
        </Section>

        <Section
          id="faq"
          title="FAQ accordion"
          note="Heading > button[aria-expanded] controlling a region."
        >
          <div className={styles.narrow}>
            <FAQ
              items={[
                {
                  question: "How far ahead should I book?",
                  answer:
                    "Weekday slots are usually free within a few days. Weekends fill about two weeks ahead.",
                },
                {
                  question: "Can I choose my stylist?",
                  answer:
                    "Yes. Pick a name when you book, or choose any available stylist at your level.",
                },
                {
                  question: "Do prices include GST?",
                  answer: "Yes. Every price shown includes 9% GST.",
                },
              ]}
            />
          </div>
        </Section>

        <Section
          id="footer"
          title="Footer"
          note="Four columns on desktop; Services and Join become accordions on mobile."
        >
          <Footer
            id="showcase-footer"
            brandName="Sable & Shear"
            homeHref="#footer"
            blurb="A hair atelier for considered cuts and colour. Fictional demo brand."
            social={[
              { label: "Instagram (demo)", href: "#footer", icon: "camera" },
              { label: "YouTube (demo)", href: "#footer", icon: "play" },
            ]}
            services={[
              { label: "Cuts", href: "#services" },
              { label: "Colour", href: "#services" },
              { label: "Balayage", href: "#services" },
            ]}
            outlets={[
              { name: "Tiong Bahru", phone: "+65 6101 0000" },
              { name: "Tanjong Pagar", phone: "+65 6102 0000" },
            ]}
            hours={["Mon–Fri 10 am–9 pm", "Sat 9 am–7 pm", "Sun closed"]}
            group={{ label: "Orrin Collective", href: "/" }}
            sisterBrands={[
              { label: "Dewlab Skin Studio", href: "#footer" },
              { label: "Rootwell", href: "#footer" },
            ]}
            legal={[
              { label: "Privacy policy", href: "#footer" },
              { label: "Terms", href: "#footer" },
              { label: "Accessibility", href: "#footer" },
            ]}
            copyright="© 2026 Orrin Collective (fictional demo). No real bookings are made."
          />
        </Section>

        <Section
          id="sticky"
          title="Sticky book bar"
          note="Mobile only (under 1024px). Appears once you scroll past the first hero CTA and hides at the footer."
        >
          <StickyBookBar
            bookHref="#buttons"
            phone={PHONE}
            whatsapp={WHATSAPP}
            watchId="showcase-hero-cta"
            hideNearId="showcase-footer"
          />
          <p className={styles.note}>Resize the window below 1024px and scroll to see it.</p>
        </Section>
      </BrandSwitcher>
    </main>
  );
}

const CARD = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

/** Sample photo for a showcase slot. Decorative: each card's heading names it. */
function showcase(photo: Photo | undefined, sizes: string, hero = false): ReactNode {
  if (!photo) return undefined;
  return <Image src={photo.id} alt={hero ? photo.alt : ""} fill sizes={sizes} />;
}
