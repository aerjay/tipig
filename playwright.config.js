import { defineConfig } from "@playwright/test";

// Thin end-to-end safety net. It covers the journeys the unit tests can't:
// real routing + deep links, the justified layout as measured by a real
// browser, keyboard navigation across views, and that no view logs an error.
// Kept to a handful of flows so it stays fast.
//
// The dev server is started automatically, so `npm run test:e2e` is all you need.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium", viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
