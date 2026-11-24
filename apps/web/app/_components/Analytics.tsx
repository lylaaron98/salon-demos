import { GoogleTagManager } from "@next/third-parties/google";
import { consentBootstrapScript, validGtmId } from "@/lib/consent";

const GTM_ID = validGtmId(process.env.NEXT_PUBLIC_GTM_ID);

/**
 * Consent Mode v2 defaults. Goes in <head> so it runs before GTM and before the
 * cookie banner paints. Rendered even without GTM: it also drives the banner.
 */
export function ConsentDefaults() {
  return (
    <script
      id="consent-defaults"
      // Static string built from our own constants (lib/consent.ts).
      dangerouslySetInnerHTML={{ __html: consentBootstrapScript() }}
    />
  );
}

/** Google Tag Manager, loaded after hydration. A no-op unless NEXT_PUBLIC_GTM_ID is set. */
export function TagManager() {
  return GTM_ID ? <GoogleTagManager gtmId={GTM_ID} /> : null;
}
