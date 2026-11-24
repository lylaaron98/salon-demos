import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { brands, group } from "../content/index.ts";
import { closedMondays, everyDay } from "../content/hours.ts";
import {
  brandGraph,
  breadcrumbNode,
  groupGraph,
  ids,
  openingHoursSpecification,
  serializeJsonLd,
} from "../lib/seo/jsonld.ts";
import { DEFAULT_SITE_URL, absoluteUrl, resolveSiteUrl } from "../lib/site.ts";

const SITE = "https://example.test";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const EXPECTED_TYPE = {
  sable: "HairSalon",
  dewlab: "BeautySalon",
  rootwell: "HealthAndBeautyBusiness",
};

type Node = Record<string, unknown> & { "@type"?: string; "@id"?: string };

/** JSON round trip: what a crawler actually parses. */
const parse = (data: unknown) =>
  JSON.parse(serializeJsonLd(data)) as { "@context": string; "@graph": Node[] };

const byType = (nodes: Node[], type: string) => {
  const found = nodes.filter((n) => n["@type"] === type);
  assert.equal(found.length, 1, `exactly one ${type} node`);
  return found[0]!;
};

/** Every key anywhere in the document, for "never present" rules. */
function allKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((v) => allKeys(v, keys));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      keys.add(k);
      allKeys(v, keys);
    }
  }
  return keys;
}

function assertAbsolute(url: unknown, label: string) {
  assert.equal(typeof url, "string", `${label} is a string`);
  assert.ok((url as string).startsWith(`${SITE}/`), `${label} is under the site origin: ${url}`);
}

describe("site URL", () => {
  it("falls back to the default production domain", () => {
    assert.equal(resolveSiteUrl({}), DEFAULT_SITE_URL);
  });

  it("prefers SITE_URL, then NEXT_PUBLIC_SITE_URL, then the production domain", () => {
    const env = { SITE_URL: "https://a.test/", NEXT_PUBLIC_SITE_URL: "https://b.test" };
    assert.equal(resolveSiteUrl(env), "https://a.test");
    assert.equal(resolveSiteUrl({ ...env, SITE_URL: "" }), "https://b.test");
    // Vercel's auto-assigned domain must not win over the chosen one.
    assert.equal(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "c.test" }), DEFAULT_SITE_URL);
  });

  it("ignores values that are not absolute http(s) URLs", () => {
    assert.equal(resolveSiteUrl({ SITE_URL: "salon.test" }), DEFAULT_SITE_URL);
  });

  it("builds absolute URLs from paths", () => {
    assert.equal(absoluteUrl("/", SITE), `${SITE}/`);
    assert.equal(absoluteUrl("/sable", SITE), `${SITE}/sable`);
  });
});

describe("openingHoursSpecification", () => {
  it("groups days that share hours and omits closed days", () => {
    const spec = openingHoursSpecification(closedMondays);
    const days = spec.flatMap((s) => (s as unknown as { dayOfWeek: string[] }).dayOfWeek);
    assert.ok(!days.includes("Monday"), "closed Monday is omitted");
    assert.equal(days.length, 6);
    assert.equal(spec.length, 2, "Tue-Fri and Sat-Sun");
  });

  it("collapses an every-day schedule into one specification", () => {
    const spec = openingHoursSpecification(everyDay);
    assert.equal(spec.length, 1);
    assert.deepEqual((spec[0] as unknown as { dayOfWeek: string[] }).dayOfWeek, DAYS);
  });
});

describe("group JSON-LD", () => {
  const doc = parse(groupGraph(SITE, group, brands));

  it("is one schema.org @graph", () => {
    assert.equal(doc["@context"], "https://schema.org");
    assert.ok(Array.isArray(doc["@graph"]));
  });

  it("describes the group as an Organization linking every brand", () => {
    const org = byType(doc["@graph"], "Organization");
    assert.equal(org["@id"], ids.organization(SITE));
    assert.equal(org.name, group.name);
    assertAbsolute(org.url, "organization url");
    const subs = (org.subOrganization as { "@id": string }[]).map((s) => s["@id"]);
    assert.deepEqual(
      subs,
      brands.map((b) => ids.brand(SITE, b)),
    );
  });

  it("has a WebSite published by the Organization", () => {
    const site = byType(doc["@graph"], "WebSite");
    assert.deepEqual(site.publisher, { "@id": ids.organization(SITE) });
    assert.equal(site.inLanguage, "en-SG");
  });
});

for (const brand of brands) {
  describe(`${brand.name} JSON-LD`, () => {
    const doc = parse(brandGraph(SITE, group, brand));
    const nodes = doc["@graph"];
    const business = byType(nodes, EXPECTED_TYPE[brand.id]);

    it("uses the brand's LocalBusiness subtype under the group", () => {
      assert.equal(business["@id"], ids.brand(SITE, brand));
      assert.equal(business.name, brand.name);
      assert.equal(business.priceRange, brand.priceRange);
      assertAbsolute(business.url, "business url");
      assert.deepEqual(business.parentOrganization, { "@id": ids.organization(SITE) });
    });

    it("lists every outlet as a location with address, geo, hours and price range", () => {
      const locations = business.location as Node[];
      assert.equal(locations.length, brand.outlets.length);
      locations.forEach((loc, i) => {
        const outlet = brand.outlets[i]!;
        assert.equal(loc["@type"], EXPECTED_TYPE[brand.id]);
        assert.equal(loc["@id"], ids.outlet(SITE, brand, outlet));
        assert.equal(loc.priceRange, brand.priceRange);
        assert.equal(loc.telephone, outlet.phone);

        const address = loc.address as Node;
        assert.equal(address["@type"], "PostalAddress");
        assert.equal(address.streetAddress, outlet.address);
        assert.match(address.postalCode as string, /^\d{6}$/);
        assert.equal(address.addressCountry, "SG");

        const geo = loc.geo as { "@type": string; latitude: number; longitude: number };
        assert.equal(geo["@type"], "GeoCoordinates");
        assert.ok(geo.latitude > 1.15 && geo.latitude < 1.48, "latitude inside Singapore");
        assert.ok(geo.longitude > 103.6 && geo.longitude < 104.1, "longitude inside Singapore");

        const hours = loc.openingHoursSpecification as Node[];
        assert.ok(hours.length > 0);
        const seen = new Set<string>();
        for (const spec of hours) {
          assert.equal(spec["@type"], "OpeningHoursSpecification");
          assert.match(spec.opens as string, TIME);
          assert.match(spec.closes as string, TIME);
          assert.ok((spec.opens as string) < (spec.closes as string), "opens before closing");
          for (const day of spec.dayOfWeek as string[]) {
            assert.ok(DAYS.includes(day), `valid day ${day}`);
            assert.ok(!seen.has(day), `${day} appears once`);
            seen.add(day);
          }
        }
        const openDays = Object.values(outlet.hours).filter(Boolean).length;
        assert.equal(seen.size, openDays);
      });
    });

    it("lists the services with SGD offers", () => {
      const list = byType(nodes, "ItemList");
      const items = list.itemListElement as Node[];
      assert.equal(items.length, brand.services.length);
      assert.equal(list.numberOfItems, brand.services.length);
      items.forEach((entry, i) => {
        const service = brand.services[i]!;
        assert.equal(entry["@type"], "ListItem");
        assert.equal(entry.position, i + 1);
        const item = entry.item as Node;
        assert.equal(item["@type"], "Service");
        assert.equal(item.name, service.title);
        assert.deepEqual(item.provider, { "@id": ids.brand(SITE, brand) });
        const offer = item.offers as Node;
        assert.equal(offer["@type"], "Offer");
        assert.equal(offer.priceCurrency, "SGD");
        assertAbsolute(offer.url, "offer url");
        if (service.priceVaries) {
          const spec = offer.priceSpecification as Node;
          assert.equal(spec.minPrice, service.priceFrom);
          assert.equal(spec.priceCurrency, "SGD");
        } else {
          assert.equal(offer.price, service.priceFrom);
        }
      });
    });

    it("marks up the visible FAQ as a FAQPage", () => {
      const faq = byType(nodes, "FAQPage");
      const questions = faq.mainEntity as Node[];
      assert.equal(questions.length, Math.min(brand.faqs.length, 5));
      for (const q of questions) {
        assert.equal(q["@type"], "Question");
        assert.ok((q.name as string).length > 0);
        const answer = q.acceptedAnswer as Node;
        assert.equal(answer["@type"], "Answer");
        assert.ok((answer.text as string).length > 0);
      }
    });

    it("has a BreadcrumbList from the group to the brand", () => {
      const crumbs = byType(nodes, "BreadcrumbList").itemListElement as Node[];
      assert.deepEqual(
        crumbs.map((c) => [c.position, c.name, c.item]),
        [
          [1, group.name, `${SITE}/`],
          [2, brand.name, `${SITE}/${brand.id}`],
        ],
      );
    });

    it("never includes fake ratings, reviews or social profiles", () => {
      const keys = allKeys(doc);
      for (const banned of ["aggregateRating", "review", "sameAs"]) {
        assert.ok(!keys.has(banned), `no ${banned}`);
      }
    });

    it("uses absolute, unique @ids under the site origin", () => {
      const all: string[] = [];
      (function collect(value: unknown) {
        if (Array.isArray(value)) value.forEach(collect);
        else if (value && typeof value === "object") {
          const node = value as Node;
          // A node that only holds "@id" is a reference, not a definition.
          if (node["@id"] && Object.keys(node).length > 1) all.push(node["@id"]);
          Object.values(node).forEach(collect);
        }
      })(doc);
      all.forEach((id) => assertAbsolute(id, "@id"));
      assert.equal(new Set(all).size, all.length, "no duplicate @id definitions");
    });
  });
}

describe("breadcrumbNode", () => {
  it("numbers crumbs from 1 and resolves paths", () => {
    const node = breadcrumbNode(SITE, [
      { name: "Home", path: "/" },
      { name: "Tokens", path: "/tokens" },
    ]);
    assert.equal(node["@type"], "BreadcrumbList");
    const items = node.itemListElement as { position: number; item: string }[];
    assert.deepEqual(
      items.map((i) => [i.position, i.item]),
      [
        [1, `${SITE}/`],
        [2, `${SITE}/tokens`],
      ],
    );
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so content cannot close the script tag", () => {
    const out = serializeJsonLd({ text: "</script><script>alert(1)</script>" });
    assert.ok(!out.includes("<"));
    assert.deepEqual(JSON.parse(out), { text: "</script><script>alert(1)</script>" });
  });
});
