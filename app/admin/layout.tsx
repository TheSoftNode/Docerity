import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLinkIcon, LogOutIcon } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/dal";
import { signOut } from "@/lib/auth/actions";
import { database } from "@/lib/config/env";
import { countEnquiriesByStatus } from "@/lib/repositories/enquiry.repository";
import { countReviewsByStatus } from "@/lib/repositories/review.repository";
import { AdminNav } from "@/components/admin/admin-nav";
import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";

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
  let counts = { enquiries: 0, reviews: 0 };
  if (database.isConfigured) {
    try {
      const [enquiries, reviews] = await Promise.all([
        countEnquiriesByStatus(),
        countReviewsByStatus(),
      ]);
      counts = { enquiries: enquiries.new, reviews: reviews.pending };
    } catch {
      /* Badges are an affordance, not information the page depends on. */
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-background lg:flex-row">
      <aside className="shrink-0 border-b border-border/80 bg-card/40 lg:w-60 lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col gap-6 px-4 py-5 lg:sticky lg:top-0 lg:max-h-svh lg:py-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <BrandMark className="size-8" />
            <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
              Docerity
            </span>
            <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.625rem] uppercase text-muted-foreground">
              Admin
            </span>
          </Link>

          <div className="flex-1">
            <AdminNav role={user.role} counts={counts} />
          </div>

          <div className="space-y-3 border-t border-border/80 pt-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* A Server Action in a form, so signing out is a POST. A GET
                  link would let any page on the internet sign you out with an
                  <img src>. */}
              <form action={signOut} className="flex-1">
                <Button type="submit" variant="outline" size="sm" className="w-full">
                  <LogOutIcon />
                  Sign out
                </Button>
              </form>
              <Button
                variant="ghost"
                size="icon-sm"
                nativeButton={false}
                render={<Link href="/" target="_blank" aria-label="Open the site" />}
              >
                <ExternalLinkIcon />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-7 sm:px-7 lg:px-9 lg:py-9">{children}</main>
    </div>
  );
}
