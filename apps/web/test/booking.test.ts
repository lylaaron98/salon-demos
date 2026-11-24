import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OpeningHours } from "@salon-demos/ui";
import {
  addDays,
  bookingDates,
  daypart,
  getSlots,
  groupByDaypart,
  isFullyBooked,
  nearestSlots,
  sgToday,
} from "../lib/booking/availability.ts";
import { buildIcs, eventRange, escapeText, foldLine } from "../lib/booking/ics.ts";
import {
  MESSAGES,
  errorType,
  mobileDigits,
  suggestEmail,
  validateDetails,
  validateField,
} from "../lib/booking/schema.ts";

const slot = (open: string, close: string) => ({ open, close });
const closedMondays: OpeningHours = {
  mon: null,
  tue: slot("11:00", "21:00"),
  wed: slot("11:00", "21:00"),
  thu: slot("11:00", "21:00"),
  fri: slot("11:00", "21:00"),
  sat: slot("10:00", "19:00"),
  sun: slot("10:00", "19:00"),
};

// Sun 22 Nov 2026, 23:00 SGT (15:00 UTC).
const NOW = new Date("2026-11-22T15:00:00Z");

const valid = {
  firstName: "Mei",
  mobile: "9123 4567",
  email: "",
  notes: "",
  consent: "on",
  marketing: "",
  company: "",
};

describe("details schema", () => {
  it("accepts the minimal valid form and normalises the mobile to E.164", () => {
    const result = validateDetails(valid);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.mobile, "+6591234567");
      assert.equal(result.data.consent, true);
      assert.equal(result.data.marketing, false);
    }
  });

  it("uses the brief's microcopy", () => {
    assert.equal(validateField("firstName", " "), MESSAGES.firstName);
    assert.equal(validateField("mobile", "1234"), MESSAGES.mobile);
    assert.equal(validateField("mobile", "6123 4567"), MESSAGES.landline);
    assert.equal(validateField("email", "mei@"), MESSAGES.email);
    assert.equal(validateField("consent", ""), MESSAGES.consent);
  });

  it("allows CJK, Tamil and punctuation in first names", () => {
    for (const name of ["美玲", "Siti", "D'Souza", "Anne-Marie", "தமிழ்"]) {
      assert.equal(validateField("firstName", name), undefined, name);
    }
    assert.equal(validateField("firstName", "a".repeat(51)), MESSAGES.firstName);
    assert.equal(validateField("firstName", "Mei2"), MESSAGES.firstName);
  });

  it("accepts mobiles with spaces or a +65 prefix, and only 8 or 9 leading digits", () => {
    assert.equal(mobileDigits("+65 9123-4567"), "91234567");
    assert.equal(validateField("mobile", "8123 4567"), undefined);
    assert.equal(validateField("mobile", "+65 9123 4567"), undefined);
    assert.equal(validateField("mobile", "7123 4567"), MESSAGES.mobile);
    assert.equal(validateField("mobile", "9123 456"), MESSAGES.mobile);
  });

  it("treats email as optional", () => {
    assert.equal(validateField("email", ""), undefined);
    assert.equal(validateField("email", "mei@example.com"), undefined);
  });

  it("orders errors by field and flags the honeypot", () => {
    const result = validateDetails({ ...valid, firstName: "", consent: "", company: "Acme" });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.deepEqual(Object.keys(result.errors), ["firstName", "consent"]);
      assert.equal(result.spam, true);
    }
  });

  it("classifies errors for analytics", () => {
    assert.equal(errorType("mobile", "", MESSAGES.mobile), "empty");
    assert.equal(errorType("mobile", "123", MESSAGES.mobile), "format");
    assert.equal(errorType("mobile", "61234567", MESSAGES.landline), "landline");
    assert.equal(errorType("consent", "", MESSAGES.consent), "empty");
  });

  it("suggests fixes for common email typos", () => {
    assert.equal(suggestEmail("mei@gmial.com"), "mei@gmail.com");
    assert.equal(suggestEmail("mei@hotmial.com"), "mei@hotmail.com");
    assert.equal(suggestEmail("mei@gmail.com"), undefined);
    assert.equal(suggestEmail("nope"), undefined);
  });
});

describe("availability", () => {
  it("uses Singapore dates and a 14-day window", () => {
    assert.equal(sgToday(NOW), "2026-11-22");
    const dates = bookingDates(NOW);
    assert.equal(dates.length, 14);
    assert.equal(dates[0], "2026-11-22");
    assert.equal(dates[13], "2026-12-05");
  });

  it("is deterministic", () => {
    const query = { outletSlug: "katong", hours: closedMondays, durationMin: 75, now: NOW };
    const a = getSlots({ ...query, date: "2026-11-25" });
    const b = getSlots({ ...query, date: "2026-11-25" });
    assert.deepEqual(a, b);
  });

  it("honours closed days", () => {
    // 23 Nov 2026 is a Monday.
    assert.deepEqual(
      getSlots({
        outletSlug: "katong",
        hours: closedMondays,
        date: "2026-11-23",
        durationMin: 45,
        now: NOW,
      }),
      [],
    );
  });

  it("only offers slots that finish by closing time and start after opening", () => {
    for (let i = 1; i < 14; i += 1) {
      const date = addDays("2026-11-22", i);
      const slots = getSlots({
        outletSlug: "novena",
        hours: closedMondays,
        date,
        durationMin: 75,
        now: NOW,
      });
      for (const time of slots) {
        const [h = 0, m = 0] = time.split(":").map(Number);
        const start = h * 60 + m;
        assert.ok(start >= 10 * 60, `${date} ${time} before opening`);
        assert.ok(start + 75 <= 21 * 60, `${date} ${time} ends after closing`);
      }
    }
  });

  it("returns nothing for past dates, dates beyond the window and fully booked days", () => {
    const base = { outletSlug: "bugis", hours: closedMondays, durationMin: 30, now: NOW };
    assert.deepEqual(getSlots({ ...base, date: "2026-11-21" }), []);
    assert.deepEqual(getSlots({ ...base, date: "2026-12-06" }), []);
    const full = bookingDates(NOW).find((d) => isFullyBooked("bugis", d));
    if (full) assert.deepEqual(getSlots({ ...base, date: full }), []);
  });

  it("skips slots less than an hour away today", () => {
    const morning = new Date("2026-11-24T02:10:00Z"); // Tue 10:10 SGT
    const slots = getSlots({
      outletSlug: "katong",
      hours: closedMondays,
      date: "2026-11-24",
      durationMin: 30,
      now: morning,
    });
    assert.ok(slots.every((t) => t >= "11:10"));
  });

  it("groups by daypart and finds the nearest alternatives", () => {
    assert.equal(daypart("11:30"), "morning");
    assert.equal(daypart("12:00"), "afternoon");
    assert.equal(daypart("17:00"), "evening");
    const groups = groupByDaypart(["10:00", "13:00", "19:00", "19:30"]);
    assert.deepEqual(
      groups.map((g) => g.part),
      ["morning", "afternoon", "evening"],
    );
    // Ties go to the earlier time.
    assert.deepEqual(nearestSlots(["10:00", "13:00", "14:30", "15:00", "19:00"], "14:30"), [
      "10:00",
      "13:00",
      "15:00",
    ]);
    assert.deepEqual(nearestSlots(["11:00", "14:00", "15:00", "16:00", "20:00"], "14:30"), [
      "14:00",
      "15:00",
      "16:00",
    ]);
  });
});

describe("ics", () => {
  const event = {
    uid: "ORN-7K3Q@orrin-collective.demo",
    title: "Hydra-Glow signature facial at Dewlab Novena (demo)",
    description: "Booking ref ORN-7K3Q; demo, no real appointment.",
    location: "Dewlab Skin Studio, 238 Dewpoint Road, #03-11, Singapore 307238",
    date: "2026-11-26",
    time: "14:30",
    durationMin: 75,
  };

  it("converts Singapore time to UTC", () => {
    const { start, end } = eventRange(event);
    assert.equal(start.toISOString(), "2026-11-26T06:30:00.000Z");
    assert.equal(end.toISOString(), "2026-11-26T07:45:00.000Z");
  });

  it("builds a valid VCALENDAR with escaped text and CRLF line endings", () => {
    const ics = buildIcs(event, new Date("2026-11-22T00:00:00Z"));
    assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
    assert.ok(ics.endsWith("END:VCALENDAR\r\n"));
    assert.match(ics, /DTSTART:20261126T063000Z\r\n/);
    assert.match(ics, /DTEND:20261126T074500Z\r\n/);
    assert.ok(ics.includes("ORN-7K3Q\; demo\\, no real appointment."));
    for (const line of ics.split("\r\n")) {
      assert.ok(new TextEncoder().encode(line).length <= 75, line);
    }
  });

  it("escapes and folds per RFC 5545", () => {
    assert.equal(escapeText("a,b;c\\d\ne"), "a\\,b\;c\\\\d\\ne");
    const folded = foldLine(`DESCRIPTION:${"x".repeat(100)}`);
    assert.ok(folded.includes("\r\n "));
  });
});
