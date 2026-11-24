import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { brands } from "../content/index.ts";
import { allPhotos, photoSrc, photos } from "../content/media.ts";

describe("photoSrc", () => {
  it("points next/image at a capped Unsplash original", () => {
    const url = new URL(photoSrc({ id: "photo-123-abc", alt: "x", credit: "y", href: "z" }));
    assert.equal(url.origin + url.pathname, "https://images.unsplash.com/photo-123-abc");
    assert.equal(url.searchParams.get("w"), "2400");
  });
});

describe("brand photos", () => {
  for (const brand of brands) {
    const set = photos[brand.id];
    it(`${brand.shortName} has a photo for every service, outlet and team member`, () => {
      assert.deepEqual(
        brand.services.filter((s) => !set.services[s.slug]).map((s) => s.slug),
        [],
      );
      assert.deepEqual(
        brand.outlets.filter((o) => !set.outlets[o.slug]).map((o) => o.slug),
        [],
      );
      assert.deepEqual(
        brand.team.filter((m) => !set.team[m.slug]).map((m) => m.slug),
        [],
      );
    });
  }

  it("every photo has an id, alt text and a credit link", () => {
    for (const photo of allPhotos) {
      assert.match(photo.id, /^photo-[\w-]+$/);
      assert.ok(photo.alt.trim().length > 0, photo.id);
      assert.ok(photo.credit.trim().length > 0, photo.id);
      assert.match(photo.href, /^https:\/\/unsplash\.com\/photos\//);
    }
  });
});
