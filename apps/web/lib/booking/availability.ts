import type { DayKey, OpeningHours } from "@salon-demos/ui";

/**
 * Mock availability. Deterministic: the same outlet, date and service length
 * always give the same slots, so tests and screenshots are stable. All dates and
 * times are Singapore time (UTC+8, no daylight saving). Nothing is stored.
 */

export const BOOKING_WINDOW_DAYS = 14;
const SG_OFFSET_MS = 8 * 60 * 60 * 1000;
const SLOT_STEP_MIN = 30;
/** Earliest bookable slot today, in minutes from now. */
const LEAD_TIME_MIN = 60;

const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTH_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isIsoDate = (value: string) =>
  DATE_PATTERN.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
export const isTime = (value: string) => TIME_PATTERN.test(value);

function utcDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Today's date in Singapore, "YYYY-MM-DD". */
export function sgToday(now: Date): string {
  return iso(new Date(now.getTime() + SG_OFFSET_MS));
}

/** Minutes since midnight, Singapore time. */
export function sgMinutes(now: Date): number {
  const sg = new Date(now.getTime() + SG_OFFSET_MS);
  return sg.getUTCHours() * 60 + sg.getUTCMinutes();
}

export function addDays(date: string, days: number): string {
  const d = utcDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}

export function weekdayOf(date: string): DayKey {
  return DAY_KEYS[utcDate(date).getUTCDay()] as DayKey;
}

/** The bookable window: today plus the next 13 days. */
export function bookingDates(now: Date): string[] {
  const today = sgToday(now);
  return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => addDays(today, i));
}

export function daysAhead(date: string, now: Date): number {
  return Math.round((utcDate(date).getTime() - utcDate(sgToday(now)).getTime()) / 86_400_000);
}

/** "Wed 26 Nov" */
export function formatDateShort(date: string): string {
  const d = utcDate(date);
  return `${DAY_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]}`;
}

/** "Wednesday 26 November 2026" */
export function formatDateLong(date: string): string {
  const d = utcDate(date);
  return `${DAY_LONG[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_LONG[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** Parts for a date chip: { weekday: "Wed", day: "26", month: "Nov" }. */
export function dateParts(date: string) {
  const d = utcDate(date);
  return {
    weekday: DAY_SHORT[d.getUTCDay()] ?? "",
    day: String(d.getUTCDate()),
    month: MONTH_SHORT[d.getUTCMonth()] ?? "",
  };
}

/** FNV-1a 32-bit hash: small, fast and stable across runtimes. */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const toMinutes = (time: string) => {
  const [h = "0", m = "0"] = time.split(":");
  return Number(h) * 60 + Number(m);
};

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** Simulated fully booked days (about one in nine per outlet). */
export function isFullyBooked(outletSlug: string, date: string): boolean {
  return hash(`${outletSlug}|${date}|full`) % 9 === 0;
}

export function isClosed(hours: OpeningHours, date: string): boolean {
  return hours[weekdayOf(date)] === null;
}

export type SlotQuery = {
  outletSlug: string;
  hours: OpeningHours;
  date: string;
  durationMin: number;
  now: Date;
};

/**
 * Free start times ("HH:MM", 24-hour) for a service at an outlet on a date.
 * Closed days, days outside the window and simulated fully booked days return [].
 * The appointment must finish by closing time; today's slots start at least an
 * hour from now.
 */
export function getSlots({ outletSlug, hours, date, durationMin, now }: SlotQuery): string[] {
  if (!isIsoDate(date)) return [];
  const ahead = daysAhead(date, now);
  if (ahead < 0 || ahead >= BOOKING_WINDOW_DAYS) return [];
  const day = hours[weekdayOf(date)];
  if (!day || isFullyBooked(outletSlug, date)) return [];

  const earliest = ahead === 0 ? sgMinutes(now) + LEAD_TIME_MIN : 0;
  const last = toMinutes(day.close) - durationMin;
  const slots: string[] = [];
  for (let t = toMinutes(day.open); t <= last; t += SLOT_STEP_MIN) {
    if (t < earliest) continue;
    const time = toTime(t);
    // Roughly a third of slots are "taken".
    if (hash(`${outletSlug}|${date}|${time}`) % 100 < 35) continue;
    slots.push(time);
  }
  return slots;
}

export type Daypart = "morning" | "afternoon" | "evening";

export function daypart(time: string): Daypart {
  const minutes = toMinutes(time);
  if (minutes < 12 * 60) return "morning";
  if (minutes < 17 * 60) return "afternoon";
  return "evening";
}

export const DAYPART_LABELS: Record<Daypart, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

export function groupByDaypart(slots: string[]): { part: Daypart; slots: string[] }[] {
  const parts: Daypart[] = ["morning", "afternoon", "evening"];
  return parts
    .map((part) => ({ part, slots: slots.filter((slot) => daypart(slot) === part) }))
    .filter((group) => group.slots.length > 0);
}

/** The `count` free slots closest to a time that was just taken. */
export function nearestSlots(slots: string[], time: string, count = 3): string[] {
  const target = toMinutes(time);
  return slots
    .filter((slot) => slot !== time)
    .map((slot) => ({ slot, distance: Math.abs(toMinutes(slot) - target) }))
    .sort((a, b) => a.distance - b.distance || toMinutes(a.slot) - toMinutes(b.slot))
    .slice(0, count)
    .map(({ slot }) => slot)
    .sort((a, b) => toMinutes(a) - toMinutes(b));
}

/** Adds minutes to an "HH:MM" time (same day). */
export function addMinutes(time: string, minutes: number): string {
  return toTime(toMinutes(time) + minutes);
}
