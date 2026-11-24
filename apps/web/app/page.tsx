import { ButtonLink, MediaPlaceholder } from "@salon-demos/ui";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { brandHref, brands, group } from "@/content";
import { photoSrc, photos } from "@/content/media";
import { groupGraph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "./_components/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: `${group.name}: ${group.tagline} (demo)`,
  absoluteTitle: true,
  socialTitle: group.name,
  description:
    "Orrin Collective is a fictional Singapore beauty group with three specialist studios: Sable & Shear (hair), Dewlab (skin) and Rootwell (scalp). Portfolio demo.",
  path: "/",
});

/** Group hub: introduces Orrin Collective and routes visitors to the three studios. */
export default function HomePage() {
  return (
    <main id="main" className="page">
      <JsonLd data={groupGraph(SITE_URL, group, brands)} />
      <header className="masthead">
        <p className="wordmark">
          {group.name}
          <span className="wordmark-dot" aria-hidden="true" />
        </p>
        <h1>{group.tagline}</h1>
        <p className="lede">{group.lead}</p>
      </header>

      <section aria-labelledby="studios-heading">
        <h2 id="studios-heading" className="section-heading">
          Our studios
        </h2>
        <ul className="brand-list">
          {brands.map((brand, index) => (
            <li key={brand.id} className="brand-card" data-brand={brand.id}>
              <MediaPlaceholder ratio="3 / 2" tone="inverse">
                <Image
                  src={photoSrc(photos[brand.id].hero)}
                  alt=""
                  fill
                  // The first card is above the fold on phones and is the LCP element there.
                  preload={index === 0}
                  fetchPriority={index === 0 ? "high" : undefined}
                  quality={55}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </MediaPlaceholder>
              <div className="brand-card-body">
                <p className="brand-category">{brand.category}</p>
                <h3 className="brand-name">
                  <Link className="brand-link" href={brandHref(brand.id)}>
                    {brand.name}
                  </Link>
                </h3>
                <p className="brand-tagline">{brand.tagline}</p>
                <p className="brand-meta">
                  {brand.outlets.length} outlets · {brand.hero.trust[0]}
                </p>
                <span className="brand-more" aria-hidden="true">
                  Visit {brand.shortName} →
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="membership" aria-labelledby="membership-heading">
        <h2 id="membership-heading" className="section-heading">
          One membership, three specialists
        </h2>
        <p className="lede">
          Credit from an Orrin Collective membership works at every studio, with one booking account
          and the same service standards. (Fictional, for this demo.)
        </p>
        <div className="actions">
          {brands.map((brand) => (
            <ButtonLink
              key={brand.id}
              href={brandHref(brand.id)}
              variant="secondary"
              data-brand={brand.id}
            >
              {brand.shortName}
            </ButtonLink>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>
          Demo project. No bookings are made and no real business is represented.{" "}
          <Link href="/tokens">View the design tokens</Link> or the{" "}
          <Link href="/components">component library</Link>.{" "}
          <Link href="/credits">Photo credits</Link>. <a href="#cookie-settings">Cookie settings</a>
        </p>
      </footer>
    </main>
  );
}
