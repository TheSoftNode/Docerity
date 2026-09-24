import { test, expect } from "@playwright/test";

/*
  The page shell's edge.

  This exists because the gutter used to grow five times faster than the
  screen: the content was capped at 84rem, so from 1366 up every extra pixel
  of viewport became margin — 48px of edge space at 1280, 96px at 1440, 240px
  at 1728, with the content frozen at 1248px throughout. It was not even
  monotonic, because the rem-based cap interacted with the root-size step at
  1800 to make 1920 narrower-gutted than 1728.
*/
test.describe("Page shell", () => {
  /*
    Each test here reloads the page at eight to ten viewport widths, which is
    the point — the bug was a discontinuity *between* widths, so one viewport
    proves nothing. That makes them several times longer than a normal test,
    and the default 30s budget is not enough once four workers are competing
    for the dev server.
  */
  test.setTimeout(120_000);

  /* Real laptop widths: 13", common Windows, 15" scaled, 14" MBP native,
     15.6" Windows, 16" scaled, 16" MBP native, 1080p. */
  const laptops = [1280, 1366, 1440, 1512, 1600, 1680, 1728, 1920];

  async function gutterAt(page: import("@playwright/test").Page, width: number) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    return page.evaluate(() =>
      Math.round((document.querySelector(".doc-shell") as HTMLElement).getBoundingClientRect().left)
    );
  }

  test("gutter never shrinks as the viewport grows", async ({ page }) => {
    const measured: { width: number; gutter: number }[] = [];
    for (const width of laptops) {
      measured.push({ width, gutter: await gutterAt(page, width) });
    }

    for (let i = 1; i < measured.length; i++) {
      expect(
        measured[i].gutter,
        `gutter shrank from ${measured[i - 1].width}px (${measured[i - 1].gutter}) to ${measured[i].width}px (${measured[i].gutter})`
      ).toBeGreaterThanOrEqual(measured[i - 1].gutter);
    }
  });

  test("gutter stays lean across the whole laptop range", async ({ page }) => {
    /* Lean below 15" and only a little wider from 16", rather than ballooning:
       the whole 1280–1920 range should sit inside one narrow band. */
    for (const width of laptops) {
      const gutter = await gutterAt(page, width);
      expect(gutter, `gutter too wide at ${width}px`).toBeLessThanOrEqual(72);
      expect(gutter, `gutter too narrow at ${width}px`).toBeGreaterThanOrEqual(44);
    }
  });

  test("hero copy starts a consistent distance below the nav", async ({ page }) => {
    /* The headline used to sit 121–140px below the nav depending on width,
       because the copy is centred against a fixed-height illustration. */
    const gaps: number[] = [];
    for (const width of laptops) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      gaps.push(
        await page.evaluate(() => {
          const h1 = document.querySelector("h1") as HTMLElement;
          const eyebrow = h1.previousElementSibling as HTMLElement;
          const header = document.querySelector("header") as HTMLElement;
          return Math.round(
            eyebrow.getBoundingClientRect().top - header.getBoundingClientRect().bottom
          );
        })
      );
    }

    const spread = Math.max(...gaps) - Math.min(...gaps);
    expect(spread, `top gap varies too much across laptops: ${gaps.join(", ")}`).toBeLessThanOrEqual(24);
    expect(Math.max(...gaps), `too much space above the headline: ${gaps.join(", ")}`).toBeLessThanOrEqual(115);
  });

  test("no horizontal overflow from phone to ultrawide", async ({ page }) => {
    for (const width of [320, 375, 640, 768, 1024, 1280, 1440, 1728, 1920, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(clientWidth + 1);
    }
  });
});
