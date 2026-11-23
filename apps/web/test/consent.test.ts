import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runInNewContext } from "node:vm";
import { buildEvent, contactMethod, pageContext } from "../lib/analytics.ts";
import {
  CONSENT_DEFAULTS,
  CONSENT_MAX_AGE_MS,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  consentBootstrapScript,
  parseStoredConsent,
  toGtagConsent,
  validGtmId,
} from "../lib/consent.ts";

const NOW = Date.UTC(2026, 10, 23);
const stored = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    v: CONSENT_VERSION,
    ts: NOW - 1000,
    analytics: true,
    marketing: false,
    ...over,
  });

/** Run the inline <head> script against a fake window; return what it did. */
function runBootstrap(saved: string | null, opts: { throwOnStorage?: boolean } = {}) {
  const attributes: Record<string, string> = {};
  const window = {
    dataLayer: undefined as unknown[] | undefined,
    localStorage: {
      getItem(key: string) {
        if (opts.throwOnStorage) throw new Error("blocked");
        return key === CONSENT_STORAGE_KEY ? saved : null;
      },
    },
  };
  const document = {
    documentElement: {
      setAttribute: (name: string, value: string) => (attributes[name] = value),
    },
  };
  const DateStub = { now: () => NOW };
  runInNewContext(consentBootstrapScript(), { window, document, Date: DateStub, JSON });
  // gtag pushes `arguments` objects from another realm; copy them into plain arrays.
  const calls = (window.dataLayer ?? []).map(
    (entry) => JSON.parse(JSON.stringify(Array.from(entry as ArrayLike<unknown>))) as unknown[],
  );
  return { calls, consent: attributes["data-consent"] };
}

describe("Consent Mode v2 defaults", () => {
  it("denies every storage type by default", () => {
    assert.deepEqual(CONSENT_DEFAULTS, {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    });
  });

  it("maps analytics and marketing onto the four v2 signals", () => {
    assert.deepEqual(toGtagConsent({ analytics: true, marketing: false }), {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
    assert.deepEqual(toGtagConsent({ analytics: false, marketing: true }), {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "denied",
    });
  });
});

describe("parseStoredConsent", () => {
  it("reads a valid choice", () => {
    assert.deepEqual(parseStoredConsent(stored(), NOW), { analytics: true, marketing: false });
  });

  it("rejects missing, malformed, old-version, expired and future entries", () => {
    assert.equal(parseStoredConsent(null, NOW), null);
    assert.equal(parseStoredConsent("{nope", NOW), null);
    assert.equal(parseStoredConsent(stored({ v: CONSENT_VERSION - 1 }), NOW), null);
    assert.equal(parseStoredConsent(stored({ ts: NOW - CONSENT_MAX_AGE_MS - 1 }), NOW), null);
    assert.equal(parseStoredConsent(stored({ ts: NOW + 60_000 }), NOW), null);
    assert.equal(parseStoredConsent(stored({ analytics: "yes" }), NOW), null);
  });
});

describe("inline consent script", () => {
  it("sets denied defaults first and shows the banner for new visitors", () => {
    const { calls, consent } = runBootstrap(null);
    assert.deepEqual(calls[0], [
      "consent",
      "default",
      { ...CONSENT_DEFAULTS, wait_for_update: 500 },
    ]);
    assert.ok(!calls.some((c) => c[1] === "update"), "no update without a stored choice");
    assert.equal(consent, "unset");
  });

  it("re-applies a remembered choice and hides the banner", () => {
    const { calls, consent } = runBootstrap(stored({ analytics: false, marketing: true }));
    assert.equal(calls[0]![1], "default");
    const update = calls.find((c) => c[0] === "consent" && c[1] === "update");
    assert.deepEqual(update?.[2], toGtagConsent({ analytics: false, marketing: true }));
    assert.equal(consent, "set");
  });

  it("agrees with parseStoredConsent on expired and old-version entries", () => {
    for (const raw of [stored({ ts: NOW - CONSENT_MAX_AGE_MS - 1 }), stored({ v: 0 })]) {
      assert.equal(parseStoredConsent(raw, NOW), null);
      assert.equal(runBootstrap(raw).consent, "unset");
    }
  });

  it("survives blocked storage", () => {
    const { calls, consent } = runBootstrap(null, { throwOnStorage: true });
    assert.equal(calls[0]![1], "default");
    assert.equal(consent, "unset");
  });
});

describe("validGtmId", () => {
  it("accepts container ids and ignores anything else", () => {
    assert.equal(validGtmId("GTM-ABC1234"), "GTM-ABC1234");
    assert.equal(validGtmId(" GTM-ABC1234 "), "GTM-ABC1234");
    assert.equal(validGtmId(undefined), null);
    assert.equal(validGtmId(""), null);
    assert.equal(validGtmId("G-ABC1234"), null);
    assert.equal(validGtmId("GTM-1');alert(1)//"), null);
  });
});

describe("dataLayer events", () => {
  it("adds the brief's common parameters", () => {
    assert.deepEqual(
      buildEvent("contact_click", { brand: "sable", page_type: "brand_home" }, { method: "call" }),
      {
        event: "contact_click",
        brand: "sable",
        site_platform: "nextjs",
        page_type: "brand_home",
        outlet_id: null,
        service_id: null,
        campaign_id: null,
        flow: null,
        method: "call",
      },
    );
  });

  it("defaults flow to booking on booking pages", () => {
    assert.equal(
      buildEvent("booking_start", { brand: "dewlab", page_type: "booking" }).flow,
      "booking",
    );
    assert.equal(
      buildEvent("booking_complete", { brand: "dewlab", page_type: "booking_confirmation" }).flow,
      "booking",
    );
  });

  it("recognises call and WhatsApp links", () => {
    assert.equal(contactMethod("tel:+6561000000"), "call");
    assert.equal(contactMethod("https://wa.me/6581000000?text=Hi"), "whatsapp");
    assert.equal(contactMethod("https://api.whatsapp.com/send?phone=65"), "whatsapp");
    assert.equal(contactMethod("https://example.com/wa.me"), null);
    assert.equal(contactMethod("/sable/book"), null);
  });

  it("derives brand and page type from the path", () => {
    const ids = ["sable", "dewlab", "rootwell"];
    assert.deepEqual(pageContext("/", ids), { brand: "orrin", page_type: "group_home" });
    assert.deepEqual(pageContext("/dewlab", ids), { brand: "dewlab", page_type: "brand_home" });
    assert.deepEqual(pageContext("/dewlab/book", ids), { brand: "dewlab", page_type: "booking" });
    assert.deepEqual(pageContext("/sable/book/confirmed", ids), {
      brand: "sable",
      page_type: "booking_confirmation",
    });
    assert.deepEqual(pageContext("/tokens", ids), { brand: "orrin", page_type: "utility" });
  });
});
