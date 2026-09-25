/**
 * What each role may do, in one place.
 *
 * Kept as predicates rather than scattered `role === "owner"` checks, because
 * the question "who can see client enquiries?" should have exactly one answer
 * in the codebase. Adding a fourth role later means editing this file, not
 * hunting for comparisons.
 *
 * This module is pure and has no imports, so it can be used by a page, a Server
 * Action, and the nav that decides what to render.
 */

export type Role = "owner" | "editor" | "contributor";

export const ROLES: { value: Role; label: string; summary: string }[] = [
  {
    value: "owner",
    label: "Owner",
    summary: "Everything, including accounts.",
  },
  {
    value: "editor",
    label: "Editor",
    summary: "Writing, reviews, enquiries and subscribers. Can publish.",
  },
  {
    value: "contributor",
    label: "Contributor",
    summary: "Writes their own posts and submits them. Cannot publish.",
  },
];

/**
 * "Staff" is owner or editor: the people who run the site rather than write for
 * it.
 *
 * The distinction matters more than it looks. A contributor is somebody's
 * mentee writing their first explainer, and enquiries carry client budgets and
 * attachments while the subscriber list is a column of people's email
 * addresses. Neither has anything to do with writing a post.
 */
export function isStaff(role: Role): boolean {
  return role === "owner" || role === "editor";
}

export const can = {
  /** Create, disable and delete accounts. */
  manageAccounts: (role: Role) => role === "owner",

  /** Put a post on the live blog, or take one off it. */
  publishPosts: (role: Role) => isStaff(role),

  /** Approve, reject and delete reviews. */
  moderateReviews: (role: Role) => isStaff(role),

  /** Read the contact form's submissions, including attachments. */
  readEnquiries: (role: Role) => isStaff(role),

  /** Read and export the mailing list. */
  readSubscribers: (role: Role) => isStaff(role),

  /** Open the editor at all. Everyone with an account can write. */
  writePosts: () => true,

  /**
   * See every post rather than only their own.
   *
   * A contributor's list is scoped to what they wrote. This is a convenience in
   * the UI and a rule in the repository: `listPostsFor` takes an author filter,
   * so a contributor cannot reach another person's draft by guessing its id.
   */
  seeAllPosts: (role: Role) => isStaff(role),
} as const;

/** The landing page for a role, used after signing in. */
export function homeFor(role: Role): string {
  /* A contributor has no use for the overview: its counts are enquiries,
     reviews and subscribers, none of which they can open. */
  return role === "contributor" ? "/admin/posts" : "/admin";
}
