import "@salon-demos/tokens/tokens.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { brandFontVariables, manrope } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Portfolio demo: a multi-brand salon showcase for the fictional Orrin Collective group.",
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, locale: "en_SG", type: "website" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-SG" className={`${manrope.variable} ${brandFontVariables}`}>
      <body>{children}</body>
    </html>
  );
}
