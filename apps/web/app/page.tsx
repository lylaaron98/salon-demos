import Link from "next/link";
import { brands, group } from "./brands";

export default function HomePage() {
  return (
    <main className="page">
      <header className="masthead">
        <p className="wordmark">
          {group.name}
          <span className="wordmark-dot" aria-hidden="true" />
        </p>
        <h1>{group.tagline}</h1>
        <p className="lede">
          One membership, three specialist studios. This is a portfolio demo: every brand, name and
          line of copy is fictional.
        </p>
      </header>

      <section aria-labelledby="studios-heading">
        <h2 id="studios-heading" className="section-heading">
          Our studios
        </h2>
        <ul className="brand-list">
          {brands.map((brand) => (
            <li key={brand.id} className="brand-card" data-brand={brand.id}>
              <p className="brand-category">{brand.category}</p>
              <h3 className="brand-name">{brand.name}</h3>
              <p className="brand-tagline">{brand.tagline}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <p>
          Demo project. No bookings are made and no real business is represented.{" "}
          <Link href="/tokens">View the design tokens</Link>.
        </p>
      </footer>
    </main>
  );
}
