import type { Metadata } from "next";
import { group } from "@/content";
import { breadcrumbNode, graph } from "@/lib/seo/jsonld";
import { GROUP_CARD_ALT, pageMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "../_components/JsonLd";
import Link from "next/link";
import { TokenExplorer } from "./token-explorer";
import styles from "./tokens.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Design tokens",
  description:
    "Swatches, type, radii and contrast checks for the Orrin Collective group and its three fictional brands, generated from one token source.",
  path: "/tokens",
  image: { path: "/opengraph-image", alt: GROUP_CARD_ALT },
});

export default function TokensPage() {
  return (
    <main className={styles.page}>
      <JsonLd
        data={graph([
          breadcrumbNode(SITE_URL, [
            { name: group.name, path: "/" },
            { name: "Design tokens", path: "/tokens" },
          ]),
        ])}
      />
      <header className={styles.header}>
        <p className={styles.back}>
          <Link href="/">Back to Orrin Collective</Link>
        </p>
        <h1 className={styles.title}>Design tokens</h1>
        <p className={styles.lede}>
          One token source, three brands. Pick a theme: every swatch, sample and ratio below comes
          from <code>@salon-demos/tokens</code> through CSS custom properties scoped by{" "}
          <code>data-brand</code>.
        </p>
      </header>
      <TokenExplorer />
    </main>
  );
}
