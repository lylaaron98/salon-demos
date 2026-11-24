/**
 * Typed JSON-LD builders (schema.org via schema-dts). Pure functions of the content
 * files and the site origin, so the unit tests can check every brand's output.
 *
 * Rules (architecture plan §6): fictional SG addresses with `geo`, opening hours and
 * `priceRange`; no `sameAs` (no fake socials); no AggregateRating or reviews.
 */
import type {
  BreadcrumbList,
  DayOfWeek,
  FAQPage,
  Graph,
  ItemList,
  HairSalon,
  Offer,
  OpeningHoursSpecification,
  Organization,
  Service as ServiceLd,
  Thing,
  WebSite,
} from "schema-dts";
import type { DayKey, OpeningHours } from "@salon-demos/ui";
import type { Brand, Outlet, Service } from "../../content/types.ts";
import { absoluteUrl } from "../site.ts";

export type GroupInfo = { name: string; tagline: string; lead: string };

const DAY_NAMES: Record<DayKey, DayOfWeek & string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** LocalBusiness fields, with `@type` narrowed to the brand's subtype. */
type BusinessLd = Omit<Exclude<HairSalon, string>, "@type"> & { "@type": Brand["schemaType"] };

const SINGAPORE = { "@type": "Country", name: "Singapore" } as const;

/** Stable node ids, so pages can reference each other's nodes. */
export const ids = {
  organization: (site: string) => absoluteUrl("/#organization", site),
  website: (site: string) => absoluteUrl("/#website", site),
  brand: (site: string, brand: Pick<Brand, "id">) => absoluteUrl(`/${brand.id}#business`, site),
  outlet: (site: string, brand: Pick<Brand, "id">, outlet: Pick<Outlet, "slug">) =>
    absoluteUrl(`/${brand.id}#outlet-${outlet.slug}`, site),
  service: (site: string, brand: Pick<Brand, "id">, service: Pick<Service, "slug">) =>
    absoluteUrl(`/${brand.id}#service-${service.slug}`, site),
};

/** Days with the same hours are grouped into one specification; closed days are omitted. */
export function openingHoursSpecification(hours: OpeningHours): OpeningHoursSpecification[] {
  const groups = new Map<string, { days: DayKey[]; opens: string; closes: string }>();
  for (const day of Object.keys(DAY_NAMES) as DayKey[]) {
    const slot = hours[day];
    if (!slot) continue;
    const key = `${slot.open}-${slot.close}`;
    const group = groups.get(key) ?? { days: [], opens: slot.open, closes: slot.close };
    group.days.push(day);
    groups.set(key, group);
  }
  return [...groups.values()].map((g) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: g.days.map((d) => DAY_NAMES[d]),
    opens: g.opens,
    closes: g.closes,
  }));
}

export function organizationNode(site: string, group: GroupInfo, brands: readonly Brand[]) {
  return {
    "@type": "Organization",
    "@id": ids.organization(site),
    name: group.name,
    url: absoluteUrl("/", site),
    slogan: group.tagline,
    description: group.lead,
    logo: absoluteUrl("/icon.svg", site),
    areaServed: SINGAPORE,
    subOrganization: brands.map((b) => ({ "@id": ids.brand(site, b) })),
  } satisfies Organization;
}

export function websiteNode(site: string, group: GroupInfo) {
  return {
    "@type": "WebSite",
    "@id": ids.website(site),
    name: `${group.name} (demo)`,
    url: absoluteUrl("/", site),
    inLanguage: "en-SG",
    publisher: { "@id": ids.organization(site) },
  } satisfies WebSite;
}

export function outletNode(site: string, brand: Brand, outlet: Outlet) {
  return {
    "@type": brand.schemaType,
    "@id": ids.outlet(site, brand, outlet),
    name: `${brand.name} ${outlet.area}`,
    url: absoluteUrl(`/${brand.id}`, site),
    image: absoluteUrl(`/${brand.id}/opengraph-image`, site),
    telephone: outlet.phone,
    priceRange: brand.priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: outlet.address,
      addressLocality: "Singapore",
      postalCode: outlet.postalCode,
      addressCountry: "SG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: outlet.geo.latitude,
      longitude: outlet.geo.longitude,
    },
    openingHoursSpecification: openingHoursSpecification(outlet.hours),
    parentOrganization: { "@id": ids.brand(site, brand) },
  } satisfies BusinessLd;
}

/** The brand as a LocalBusiness subtype, with each outlet embedded as a `location`. */
export function brandNode(site: string, brand: Brand) {
  return {
    "@type": brand.schemaType,
    "@id": ids.brand(site, brand),
    name: brand.name,
    alternateName: brand.shortName !== brand.name ? brand.shortName : undefined,
    description: brand.description,
    slogan: brand.tagline,
    url: absoluteUrl(`/${brand.id}`, site),
    image: absoluteUrl(`/${brand.id}/opengraph-image`, site),
    telephone: brand.contact.phone,
    priceRange: brand.priceRange,
    currenciesAccepted: "SGD",
    areaServed: SINGAPORE,
    parentOrganization: { "@id": ids.organization(site) },
    location: brand.outlets.map((outlet) => outletNode(site, brand, outlet)),
  } satisfies BusinessLd;
}

export function serviceNode(site: string, brand: Brand, service: Service) {
  const offer: Offer = {
    "@type": "Offer",
    priceCurrency: "SGD",
    url: absoluteUrl(`/${brand.id}/book?service=${service.slug}`, site),
    // "From" prices are a minimum; fixed prices are exact. Prices include GST.
    ...(service.priceVaries
      ? {
          priceSpecification: {
            "@type": "PriceSpecification",
            minPrice: service.priceFrom,
            priceCurrency: "SGD",
            valueAddedTaxIncluded: true,
          },
        }
      : { price: service.priceFrom }),
  };
  return {
    "@type": "Service",
    "@id": ids.service(site, brand, service),
    name: service.title,
    description: service.summary,
    serviceType: service.category,
    provider: { "@id": ids.brand(site, brand) },
    areaServed: SINGAPORE,
    offers: offer,
  } satisfies ServiceLd;
}

export function serviceListNode(site: string, brand: Brand) {
  return {
    "@type": "ItemList",
    "@id": absoluteUrl(`/${brand.id}#services`, site),
    name: `${brand.name} services`,
    numberOfItems: brand.services.length,
    itemListElement: brand.services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: serviceNode(site, brand, service),
    })),
  } satisfies ItemList;
}

/** FAQ markup must match what is visible: the home page shows at most `limit` items. */
export function faqPageNode(site: string, brand: Brand, limit = 5) {
  return {
    "@type": "FAQPage",
    "@id": absoluteUrl(`/${brand.id}#faq`, site),
    mainEntity: brand.faqs.slice(0, limit).map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  } satisfies FAQPage;
}

export type Crumb = { name: string; path: string };

export function breadcrumbNode(site: string, crumbs: readonly Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path, site),
    })),
  } satisfies BreadcrumbList;
}

/** Wrap nodes in one `@graph` document. */
export function graph(nodes: Thing[]): Graph {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Group hub: Organization (with sub-organisations) and WebSite. */
export function groupGraph(site: string, group: GroupInfo, brands: readonly Brand[]): Graph {
  return graph([organizationNode(site, group, brands), websiteNode(site, group)]);
}

/** Brand home: the business with its outlets, its services, the FAQ and breadcrumbs. */
export function brandGraph(site: string, group: GroupInfo, brand: Brand): Graph {
  return graph([
    brandNode(site, brand),
    serviceListNode(site, brand),
    faqPageNode(site, brand),
    breadcrumbNode(site, [
      { name: group.name, path: "/" },
      { name: brand.name, path: `/${brand.id}` },
    ]),
  ]);
}

/** Serialise for a <script type="application/ld+json">; `<` is escaped so text can't close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
