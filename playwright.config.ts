import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  /*
    Playwright's default is 5s, and the client-side navigation assertions sat
    right on it. The suite runs against `next dev`, which compiles a route the
    first time it is requested: measured serially, a click through to /work
    settles in 3.1–4.6s, so any contention at all pushed `toHaveURL` past the
    limit. That produced a recurring failure that looked like a broken link
    and was not one.

    Raising the ceiling does not hide a real break: an assertion that will
    never pass still fails, just later, while one that would have passed at
    5.2s now does.
  */
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      /*
        Two exclusions, for different reasons.

        Visual baselines are recorded on Desktop Chrome, so running them here
        would compare a phone viewport against a desktop screenshot.

        The unit spec never opens a page: it imports server modules and calls
        them in Node. Running it under a second device would repeat the scrypt
        work, which is deliberately slow, to assert exactly the same thing.
      */
      testIgnore: [/visual\.spec\.ts/, /auth-unit\.spec\.ts/],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    /*
      Every service blanked, so this suite runs against nothing real.

      It was written for the degraded path: the contact and review forms answer
      503, the blog serves the posts built into the code, the admin area
      explains what is missing. That held while `.env.local` did not exist. The
      moment it did, `next dev` loaded it and the suite started running against
      a live Atlas cluster, a live Cloudinary account and live Gmail
      credentials. Tests that assert a 503 failed, which was the harmless half.
      The other half is that `reviews.spec.ts` posts a valid review, and that
      review was written to the production database.

      `@next/env` does not override variables already present in the
      environment, so setting them empty here wins over .env.local. Anything
      that genuinely needs a database belongs in the integration suite, which
      starts its own throwaway one.
    */
    env: {
      MONGODB_URI: "",
      SESSION_SECRET: "",
      SMTP_USER: "",
      SMTP_PASSWORD: "",
      SMTP_FROM: "",
      CONTACT_TO_EMAIL: "",
      CLOUDINARY_CLOUD_NAME: "",
      CLOUDINARY_API_KEY: "",
      CLOUDINARY_API_SECRET: "",
    },
  },
});
