import { expect, test, type Page } from "@playwright/test";
import { dataLayer } from "./helpers";

/** Keep the browser on the page: contact links would open the dialer or WhatsApp. */
async function stayOnPage(page: Page) {
  await page.evaluate(() =>
    window.addEventListener("click", (event) => event.preventDefault(), true),
  );
}

const contactClicks = async (page: Page) =>
  (await dataLayer(page)).filter((e) => e.event === "contact_click");

test.describe("contact_click", () => {
  test("fires for outlet-card WhatsApp and call links with the outlet id", async ({ page }) => {
    await page.goto("/sable");
    await stayOnPage(page);
    const card = page.locator('[data-outlet-id="tanjong-pagar"]');
    await card.getByRole("link", { name: /WhatsApp/ }).click();
    await card.getByRole("link", { name: /Call/ }).click();

    const events = await contactClicks(page);
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      brand: "sable",
      site_platform: "nextjs",
      page_type: "brand_home",
      outlet_id: "tanjong-pagar",
      method: "whatsapp",
      location: "outlet_card",
    });
    expect(events[1]).toMatchObject({ method: "call", location: "outlet_card" });
    // No phone numbers in the dataLayer.
    expect(JSON.stringify(events)).not.toMatch(/\d{4} ?\d{4}/);
  });

  test("fires for the closing band's WhatsApp button", async ({ page }) => {
    await page.goto("/rootwell");
    await stayOnPage(page);
    await page
      .locator('[data-contact-location="cta_band"]')
      .getByRole("link", { name: /WhatsApp/ })
      .click();
    expect(await contactClicks(page)).toEqual([
      expect.objectContaining({ brand: "rootwell", method: "whatsapp", location: "cta_band" }),
    ]);
  });

  test("fires once for booking contact links, with the booking context", async ({ page }) => {
    await page.goto("/dewlab/book?outlet=novena");
    await stayOnPage(page);
    const before = (await contactClicks(page)).length;
    await page
      .getByRole("link", { name: /WhatsApp/ })
      .first()
      .click();
    const events = (await contactClicks(page)).slice(before);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ brand: "dewlab", method: "whatsapp", flow: "booking" });
  });
});

test.describe("contact_click in the header", () => {
  test.skip(({ isMobile }) => isMobile, "the desktop utility bar shows the phone number");

  test("fires for the header phone link", async ({ page }) => {
    await page.goto("/dewlab");
    await stayOnPage(page);
    await page.locator("header").getByRole("link", { name: "+65 6200 0000" }).first().click();
    expect(await contactClicks(page)).toEqual([
      expect.objectContaining({
        brand: "dewlab",
        page_type: "brand_home",
        method: "call",
        location: "header",
        flow: null,
      }),
    ]);
  });
});
