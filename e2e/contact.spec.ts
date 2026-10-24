import { test, expect } from "@playwright/test";

test.describe("Contact page", () => {
  test("renders with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/contact");

    await expect(
      page.getByRole("heading", { level: 1, name: "Tell us what you're building." })
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("What are you building?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Software project" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Send enquiry" })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("the homepage's header, mentorship and contact links all navigate here", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Start a project" }).click();
    await expect(page).toHaveURL("/contact");

    await page.goto("/");
    const mentorship = page.locator("#mentorship");
    await mentorship.scrollIntoViewIfNeeded();
    await mentorship.getByRole("link", { name: "Apply" }).click();
    await expect(page).toHaveURL("/contact?type=mentorship");

    await page.goto("/");
    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();
    await contact.getByRole("link", { name: /A new project/ }).click();
    await expect(page).toHaveURL("/contact");
  });

  test("the shared closing call to action navigates here", async ({ page }) => {
    await page.goto("/about");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Start the conversation" }).click();
    await expect(page).toHaveURL("/contact");
  });

  test("the form asks a mentee different questions from a client", async ({ page }) => {
    await page.goto("/contact?type=mentorship");

    await expect(page.getByRole("heading", { level: 1, name: "Tell us where you are." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Mentorship", exact: true })).toHaveAttribute("aria-pressed", "true");
    /* No budget and no company for a mentee; a starting point and a code link instead. */
    await expect(page.getByRole("group", { name: "Budget" })).toHaveCount(0);
    await expect(page.getByLabel("Company")).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Which sounds like you?" })).toBeVisible();
    await expect(page.getByLabel(/Your code/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Send application" })).toBeVisible();

    /* And back again, in place. */
    await page.getByRole("button", { name: "Software project" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Tell us what you're building." })).toBeVisible();
    await expect(page.getByRole("group", { name: "Budget" })).toBeVisible();
    await expect(page.getByLabel(/Your code/)).toHaveCount(0);
  });

  test("an unknown type opens on a software project", async ({ page }) => {
    await page.goto("/contact?type=nonsense");
    await expect(page.getByRole("button", { name: "Software project" })).toHaveAttribute("aria-pressed", "true");
  });

  test("a mentorship application posts its starting point and code link, then shows a receipt", async ({
    page,
  }) => {
    /*
      The endpoint is stubbed so this stays a test of the form. Letting it run
      for real would make the result depend on a reachable database and write
      a row on every run; the integration suite covers the real thing.
    */
    let posted: Record<string, unknown> = {};
    await page.route("**/api/contact", async (route) => {
      posted = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: { reference: "DOC-ABC-123" } }),
      });
    });

    await page.goto("/contact?type=mentorship");
    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page.getByRole("group", { name: "Which sounds like you?" }).getByText("Career switchers & self-taught").click();
    await page.getByLabel(/Your code/).fill("github.com/ada");
    await page.getByLabel("Where do you want to get to?").fill("I'd love to learn backend engineering properly.");
    await page.getByRole("button", { name: "Send application" }).click();

    await expect(page.getByRole("heading", { name: "Application received." })).toBeVisible();
    await expect(page.getByText("DOC-ABC-123")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to mentorship" })).toHaveAttribute("href", "/mentorship");
    expect(posted).toMatchObject({
      projectType: "mentorship",
      stage: "Career switchers & self-taught",
      codeLink: "github.com/ada",
      budget: "",
      company: "",
    });
  });

  test("a code link that is not a link is caught before sending", async ({ page }) => {
    await page.goto("/contact?type=mentorship");
    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page.getByLabel(/Your code/).fill("my repo");
    await page.getByLabel("Where do you want to get to?").fill("I'd love to learn backend engineering properly.");
    await page.getByRole("button", { name: "Send application" }).click();
    await expect(page.getByText(/That link doesn't look right/)).toBeVisible();
  });

  test("a server-side field error is shown against its field", async ({ page }) => {
    /* The server is the authority on validity, so a rejection it reports has to
       reach the right input rather than surfacing as a generic failure. */
    await page.route("**/api/contact", (route) =>
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: {
            code: "validation_failed",
            message: "Some details need correcting.",
            fields: { email: "That email address doesn't look right." },
          },
          requestId: "test-request-id",
        }),
      })
    );

    await page.goto("/contact");

    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
    await page.getByLabel("What are you building?").fill("A reconciliation service against our ledger.");
    await page.getByRole("button", { name: "Send enquiry" }).click();

    await expect(page.getByText("That email address doesn't look right.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Enquiry received." })).toHaveCount(0);
  });
});
