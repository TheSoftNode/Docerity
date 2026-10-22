import { test, expect } from "@playwright/test";

import { explainerPairs, heading } from "./copy";

/*
  The explainer card: a concept on the front, its everyday analogy on the
  back, walking through every pair.

  Only the face that is showing is exposed to assistive technology, so the
  assertions read the face marked `aria-hidden="false"`: a face that is merely
  turned away is still in the layout, and checking visibility alone would find
  both.
*/
const shownFace = "#explainers [aria-hidden='false']";

test.describe("Explainers", () => {
  test("shows the first concept with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    await page.locator("#explainers").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: heading("explainers", "explainers") })
    ).toBeVisible();
    await expect(page.locator(shownFace)).toContainText(explainerPairs()[0].concept);

    expect(errors).toEqual([]);
  });

  test("turns to the analogy, then on to the next concept, by hand", async ({ page }) => {
    await page.goto("/");
    await page.locator("#explainers").scrollIntoViewIfNeeded();
    const [first, second] = explainerPairs();

    await page.getByRole("button", { name: "Flip the card" }).click();
    await expect(page.locator(shownFace)).toContainText(first.analogy);

    await page.getByRole("button", { name: "Next concept" }).click();
    await expect(page.locator(shownFace)).toContainText(second.concept);
  });

  test("turns by itself, but not under reduced motion", async ({ page }) => {
    await page.goto("/");
    await page.mouse.move(0, 0);
    await expect(page.locator(shownFace)).toContainText(explainerPairs()[0].analogy, {
      timeout: 12_000,
    });

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await page.waitForTimeout(6_000);
    await expect(page.locator(shownFace)).toContainText(explainerPairs()[0].concept);
  });
});
