import { test, expect } from "@playwright/test";

import { newestWaiting, timeAgo, type WaitingItem } from "@/components/admin/admin-content";

/*
  Unit tests for the admin's small rules. Like the other *-content specs these
  never open a page.
*/

const now = new Date("2026-10-31T12:00:00Z");
const before = (ms: number) => new Date(now.getTime() - ms);
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

test.describe("timeAgo", () => {
  test("says it the way a person would", () => {
    expect(timeAgo(before(20_000), now)).toBe("just now");
    expect(timeAgo(before(MIN), now)).toBe("1 minute ago");
    expect(timeAgo(before(12 * MIN), now)).toBe("12 minutes ago");
    expect(timeAgo(before(HOUR), now)).toBe("1 hour ago");
    expect(timeAgo(before(5 * HOUR), now)).toBe("5 hours ago");
    expect(timeAgo(before(30 * HOUR), now)).toBe("yesterday");
    expect(timeAgo(before(4 * DAY), now)).toBe("4 days ago");
  });

  test("gives the date once it is over a week old, with the year only when it differs", () => {
    expect(timeAgo(new Date("2026-10-01T09:00:00Z"), now)).toBe("1 Oct");
    expect(timeAgo(new Date("2025-12-24T09:00:00Z"), now)).toBe("24 Dec 2025");
  });

  test("a time in the future reads as just now rather than a negative", () => {
    expect(timeAgo(new Date(now.getTime() + HOUR), now)).toBe("just now");
  });
});

test.describe("newestWaiting", () => {
  const item = (id: string, at: Date): WaitingItem => ({ kind: "enquiry", id, title: id, detail: "", href: "", at });

  test("mixes both kinds, newest first, up to the limit", () => {
    const items = [item("a", before(3 * HOUR)), item("b", before(HOUR)), item("c", before(2 * DAY))];
    expect(newestWaiting(items).map((entry) => entry.id)).toEqual(["b", "a", "c"]);
    expect(newestWaiting(items, 2)).toHaveLength(2);
  });
});
