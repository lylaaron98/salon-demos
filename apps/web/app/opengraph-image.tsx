import { brands, group } from "@/content";
import { GROUP_CARD_ALT } from "@/lib/seo/metadata";
import { ogCard, ogSize } from "./_components/og-card";

export const alt = GROUP_CARD_ALT;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    theme: "orrin",
    eyebrow: "Beauty group · Singapore",
    title: group.name,
    tagline: group.tagline,
    footer: `${brands.map((b) => b.name).join(" · ")} · Portfolio demo`,
  });
}
