import { test, expect } from "@playwright/test";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { readSession, signSession } from "@/lib/auth/token";
import {
  POST_LIMITS,
  cleanTags,
  emptyPost,
  slugify,
  validatePost,
} from "@/lib/content/post-schema";
import { normaliseUrl, validateReview } from "@/lib/reviews/schema";

/*
  Unit tests, run by Playwright because that is the runner this project has.

  These need no browser: the spec file is Node, so a server module can be
  imported directly. They are here rather than as browser tests because what is
  being checked is a function's behaviour, and driving a form to assert that
  scrypt is timing-safe would test the form instead.
*/

test.describe.configure({ mode: "parallel" });

test.describe("Password hashing", () => {
  /* scrypt at these parameters is deliberately slow, and each of these hashes
     twice. The default 30s would be tight on a loaded machine. */
  test.setTimeout(60_000);

  test("a hash verifies against its own password and nothing else", async () => {
    const hash = await hashPassword("correct horse battery staple");

    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("correct horse battery stapl", hash)).toBe(false);
    expect(await verifyPassword("", hash)).toBe(false);
  });

  test("the same password hashes differently every time", async () => {
    /*
      The salt is what makes this true, and it is the property that stops one
      leaked hash revealing that two accounts share a password, and stops a
      precomputed rainbow table working at all.
    */
    const [first, second] = await Promise.all([
      hashPassword("the same password"),
      hashPassword("the same password"),
    ]);

    expect(first).not.toBe(second);
    expect(await verifyPassword("the same password", first)).toBe(true);
    expect(await verifyPassword("the same password", second)).toBe(true);
  });

  test("the digest records its own parameters", async () => {
    /* So raising the cost later does not invalidate every existing password:
       an old hash still verifies against the parameters it was made with. */
    const hash = await hashPassword("whatever");
    const [scheme, n, r, p, salt, digest] = hash.split("$");

    expect(scheme).toBe("scrypt");
    expect(Number(n)).toBe(65536);
    expect(Number(r)).toBe(8);
    expect(Number(p)).toBe(1);
    expect(salt.length).toBeGreaterThan(20);
    expect(digest.length).toBeGreaterThan(80);
  });

  test("a malformed stored value returns false rather than throwing", async () => {
    /* Anything here that threw would turn a corrupt row into a 500 on the login
       page rather than a failed sign-in. */
    for (const stored of ["", "garbage", "scrypt$$$$", "bcrypt$10$abc", "scrypt$1$1$1$a$b"]) {
      expect(await verifyPassword("anything", stored)).toBe(false);
    }
  });

  test("a password is normalised before hashing", async () => {
    /*
      NFKC, so a passphrase typed with a composed accent verifies against the
      same one typed with a combining mark. Without it, the same keystrokes on a
      different keyboard layout produce a different hash and the account appears
      to have the wrong password.
    */
    const composed = "café passphrase here";
    const decomposed = "cafe" + "\u0301" + " passphrase here";
    expect(composed).not.toBe(decomposed);

    const hash = await hashPassword(composed);
    expect(await verifyPassword(decomposed, hash)).toBe(true);
  });
});

test.describe("Sessions", () => {
  const payload = { userId: "abc123", role: "owner" as const, sessionVersion: 3 };

  test("a signed session reads back with the same claims", async () => {
    const token = await signSession(payload);
    expect(await readSession(token)).toMatchObject(payload);
  });

  test("a tampered token does not verify", async () => {
    const token = await signSession(payload);

    /* Flipping one character of the signature is the whole point of signing it.
       If this ever passes, anyone can mint an owner session. */
    const tampered = `${token.slice(0, -2)}${token.endsWith("aa") ? "bb" : "aa"}`;
    expect(await readSession(tampered)).toBeNull();
  });

  test("a payload edited in place does not verify", async () => {
    const token = await signSession({ ...payload, role: "editor" });
    const [header, body, signature] = token.split(".");

    /* Rewriting the body to claim `owner` and keeping the old signature. The
       base64url payload of a JWT is readable and editable by anyone holding it;
       only the signature stops it being useful. */
    const escalated = Buffer.from(
      JSON.stringify({ ...payload, role: "owner" })
    ).toString("base64url");

    expect(await readSession(`${header}.${escalated}.${signature}`)).toBeNull();
    /* And the untouched original still does verify, so the test is not passing
       for the wrong reason. */
    expect(await readSession(`${header}.${body}.${signature}`)).toMatchObject({
      role: "editor",
    });
  });

  test("nonsense and absence both read as no session", async () => {
    expect(await readSession(undefined)).toBeNull();
    expect(await readSession("")).toBeNull();
    expect(await readSession("not.a.jwt")).toBeNull();
    /* An unsigned token, which is the `alg: "none"` attack. `jwtVerify` is
       pinned to HS256, so this is refused rather than accepted as valid. */
    const unsigned = `${Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.`;
    expect(await readSession(unsigned)).toBeNull();
  });

  test("a session missing a required claim is refused", async () => {
    /* A validly signed token is still rejected if the shape is wrong, so a
       payload from an older version of this code cannot half-authenticate. */
    const { SignJWT } = await import("jose");
    const key = new TextEncoder().encode(
      "docerity-development-secret-not-for-production-use"
    );

    const token = await new SignJWT({ userId: "abc" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .setIssuer("docerity")
      .setAudience("docerity-admin")
      .sign(key);

    expect(await readSession(token)).toBeNull();
  });
});

test.describe("Review validation", () => {
  const valid = {
    fullName: "Real Person",
    title: "CTO, Somewhere",
    body: "A review comfortably longer than the forty character minimum this imposes.",
    rating: 5,
    contactEmail: "person@example.com",
    links: [],
  };

  test("accepts a complete review", () => {
    expect(validateReview(valid)).toEqual({});
  });

  test("rejects a rating outside one to five, and a fractional one", () => {
    for (const rating of [0, 6, -1, 2.5, Number.NaN]) {
      expect(validateReview({ ...valid, rating }).rating).toBeTruthy();
    }
  });

  test("normaliseUrl refuses anything that is not http or https", () => {
    /* These are rendered as an anchor's href on a public page. */
    expect(normaliseUrl("javascript:alert(1)")).toBeNull();
    expect(normaliseUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(normaliseUrl("file:///etc/passwd")).toBeNull();
    expect(normaliseUrl("vbscript:msgbox")).toBeNull();
  });

  test("normaliseUrl assumes https for a bare hostname", () => {
    /* Somebody typing "docerity.com" means a website, not a relative path. */
    expect(normaliseUrl("docerity.com")).toBe("https://docerity.com/");
    expect(normaliseUrl("http://example.com/path")).toBe("http://example.com/path");
    /* A hostname with no dot is a typo, not a domain. */
    expect(normaliseUrl("localhost")).toBeNull();
  });
});

test.describe("Post validation", () => {
  test("slugify produces a URL-safe slug", () => {
    expect(slugify("A Sticky Note on Your Monitor")).toBe(
      "a-sticky-note-on-your-monitor"
    );
    expect(slugify("  Trailing and   spaces  ")).toBe("trailing-and-spaces");
    expect(slugify("What's an API? (Really)")).toBe("what-s-an-api-really");
  });

  test("slugify strips accents rather than dropping the letter", () => {
    /* Without the NFD normalisation, "Café" becomes "caf": the accented
       character is not in the allowed set and is simply removed. */
    expect(slugify("Café Culture")).toBe("cafe-culture");
  });

  test("a draft may be incomplete; a published post may not", () => {
    const draft = { ...emptyPost("article"), title: "A title", hook: "x".repeat(30), topic: "T" };

    /* An outline saved as a draft is the point of drafts. */
    expect(validatePost({ ...draft, slug: "a-title" }).body).toBeUndefined();

    /* The same thing published is not. */
    expect(
      validatePost({ ...draft, slug: "a-title", status: "published" }).body
    ).toBeTruthy();
  });

  test("an explainer needs both halves of the pairing", () => {
    const base = {
      ...emptyPost("explainer"),
      slug: "caching",
      title: "A sticky note",
      hook: "x".repeat(30),
    };

    expect(validatePost(base).concept).toBeTruthy();
    expect(validatePost(base).analogy).toBeTruthy();

    const complete = {
      ...base,
      concept: { label: "Caching", caption: "Store it once", iconName: "ZapIcon" },
      analogy: { label: "A sticky note", caption: "Quick answer", iconName: "StickyNoteIcon" },
    };
    expect(validatePost(complete).concept).toBeUndefined();
    expect(validatePost(complete).analogy).toBeUndefined();
  });

  test("a slug the blog's own routes use is refused", () => {
    /* `/blog/rss.xml` is a route handler in the same segment, so a post could
       otherwise shadow the feed. */
    const post = {
      ...emptyPost("article"),
      slug: "rss",
      title: "A title",
      hook: "x".repeat(30),
      topic: "T",
    };
    expect(validatePost(post).slug).toContain("used by the blog itself");
  });

  test("a slug with spaces or capitals is refused rather than silently fixed", () => {
    /* Silently correcting it would mean the URL shown in the editor is not the
       URL that was saved. */
    const post = {
      ...emptyPost("article"),
      title: "A title",
      hook: "x".repeat(30),
      topic: "T",
    };
    expect(validatePost({ ...post, slug: "Not A Slug" }).slug).toBeTruthy();
    expect(validatePost({ ...post, slug: "double--hyphen" }).slug).toBeTruthy();
    expect(validatePost({ ...post, slug: "-leading" }).slug).toBeTruthy();
  });

  test("tags are deduplicated case-insensitively and capped", () => {
    /* Otherwise "Performance" and "performance" both become facets on the
       index page and look like a bug. */
    expect(cleanTags(["Performance", "performance", " PERFORMANCE "])).toEqual([
      "Performance",
    ]);
    expect(cleanTags(Array.from({ length: 20 }, (_, i) => `tag${i}`))).toHaveLength(
      POST_LIMITS.maxTags
    );
    expect(cleanTags(["", "  ", "real"])).toEqual(["real"]);
  });
});
