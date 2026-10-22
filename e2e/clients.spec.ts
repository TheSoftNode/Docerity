import { test, expect } from "@playwright/test";

import { clientNames } from "./copy";

/*
  The partner bands under the hero.

  The organisations and the ecosystems are named in a scrolling band. Each name
  is drawn twice so the loop is seamless, and the second pass is hidden from
  assistive technology, so what is worth asserting is that every name is
  *announced* exactly once: a missing one is a dropped partner, and a doubled
  one is a screen reader reading the list twice.
*/
test.describe("Partner bands", () => {
  test("announce every partner exactly once, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    const band = page.locator("#clients");
    await band.scrollIntoViewIfNeeded();

    const names = clientNames();
    await expect(band.getByRole("listitem")).toHaveCount(names.length);
    for (const name of names) {
      await expect(band.getByRole("listitem").filter({ hasText: name })).toHaveCount(1);
    }

    expect(errors).toEqual([]);
  });

  test("hold still under the pointer so a name can be read", async ({ page }) => {
    await page.goto("/");
    const track = page.locator("#clients .ld-marquee");
    await track.hover();

    await expect
      .poll(() => track.evaluate((element) => getComputedStyle(element).animationPlayState))
      .toBe("paused");
  });
});
