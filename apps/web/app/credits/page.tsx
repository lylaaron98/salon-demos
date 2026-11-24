import type { Metadata } from "next";
import Link from "next/link";
import { brands, group } from "@/content";
import { type Photo, photos } from "@/content/media";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import { GROUP_CARD_ALT, pageMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "../_components/JsonLd";
import styles from "./credits.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Photo credits",
  description:
    "The free Unsplash photos used across the Orrin Collective demo, with the photographer of each one.",
  path: "/credits",
  image: { path: "/opengraph-image", alt: GROUP_CARD_ALT },
});

export default function CreditsPage() {
  return (
    <main id="main" className={styles.page}>
      <JsonLd
        data={graph([
          breadcrumbNode(SITE_URL, [
            { name: group.name, path: "/" },
            { name: "Photo credits", path: "/credits" },
          ]),
        ])}
      />
      <header className={styles.header}>
        <p className={styles.back}>
          <Link href="/">Back to {group.name}</Link>
        </p>
        <h1 className={styles.title}>Photo credits</h1>
        <p className={styles.lede}>
          Every photo is from <a href="https://unsplash.com">Unsplash</a> and used under the{" "}
          <a href="https://unsplash.com/license">Unsplash License</a>, which allows free use without
          attribution. The photographers are credited here anyway. The people pictured are not the
          fictional team members whose cards they appear on.
        </p>
      </header>
      {brands.map((brand) => {
        const set = photos[brand.id];
        const rows = [
          credit("Hero", set.hero),
          ...brand.services.map((s) => credit(s.title, set.services[s.slug])),
          ...brand.outlets.map((o) => credit(`${o.area} outlet`, set.outlets[o.slug])),
          ...brand.team.map((m) => credit(`${m.name} (portrait)`, set.team[m.slug])),
        ].filter((row) => row !== null);
        return (
          <section
            key={brand.id}
            className={styles.section}
            aria-labelledby={`credits-${brand.id}`}
          >
            <h2 id={`credits-${brand.id}`} className={styles.heading}>
              {brand.name}
            </h2>
            <ul className={styles.list}>
              {rows.map(({ use, photo }) => (
                <li key={use}>
                  {use}: <a href={photo.href}>photo by {photo.credit}</a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}

function credit(use: string, photo: Photo | undefined) {
  return photo ? { use, photo } : null;
}
