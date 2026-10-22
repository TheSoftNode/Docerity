import { test, expect } from "@playwright/test";

import { tracks } from "@/components/sections/home/home-data";

import { heading } from "./copy";

/*
  The homepage sections that have no spec of their own: the track tabs and the
  closing contact section. The rest are covered where they always were, by
  section (hero, clients, work, mentorship, explainers, testimonials, footer).
*/
test.describe("Tracks", () => {
  test("is a tab set, with Build selected first", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#services");
    await section.scrollIntoViewIfNeeded();

    const tabs = section.getByRole("tablist", { name: "Tracks" }).getByRole("tab");
    await expect(tabs).toHaveCount(tracks.length);
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");

    /* The open panel is labelled by its tab, which is what a screen reader
       announces on entering it. */
    await expect(section.getByRole("tabpanel", { name: tracks[0].label })).toBeVisible();
  });

  test("switches panels by click and by arrow keys", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#services");
    await section.scrollIntoViewIfNeeded();

    await section.getByRole("tab", { name: tracks[1].label }).click();
    await expect(section.getByRole("tabpanel", { name: tracks[1].label })).toBeVisible();
    await expect(section.getByRole("tabpanel")).toHaveCount(1);

    /* Arrows move selection and focus together, and wrap at the ends. */
    await page.keyboard.press("ArrowDown");
    await expect(section.getByRole("tab", { name: tracks[2].label })).toBeFocused();
    await expect(section.getByRole("tabpanel", { name: tracks[2].label })).toBeVisible();

    await page.keyboard.press("ArrowDown");
    await expect(section.getByRole("tab", { name: tracks[0].label })).toBeFocused();

    await page.keyboard.press("End");
    await expect(section.getByRole("tab", { name: tracks[2].label })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("each panel leads somewhere", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#services");

    for (const track of tracks) {
      await section.getByRole("tab", { name: track.label }).click();
      await expect(
        section.getByRole("tabpanel").getByRole("link", { name: track.action.label })
      ).toHaveAttribute("href", track.action.href);
    }
  });
});

test.describe("Contact", () => {
  test("offers three ways in, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    const section = page.locator("#contact");
    await section.scrollIntoViewIfNeeded();

    /* The title is editable and carries its emphasis in asterisks, which are
       markup rather than words. */
    await expect(
      section.getByRole("heading", { name: heading("homepage", "home-cta").replace(/\*/g, "") })
    ).toBeVisible();

    await expect(section.getByRole("link", { name: /A new project/ })).toHaveAttribute("href", "/contact");
    await expect(section.getByRole("link", { name: /Mentorship/ })).toHaveAttribute(
      "href",
      "/contact?type=mentorship"
    );
    await expect(section.getByRole("link", { name: /Just a question/ })).toHaveAttribute(
      "href",
      /^mailto:/
    );

    expect(errors).toEqual([]);
  });
});
