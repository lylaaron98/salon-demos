import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * axe-core scans (WCAG 2.2 A/AA rules) on the key pages, at both viewports (the
 * desktop and mobile projects). Any serious or critical violation fails the test;
 * minor and moderate ones are attached to the report for review.
 */
const PAGES = [
  { name: "group hub", path: "/" },
  { name: "Sable & Shear home", path: "/sable" },
  { name: "Dewlab home", path: "/dewlab" },
  { name: "Rootwell home", path: "/rootwell" },
  { name: "Sable & Shear booking step 1", path: "/sable/book" },
  { name: "Dewlab booking step 1", path: "/dewlab/book" },
  { name: "Rootwell booking step 1", path: "/rootwell/book" },
];

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function scan(page: Page, label: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  const summary = blocking.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.map((n) => n.target.join(" ")).slice(0, 5),
  }));
  await test.info().attach(`axe ${label}`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json",
  });
  expect(summary, `serious/critical axe violations on ${label}`).toEqual([]);
}

for (const { name, path } of PAGES) {
  test(`${name} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    await scan(page, name);
  });
}

test.describe("with the cookie banner open", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("banner and customise panel have no serious or critical axe violations", async ({
    page,
  }) => {
    await page.goto("/dewlab");
    const banner = page.getByRole("region", { name: "Cookies on this demo" });
    await expect(banner).toBeVisible();
    await scan(page, "consent banner");
    await banner.getByRole("button", { name: "Customise" }).click();
    // Save choices replaces Customise in the same slot. It must be a new element
    // that renders in its final colours at once: if React reused the Customise
    // button, a colour transition would be running and axe would read a
    // half-faded background. (Its colour can be the hover shade on touch
    // emulation, where the pointer stays over the slot, so compare animations.)
    const running = await banner
      .getByRole("button", { name: "Save choices" })
      .evaluate((el) => el.getAnimations().length);
    expect(running).toBe(0);
    await scan(page, "consent customise panel");
  });
});
