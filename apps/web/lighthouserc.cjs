/**
 * Lighthouse CI: mobile preset (Lighthouse's default Moto G Power emulation with
 * simulated slow 4G), against `next start` on a production build.
 *
 *   pnpm build && pnpm --filter web lhci
 *
 * Locally, point CHROME_PATH at a Chromium (for example /opt/pw-browsers/chromium).
 * LHCI_RUNS overrides the number of runs per URL (median is asserted).
 */
const PORT = process.env.LHCI_PORT ?? "3400";
const base = `http://localhost:${PORT}`;

module.exports = {
  ci: {
    collect: {
      startServerCommand: `pnpm exec next start --port ${PORT}`,
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 60000,
      // The group hub and each brand home: the pages people land on.
      url: [`${base}/`, `${base}/sable`, `${base}/dewlab`, `${base}/rootwell`],
      numberOfRuns: Number(process.env.LHCI_RUNS ?? 3),
      settings: {
        // Mobile is Lighthouse's default form factor; stated here for clarity.
        formFactor: "mobile",
        screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75 },
        throttlingMethod: "simulate",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        chromeFlags: "--no-sandbox --headless=new",
      },
    },
    assert: {
      // Assert on the median of the runs, not the best one (LHCI's default is "optimistic").
      aggregationMethod: "median",
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.95 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
