import { test, expect } from "@playwright/test";

/*
  The suite runs without MONGODB_URI, so there are no approved reviews to list.
  That is the state a fresh deployment is in, and it is worth covering: the page
  still has to render its form, and the form still has to validate, or nobody can
  leave the first review.
*/

test.describe("Reviews page", () => {
  test("renders the hero and the form with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    page.on("pageerror", (e) => errors.push(e.message));

    await page.goto("/reviews");

    await expect(
      page.getByRole("heading", { level: 1, name: /in their words/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Worked together? Be the first." })
    ).toBeVisible();
    await expect(page.getByLabel("Your name")).toBeVisible();

    /* The empty state says so rather than showing an empty panel where the
       rating summary goes. */
    await expect(page.getByText("No entries")).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("omits the rating structured data when there is nothing to average", async ({
    page,
  }) => {
    /* An AggregateRating with a reviewCount of 0 is a structured-data error
       rather than an empty one, so the script is not emitted at all. */
    await page.goto("/reviews");

    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(0);
  });

  test("the rating input is a real radio group", async ({ page }) => {
    /*
      Asserted because the obvious implementation is five buttons and a state
      variable, which announces nothing. A radio group gives arrow-key movement
      and "3 of 5" for free.
    */
    await page.goto("/reviews");

    const group = page.getByRole("radiogroup", { name: "Rating out of five" });
    await expect(group).toBeVisible();
    await expect(group.getByRole("radio")).toHaveCount(5);

    /*
      The label is clicked, not the input. The input is `sr-only`, which puts it
      outside the viewport, so Playwright refuses to click it directly. That is
      the design working: the star is the label and the label is what a pointer
      hits, while the input stays focusable for the keyboard.
    */
    await group.locator("label").filter({ hasText: "4 out of 5" }).click();
    await expect(group.getByRole("radio", { name: "4 out of 5" })).toBeChecked();
  });

  test("submitting an empty form reports every problem and focuses the first", async ({
    page,
  }) => {
    await page.goto("/reviews");
    await page.getByRole("button", { name: "Submit review" }).click();

    await expect(page.getByText("Please tell me your name.")).toBeVisible();
    await expect(page.getByText("Pick a rating from 1 to 5.")).toBeVisible();
    await expect(
      page.getByText("An email address, so I can verify this is really you.")
    ).toBeVisible();

    /* Focus moves to the first field with a problem, so a keyboard user is not
       left hunting for what changed. */
    await expect(page.getByLabel("Your name")).toBeFocused();
  });

  test("is reachable from the footer and the homepage testimonials", async ({ page }) => {
    await page.goto("/");

    /*
      `getByRole("button")`, not "link". base-ui's Button sets `role="button"` on
      the element it renders into, so an anchor rendered through it is announced
      as a button. Every other test here queries these the same way.
    */
    await expect(
      page.getByRole("button", { name: "Read all of them" })
    ).toHaveAttribute("href", "/reviews");
    /* Filled rather than ghost. A borderless button beside a filled one read as
       stray text, which is why nobody found the form from the homepage. */
    await expect(
      page.getByRole("button", { name: "Write a review" })
    ).toHaveAttribute("href", "/reviews#leave-a-review");
    await expect(
      page.locator('footer a[href="/reviews"]')
    ).toBeVisible();
  });
});

test.describe("Review submission API", () => {
  test("rejects a submission that fails validation with per-field messages", async ({
    request,
  }) => {
    const response = await request.post("/api/reviews", {
      data: { fullName: "A", title: "", body: "too short", rating: 9, contactEmail: "nope" },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("validation_failed");
    /* Per-field, so the form can show each message against its own input
       rather than one banner for the whole thing. */
    expect(Object.keys(body.error.fields)).toEqual(
      expect.arrayContaining(["fullName", "title", "body", "rating", "contactEmail"])
    );
  });

  test("refuses a javascript: URL in a link", async ({ request }) => {
    /*
      A link is rendered as an anchor on a public page, so this is stored XSS if
      it gets through. `new URL()` parses `javascript:` happily, which is why the
      protocol is checked separately rather than relying on the parse.
    */
    const response = await request.post("/api/reviews", {
      data: {
        fullName: "Real Person",
        title: "CTO, Somewhere",
        body: "A review that is comfortably longer than the forty character minimum imposed here.",
        rating: 5,
        contactEmail: "person@example.com",
        links: [{ title: "Site", url: "javascript:alert(1)" }],
      },
    });

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.fields?.links).toBeTruthy();
  });

  test("answers the honeypot as though it worked", async ({ request }) => {
    /* A bot that is told it failed tries something else. One that is told it
       succeeded does not. */
    const response = await request.post("/api/reviews", {
      data: { website: "http://spam.example", fullName: "", body: "", rating: 0 },
    });

    expect(response.status()).toBe(200);
    expect((await response.json()).ok).toBe(true);
  });

  test("answers 503, not 500, when the database is unreachable", async ({ request }) => {
    /*
      A valid submission with no MONGODB_URI. 503 says the dependency is down and
      a retry may work; 500 would tell the caller and any monitor that the fault
      is ours and permanent.
    */
    const response = await request.post("/api/reviews", {
      data: {
        fullName: "Real Person",
        title: "CTO, Somewhere",
        body: "A review that is comfortably longer than the forty character minimum imposed here.",
        rating: 5,
        contactEmail: "person@example.com",
        links: [],
      },
    });

    expect(response.status()).toBe(503);
    expect((await response.json()).error.code).toBe("service_unavailable");
  });

  test("refuses a photo signature for a file that is not an image", async ({ request }) => {
    const response = await request.post("/api/reviews/upload", {
      data: { contentType: "application/pdf", bytes: 1024 },
    });

    expect(response.status()).toBe(400);
    expect((await response.json()).error.fields.photo).toContain("PNG");
  });
});

test.describe("Unsubscribe", () => {
  test("a missing token says so without confirming anything", async ({ page }) => {
    await page.goto("/unsubscribe");

    await expect(
      page.getByRole("heading", { name: "That link did not work" })
    ).toBeVisible();
    /* Deliberately vague: "that address is not on the list" would confirm
       whether a given address is subscribed to anyone who tried the URL. */
    await expect(page.getByText(/already have been used/)).toBeVisible();
  });

  test("is not indexable", async ({ page }) => {
    await page.goto("/unsubscribe?token=whatever");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/
    );
  });
});
