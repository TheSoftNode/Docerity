import { test, expect } from "@playwright/test";

test.describe("Blog index", () => {
  test("renders the console with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/blog");

    await expect(
      page
        .getByText("A sticky note on your monitor", { exact: true })
        .and(page.locator(":visible"))
        .first()
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("clicking a concept updates the detail pane", async ({ page }) => {
    await page.goto("/blog");
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.getByRole("button", { name: /Concurrency/ }).click();
    await expect(
      page.getByRole("heading", { name: "Multiple chefs sharing one kitchen" })
    ).toBeVisible();
  });

  test("switching to the Articles tab shows regular articles", async ({ page }) => {
    await page.goto("/blog");
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.getByRole("button", { name: "Articles", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Why I default to boring technology" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Read the article" })
    ).toBeVisible();
  });

  test("homepage 'Read the blog' button navigates here", async ({ page }) => {
    await page.goto("/");
    await page.locator("#blog").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Read the blog" }).click();
    await expect(page).toHaveURL("/blog");
  });
});

test.describe("Blog article", () => {
  test("explainer article renders sections with sidenotes", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/blog/caching");

    await expect(
      page.getByRole("heading", { name: "A sticky note on your monitor" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "The problem: doing the same expensive work, over and over" })
    ).toBeVisible();
    await expect(
      page.getByText("Like this").and(page.locator(":visible")).first()
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("plain article renders without analogy iconography", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/blog/boring-technology");

    await expect(
      page.getByRole("heading", { name: "Why I default to boring technology" })
    ).toBeVisible();
    await expect(page.getByText("Like this")).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("returns 404 for an unknown slug", async ({ page }) => {
    const response = await page.goto("/blog/not-a-real-post");
    expect(response?.status()).toBe(404);
  });

  test("article with media renders image and video placeholders", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/blog/checkout-redesign-case-study");

    await expect(
      page.getByRole("heading", { name: "Case study: rebuilding a client's checkout flow" })
    ).toBeVisible();
    await expect(page.getByText("Image placeholder")).toHaveCount(2);
    await expect(page.getByText("Video placeholder")).toHaveCount(1);

    expect(errors).toEqual([]);
  });

  test("shows tags and links to the next post in sequence", async ({ page }) => {
    await page.goto("/blog/caching");

    await expect(page.getByText("Performance", { exact: true })).toBeVisible();
    await expect(page.getByText("Databases", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: /Next.*A host seating restaurant guests/ }).click();
    await expect(
      page.getByRole("heading", { name: "A host seating restaurant guests" })
    ).toBeVisible();
  });

  test("subscribe form submits successfully", async ({ page }) => {
    /*
      The endpoint is stubbed so this stays a test of the form. Since the
      route began writing to MongoDB, letting it run for real would make the
      result depend on a reachable database and would write a subscriber row
      on every run.
    */
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: { subscribed: true } }),
      })
    );

    await page.goto("/blog/caching");

    await page.getByLabel("Email address").fill("reader@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("You're on the list")).toBeVisible();
  });

  test("a failed subscribe surfaces the error rather than claiming success", async ({
    page,
  }) => {
    /* The write endpoint can be down (503 when the database is unreachable)
       and the form must not report success in that case. */
    await page.route("**/api/subscribe", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: { code: "service_unavailable", message: "Please try again shortly." },
          requestId: "test-request-id",
        }),
      })
    );

    await page.goto("/blog/caching");

    await page.getByLabel("Email address").fill("reader@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("You're on the list")).toBeHidden();
  });
});

test.describe("Blog SEO plumbing", () => {
  test("sitemap includes all posts and static routes", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/blog/caching");
    expect(body).toContain("/blog/checkout-redesign-case-study");
    expect(body).toContain("/mentorship");
    expect(body).toContain("/work/eep");
    expect(body).toContain("/web3");
  });

  test("robots.txt points to the sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Sitemap:");
  });

  test("rss feed returns valid XML with post entries", async ({ request }) => {
    const res = await request.get("/blog/rss.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/rss+xml");
    const body = await res.text();
    /* The namespace declaration is part of it: <dc:creator> on a contributor's
       post needs the prefix declared, or the whole feed is invalid XML. */
    expect(body).toContain(
      '<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">'
    );
    expect(body).toContain("A sticky note on your monitor");
  });

  test("open graph images render for root, blog index, and a post", async ({ request }) => {
    for (const path of [
      "/opengraph-image",
      "/blog/opengraph-image",
      "/blog/caching/opengraph-image",
    ]) {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    }
  });
});
