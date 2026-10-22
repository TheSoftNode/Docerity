import { test, expect, type Page } from "@playwright/test";

import { PALETTE_STORAGE_KEY, PALETTES } from "@/lib/theme/palettes";

/*
  Visual regression for the homepage.

  Every test runs under emulated reduced motion, which the page honours by
  holding still: entrances are instant, the bands stop, the board's tiles do
  not scramble and the explainer card does not turn on its own. That is what
  makes a screenshot of an animated page deterministic.

  Two things still change by themselves even then, because they are content
  rather than motion: the board's clock and the word on each of its rows. Both
  are masked, so the baseline checks the board's frame and layout without
  depending on which second or which word the capture landed on.

  Baselines are recorded on Desktop Chrome (see playwright.config.ts). After an
  intentional visual change, re-record them with
  `npm run test:e2e:update-snapshots -- e2e/visual.spec.ts`.
*/

const OPTIONS = { maxDiffPixelRatio: 0.02 } as const;

/** The parts of the hero that change on their own, masked out of every capture. */
const liveParts = (page: Page) => [
  page.locator(".ld-board .tabular-nums"),
  page.locator(".ld-board ul"),
];

async function open(page: Page, width: number, height: number) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await page.getByRole("heading", { level: 1 }).waitFor();
  /* The pointer off the page, so nothing is in its hover state. */
  await page.mouse.move(0, 0);
}

test.describe("Visual regression", () => {
  test("hero looks correct on desktop", async ({ page }) => {
    await open(page, 1440, 900);
    await expect(page).toHaveScreenshot("hero-desktop.png", { ...OPTIONS, mask: liveParts(page) });
  });

  test("hero looks correct on mobile", async ({ page }) => {
    await open(page, 390, 844);
    await expect(page).toHaveScreenshot("hero-mobile.png", { ...OPTIONS, mask: liveParts(page) });
  });

  /* One capture per palette, so a change to a palette's tokens, or a token a
     section forgot to use, shows up as a diff rather than in production. */
  for (const palette of PALETTES) {
    test(`hero in the ${palette.name} palette`, async ({ page }) => {
      await page.addInitScript(
        ([key, value]) => window.localStorage.setItem(key, value),
        [PALETTE_STORAGE_KEY, palette.key] as const
      );
      await open(page, 1440, 900);
      await expect(page).toHaveScreenshot(`hero-${palette.key}.png`, {
        ...OPTIONS,
        mask: liveParts(page),
      });
    });
  }

  for (const id of ["clients", "services", "work", "mentorship", "explainers", "reviews", "contact"]) {
    test(`${id} section looks correct on desktop`, async ({ page }) => {
      await open(page, 1440, 900);
      const section = page.locator(`#${id}`);
      await section.scrollIntoViewIfNeeded();

      await expect(section).toHaveScreenshot(`${id}-desktop.png`, OPTIONS);
    });
  }
});
