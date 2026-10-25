import { test, expect } from "@playwright/test";

import { heading } from "./copy";
import { DEFAULTS } from "@/lib/content/blocks/defaults";
import type { EngagementView } from "@/lib/content/blocks/views";

const engagements = DEFAULTS["how-we-work"].engagements as unknown as EngagementView[];
const links = DEFAULTS["how-we-work"].links as { projects: string; contact: string };

test.describe("How we work page", () => {
  test("renders every section with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/how-we-work");

    await expect(page.getByRole("heading", { level: 1, name: heading("how-we-work", "hww-hero") })).toBeVisible();
    for (const entry of ["hww-engagements", "hww-habits", "hww-faq"]) {
      await expect(page.getByRole("heading", { level: 2, name: heading("how-we-work", entry), exact: true })).toBeVisible();
    }
    for (const engagement of engagements) {
      await expect(page.getByRole("heading", { level: 3, name: engagement.title, exact: true })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("each card goes down to that option in full", async ({ page }) => {
    await page.goto("/how-we-work");
    const third = engagements[2];
    const card = page.getByRole("link", { name: new RegExp(third.title) }).first();
    await expect(card).toContainText(third.forWho);
    await card.click();
    await expect(page).toHaveURL(/#engineers-for-your-team$/);

    const option = page.getByRole("article", { name: third.title });
    await expect(option).toBeInViewport();
    await expect(option.getByRole("listitem")).toHaveCount(third.steps.length);
  });

  test("anyone unsure is pointed to the contact page", async ({ page }) => {
    await page.goto("/how-we-work");
    await expect(page.getByRole("link", { name: "Ask us", exact: true })).toHaveAttribute("href", "/contact");
  });

  test("there are no prices on the page", async ({ page }) => {
    await page.goto("/how-we-work");
    await expect(page.locator("main")).not.toContainText(/[$€£₦]\s?\d|\bper hour\b|\/hr\b/i);
  });

  test("Projects and the contact page link here", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("link", { name: links.projects })).toHaveAttribute("href", "/how-we-work");
    await page.goto("/contact");
    await expect(page.getByRole("link", { name: links.contact })).toHaveAttribute("href", "/how-we-work");
  });
});
