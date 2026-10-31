import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLinkIcon, LogOutIcon } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/dal";
import { signOut } from "@/lib/auth/actions";
import { database } from "@/lib/config/env";
import { countEnquiriesByStatus } from "@/lib/repositories/enquiry.repository";
import { countReviewsByStatus } from "@/lib/repositories/review.repository";
import { countPostsByStatus } from "@/lib/repositories/post.repository";
import { isStaff } from "@/lib/auth/permissions";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminRail } from "@/components/admin/admin-rail";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Docerity admin" },
  robots: { index: false, follow: false },
};

/**
 * The admin shell.
 *
 * `getCurrentUser` rather than `requireUser` here: the login page is inside
 * this segment, and redirecting from the layout would redirect the login page
 * to itself. Each admin page calls `requireUser` for its own content, which is
 * where the guard belongs anyway, since a layout protects only what it renders.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  /* Signed out, or the login page: render the page alone with no chrome. */
  if (!user) return <>{children}</>;

  /*
    Counts for the rail badges. Wrapped because the shell must still render if
    the database goes away mid-session, otherwise an Atlas blip turns every
    admin page into an error screen instead of one with empty lists.
  */
  let counts = { enquiries: 0, reviews: 0, posts: 0 };
  if (database.isConfigured) {
    try {
      if (isStaff(user.role)) {
        /* Staff see what is waiting on them across the whole site. */
        const [enquiries, reviews, posts] = await Promise.all([
          countEnquiriesByStatus(),
          countReviewsByStatus(),
          countPostsByStatus(),
        ]);
        counts = {
          enquiries: enquiries.new,
          reviews: reviews.pending,
          posts: posts.submitted,
        };
      } else {
        /*
          A contributor's badge counts their own drafts, not the queue. Counting
          submissions site-wide would leak how much other people have written,
          from a number on a nav item.
        */
        const posts = await countPostsByStatus(user.id);
        counts = { enquiries: 0, reviews: 0, posts: posts.draft };
      }
    } catch {
      /* Badges are an affordance, not information the page depends on. */
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background lg:flex-row">
      <AdminRail
        brand={
          <Link href="/admin" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
            <BrandMark className="size-8" />
            <span className="font-heading text-xl font-extrabold tracking-[-0.03em] text-sidebar-accent-foreground">Docerity</span>
          </Link>
        }
      >
        <div className="flex-1">
          <AdminNav role={user.role} counts={counts} />
        </div>

        <div className="border-t border-sidebar-border pt-5 lg:px-2">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full bg-[#1c3a8c] text-sm font-bold text-[#afc4ff]"
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">{user.name}</p>
              <p className="truncate text-xs text-[#8b98c4]">{user.email}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {/* A Server Action in a form, so signing out is a POST: a GET link would let any page sign you out with an <img>. */}
            <form action={signOut} className="flex-1">
              <button
                type="submit"
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-sidebar-border text-sm font-medium text-sidebar-accent-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring"
              >
                <LogOutIcon className="size-4" />
                Sign out
              </button>
            </form>

            {/* The same toggle the public navbar uses; light and dark both keep this sidebar navy. */}
            <ThemeToggle className="size-9 rounded-full border border-sidebar-border text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />

            <Link
              href="/"
              target="_blank"
              aria-label="Open the site in a new tab"
              className="grid size-9 place-items-center rounded-full border border-sidebar-border text-sidebar-accent-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring"
            >
              <ExternalLinkIcon className="size-4" />
            </Link>
          </div>
        </div>
      </AdminRail>

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-11">
        <div className="mx-auto max-w-[1240px]">{children}</div>
      </main>
    </div>
  );
}

/** "Theophilus Uchechukwu" → "TU", for the round mark beside the account. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
