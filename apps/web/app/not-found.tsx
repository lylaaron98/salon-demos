import Link from "next/link";
import { brandHref, brands } from "@/content";

export default function NotFound() {
  return (
    <main id="main" className="page not-found">
      <p className="wordmark">
        Orrin Collective
        <span className="wordmark-dot" aria-hidden="true" />
      </p>
      <h1>We couldn&apos;t find that page.</h1>
      <p className="lede">
        It may have moved, or the studio name may be misspelt. Try one of these:
      </p>
      <ul className="not-found-links">
        <li>
          <Link href="/">Orrin Collective home</Link>
        </li>
        {brands.map((brand) => (
          <li key={brand.id}>
            <Link href={brandHref(brand.id)}>{brand.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
