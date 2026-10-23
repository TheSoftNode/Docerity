import { test, expect } from "@playwright/test";

import {
  audiences,
  stages,
} from "@/components/sections/mentorship-program/mentorship-program-data";

test.describe("Mentorship page", () => {
  test("renders all sections with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/mentorship");

    /* The accented full stop is its own element; the heading still reads as
       one sentence. */
    await expect(
      page.getByRole("heading", { level: 1, name: "A clear path to your next level." })
    ).toBeVisible();
    for (const name of [
      "Three starting points, one honest process.",
      "One path, four stages.",
      "Not just office hours.",
      "A team that ships, not a lone tutor.",
      "Real progress, in their words.",
      "Questions before you apply.",
      "Your next level starts with a short note.",
    ]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("with no approved mentee reviews, nobody is quoted and mentees are invited", async ({
    page,
  }) => {
    /* No database in this run, so no reviews: the section invites rather
       than inventing. The populated state is in the integration suite. */
    await page.goto("/mentorship");
    await expect(page.getByText("The first reviews are being collected.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Leave a review" })).toHaveAttribute(
      "href",
      "/reviews#leave-a-review"
    );
  });

  test("hero links: apply preselects mentorship, see-how-it-works scrolls to the path", async ({
    page,
  }) => {
    await page.goto("/mentorship");

    await page.getByRole("link", { name: "See how it works" }).click();
    await expect(page.locator("#how-it-works")).toBeInViewport();

    await page.getByRole("link", { name: "Apply for mentorship" }).first().click();
    await expect(page).toHaveURL("/contact?type=mentorship");
    await expect(page.getByRole("button", { name: "Mentorship", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  test("picking a starting point marks where it usually starts on the path", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/mentorship");

    const tabs = page.getByRole("tablist", { name: "Starting points" }).getByRole("tab");
    await expect(tabs).toHaveCount(audiences.length);

    for (const [index, audience] of audiences.entries()) {
      await tabs.nth(index).click();
      await expect(tabs.nth(index)).toHaveAttribute("aria-selected", "true");
      const marker = page.locator("#how-it-works").getByText(`${audience.short} start here`);
      await expect(marker).toBeVisible();
      /* The marker sits in the stage it names. */
      await expect(
        page.locator("#how-it-works li", { hasText: audience.startsAt }).getByText(`${audience.short} start here`)
      ).toBeVisible();
    }
  });

  test("the starting points are keyboard tabs", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/mentorship");

    const tabs = page.getByRole("tablist", { name: "Starting points" }).getByRole("tab");
    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  });

  test("the path can be stepped through, and advances on its own", async ({ page }) => {
    await page.goto("/mentorship");
    const path = page.locator("#how-it-works");
    const buttons = path.getByRole("list", { name: "Stages" }).getByRole("button");
    await expect(buttons).toHaveCount(stages.length);

    await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
    await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "true", { timeout: 9000 });

    await path.scrollIntoViewIfNeeded();
    await buttons.last().click();
    await expect(path.getByRole("heading", { level: 3, name: stages[stages.length - 1].label })).toBeVisible();
  });

  test("the path holds still under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/mentorship");
    const buttons = page.locator("#how-it-works").getByRole("list", { name: "Stages" }).getByRole("button");
    await page.waitForTimeout(6500);
    await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
  });

  test("FAQ: the first answer is open, and opening another closes it", async ({ page }) => {
    await page.goto("/mentorship");

    const first = page.getByRole("button", { name: "How much does mentorship cost?" });
    const second = page.getByRole("button", { name: "How long does the program last?" });
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("It depends on your goals and how much time")).toBeVisible();

    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
  });

  test("the closing section lists what happens after applying", async ({ page }) => {
    await page.goto("/mentorship");
    const apply = page.locator("#apply");
    await apply.scrollIntoViewIfNeeded();
    for (const step of ["Apply", "Intro call", "Your plan", "First session"]) {
      await expect(apply.getByText(step, { exact: true })).toBeVisible();
    }
    await expect(apply.getByRole("link", { name: /Apply for mentorship/ })).toHaveAttribute(
      "href",
      "/contact?type=mentorship"
    );
  });

  test("homepage teaser links to the full program and preselects mentorship", async ({
    page,
  }) => {
    await page.goto("/");
    const mentorship = page.locator("#mentorship");
    await mentorship.scrollIntoViewIfNeeded();

    await mentorship.getByRole("link", { name: "The program" }).click();
    await expect(page).toHaveURL("/mentorship");

    await page.goto("/");
    await mentorship.scrollIntoViewIfNeeded();
    await mentorship.getByRole("link", { name: "Apply" }).click();
    await expect(page).toHaveURL("/contact?type=mentorship");
  });
});
