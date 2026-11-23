import type { OpeningHours } from "@salon-demos/ui";

/** Reusable fictional opening-hours patterns (24-hour data; the UI shows 12-hour). */

const slot = (open: string, close: string) => ({ open, close });

export const lateWeekdays: OpeningHours = {
  mon: slot("10:00", "21:00"),
  tue: slot("10:00", "21:00"),
  wed: slot("10:00", "21:00"),
  thu: slot("10:00", "21:00"),
  fri: slot("10:00", "21:00"),
  sat: slot("09:00", "19:00"),
  sun: slot("10:00", "18:00"),
};

export const closedMondays: OpeningHours = {
  mon: null,
  tue: slot("11:00", "21:00"),
  wed: slot("11:00", "21:00"),
  thu: slot("11:00", "21:00"),
  fri: slot("11:00", "21:00"),
  sat: slot("10:00", "19:00"),
  sun: slot("10:00", "19:00"),
};

export const everyDay: OpeningHours = {
  mon: slot("10:00", "22:00"),
  tue: slot("10:00", "22:00"),
  wed: slot("10:00", "22:00"),
  thu: slot("10:00", "22:00"),
  fri: slot("10:00", "22:00"),
  sat: slot("10:00", "22:00"),
  sun: slot("10:00", "22:00"),
};
