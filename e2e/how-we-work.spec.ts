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

  test("picking a need finishes the sentence and lights its engagement", async ({ page }) => {
    await page.goto("/how-we-work");
    const [first, , third] = engagements;
    await expect(page.getByText(first.need)).toBeVisible();

    const choice = page.getByRole("button", { name: third.choice });
    await choice.click();
    await expect(choice).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(third.need)).toBeVisible();

    const row = page.locator("li[aria-current='true']");
    await expect(row).toHaveCount(1);
    await expect(row.getByRole("heading", { level: 3 })).toHaveText(third.title);

    await page.getByRole("link", { name: /How it runs/ }).click();
    await expect(page).toHaveURL(/#team-extension$/);
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
