import { expect, test } from "@playwright/test";
import {
  chooseOutletServiceAndSlot,
  continueTo,
  dataLayer,
  eventNames,
  stepHeading,
} from "./helpers";

test.describe("booking flow", () => {
  test("books a Dewlab facial end to end", async ({ page, request }, testInfo) => {
    await page.goto("/dewlab/book?offer=first-visit");
    await expect(stepHeading(page)).toHaveText("Choose an outlet");

    // Continue stays disabled until a choice is made.
    const next = page.getByRole("button", { name: "Continue" });
    await expect(next).toBeDisabled();
    await expect(page.getByText("Choose an outlet to continue.")).toBeVisible();

    await page.getByRole("radio", { name: /Dewlab · Novena/ }).check();
    await continueTo(page, "service", "Choose a service");
    await expect(page).toHaveURL(/outlet=novena/);

    // The first-visit offer shows its price.
    const facial = page.getByRole("radio", { name: /Hydra-Glow signature facial/ });
    await expect(page.locator("label", { has: facial })).toContainText("S$48");
    await facial.check();
    await continueTo(page, "time", "Pick a date and time");

    // Back and forward move between step URLs and keep the choice.
    await page.goBack();
    await expect(stepHeading(page)).toHaveText("Choose a service");
    await expect(page.getByRole("radio", { name: /Hydra-Glow signature facial/ })).toBeChecked();
    await page.goForward();
    await expect(stepHeading(page)).toHaveText("Pick a date and time");

    // Progress: labelled steps on desktop, "Step 3 of 5" on mobile.
    if (testInfo.project.name === "desktop") {
      await expect(page.locator('[aria-current="step"]')).toContainText("Date & time");
    } else {
      await expect(page.getByText("Step 3 of 5 · Date & time")).toBeVisible();
    }

    await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
    await expect(page.getByText("Choose a time to continue.")).toBeVisible();

    // 44px minimum targets on the busiest step.
    const slot = page.locator('input[name="time"]').first();
    const targets = [
      page.locator('label:has(input[name="time"])').first(),
      page.locator('a[aria-current="date"]'),
      page.getByRole("button", { name: "Continue" }),
      page.getByRole("link", { name: "Back" }),
    ];
    for (const target of targets) {
      const box = await target.boundingBox();
      expect(box, "target is rendered").not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    }

    // Sticky Continue on mobile: stays in the viewport.
    if (testInfo.project.name === "mobile") {
      const button = await page.getByRole("button", { name: "Continue" }).boundingBox();
      expect(button!.y + button!.height).toBeLessThanOrEqual(844);
    }

    await slot.check();
    await continueTo(page, "details", "Your details");

    await page.getByLabel("First name").fill("Mei");
    await page.getByLabel("Mobile number").fill("9123 4567");
    await page.getByLabel("Email (optional)").fill("mei@example.com");
    await page.getByRole("checkbox", { name: /I agree to Orrin Collective/ }).check();
    await continueTo(page, "confirm", "Review and confirm");

    const review = page.locator("form dl");
    await expect(review).toContainText("Your detailsMei");
    await expect(review).toContainText("9123 4567 · mei@example.com");
    await expect(page.locator("main")).not.toContainText("NRIC");

    await page.getByRole("button", { name: "Confirm booking" }).click();
    await expect(page).toHaveURL(/\/dewlab\/book\/confirmed\?ref=ORN-[2-9A-HJ-NP-Z]{4}/);
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("You're booked, Mei.");
    await expect(heading).toBeFocused();
    await expect(page.getByText(/^Ref: ORN-/)).toBeVisible();

    // WhatsApp and call fallbacks.
    await expect(
      page.getByRole("link", { name: /WhatsApp us about this booking/ }),
    ).toHaveAttribute("href", /^https:\/\/wa\.me\/6582010000\?text=/);
    await expect(page.getByRole("link", { name: /^Call \+65 6201 0000/ })).toHaveAttribute(
      "href",
      "tel:+6562010000",
    );

    // Add to calendar: .ics download.
    await page.getByText("Add to calendar").click();
    const ics = page.getByRole("link", { name: "Apple Calendar (.ics)" });
    await expect(ics).toBeVisible();
    const response = await request.get((await ics.getAttribute("href"))!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/calendar");
    expect(response.headers()["content-disposition"]).toMatch(/attachment; filename="dewlab-ORN-/);
    const body = await response.text();
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("SUMMARY:Hydra-Glow signature facial at Dewlab Novena (demo)");

    // Analytics: funnel events in order, named as in the brief, with no PII.
    await expect.poll(() => eventNames(page)).toContain("booking_complete");
    const names = await eventNames(page);
    const funnel = [
      "booking_start",
      "select_outlet",
      "select_service",
      "select_slot",
      "details_submit",
      "booking_confirm",
      "booking_complete",
    ];
    const positions = funnel.map((name) => names.indexOf(name));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);

    const events = await dataLayer(page);
    // One view per step shown, including the back/forward detour.
    expect(events.filter((e) => e.event === "booking_step_view").map((e) => e.step_name)).toEqual([
      "outlet",
      "service",
      "time",
      "service",
      "time",
      "details",
      "confirm",
    ]);
    for (const event of events) {
      expect(event.brand).toBe("dewlab");
      expect(event.site_platform).toBe("nextjs");
      expect(event.flow).toBe("booking");
    }
    const complete = events.find((e) => e.event === "booking_complete")!;
    expect(complete).toMatchObject({ value: 48, currency: "SGD", is_trial: true });
    expect(complete.booking_ref).toMatch(/^[0-9a-f]{16}$/);
    const serialised = JSON.stringify(events);
    for (const pii of ["Mei", "9123", "91234567", "mei@example.com", "ORN-"]) {
      expect(serialised).not.toContain(pii);
    }

    // The conversion fires once per booking ref, even after a reload.
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await eventNames(page)).not.toContain("booking_complete");
  });

  test("shows inline validation errors with the brief's microcopy", async ({ page }) => {
    await chooseOutletServiceAndSlot(page);

    // Submitting empty: errors, a count announcement and focus on the first field.
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page).toHaveURL(/step=details/);
    await expect(
      page.getByRole("alert").filter({ hasText: "3 fields need attention." }),
    ).toBeVisible();
    await expect(page.getByText("Please enter your first name.")).toBeVisible();
    await expect(
      page.getByText("Enter an 8-digit Singapore mobile number, e.g. 9123 4567."),
    ).toBeVisible();
    await expect(
      page.getByText("Please agree so we can contact you about your booking."),
    ).toBeVisible();
    await expect(page.getByLabel("First name")).toBeFocused();
    await expect(page.getByLabel("First name")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("First name")).toHaveAttribute(
      "aria-describedby",
      /firstName-error/,
    );

    // Landline, validated on blur.
    const mobile = page.getByLabel("Mobile number");
    await mobile.fill("6123 4567");
    await mobile.blur();
    await expect(
      page.getByText(
        "This looks like a landline. We'll need a mobile number to send your confirmation.",
      ),
    ).toBeVisible();

    // Live once in error: fixing it shows a check.
    await mobile.fill("8123 4567");
    await expect(page.getByText("This looks like a landline.", { exact: false })).toBeHidden();
    await expect(page.getByText("Looks good")).toBeVisible();

    // Email typo suggestion.
    const email = page.getByLabel("Email (optional)");
    await email.fill("mei@gmial.com");
    await email.blur();
    await expect(page.getByText("Did you mean mei@gmail.com?")).toBeVisible();
    await page.getByRole("button", { name: "Use this" }).click();
    await expect(email).toHaveValue("mei@gmail.com");

    await email.fill("mei@");
    await email.blur();
    await expect(page.getByText("Enter an email like name@example.com.")).toBeVisible();

    // No validation on the first keystroke of an untouched field.
    const name = page.getByLabel("First name");
    await name.fill("M");
    await expect(page.getByText("Please enter your first name.")).toBeHidden();

    const errors = (await dataLayer(page)).filter((e) => e.event === "form_error");
    expect(errors.map((e) => `${e.field}:${e.error_type}`)).toEqual(
      expect.arrayContaining([
        "first_name:empty",
        "mobile:empty",
        "consent:empty",
        "mobile:landline",
        "email:format",
      ]),
    );
    expect(JSON.stringify(errors)).not.toContain("6123");
  });

  test("is keyboard operable", async ({ page }) => {
    await page.goto("/dewlab/book");
    const first = page.getByRole("radio").first();
    await first.focus();
    await page.keyboard.press("Space");
    await expect(first).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("radio").nth(1)).toBeChecked();
    await page.keyboard.press("Enter");
    await expect(stepHeading(page)).toHaveText("Choose a service");
    // Focus moves to the new step's heading.
    await expect(stepHeading(page)).toBeFocused();
  });

  test("redirects a skipped step back with a message", async ({ page }) => {
    await page.goto("/dewlab/book?outlet=novena&step=details");
    await expect(stepHeading(page)).toHaveText("Choose a service");
    await expect(page.locator("main").getByRole("alert")).toHaveText(
      "Choose a service to continue.",
    );
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("completes a booking with plain form posts", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "one viewport is enough");
    await page.goto("/rootwell/book");
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(stepHeading(page)).toHaveText("Choose a service");
    await page.getByRole("radio", { name: /Signature head spa/ }).check();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(stepHeading(page)).toHaveText("Pick a date and time");
    await page.locator('input[name="time"]').first().check();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(stepHeading(page)).toHaveText("Your details");

    // Server-side validation (the same zod schema) without client JS.
    await page.getByLabel("First name").fill("Arun");
    await page.getByLabel("Mobile number").fill("6123 4567");
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("This looks like a landline.", { exact: false })).toBeVisible();
    await expect(page.getByLabel("First name")).toHaveValue("Arun");

    await page.getByLabel("Mobile number").fill("9876 5432");
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(stepHeading(page)).toHaveText("Review and confirm");

    await page.getByRole("button", { name: "Confirm booking" }).click();
    await expect(page).toHaveURL(/\/rootwell\/book\/confirmed\?ref=ORN-/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("You're booked, Arun.");
  });
});

test.describe("unknown brand", () => {
  for (const path of ["/glowco", "/glowco/book", "/glowco/book/confirmed?ref=ORN-ABCD"]) {
    test(`404s for ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "We couldn't find that page.",
      );
    });
  }
});
