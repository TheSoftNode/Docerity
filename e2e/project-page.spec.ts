import { test, expect } from "@playwright/test";

import { featuredProjects, projects } from "@/components/sections/work/work-data";

test.describe("Project pages", () => {
  test("renders each project page with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    for (const slug of ["eep", "metapilot", "softinven", "uri-social"]) {
      await page.goto(`/projects/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      /* Status is known for every project; the other facts appear only where
         the project has them. */
      await expect(page.getByText("Status", { exact: true })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("the heading is the project's name, without the decorative stop", async ({ page }) => {
    await page.goto("/projects/metapilot");
    await expect(page.getByRole("heading", { level: 1, name: "MetaPilot", exact: true })).toBeVisible();
  });

  test("a project without a written study says so and links out", async ({ page }) => {
    /*
      The placeholder case studies were invented narrative. Where no real
      write-up exists the page has to say that plainly rather than fill the
      space, so the absence is asserted.
    */
    await page.goto("/projects/metapilot");

    await expect(page.getByRole("heading", { name: "The short version." })).toBeVisible();
    await expect(page.getByText(/hasn't been written up yet/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Visit MetaPilot/i })).toHaveAttribute(
      "href",
      "https://metapilot-frontend.vercel.app/"
    );
    await expect(page.getByRole("link", { name: /Source code/ })).toHaveAttribute(
      "href",
      "https://github.com/TheSoftNode/metapilot-frontend"
    );
  });

  test("a project with a write-up shows its outcomes and chapters", async ({ page }) => {
    await page.goto("/projects/uri-social");

    await expect(page.getByRole("heading", { name: "What changed." })).toBeVisible();
    /* The figure a result leads with is pulled out of its sentence. */
    const outcomes = page.locator("section", { has: page.getByRole("heading", { name: "What changed." }) });
    await expect(outcomes.getByText("90%", { exact: true })).toBeVisible();

    await expect(page.getByRole("heading", { name: "The short version." })).toHaveCount(0);
    await expect(page.getByText("Built for", { exact: true })).toBeVisible();
    await expect(page.getByText("URI Creative", { exact: true })).toBeVisible();

    /* No live product, so the primary action is the write-up itself. */
    await page.getByRole("link", { name: "Read the case study" }).click();
    await expect(page.locator("#write-up")).toBeInViewport();
  });

  test("the chapter rail jumps to a chapter and marks it current", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/projects/uri-social");

    const rail = page.getByRole("navigation", { name: "Chapters" });
    const last = rail.getByRole("link").last();
    await last.click();
    await expect(last).toHaveAttribute("aria-current", "location");
    const target = await last.getAttribute("href");
    await expect(page.locator(target!)).toBeInViewport();
  });

  test("the homepage's 'Case study' link navigates to the real page", async ({ page }) => {
    await page.goto("/");
    const work = page.locator("#work");
    await work.scrollIntoViewIfNeeded();

    /* The preview opens on the first featured project. */
    await work.getByRole("link", { name: "Case study" }).click();
    await expect(page).toHaveURL(`/projects/${featuredProjects[0].slug}`);
  });

  test("next/previous navigation links between projects", async ({ page }) => {
    await page.goto("/projects/eep");

    await page.getByRole("link", { name: "Next project", exact: true }).click();
    await expect(page).toHaveURL("/projects/hitoai");

    await page.getByRole("link", { name: "Previous project", exact: true }).click();
    await expect(page).toHaveURL("/projects/eep");
  });

  test("up next wraps round from the last project to the first", async ({ page }) => {
    const last = projects[projects.length - 1];
    await page.goto(`/projects/${last.slug}`);
    await page.getByRole("link", { name: new RegExp(`Up next: ${projects[0].name}`) }).click();
    await expect(page).toHaveURL(`/projects/${projects[0].slug}`);
  });

  test("returns 404 for an unknown project slug", async ({ page }) => {
    const response = await page.goto("/projects/not-a-real-project");
    expect(response?.status()).toBe(404);
  });
});

test.describe("404 page", () => {
  test("renders a branded not-found page for unknown routes", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);

    await expect(
      page.getByRole("heading", { name: "This page doesn't exist." })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();

    expect(errors.filter((e) => !e.includes("404"))).toEqual([]);
  });

  test("'Back to home' navigates to the homepage", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("every page in the menus is on the shelf, and each spine is a link", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    const shelf = page.getByRole("list", { name: "Pages on this site" });
    for (const href of ["/projects", "/ai", "/web3", "/mentorship", "/blog", "/about"]) {
      await expect(shelf.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    await expect(shelf.getByText("/this-route-does-not-exist")).toBeVisible();
  });

  test("a near miss offers the page somebody meant", async ({ page }) => {
    await page.goto("/projets");
    const guess = page.getByRole("link", { name: /Did you mean Projects\?/ });
    await expect(guess).toHaveAttribute("href", "/projects");

    await page.goto("/qwertyuiop");
    await expect(page.getByRole("link", { name: /Did you mean/ })).toHaveCount(0);
  });
});
