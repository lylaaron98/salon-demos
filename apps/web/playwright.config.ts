import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

/**
 * End-to-end tests for the booking flow. They run against a production build:
 * `pnpm --filter web build && pnpm --filter web test:e2e`.
 *
 * Browser: Playwright's own Chromium when installed (`pnpm exec playwright install
 * chromium`). Set PLAYWRIGHT_CHROMIUM_EXECUTABLE to use another binary; a
 * preinstalled one at /opt/pw-browsers/chromium is picked up automatically.
 */
const PORT = Number(process.env.E2E_PORT ?? 3210);
const PREINSTALLED = "/opt/pw-browsers/chromium";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ??
  (existsSync(PREINSTALLED) ? PREINSTALLED : undefined);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
    browserName: "chromium",
    launchOptions: { executablePath },
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
  ],
  webServer: {
    command: `pnpm exec next start --port ${PORT}`,
    url: `http://localhost:${PORT}/dewlab`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
