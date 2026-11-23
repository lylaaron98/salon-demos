import { brandIds } from "@salon-demos/tokens";
import { Footer, Header } from "@salon-demos/ui";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { bookHref, brandHref, brands, getBrand, group } from "@/content";
import styles from "./brand.module.css";

/** Only the three known brands are built; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return brandIds.map((brand) => ({ brand }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const brand = getBrand((await params).brand);
  if (!brand) return {};
  return {
    title: { default: `${brand.name}: ${brand.category}`, template: `%s | ${brand.name} (demo)` },
    description: brand.description,
  };
}

export default async function BrandLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ brand: string }>;
}) {
  const brand = getBrand((await params).brand);
  if (!brand) notFound();

  const home = brandHref(brand.id);
  const nav = [
    { label: "Services", href: `${home}#services` },
    { label: "Pricing", href: `${home}#pricing` },
    { label: "Our team", href: `${home}#team` },
    { label: "Outlets", href: `${home}#outlets` },
    { label: "Offers", href: `${home}#offer` },
  ];

  return (
    // The brand scope: every token variable below resolves to this brand's theme.
    <div data-brand={brand.id} className={styles.shell}>
      <Header
        brandName={brand.name}
        homeHref={home}
        nav={nav}
        cta={{ label: "Book now", href: bookHref(brand.id) }}
        phone={brand.contact.phone}
        whatsapp={brand.contact.whatsapp}
        group={{ name: group.name, href: "/" }}
        brands={brands.map((b) => ({
          label: b.shortName,
          href: brandHref(b.id),
          current: b.id === brand.id,
        }))}
        findOutletHref={`${home}#outlets`}
      />
      {children}
      <Footer
        brandName={brand.name}
        homeHref={home}
        blurb={brand.footer.blurb}
        services={brand.services.map((s) => ({ label: s.title, href: `${home}#services` }))}
        outlets={brand.outlets.map((o) => ({ name: o.area, phone: o.phone }))}
        hours={brand.footer.hours}
        group={{ label: group.name, href: "/" }}
        sisterBrands={brands
          .filter((b) => b.id !== brand.id)
          .map((b) => ({ label: b.name, href: brandHref(b.id) }))}
        copyright="© 2026 Orrin Collective (fictional demo). No real business is represented and no bookings are made. Images are placeholders."
      />
    </div>
  );
}
