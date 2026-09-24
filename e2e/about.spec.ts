import { test, expect } from "@playwright/test";

test.describe("About page", () => {
  test("renders every section with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/about");

    await expect(
      page.getByRole("heading", { level: 1, name: /One engineer, three habits/i })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "How this started." })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Where the experience comes from." })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "What I build with." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Studied, and certified." })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("navbar 'About' link navigates to the page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation").getByRole("link", { name: "About" }).first().click();
    await expect(page).toHaveURL("/about");
  });

  test("shows the migrated portfolio track record", async ({ page }) => {
    await page.goto("/about");

    /* Roles and institutions carried over from the standalone portfolio.
       "HitoAI" appears in both the story prose and the experience list, so this
       scopes to the experience section rather than matching either. */
    const experience = page.locator("#experience");
    await expect(
      experience.getByRole("heading", { name: "Full-stack Development Lead" })
    ).toBeVisible();
    await expect(experience.getByText("HitoAI")).toBeVisible();
    await expect(
      experience.getByRole("heading", { name: "Web3 & Blockchain Engineer" })
    ).toBeVisible();
    /* The university appears twice under #credentials — once as an institution
       and once as a certificate issuer — so this asserts the degree itself,
       which is unique on the page. */
    await expect(
      page.getByText("B.Eng Electrical & Electronic Engineering, 2nd class upper")
    ).toBeVisible();
  });

  test("does not expose personal contact details or date of birth", async ({ page }) => {
    /*
      The portfolio's About panel carried a date of birth and two personal phone
      numbers. On a company site those invite spam and belong nowhere but the
      contact route, so their absence is asserted rather than assumed.
    */
    await page.goto("/about");
    const body = await page.locator("body").innerText();

    expect(body).not.toContain("9135");
    expect(body).not.toContain("9038");
    expect(body).not.toMatch(/born on/i);
    expect(body).not.toMatch(/whatsapp/i);
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

test.describe("About page claims", () => {
  test("the project count matches the work page", async ({ page }) => {
    /*
      The About hero claims a number of shipped projects. It is derived from
      the same array the work page renders, and this asserts the two agree —
      a headline figure nobody can reconcile with the work is worth less than
      no figure at all.
    */
    await page.goto("/work");
    await page.locator("#showcase").scrollIntoViewIfNeeded();
    const actual = await page.locator("#showcase h3 a").count();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    await expect(
      page.getByText("Shipped projects").locator("xpath=preceding-sibling::p[1]")
    ).toHaveText(String(actual));
  });
});
