import type { BrandId } from "@salon-demos/tokens";
import type { FAQItem, OpeningHours, PricingTableProps } from "@salon-demos/ui";

/**
 * Content model for a brand home page. Every brand file is plain typed data, so
 * a new brand is one token file plus one content file. All content is fictional.
 */

export type Service = {
  slug: string;
  title: string;
  category: string;
  /** Two short sentences at most. */
  summary: string;
  durationMin: number;
  /** S$, GST inclusive. 0 = free. */
  priceFrom: number;
  /** Adds "from" to the price. */
  priceVaries: boolean;
  badge?: string;
  featured?: boolean;
};

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  specialities: string[];
  languages: string[];
  /** Outlet area, e.g. "Tiong Bahru". */
  outlet: string;
};

export type Outlet = {
  slug: string;
  /** Neighbourhood, e.g. "Tiong Bahru". */
  area: string;
  /** Fictional street address with unit number. */
  address: string;
  postalCode: string;
  /** Approximate coordinates (WGS 84) for maps and JSON-LD `geo`. */
  geo: { latitude: number; longitude: number };
  mrt: string;
  hours: OpeningHours;
  phone: string;
  whatsapp: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  service: string;
  rating: number;
};

/** First-visit offer applied in the booking flow when the URL carries `offer=<id>`. */
export type BookingOffer = {
  id: string;
  /** Short label for the summary, e.g. "First-visit trial". */
  label: string;
  /** Service slugs the offer applies to. */
  services: string[];
  /** Fixed offer price in S$ (GST inclusive). */
  price?: number;
  /** Or a percentage off the listed price. */
  percentOff?: number;
};

export type Brand = {
  id: BrandId;
  name: string;
  /** Short label for switchers, e.g. "Dewlab". */
  shortName: string;
  category: string;
  tagline: string;
  /** Meta description, about 150 characters. */
  description: string;
  /** Primary CTA wording from the brief, e.g. "Book a stylist". */
  primaryCta: string;
  /** What the team is called on this brand: "stylists", "therapists", "scalp coaches". */
  teamNoun: string;
  /** schema.org LocalBusiness subtype for the brand and each outlet. */
  schemaType: "HairSalon" | "BeautySalon" | "HealthAndBeautyBusiness";
  /** schema.org `priceRange`, e.g. "$$". */
  priceRange: string;
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    secondaryCta: string;
    trust: string[];
  };
  contact: { phone: string; whatsapp: string };
  promo: { eyebrow: string; title: string; body: string; cta: string };
  services: Service[];
  pricing: { title: string; intro: string; table: PricingTableProps };
  whyUs: { title: string; body: string }[];
  team: TeamMember[];
  testimonials: Testimonial[];
  outlets: Outlet[];
  faqs: FAQItem[];
  closing: { title: string; body: string };
  footer: { blurb: string; hours: string[] };
  /** Optional first-visit offer the promo banner links into the booking flow. */
  offer?: BookingOffer;
};
