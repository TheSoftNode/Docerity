import { test, expect } from "@playwright/test";

/*
  The suite runs with no MONGODB_URI, which is what makes these assertions
  meaningful rather than a limitation. With no database there are no accounts, so
  nothing can be signed in as, and every one of these checks is about what
  happens to somebody who is *not* authenticated. That is the case worth having
  covered: a regression here is an exposed admin area.
*/

const ADMIN_PATHS = [
  "/admin",
  "/admin/enquiries",
  "/admin/reviews",
  "/admin/posts",
  "/admin/posts/new",
  "/admin/subscribers",
  "/admin/users",
];

test.describe("Admin access", () => {
  for (const path of ADMIN_PATHS) {
    test(`${path} redirects to the login page when signed out`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(new RegExp("/admin/login"));
      /* The requested path is carried, so signing in returns to it. */
      expect(new URL(page.url()).searchParams.get("next")).toBe(path);
      await expect(
        page.getByRole("heading", { name: "Docerity admin" })
      ).toBeVisible();
    });
  }

  test("the login page is not indexable", async ({ page }) => {
    await page.goto("/admin/login");

    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute("content", /noindex/);
  });

  test("a forged session cookie gets past the proxy and no further", async ({
    page,
    context,
  }) => {
    /*
      The point of the layered design, asserted.

      `proxy.ts` only checks that a cookie is present, because it runs at the CDN
      and cannot verify a signature against the database. So this cookie gets it
      past the redirect. The Data Access Layer then fails to verify the JWT and
      the page redirects back to login. If this ever lands on a rendered admin
      page, the real check has been lost.
    */
    await context.addCookies([
      {
        name: "docerity_session",
        value: "not.a.real.jwt",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/admin/enquiries");

    await expect(page).toHaveURL(new RegExp("/admin/login"));
  });

  test("the login form is replaced by an explanation when there is no database", async ({
    page,
  }) => {
    /*
      Asserted because the alternative is worse than useless: with no user
      collection to check against, every attempt returns the same "email and
      password don't match" and reads as a forgotten password rather than as
      missing configuration.
    */
    await page.goto("/admin/login");

    await expect(page.getByText("MONGODB_URI")).toBeVisible();
    await expect(page.getByText("scripts/create-admin.mjs")).toBeVisible();
    await expect(page.getByLabel("Password")).toHaveCount(0);
  });

  test("the admin area is reachable from nowhere on the public site", async ({
    page,
  }) => {
    /* Not secrecy, which is not a control. It is that an admin link in the
       footer is a dead end for every visitor who is not the owner. */
    await page.goto("/");

    await expect(page.locator('a[href^="/admin"]')).toHaveCount(0);
  });
});

test.describe("Admin API routes", () => {
  test("the subscriber export refuses an unauthenticated request with 401", async ({
    request,
  }) => {
    /*
      401 and not a redirect. `/api/admin/*` sits outside the proxy's matcher on
      purpose: a 302 to an HTML login page is useless to a fetch, and a caller
      expecting a CSV would receive a page of markup with a 200.
    */
    const response = await request.get("/api/admin/subscribers/export");

    expect(response.status()).toBe(401);
    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("unauthorized");
  });
});
