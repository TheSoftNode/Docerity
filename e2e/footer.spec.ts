import { test, expect } from "@playwright/test";

import { footerLinks } from "./copy";

test.describe("Footer", () => {
  test("renders nav links, socials, and copyright with no console errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    /* Read from the copy rather than named here: these labels are editable,
       and a test that types them out fails when somebody renames one, which
       is a decision rather than a defect. What is worth asserting is that
       every link the footer was given is on the page exactly once. */
    for (const { label, href } of footerLinks()) {
      const link = footer.getByRole("link", { name: label, exact: true });
      await expect(link, `the footer's ${label} link`).toHaveCount(1);
      await expect(link).toHaveAttribute("href", href);
    }
    await expect(footer.getByText("All rights reserved.")).toBeVisible();

    expect(errors).toEqual([]);
  });
});
