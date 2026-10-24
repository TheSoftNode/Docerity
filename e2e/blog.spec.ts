import { test, expect } from "@playwright/test";

test.describe("Blog index", () => {
  test("renders the hero with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/blog");

    await expect(
      page.getByRole("heading", { level: 1, name: "Complex ideas, explained through things you already know." })
    ).toBeVisible();
    /* Each explainer can be picked under the word; articles have no analogy to melt into. */
    const explainers = page.getByRole("group", { name: "Explainers" });
    await expect(explainers.getByRole("button", { name: "Caching" })).toHaveAttribute("aria-pressed", "true");
    await expect(explainers.getByRole("button", { name: "Why I default to boring technology" })).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("picking an explainer shows its pair and links to it", async ({ page }) => {
    await page.goto("/blog");

    const concurrency = page.getByRole("group", { name: "Explainers" }).getByRole("button", { name: "Concurrency" });
    await concurrency.click();
    await expect(concurrency).toHaveAttribute("aria-pressed", "true");
    /* The plain line says what the melting word shows. */
    await expect(page.getByText(/Concurrency works like multiple chefs sharing one kitchen/i)).toBeAttached();
    await expect(page.getByRole("link", { name: /Read about concurrency/ })).toHaveAttribute("href", "/blog/concurrency");
  });

  test("under reduced motion the word holds still", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/blog");
    const caching = page.getByRole("group", { name: "Explainers" }).getByRole("button", { name: "Caching" });
    await page.waitForTimeout(3500);
    await expect(caching).toHaveAttribute("aria-pressed", "true");
    await context.close();
  });

  test("the glossary narrows by kind and by topic", async ({ page }) => {
    await page.goto("/blog");
    const glossary = page.locator("#glossary");
    await glossary.scrollIntoViewIfNeeded();
    const rows = glossary.locator("ol > li");
    const all = await rows.count();

    await glossary.getByRole("button", { name: /^Articles/ }).click();
    await expect(glossary.getByRole("link", { name: /Why I default to boring technology/ })).toBeVisible();
    await expect(glossary.getByRole("link", { name: /Caching/ })).toHaveCount(0);

    await glossary.getByRole("button", { name: /^All/ }).click();
    await glossary.getByRole("button", { name: "Databases", exact: true }).click();
    const narrowed = await rows.count();
    expect(narrowed).toBeLessThan(all);
    await expect(glossary.getByRole("link", { name: /Caching/ })).toBeVisible();
  });

  test("the latest piece is featured", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByText(/^Latest ·/)).toBeVisible();
  });

  test("homepage 'Read the blog' button navigates here", async ({ page }) => {
    await page.goto("/");
    const explainers = page.locator("#explainers");
    await explainers.scrollIntoViewIfNeeded();
    await explainers.getByRole("link", { name: "Read the blog" }).click();
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
      page.getByRole("heading", { level: 1, name: "A sticky note on your monitor." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "The problem: doing the same expensive work, over and over" })
    ).toBeVisible();
    await expect(page.getByText("In the analogy").first()).toBeVisible();
    /* The rail lists the sections and follows the reader. */
    await expect(page.getByRole("navigation", { name: "Chapters" }).getByRole("link")).toHaveCount(4);

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
      page.getByRole("heading", { level: 1, name: "Why I default to boring technology." })
    ).toBeVisible();
    await expect(page.getByText("In the analogy")).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("the share row copies the link", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/blog/caching");
    await page.getByRole("button", { name: "Copy link" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Share on LinkedIn" })).toHaveAttribute("href", /linkedin\.com\/sharing/);
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
      page.getByRole("heading", { level: 1, name: "Case study: rebuilding a client's checkout flow." })
    ).toBeVisible();
    await expect(page.getByText("Image placeholder")).toHaveCount(2);
    await expect(page.getByText("Video placeholder")).toHaveCount(1);

    expect(errors).toEqual([]);
  });

  test("shows tags and links to the next post in sequence", async ({ page }) => {
    await page.goto("/blog/caching");

    const topics = page.getByRole("list", { name: "Topics" });
    await expect(topics.getByText("Performance", { exact: true })).toBeVisible();
    await expect(topics.getByText("Databases", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: /Next.*A host seating restaurant guests/ }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "A host seating restaurant guests." })
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
    expect(body).toContain("/projects/eep");
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
