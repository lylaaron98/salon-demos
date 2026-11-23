/**
 * Add-to-calendar helpers: an RFC 5545 .ics file plus Google and Outlook links.
 * Booking times are Singapore local time; they are written as UTC ("Z") so every
 * calendar app places them correctly without a VTIMEZONE block.
 */

export type CalendarEvent = {
  uid: string;
  title: string;
  description: string;
  location: string;
  /** "YYYY-MM-DD", Singapore date. */
  date: string;
  /** "HH:MM", Singapore time. */
  time: string;
  durationMin: number;
};

const SG_OFFSET_MIN = 8 * 60;

function stamp(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/** Start and end as UTC Dates. */
export function eventRange(event: Pick<CalendarEvent, "date" | "time" | "durationMin">) {
  const start = new Date(`${event.date}T${event.time}:00Z`);
  start.setUTCMinutes(start.getUTCMinutes() - SG_OFFSET_MIN);
  const end = new Date(start.getTime() + event.durationMin * 60_000);
  return { start, end };
}

/** "20261126T063000Z" */
export const utcStamp = (d: Date) => stamp(d);

/** Escapes TEXT values (RFC 5545 §3.3.11). */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Folds content lines longer than 75 octets (RFC 5545 §3.1). */
export function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const charSize = new TextEncoder().encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (size + charSize > limit) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += char;
    size += charSize;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function buildIcs(event: CalendarEvent, now: Date = new Date()): string {
  const { start, end } = eventRange(event);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Orrin Collective (demo)//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(event.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

export function googleCalendarHref(event: CalendarEvent): string {
  const { start, end } = eventRange(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: event.description,
    location: event.location,
    ctz: "Asia/Singapore",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarHref(event: CalendarEvent): string {
  const { start, end } = eventRange(event);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: event.description,
    location: event.location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
