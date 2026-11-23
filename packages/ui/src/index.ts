// Shared, token-styled React components. Each component reads only semantic token
// CSS variables, so the same code renders every brand under its `data-brand` scope.

export { Button, ButtonLink } from "./components/Button/Button";
export type {
  ButtonLinkProps,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./components/Button/Button";
export { FAQ } from "./components/FAQ/FAQ";
export type { FAQItem, FAQProps } from "./components/FAQ/FAQ";
export { Footer } from "./components/Footer/Footer";
export type { FooterLink, FooterProps } from "./components/Footer/Footer";
export { Header } from "./components/Header/Header";
export type { HeaderLink, HeaderProps } from "./components/Header/Header";
export { Hero } from "./components/Hero/Hero";
export type { HeroProps } from "./components/Hero/Hero";
export { MediaPlaceholder } from "./components/MediaPlaceholder/MediaPlaceholder";
export type {
  MediaPlaceholderProps,
  MediaTone,
} from "./components/MediaPlaceholder/MediaPlaceholder";
export { OutletCard } from "./components/OutletCard/OutletCard";
export type { OutletCardProps } from "./components/OutletCard/OutletCard";
export { PricingTable } from "./components/PricingTable/PricingTable";
export type {
  PricingMenuProps,
  PricingPlan,
  PricingRow,
  PricingTableProps,
  PricingTiersProps,
} from "./components/PricingTable/PricingTable";
export { PromoBanner } from "./components/PromoBanner/PromoBanner";
export type { PromoBannerProps } from "./components/PromoBanner/PromoBanner";
export { ServiceCard } from "./components/ServiceCard/ServiceCard";
export type { ServiceCardProps } from "./components/ServiceCard/ServiceCard";
export { StaffCard } from "./components/StaffCard/StaffCard";
export type { StaffCardProps } from "./components/StaffCard/StaffCard";
export { StickyBookBar } from "./components/StickyBookBar/StickyBookBar";
export type { StickyBookBarProps } from "./components/StickyBookBar/StickyBookBar";
export { Testimonial } from "./components/Testimonial/Testimonial";
export type { TestimonialProps } from "./components/Testimonial/Testimonial";
export { Icon } from "./icons/Icon";
export type { IconName, IconProps } from "./icons/Icon";
export type { DayKey, OpeningHours } from "./lib/hours";
