/**
 * Opening-hours status for outlet cards ("Open now · closes 9 pm"). Pure: the
 * caller passes the current time, so the result is testable and the component
 * can compute it on the client only (no server/client mismatch).
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/** 24-hour "HH:MM" open/close, or null when closed all day. */
export type OpeningHours = Record<DayKey, { open: string; close: string } | null>;

export type OpenStatus =
  { open: true; label: string; closes: string } | { open: false; label: string; opens?: string };

const DAYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_NAMES: Record<DayKey, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

function toMinutes(time: string): number {
  const [h = "0", m = "0"] = time.split(":");
  return Number(h) * 60 + Number(m);
}

function time12(time: string): string {
  const total = toMinutes(time);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const suffix = hours >= 12 && hours < 24 ? "pm" : "am";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0
    ? `${display} ${suffix}`
    : `${display}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/** Day of week and minutes since midnight in Singapore time (UTC+8, no DST). */
export function singaporeClock(now: Date): { day: DayKey; minutes: number } {
  const sg = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return {
    day: DAYS[sg.getUTCDay()] as DayKey,
    minutes: sg.getUTCHours() * 60 + sg.getUTCMinutes(),
  };
}

export function getOpenStatus(hours: OpeningHours, now: Date): OpenStatus {
  const { day, minutes } = singaporeClock(now);
  const today = hours[day];

  if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, closes: today.close, label: `Open now · closes ${time12(today.close)}` };
  }
  if (today && minutes < toMinutes(today.open)) {
    return { open: false, opens: today.open, label: `Closed · opens ${time12(today.open)}` };
  }

  // Closed for the rest of today: find the next opening day.
  const start = DAYS.indexOf(day);
  for (let offset = 1; offset <= 7; offset += 1) {
    const next = DAYS[(start + offset) % 7] as DayKey;
    const slot = hours[next];
    if (slot) {
      const when = offset === 1 ? "tomorrow" : DAY_NAMES[next];
      return {
        open: false,
        opens: slot.open,
        label: `Closed · opens ${when} ${time12(slot.open)}`,
      };
    }
  }
  return { open: false, label: "Closed" };
}

/** Groups identical consecutive days: "Mon–Fri 10 am–9 pm", "Sun Closed". */
export function summariseHours(hours: OpeningHours): { days: string; time: string }[] {
  const order: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const rows: { from: DayKey; to: DayKey; time: string }[] = [];
  for (const day of order) {
    const slot = hours[day];
    const time = slot ? `${time12(slot.open)}–${time12(slot.close)}` : "Closed";
    const last = rows.at(-1);
    if (last && last.time === time) last.to = day;
    else rows.push({ from: day, to: day, time });
  }
  return rows.map(({ from, to, time }) => ({
    days: from === to ? DAY_NAMES[from] : `${DAY_NAMES[from]}–${DAY_NAMES[to]}`,
    time,
  }));
}
