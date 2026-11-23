import type { Metadata } from "next";
import Link from "next/link";
import { TokenExplorer } from "./token-explorer";
import styles from "./tokens.module.css";

export const metadata: Metadata = {
  title: "Design tokens",
  description:
    "Swatches, type, radii and contrast checks for the Orrin Collective group and its three fictional brands, generated from one token source.",
};

export default function TokensPage() {
  return (
    <main className={styles.page}>
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
