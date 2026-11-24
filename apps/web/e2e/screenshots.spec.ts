import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { continueTo, savedConsent } from "./helpers";

/**
 * Portfolio and PR screenshots, desktop 1440x900 and mobile 390x844 at 2x:
 * - each brand home page, first screen and full page (photos loaded);
 * - the Dewlab booking flow: step 3 (date and time) and the success page.
 * CI uploads them as the `screenshots` artifact. Skipped unless SCREENSHOT_DIR is set:
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

function newContext(browser: Browser, baseURL: string, name: keyof typeof viewports) {
  return browser.newContext({
    ...viewports[name],
    baseURL,
    storageState: savedConsent(new URL(baseURL).origin),
  });
}

/** Scrolls through the page so lazy images load, then waits for every image. */
async function loadAllImages(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(
    () => Array.from(document.images).every((img) => img.complete),
    undefined,
    { timeout: 20_000 },
  );
  await page.evaluate(() => document.fonts.ready);
}

async function captureHomes(browser: Browser, baseURL: string, name: keyof typeof viewports) {
  const context = await newContext(browser, baseURL, name);
  const page = await context.newPage();
  for (const path of ["/", "/sable", "/dewlab", "/rootwell"]) {
    await page.goto(path);
    await loadAllImages(page);
    const slug = path === "/" ? "hub" : path.slice(1);
    await page.screenshot({ path: join(dir!, `home-${slug}-${name}.png`) });
    await page.screenshot({ path: join(dir!, `home-${slug}-${name}-full.png`), fullPage: true });
  }
  await context.close();
}

async function capture(browser: Browser, baseURL: string, name: keyof typeof viewports) {
  const context = await newContext(browser, baseURL, name);
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

test("captures brand home page screenshots", async ({ browser, baseURL }, testInfo) => {
  test.skip(!dir, "set SCREENSHOT_DIR to capture screenshots");
  test.skip(testInfo.project.name !== "desktop", "captures both viewports itself");
  test.setTimeout(120_000);
  mkdirSync(dir!, { recursive: true });
  for (const name of ["desktop", "mobile"] as const) {
    await captureHomes(browser, baseURL!, name);
  }
});
