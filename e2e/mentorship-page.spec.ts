import { test, expect } from "@playwright/test";

test.describe("Mentorship page", () => {
  test("renders all sections with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/mentorship");

    await expect(
      page.getByRole("heading", { name: "A clear path to your next level." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Three starting points, one honest process." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "One path, four stages." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Not just office hours." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Real progress, in their words." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Questions before you apply." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Got something worth building?" })
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("hero CTAs work: apply navigates to contact, see-how-it-works scrolls in page", async ({
    page,
  }) => {
    await page.goto("/mentorship");

    await page.getByRole("button", { name: "See how it works" }).click();
    await expect(page.locator("#how-it-works")).toBeInViewport();

    await page.getByRole("button", { name: "Apply for mentorship" }).click();
    await expect(page).toHaveURL("/contact?type=mentorship");
    await expect(
      page.getByRole("button", { name: "Mentorship", exact: true })
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("FAQ accordion opens an answer on click", async ({ page }) => {
    await page.goto("/mentorship");

    const question = page.getByRole("button", { name: "How much does mentorship cost?" });
    await question.click();
    await expect(
      page.getByText("It depends on your goals and how much time")
    ).toBeVisible();
  });

  test("homepage teaser links to the full program and preselects mentorship", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "See the full program" }).click();
    await expect(page).toHaveURL("/mentorship");

    await page.goto("/");
    await page.getByRole("button", { name: "Apply for mentorship" }).click();
    await expect(page).toHaveURL("/contact?type=mentorship");
  });
});
