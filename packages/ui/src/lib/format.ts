/**
 * Formatting and link helpers shared by the components. Pure functions with no
 * imports, so they run under Node's test runner as well as in the browser.
 */

/** `S$88`, or `from S$88` when the price varies. Whole dollars, no decimals. */
export function formatPrice(amount: number, options: { from?: boolean } = {}): string {
  const value = `S$${Math.round(amount).toLocaleString("en-SG")}`;
  return options.from ? `from ${value}` : value;
}

/** Spoken form for screen readers where "S$" could be ambiguous. */
export function priceLabel(amount: number, options: { from?: boolean } = {}): string {
  const value = `${Math.round(amount).toLocaleString("en-SG")} Singapore dollars`;
  return options.from ? `from ${value}` : value;
}

/** Keeps the digits of a phone number, e.g. "+65 6100 0000" -> "6561000000". */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** `tel:` link for a display number such as "+65 6100 0000". */
export function telHref(phone: string): string {
  return `tel:+${phoneDigits(phone)}`;
}

/** Plain wa.me link (no third-party widget), with optional prefilled text. */
export function whatsappHref(phone: string, text?: string): string {
  const base = `https://wa.me/${phoneDigits(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Google Maps directions link (`?api=1&destination=`), no Maps JS needed. */
export function directionsHref(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/** "14:30" -> "2:30 pm", "09:00" -> "9 am". Data stays 24-hour; the UI shows 12-hour. */
export function formatTime12(time: string): string {
  const [h = "0", m = "0"] = time.split(":");
  const hours = Number(h);
  const minutes = Number(m);
  const suffix = hours >= 12 && hours < 24 ? "pm" : "am";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return minutes === 0
    ? `${display} ${suffix}`
    : `${display}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
