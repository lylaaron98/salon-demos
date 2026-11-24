import { brandIds, type BrandId } from "@salon-demos/tokens";
import { dewlab } from "./brands/dewlab.ts";
import { rootwell } from "./brands/rootwell.ts";
import { sable } from "./brands/sable.ts";
import type { Brand } from "./types.ts";

export type { Brand, BookingOffer, Outlet, Service, TeamMember, Testimonial } from "./types.ts";

/** The fictional umbrella group. */
export const group = {
  name: "Orrin Collective",
  tagline: "Specialists in feeling like yourself.",
  lead: "One membership, three specialist studios. This is a portfolio demo: every brand, name, address and line of copy is fictional.",
} as const;

const BRANDS: Record<BrandId, Brand> = { sable, dewlab, rootwell };

/** Brands in display order (same order as the token build). */
export const brands: readonly Brand[] = brandIds.map((id) => BRANDS[id]);

export function isBrandId(value: string): value is BrandId {
  return (brandIds as readonly string[]).includes(value);
}

/** The brand for a route segment, or undefined for an unknown slug. */
export function getBrand(id: string): Brand | undefined {
  return isBrandId(id) ? BRANDS[id] : undefined;
}

export const brandHref = (id: BrandId) => `/${id}`;
export const bookHref = (id: BrandId, params?: Record<string, string>) =>
  `/${id}/book${params ? `?${new URLSearchParams(params).toString()}` : ""}`;

/** Prefilled WhatsApp message, so staff get context. */
export const whatsappText = (brand: Brand, outlet?: string) =>
  `Hi ${brand.name}${outlet ? ` ${outlet}` : ""}, I'd like to book. Sent from the website (demo).`;
