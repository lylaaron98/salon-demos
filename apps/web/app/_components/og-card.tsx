import { themes, type ThemeId } from "@salon-demos/tokens";
import { ImageResponse } from "next/og";

/** Open Graph card size (1.91:1, what Facebook, LinkedIn and X all crop to cleanly). */
export const ogSize = { width: 1200, height: 630 };

type CardInput = {
  theme: ThemeId;
  eyebrow: string;
  title: string;
  tagline: string;
  footer: string;
};

/**
 * One generated social card per brand, coloured from that brand's tokens: page
 * background, primary text, the decorative accent and the inverse band. Rendered
 * at build time (the routes are static), so there is no runtime cost.
 */
export function ogCard({ theme, eyebrow, title, tagline, footer }: CardInput): ImageResponse {
  const c = themes[theme].color;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: c.bg.page,
        color: c.text.primary,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", padding: "72px 80px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 56, height: 8, background: c["decor-accent"] }} />
          <div
            style={{
              fontSize: 28,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: c.text.muted,
            }}
          >
            {eyebrow}
          </div>
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05, marginTop: 40 }}>
          {title}
        </div>
        <div style={{ fontSize: 44, marginTop: 24, color: c.text.muted }}>{tagline}</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 80px",
          background: c.bg.inverse,
          color: c.text.inverse,
          fontSize: 26,
        }}
      >
        <div style={{ display: "flex" }}>{footer}</div>
        <div style={{ width: 20, height: 20, borderRadius: 999, background: c["decor-accent"] }} />
      </div>
    </div>,
    ogSize,
  );
}
