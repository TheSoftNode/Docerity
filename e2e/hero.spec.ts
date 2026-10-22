import { test, expect } from "@playwright/test";

import { hero } from "./copy";

/*
  The homepage hero: the rotating headline and the Now Board.

  Copy is read from the editable defaults rather than typed here, as elsewhere
  in this suite: what is worth asserting is that the hero rendered what it was
  given, not that particular words survived an edit.
*/
test.describe("Hero", () => {
  test("renders the headline and both actions with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");

    const copy = hero();
    /* The heading carries the whole title once, whatever phrase is on show. */
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      (copy.title as string).split("\n")[0]
    );

    const hero$ = page.locator("main section").first();
    await expect(hero$.getByRole("link", { name: copy.primaryLabel as string })).toHaveAttribute(
      "href",
      "/contact"
    );
    await expect(
      hero$.getByRole("link", { name: copy.secondaryLabel as string })
    ).toHaveAttribute("href", "/#services");

    expect(errors).toEqual([]);
  });

  test("the Now Board shows a row for each track, and Build opens a live site", async ({
    page,
  }) => {
    await page.goto("/");

    for (const track of ["Build", "Mentor", "Explain"]) {
      await expect(page.getByRole("link", { name: new RegExp(`^${track}: `) })).toBeVisible();
    }

    /* The Build row is a live project, and leads to that project's own site
       rather than to a page about it. */
    await expect(page.getByRole("link", { name: /^Build: / })).toHaveAttribute("href", /^https?:\/\//);
  });

  test("the board moves on to the next word by itself", async ({ page }) => {
    await page.goto("/");
    const build = page.getByRole("link", { name: /^Build: / });
    const first = await build.getAttribute("aria-label");

    /* Polled past one interval (3.6s), with the pointer kept off the board,
       which is what pauses it. */
    await page.mouse.move(0, 0);
    await expect.poll(() => build.getAttribute("aria-label"), { timeout: 12_000 }).not.toBe(first);
  });

  test("under reduced motion the board changes words without scrambling", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.mouse.move(0, 0);

    const build = page.getByRole("link", { name: /^Build: / });
    const first = await build.getAttribute("aria-label");
    await expect.poll(() => build.getAttribute("aria-label"), { timeout: 12_000 }).not.toBe(first);

    /* Sampled straight after the change: with motion on, this is exactly when
       the tiles are still searching for their letters. */
    await expect(page.locator('.ld-tile[data-searching="true"]')).toHaveCount(0);
  });

  test("fits inside the viewport on common laptop screens", async ({ page }) => {
    /* The hero, header included, is designed to open as one complete picture:
       nothing of it, the floating boarding pass included, should sit below
       the fold on a laptop. */
    for (const [width, height] of [
      [1366, 768],
      [1440, 900],
      [1536, 864],
      [1920, 1080],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto("/");

      const bottom = await page.evaluate(
        () => (document.querySelector("main section") as HTMLElement).getBoundingClientRect().bottom
      );
      expect(bottom, `hero overflows the viewport at ${width}×${height}`).toBeLessThanOrEqual(height);
    }
  });

  test("the header sits above the hero with real breathing room", async ({ page }) => {
    await page.goto("/");

    const gap = await page.evaluate(() => {
      const header = document.querySelector("header");
      const h1 = document.querySelector("h1");
      if (!header || !h1) return null;
      return h1.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    });

    expect(gap).not.toBeNull();
    expect(gap as number).toBeGreaterThan(40);
  });
});
