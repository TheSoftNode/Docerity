import { test, expect } from "@playwright/test";

import {
  currentMilestoneIndex,
  projectProgress,
  requestStatusLabel,
  safeHttps,
  validateSignup,
} from "@/lib/account/rules";
import { readAccountSession, signAccountSession } from "@/lib/account/token";
import { readSession, signSession } from "@/lib/auth/token";

/*
  Unit tests for the client portal's rules and its sessions. Like the other
  *-content specs these never open a page.
*/

test.describe("projectProgress", () => {
  test("done counts in full, in progress counts half", () => {
    expect(projectProgress([{ status: "done" }, { status: "doing" }, { status: "todo" }, { status: "todo" }])).toBe(38);
    expect(projectProgress([{ status: "done" }, { status: "done" }])).toBe(100);
    expect(projectProgress([{ status: "todo" }])).toBe(0);
  });

  test("no milestones is 0, and a delivered project is 100 whatever they say", () => {
    expect(projectProgress([])).toBe(0);
    expect(projectProgress([{ status: "todo" }], "done")).toBe(100);
  });
});

test.describe("currentMilestoneIndex", () => {
  test("is the one in progress, else the first not finished, else none", () => {
    expect(currentMilestoneIndex([{ status: "done" }, { status: "todo" }, { status: "doing" }])).toBe(2);
    expect(currentMilestoneIndex([{ status: "done" }, { status: "todo" }])).toBe(1);
    expect(currentMilestoneIndex([{ status: "done" }])).toBe(-1);
  });
});

test.describe("requestStatusLabel", () => {
  test("says where a request stands, and never shows spam", () => {
    expect(requestStatusLabel("new")).toBe("Received");
    expect(requestStatusLabel("replied")).toBe("We've replied");
    expect(requestStatusLabel("spam")).toBeNull();
  });
});

test.describe("validateSignup", () => {
  test("accepts a real sign-up", () => {
    expect(validateSignup({ name: "Ada Okafor", email: "ada@fintory.com", password: "a long passphrase" })).toEqual({});
  });

  test("names each problem", () => {
    const errors = validateSignup({ name: "A", email: "not-an-email", password: "short" });
    expect(Object.keys(errors).sort()).toEqual(["email", "name", "password"]);
  });
});

test.describe("safeHttps", () => {
  test("keeps https links and drops anything else", () => {
    expect(safeHttps("https://staging.client.com")).toBe("https://staging.client.com");
    for (const value of ["", "http://x.com", "javascript:alert(1)", "staging.client.com", null]) expect(safeHttps(value)).toBe("");
  });
});

test.describe("Sessions stay apart", () => {
  test.skip(!process.env.SESSION_SECRET, "needs SESSION_SECRET");

  test("a client session reads back, and is refused by the admin", async () => {
    const token = await signAccountSession({ accountId: "abc", sessionVersion: 2 });
    expect(await readAccountSession(token)).toEqual({ accountId: "abc", sessionVersion: 2 });
    expect(await readSession(token)).toBeNull();
  });

  test("an admin session is refused by the portal", async () => {
    const token = await signSession({ userId: "abc", role: "owner", sessionVersion: 1 });
    expect(await readAccountSession(token)).toBeNull();
  });
});
