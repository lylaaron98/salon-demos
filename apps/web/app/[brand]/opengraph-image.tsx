import { brandIds } from "@salon-demos/tokens";
import { notFound } from "next/navigation";
import { getBrand, group } from "@/content";
import { BRAND_CARD_ALT } from "@/lib/seo/metadata";
import { ogCard, ogSize } from "../_components/og-card";

export const alt = BRAND_CARD_ALT;
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return brandIds.map((brand) => ({ brand }));
}

export default async function Image({ params }: { params: Promise<{ brand: string }> }) {
  const brand = getBrand((await params).brand);
  if (!brand) notFound();
  return ogCard({
    theme: brand.id,
    eyebrow: brand.category,
    title: brand.name,
    tagline: brand.tagline,
    footer: `${group.name} · ${brand.outlets.length} outlets in Singapore · Portfolio demo`,
  });
}
