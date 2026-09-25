import { defineConfig, devices } from "@playwright/test";

/**
 * The integration suite: everything that needs a real database.
 *
 * Started by `node scripts/integration.mjs`, which boots an in-memory MongoDB
 * and puts its URI in the environment before this config's `webServer` inherits
 * it. Running `npx playwright test --config playwright.integration.config.ts`
 * directly will not work, and says so below rather than failing halfway through
 * with an unexplained 503.
 */

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not set. Run this through `node scripts/integration.mjs`, " +
      "which starts a database first."
  );
}

export default defineConfig({
  testDir: "./integration",
  /*
    Serial, unlike the main suite.

    These tests share one database and one admin account, and they build on each
    other: a review has to be submitted before it can be approved. Running them
    in parallel would have one test approving another's fixture.
  */
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  /*
    No retries. The one recurring failure here turned out to be a stale
    `.next/dev` cache making the dev server answer 404 for real routes, which a
    retry did not fix and would have hidden if it had. `scripts/integration.mjs`
    clears that cache before every run, so a failure now means a failure.
  */
  retries: 0,
  reporter: [["list"]],
  /* Same reasoning as the main config: the dev server compiles each route on
     first request, and these routes are being hit for the first time. */
  expect: { timeout: 15_000 },
  timeout: 90_000,
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    /*
      A different port from the main suite's, so neither reuses the other's
      server. That matters because the main suite's server is started with no
      MONGODB_URI, and reusing it here would fail every test with a 503.

      The port alone is not enough to run both at once: Next 16 refuses a second
      `next dev` in the same directory regardless of port, and says so. Stop the
      other one first.
    */
    command: "npm run dev -- --port 3001",
    url: "http://localhost:3001",
    /* Never reused: a server already running here may have been started without
       this run's MONGODB_URI, and the failures would make no sense. */
    reuseExistingServer: false,
    timeout: 90_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
