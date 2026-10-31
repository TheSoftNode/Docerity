/**
 * Password resets: the timing and the link.
 *
 * The token itself is made and hashed exactly as an invitation's is (32
 * random bytes, stored only as a SHA-256 digest), so those helpers are reused
 * from `invite.ts` rather than restated.
 */

/* One hour. A reset is used straight away or not at all, and a link that
   sits in an inbox for days is a link somebody else may find. */
export const RESET_TTL_MS = 60 * 60 * 1000;

/* One email per account every two minutes, however often the form is sent. */
export const RESET_THROTTLE_MS = 2 * 60 * 1000;

export function resetExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + RESET_TTL_MS);
}

/** The link in the email. Absolute, because a relative link in email goes nowhere. */
export function resetUrl(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/$/, "")}/admin/reset/${token}`;
}

/** A plausible email address, enough to refuse obvious typos before any lookup. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) && value.trim().length <= 320;
}
