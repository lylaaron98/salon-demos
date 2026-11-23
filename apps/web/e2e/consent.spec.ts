import { expect, test, type Page } from "@playwright/test";
import { dataLayer, rawDataLayer } from "./helpers";

// First visit: no saved choice.
test.use({ storageState: { cookies: [], origins: [] } });

const banner = (page: Page) => page.getByRole("region", { name: "Cookies on this demo" });

type GtagCall = [string, string, Record<string, unknown>];
const consentCalls = async (page: Page) =>
  (await rawDataLayer(page)).filter((e): e is GtagCall => Array.isArray(e) && e[0] === "consent");

test.describe("cookie consent", () => {
  test("defaults to denied before anything else and shows the banner", async ({ page }) => {
    await page.goto("/sable");
    await expect(banner(page)).toBeVisible();
    const raw = await rawDataLayer(page);
    expect(raw[0]).toEqual([
      "consent",
      "default",
      {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
        wait_for_update: 500,
      },
    ]);
  });

  test("accept all updates consent and is remembered", async ({ page }) => {
    await page.goto("/dewlab");
    await banner(page).getByRole("button", { name: "Accept all" }).click();
    await expect(banner(page)).toBeHidden();

    const update = (await consentCalls(page)).find((c) => c[1] === "update");
    expect(update?.[2]).toEqual({
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
    expect(
      (await rawDataLayer(page)).some((e) => (e as { event?: string }).event === "consent_update"),
    ).toBe(true);

    await page.reload();
    await expect(banner(page)).toBeHidden();
    // The remembered choice is re-applied on load, right after the defaults.
    const calls = await consentCalls(page);
    expect(calls.map((c) => c[1])).toEqual(["default", "update"]);
    expect(calls[1]![2]).toMatchObject({ analytics_storage: "granted" });
  });

  test("reject all keeps everything denied", async ({ page }) => {
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Reject all" }).click();
    await expect(banner(page)).toBeHidden();
    const update = (await consentCalls(page)).find((c) => c[1] === "update");
    expect(update?.[2]).toMatchObject({ analytics_storage: "denied", ad_storage: "denied" });
  });

  test("customise by keyboard, with focus managed", async ({ page }) => {
    await page.goto("/rootwell");
    const region = banner(page);
    // The banner comes first in the tab order.
    await page.keyboard.press("Tab");
    await expect(region.getByRole("button", { name: "Customise" })).toBeFocused();
    await page.keyboard.press("Enter");

    // Focus moves into the panel; the panel names itself.
    await expect(region.getByText("Choose which cookies to allow")).toBeFocused();
    const analytics = region.getByRole("checkbox", { name: /Analytics/ });
    await expect(analytics).not.toBeChecked();
    await expect(region.getByRole("checkbox", { name: /Strictly necessary/ })).toBeDisabled();
    await analytics.focus();
    await page.keyboard.press("Space");
    await expect(analytics).toBeChecked();
    await region.getByRole("button", { name: "Save choices" }).click();

    await expect(region).toBeHidden();
    // Focus does not get lost on <body> when the banner closes.
    await expect(page.locator("#main")).toBeFocused();
    const update = (await consentCalls(page)).find((c) => c[1] === "update");
    expect(update?.[2]).toEqual({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "granted",
    });
  });

  test("cookie settings reopens the choices and returns focus", async ({ page }) => {
    await page.goto("/sable");
    await banner(page).getByRole("button", { name: "Reject all" }).click();
    await expect(banner(page)).toBeHidden();

    const settings = page.getByRole("link", { name: "Cookie settings" });
    await settings.focus();
    await page.keyboard.press("Enter");
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).getByRole("checkbox", { name: /Analytics/ })).not.toBeChecked();

    await page.keyboard.press("Escape");
    await expect(banner(page)).toBeHidden();
    await expect(settings).toBeFocused();
  });

  test("causes no layout shift", async ({ page }) => {
    await page.goto("/dewlab");
    await expect(banner(page)).toBeVisible();
    await banner(page).getByRole("button", { name: "Accept all" }).click();
    await expect(banner(page)).toBeHidden();
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[]) {
              total += entry.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 300);
        }),
    );
    expect(cls).toBeLessThan(0.01);
  });

  test("does not load GTM without a container id", async ({ page }) => {
    const gtm: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("googletagmanager.com")) gtm.push(r.url());
    });
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Accept all" }).click();
    await page.waitForLoadState("networkidle");
    expect(gtm).toEqual([]);
    // Nothing was clicked, so no app events either.
    expect(await dataLayer(page)).toEqual([]);
  });
});
