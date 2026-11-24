import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Browser } from "@playwright/test";
import { continueTo, savedConsent } from "./helpers";

/**
 * Portfolio screenshots of the Dewlab booking flow: step 3 (date and time) and
 * the success page, desktop 1440x900 and mobile 390x844 at 2x, viewport only.
 * Skipped unless SCREENSHOT_DIR is set:
 *   SCREENSHOT_DIR=../../screenshots pnpm --filter web test:e2e screenshots
 */
const dir = process.env.SCREENSHOT_DIR;

const viewports = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  mobile: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
} as const;

async function capture(browser: Browser, baseURL: string, name: keyof typeof viewports) {
  const context = await browser.newContext({
    ...viewports[name],
    baseURL,
    storageState: savedConsent(new URL(baseURL).origin),
  });
  const page = await context.newPage();
  await page.goto("/dewlab/book?outlet=novena&offer=first-visit");
  await page.getByRole("radio", { name: /Hydra-Glow signature facial/ }).check();
  await continueTo(page, "time", "Pick a date and time");
  await page.locator('input[name="time"]').nth(3).check();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(dir!, `booking-dewlab-step3-${name}.png`) });

  await continueTo(page, "details", "Your details");
  await page.getByLabel("First name").fill("Mei");
  await page.getByLabel("Mobile number").fill("9123 4567");
  await page.getByRole("checkbox", { name: /I agree/ }).check();
  await continueTo(page, "confirm", "Review and confirm");
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("You're booked, Mei.");
  // Blur the focused heading so the screenshot shows the resting state.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(dir!, `booking-dewlab-success-${name}.png`) });
  await context.close();
}

test("captures Dewlab booking screenshots", async ({ browser, baseURL }, testInfo) => {
  test.skip(!dir, "set SCREENSHOT_DIR to capture screenshots");
  test.skip(testInfo.project.name !== "desktop", "captures both viewports itself");
  mkdirSync(dir!, { recursive: true });
  for (const name of ["desktop", "mobile"] as const) {
    await capture(browser, baseURL!, name);
  }
});
