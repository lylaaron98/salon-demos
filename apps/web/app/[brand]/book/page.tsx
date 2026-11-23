import { brandIds } from "@salon-demos/tokens";
import { ButtonLink } from "@salon-demos/ui";
import { telHref, whatsappHref } from "@salon-demos/ui/lib";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brandHref, getBrand, whatsappText } from "@/content";
import styles from "../brand.module.css";

type Props = { params: Promise<{ brand: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return brandIds.map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = getBrand((await params).brand);
  if (!brand) return {};
  return {
    title: "Book",
    description: `Booking for ${brand.name} (fictional demo).`,
    robots: { index: false },
  };
}

/**
 * Placeholder so every "Book" link resolves. The multi-step booking flow replaces
 * this page in a later PR.
 */
export default async function BookPage({ params }: Props) {
  const brand = getBrand((await params).brand);
  if (!brand) notFound();

  return (
    <main id="main" tabIndex={-1} className={`${styles.main} ${styles.bookPage}`}>
      <div className={styles.container}>
        <h1 className={styles.bookTitle}>Online booking is coming soon</h1>
        <p className={styles.bookLead}>
          This is a portfolio demo, so no real bookings are made. The step-by-step booking flow is
          being built. Until then, the WhatsApp and call buttons show how the Singapore fallbacks
          work.
        </p>
        <div className={styles.bookActions}>
          <ButtonLink
            href={whatsappHref(brand.contact.whatsapp, whatsappText(brand))}
            variant="whatsapp"
            icon="chat"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp us
          </ButtonLink>
          <ButtonLink href={telHref(brand.contact.phone)} variant="secondary" icon="phone">
            Call {brand.contact.phone}
          </ButtonLink>
          <ButtonLink href={brandHref(brand.id)} variant="ghost">
            Back to {brand.shortName}
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
