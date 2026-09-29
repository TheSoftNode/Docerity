import { test, expect } from "@playwright/test";

import { heading } from "./copy";

test.describe("The old work URLs", () => {
  /*
    The section was renamed from work to projects. Both old paths were live and
    indexed, and every link anybody has shared to a project points at one of
    them, so they redirect rather than 404. Without this the rename quietly
    throws away whatever those pages had earned.
  */
  for (const [from, to] of [
    ["/work", "/projects"],
    ["/work/eep", "/projects/eep"],
  ] as const) {
    test(`${from} still reaches ${to}`, async ({ page }) => {
      await page.goto(from);
      expect(new URL(page.url()).pathname).toBe(to);
    });
  }
});

test.describe("Work page", () => {
  test("renders all sections with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/projects");

    await expect(
      page.getByRole("heading", { name: "Software built for what happens after launch." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Four kinds of problems, one way of working." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "From first call to shipped software." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Boring where it counts, sharp where it matters." })
    ).toBeVisible();
    /*
      Absent with no database, like the mentorship page's equivalent: it quotes
      approved client reviews or it quotes nobody. The integration suite covers
      it with reviews in place.
    */
    await expect(
      page.getByRole("heading", { name: "What it's like to work together." })
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: heading("homepage", "home-cta").replace(/\*/g, "") })
    ).toBeVisible();

    for (const name of ["MetaPilot", "TalentChainPro", "SoftInven"]) {
      await expect(
        page.getByRole("heading", { name: `${name}, view project`, exact: true })
      ).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("navbar 'Work' link navigates to the dedicated page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "Work", exact: true }).click();
    await expect(page).toHaveURL("/projects");
  });

  test("'See the work' scrolls to the showcase, 'Start a project' goes to contact", async ({
    page,
  }) => {
    await page.goto("/projects");

    await page.locator("main").getByRole("button", { name: "Start a project" }).click();
    await expect(page).toHaveURL("/contact");

    await page.goto("/projects");
    await page.getByRole("button", { name: "See the work" }).click();
    await expect(page.locator("#showcase")).toBeInViewport();
  });

  test("homepage 'See all work' button links here", async ({ page }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "See all work" }).click();
    await expect(page).toHaveURL("/projects");
  });

  test("project page 'All work' back link points to the dedicated page", async ({ page }) => {
    await page.goto("/projects/eep");
    await page.getByRole("link", { name: "All work" }).click();
    await expect(page).toHaveURL("/projects");
  });
});
