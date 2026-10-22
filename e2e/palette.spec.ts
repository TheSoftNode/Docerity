import { test, expect, type Page } from "@playwright/test";

import { DEFAULT_PALETTE, PALETTE_STORAGE_KEY, PALETTES } from "@/lib/theme/palettes";

/*
  The homepage's colour themes.

  What matters to a visitor: the brand palette by default, a choice that takes
  effect at once and survives a reload, the logo following the palette, and
  no flash of the wrong colours on a return visit.
*/

const palette = (page: Page) => page.evaluate(() => document.documentElement.dataset.palette);

/** The header's logo image that is actually displayed. */
async function visibleLogo(page: Page) {
  return page
    .locator("header .ld-logo img")
    .evaluateAll((images) =>
      images
        .filter((image) => getComputedStyle(image).display !== "none")
        .map((image) => image.getAttribute("data-logo"))
    );
}

test.describe("Colour themes", () => {
  test("a first visit gets the brand palette and its logo", async ({ page }) => {
    await page.goto("/");

    expect(await palette(page)).toBe(DEFAULT_PALETTE);
    expect(await visibleLogo(page)).toEqual([DEFAULT_PALETTE]);
  });

  test("choosing a palette applies it, swaps the logo, and survives a reload", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const target = PALETTES.find((entry) => entry.key !== DEFAULT_PALETTE)!;

    await page.getByRole("button", { name: /^Colour theme:/ }).click();
    const radio = page.getByRole("radio", { name: target.name });
    await radio.click();

    expect(await palette(page)).toBe(target.key);
    expect(await visibleLogo(page)).toEqual([target.key]);
    await expect(page.getByRole("button", { name: `Colour theme: ${target.name}` })).toBeVisible();

    await page.reload();
    expect(await palette(page)).toBe(target.key);
  });

  test("a returning visitor's palette is in place before the page renders", async ({ page }) => {
    const target = PALETTES[PALETTES.length - 1];
    await page.addInitScript(
      ([key, value]) => window.localStorage.setItem(key, value),
      [PALETTE_STORAGE_KEY, target.key] as const
    );

    /* Read at DOMContentLoaded. React never writes this attribute, so finding
       it here proves the blocking head script set it before first paint. */
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(await palette(page)).toBe(target.key);
  });

  test("an unknown stored value falls back to the brand palette", async ({ page }) => {
    await page.addInitScript(
      ([key]) => window.localStorage.setItem(key, "not-a-palette"),
      [PALETTE_STORAGE_KEY] as const
    );

    await page.goto("/");
    expect(await palette(page)).toBe(DEFAULT_PALETTE);
  });

  test("the phone menu offers the same choice", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();
    const group = page.getByRole("radiogroup", { name: "Colour theme" });
    await expect(group.getByRole("radio")).toHaveCount(PALETTES.length);

    const target = PALETTES[1];
    await group.getByRole("radio", { name: target.name }).click();
    expect(await palette(page)).toBe(target.key);
    await expect(group.getByRole("radio", { name: target.name })).toHaveAttribute("aria-checked", "true");
  });
});
