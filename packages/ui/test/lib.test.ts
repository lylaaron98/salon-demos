import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  directionsHref,
  formatPrice,
  formatTime12,
  priceLabel,
  telHref,
  whatsappHref,
} from "../src/lib/format.ts";
import { getOpenStatus, summariseHours, type OpeningHours } from "../src/lib/hours.ts";
import { rovingIndex, trapIndex } from "../src/lib/keyboard.ts";

describe("format", () => {
  it("writes prices as S$ with no decimals, with an optional 'from'", () => {
    assert.equal(formatPrice(88), "S$88");
    assert.equal(formatPrice(138, { from: true }), "from S$138");
    assert.equal(formatPrice(1280.4), "S$1,280");
    assert.equal(priceLabel(88, { from: true }), "from 88 Singapore dollars");
  });

  it("builds tel, WhatsApp and directions links", () => {
    assert.equal(telHref("+65 6100 0000"), "tel:+6561000000");
    assert.equal(whatsappHref("+65 8100 0000"), "https://wa.me/6581000000");
    assert.equal(
      whatsappHref("+65 8100 0000", "Hi, I'd like to book"),
      "https://wa.me/6581000000?text=Hi%2C%20I'd%20like%20to%20book",
    );
    assert.match(
      directionsHref("1 Example Road"),
      /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=1%20Example%20Road$/,
    );
  });

  it("shows 12-hour times in the UI", () => {
    assert.equal(formatTime12("09:00"), "9 am");
    assert.equal(formatTime12("14:30"), "2:30 pm");
    assert.equal(formatTime12("12:00"), "12 pm");
    assert.equal(formatTime12("00:15"), "12:15 am");
  });
});

describe("opening hours", () => {
  const weekday = { open: "10:00", close: "21:00" };
  const hours: OpeningHours = {
    mon: weekday,
    tue: weekday,
    wed: weekday,
    thu: weekday,
    fri: weekday,
    sat: { open: "09:00", close: "19:00" },
    sun: null,
  };

  // Singapore is UTC+8. Wed 26 Nov 2026, 14:30 SGT = 06:30 UTC.
  const sgt = (iso: string) => new Date(`${iso}+08:00`);

  it("is open during hours", () => {
    const status = getOpenStatus(hours, sgt("2026-11-26T14:30:00"));
    assert.equal(status.open, true);
    assert.equal(status.label, "Open now · closes 9 pm");
  });

  it("says when it opens later today", () => {
    const status = getOpenStatus(hours, sgt("2026-11-26T08:00:00"));
    assert.equal(status.label, "Closed · opens 10 am");
  });

  it("skips closed days to the next opening", () => {
    // Saturday 28 Nov after closing: Sunday is closed, so Monday.
    assert.equal(
      getOpenStatus(hours, sgt("2026-11-28T20:00:00")).label,
      "Closed · opens Mon 10 am",
    );
    // Friday after closing: Saturday opens at 9.
    assert.equal(
      getOpenStatus(hours, sgt("2026-11-27T22:00:00")).label,
      "Closed · opens tomorrow 9 am",
    );
  });

  it("summarises identical days", () => {
    assert.deepEqual(summariseHours(hours), [
      { days: "Mon–Fri", time: "10 am–9 pm" },
      { days: "Sat", time: "9 am–7 pm" },
      { days: "Sun", time: "Closed" },
    ]);
  });
});

describe("keyboard", () => {
  it("moves through tabs with arrows, Home and End", () => {
    assert.equal(rovingIndex("ArrowRight", 2, 3), 0);
    assert.equal(rovingIndex("ArrowLeft", 0, 3), 2);
    assert.equal(rovingIndex("Home", 2, 3), 0);
    assert.equal(rovingIndex("End", 0, 3), 2);
    assert.equal(rovingIndex("a", 0, 3), null);
  });

  it("wraps Tab at the edges of a focus trap", () => {
    assert.equal(trapIndex(false, 4, 5), 0);
    assert.equal(trapIndex(true, 0, 5), 4);
    assert.equal(trapIndex(false, 2, 5), null);
    assert.equal(trapIndex(false, -1, 5), 0);
    assert.equal(trapIndex(true, -1, 5), 4);
  });
});
