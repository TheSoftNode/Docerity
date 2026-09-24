import { test, expect } from "@playwright/test";

test.describe("Clients", () => {
  test("renders both logo rows with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/");
    await page.locator("#clients").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: "Teams, and the ground it was built on." })
    ).toBeVisible();
    await expect(page.getByText("Organisations", { exact: true })).toBeVisible();
    await expect(page.getByText("Protocols & platforms", { exact: true })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("every logo actually loads", async ({ page }) => {
    /* A broken logo still renders an alt-text box, so the section looks
       populated while being empty. This checks the bitmaps decoded. */
    await page.goto("/");
    await page.locator("#clients").scrollIntoViewIfNeeded();

    const logos = page.locator("#clients img");
    const count = await logos.count();
    expect(count).toBe(9);

    for (let i = 0; i < count; i++) {
      const ok = await logos.nth(i).evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
      );
      const alt = await logos.nth(i).getAttribute("alt");
      expect(ok, `logo failed to load: ${alt}`).toBe(true);
    }
  });
});
