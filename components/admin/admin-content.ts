/*
  Small rules for the admin's pages, kept apart from the components so they can
  be tested without a page.
*/

/**
 * How long ago something arrived, in the words a person would use: "just
 * now", "12 minutes ago", "3 hours ago", "yesterday", "4 days ago", then the
 * date itself once it is more than a week old.
 */
export function timeAgo(date: Date | string, now: Date = new Date()): string {
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.max(0, Math.round((now.getTime() - then.getTime()) / 1000));
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: then.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

export type WaitingItem = { kind: "enquiry" | "review" | "reply"; id: string; title: string; detail: string; href: string; at: Date };

/** The newest things waiting, of both kinds, newest first and at most `limit`. */
export function newestWaiting(items: WaitingItem[], limit = 6): WaitingItem[] {
  return [...items].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
