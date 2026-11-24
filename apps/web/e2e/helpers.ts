import { expect, type Page } from "@playwright/test";

export type DataLayerEvent = Record<string, unknown> & { event: string };

/** App events from track() (gtag consent commands and GTM internals left out). */
export async function dataLayer(page: Page): Promise<DataLayerEvent[]> {
  return page.evaluate(
    () =>
      (window.dataLayer ?? []).filter(
        (e) => !!e && typeof e === "object" && "site_platform" in e,
      ) as unknown as DataLayerEvent[],
  );
}

/** Raw dataLayer, with gtag `arguments` entries turned into arrays. */
export async function rawDataLayer(page: Page): Promise<unknown[]> {
  return page.evaluate(() =>
    (window.dataLayer ?? []).map((e) =>
      Object.prototype.toString.call(e) === "[object Arguments]"
        ? Array.from(e as ArrayLike<unknown>)
        : e,
    ),
  );
}

/**
 * Storage state with a saved "reject all" cookie choice, so the consent banner
 * stays out of the way in tests that are not about it.
 */
export function savedConsent(origin: string) {
  return {
    cookies: [],
    origins: [
      {
        origin,
        localStorage: [
          {
            name: "orn_consent",
            value: JSON.stringify({ v: 1, ts: Date.now(), analytics: false, marketing: false }),
          },
        ],
      },
    ],
  };
}

export async function eventNames(page: Page): Promise<string[]> {
  return (await dataLayer(page)).map((e) => e.event);
}

export const stepHeading = (page: Page) => page.locator("#step-title");

export async function continueTo(page: Page, step: string, heading: string | RegExp) {
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(new RegExp(`step=${step}`));
  await expect(stepHeading(page)).toHaveText(heading);
}

/** Steps 1–3 for Dewlab Novena, Hydra-Glow facial, first free slot. Returns the slot label. */
export async function chooseOutletServiceAndSlot(page: Page, query = ""): Promise<string> {
  await page.goto(`/dewlab/book${query}`);
  await expect(stepHeading(page)).toHaveText("Choose an outlet");
  await page.getByRole("radio", { name: /Dewlab · Novena/ }).check();
  await continueTo(page, "service", "Choose a service");
  await page.getByRole("radio", { name: /Hydra-Glow signature facial/ }).check();
  await continueTo(page, "time", "Pick a date and time");
  const slot = page.locator('input[name="time"]').first();
  await slot.check();
  const label = (await slot.locator("xpath=..").innerText()).trim();
  await continueTo(page, "details", "Your details");
  return label;
}
