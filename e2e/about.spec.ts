import { test, expect } from "@playwright/test";

test.describe("About page", () => {
  test("renders the hero and the profile rail with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/about");

    await expect(
      page.getByRole("heading", { level: 1, name: /One engineer, three habits/i })
    ).toBeVisible();

    const rail = page.getByRole("navigation", { name: "About sections" });
    for (const label of ["Story", "Experience", "Toolkit", "Credentials"]) {
      await expect(rail.getByRole("button", { name: new RegExp(label) })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("each rail tab swaps the panel", async ({ page }) => {
    await page.goto("/about");
    const rail = page.getByRole("navigation", { name: "About sections" });

    /* Story is open by default, so the page is never in a state with no panel. */
    await expect(page.getByRole("heading", { name: "How this started." })).toBeVisible();

    await rail.getByRole("button", { name: /Experience/ }).click();
    await expect(page.getByRole("heading", { name: "Where it comes from." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How this started." })).toBeHidden();

    await rail.getByRole("button", { name: /Toolkit/ }).click();
    await expect(page.getByRole("heading", { name: "What I build with." })).toBeVisible();

    await rail.getByRole("button", { name: /Credentials/ }).click();
    await expect(page.getByRole("heading", { name: "Studied and certified." })).toBeVisible();
  });

  test("the open tab is announced, not just styled", async ({ page }) => {
    await page.goto("/about");
    const rail = page.getByRole("navigation", { name: "About sections" });

    const experience = rail.getByRole("button", { name: /Experience/ });
    await expect(experience).not.toHaveAttribute("aria-current", "true");
    await experience.click();
    await expect(experience).toHaveAttribute("aria-current", "true");
  });

  test("the experience panel carries the migrated track record", async ({ page }) => {
    await page.goto("/about");
    await page
      .getByRole("navigation", { name: "About sections" })
      .getByRole("button", { name: /Experience/ })
      .click();

    await expect(
      page.getByRole("heading", { name: "Full-stack Development Lead" })
    ).toBeVisible();
    await expect(page.getByText("HitoAI")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Web3 & Blockchain Engineer" })
    ).toBeVisible();
  });

  test("the credentials panel shows real certificate scans", async ({
    page,
    request,
  }) => {
    await page.goto("/about");
    await page
      .getByRole("navigation", { name: "About sections" })
      .getByRole("button", { name: /Credentials/ })
      .click();

    await expect(
      page.getByText("B.Eng Electrical & Electronic Engineering, 2nd class upper")
    ).toBeVisible();

    const scans = page.locator('img[alt$="certificate"]');
    await expect(scans.first()).toBeVisible();
    expect(await scans.count()).toBe(8);

    /*
      The sources are fetched directly rather than waiting on the browser to
      decode them.

      Asserting `naturalWidth > 0` is the more direct test and it passes
      against a production build, but the dev image optimiser stalls when
      eight optimised variants are requested at once — the requests are issued
      and no response ever arrives. Since the suite runs against `next dev`,
      that assertion would fail for a reason that has nothing to do with the
      page. Fetching each file proves the same thing: it exists and is served.
    */
    const sources = await scans.evaluateAll((images) =>
      images.map((img) => (img as HTMLImageElement).src)
    );

    for (const source of sources) {
      const url = new URL(source);
      const raw = url.searchParams.get("url") ?? url.pathname;
      const response = await request.get(raw);
      expect(response.status(), `certificate not served: ${raw}`).toBe(200);
      expect(Number(response.headers()["content-length"] ?? 1)).toBeGreaterThan(0);
    }
  });

  test("the hero carries a portrait, not an empty column", async ({ page, request }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    const portrait = page.locator('img[alt*="founder of Docerity"]');
    await expect(portrait).toBeVisible();

    /* Fetched rather than waiting on decode, for the same reason as the
       certificates: the dev image optimiser is unreliable under load. */
    const source = await portrait.getAttribute("src");
    const url = new URL(source!, "http://localhost");
    const response = await request.get(url.searchParams.get("url") ?? url.pathname);
    expect(response.status()).toBe(200);
  });

  test("every hero figure settles on its real value", async ({ page }) => {
    /*
      The figures count up on first view. An earlier version kept the result
      of `String.match` in the effect's dependency list — a new array on every
      render — so the effect re-ran, restarted the count, set state and
      triggered the render that re-ran it, leaving all four flickering near
      zero. This asserts they come to rest on the real numbers.
    */
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    for (const [label, expected] of [
      ["Years teaching and mentoring", "9+"],
      ["Hackathon wins", "4"],
      ["Shipped projects", "25"],
      ["Blockchain ecosystems", "6"],
    ] as const) {
      await expect(
        page.getByText(label, { exact: true }).locator("xpath=preceding-sibling::dd[1]")
      ).toHaveText(expected);
    }

    /* Held for a beat and re-checked: a restarting animation passes a single
       assertion on its way past the target. */
    await page.waitForTimeout(1500);
    await expect(
      page.getByText("Shipped projects", { exact: true }).locator("xpath=preceding-sibling::dd[1]")
    ).toHaveText("25");
  });

  test("the hero has no background grid", async ({ page }) => {
    /*
      A 64px graph-paper tile was added to this band and removed again: it
      reads as scaffolding, and a headline on visible grid lines looks like a
      wireframe. This asserts it stays gone, since it is the kind of thing
      that gets reintroduced as "texture".
    */
    await page.goto("/about");

    const hasTiledGradient = await page
      .locator("section")
      .first()
      .evaluate((section) =>
        Array.from(section.querySelectorAll("*")).some((node) => {
          const style = getComputedStyle(node);
          return (
            style.backgroundImage.includes("linear-gradient") &&
            /^\d+px \d+px$/.test(style.backgroundSize)
          );
        })
      );

    expect(hasTiledGradient, "a tiled background grid is back in the hero").toBe(false);
  });

  test("navbar 'About' link navigates to the page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "About" }).first().click();
    await expect(page).toHaveURL("/about");
  });

  test("does not expose personal contact details or date of birth", async ({ page }) => {
    /*
      The portfolio's About panel carried a date of birth and two personal
      phone numbers. On a company site those invite spam and belong nowhere
      but the contact route, so their absence is asserted rather than assumed.
    */
    await page.goto("/about");
    const body = await page.locator("body").innerText();

    expect(body).not.toContain("9135");
    expect(body).not.toContain("9038");
    expect(body).not.toMatch(/born on/i);
    expect(body).not.toMatch(/whatsapp/i);
  });

  test("the project count matches the work page", async ({ page }) => {
    /*
      The hero claims a number of shipped projects, derived from the same
      array the work page renders. A headline figure nobody can reconcile with
      the work is worth less than no figure at all.
    */
    await page.goto("/work");
    await page.locator("#showcase").scrollIntoViewIfNeeded();
    const actual = await page.locator("#showcase h3 a").count();

    await page.goto("/about");
    await expect(
      page.getByText("Shipped projects").locator("xpath=preceding-sibling::dd[1]")
    ).toHaveText(String(actual));
  });

  test("layout does not overflow horizontally at narrow widths", async ({ page }) => {
    for (const width of [320, 375, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/about");

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(
        clientWidth + 1
      );
    }
  });
});
