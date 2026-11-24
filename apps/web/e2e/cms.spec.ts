import { expect, test } from "@playwright/test";

/**
 * Production builds without the Keystatic GitHub app (CI, and Vercel until it's
 * connected) must not expose a CMS that can't save: the admin shows a notice and
 * the API is closed.
 */
test.describe("CMS without GitHub storage", () => {
  test("shows the not-connected notice, noindexed, with no cookie banner", async ({ page }) => {
    await page.goto("/keystatic");
    await expect(page.getByRole("heading", { level: 1, name: "Content editor" })).toBeVisible();
    await expect(page.getByText("isn't connected on this deployment yet")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.getByRole("region", { name: "Cookies on this demo" })).toHaveCount(0);
  });

  test("closes the API", async ({ request }) => {
    const response = await request.get("/api/keystatic/tree");
    expect(response.status()).toBe(404);
  });
});
