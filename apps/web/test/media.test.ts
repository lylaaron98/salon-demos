import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { brands } from "../content/index.ts";
import { allPhotos, photos } from "../content/media.ts";
import unsplashLoader from "../lib/unsplash-loader.ts";

describe("unsplash loader", () => {
  it("builds a resized, auto-format Unsplash URL", () => {
    const url = new URL(unsplashLoader({ src: "photo-123-abc", width: 640, quality: 60 }));
    assert.equal(url.origin + url.pathname, "https://images.unsplash.com/photo-123-abc");
    assert.equal(url.searchParams.get("w"), "640");
    assert.equal(url.searchParams.get("q"), "60");
    assert.equal(url.searchParams.get("auto"), "format");
    assert.equal(url.searchParams.get("fit"), "crop");
  });

  it("defaults quality and passes local or absolute paths through", () => {
    assert.match(unsplashLoader({ src: "photo-1", width: 64 }), /[?&]q=70(&|$)/);
    assert.equal(unsplashLoader({ src: "/icon.svg", width: 64 }), "/icon.svg");
    assert.equal(
      unsplashLoader({ src: "https://x.test/a.jpg", width: 64 }),
      "https://x.test/a.jpg",
    );
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
