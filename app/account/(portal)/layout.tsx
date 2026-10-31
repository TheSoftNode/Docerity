import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLinkIcon, LogOutIcon } from "lucide-react";

import { requireAccount } from "@/lib/account/session";
import { signOutAccount } from "@/app/account/actions";
import { BrandMark } from "@/components/shared/brand-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { PortalNav } from "@/components/account/portal-nav";

export const metadata: Metadata = {
  title: { default: "Your account", template: "%s · Docerity" },
  robots: { index: false, follow: false },
};

/**
 * The signed-in client portal: a navy bar across the top in the same language
 * as the admin's sidebar, and the pages on paper beneath it. Every page under
 * it is behind `requireAccount`, here and again in each page.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const account = await requireAccount("/account");
  const initials = account.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-4 px-5 sm:px-8">
          <Link href="/account" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
            <BrandMark className="size-8" />
            <span className="font-heading text-xl font-extrabold tracking-[-0.03em] text-sidebar-accent-foreground">Docerity</span>
          </Link>
          <span className="hidden border-l border-sidebar-border pl-4 text-sm text-[#8b98c4] sm:inline">Client portal</span>

          <div className="ml-2 hidden md:block">
            <PortalNav />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:inline-flex"
            >
              The site <ExternalLinkIcon className="size-3.5" />
            </Link>
            <ThemeToggle className="size-9 rounded-full border border-sidebar-border text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
            <span
              aria-hidden
              title={account.name}
              className="hidden size-9 place-items-center rounded-full bg-[#1c3a8c] text-sm font-bold text-[#afc4ff] sm:grid"
            >
              {initials || "?"}
            </span>
            <form action={signOutAccount}>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-sidebar-border px-3.5 text-sm font-medium text-sidebar-accent-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-sidebar-ring"
              >
                <LogOutIcon className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
        {/* On a phone the bar has no room for the places, so they sit in a row beneath it. */}
        <div className="overflow-x-auto border-t border-sidebar-border px-4 py-2 md:hidden">
          <PortalNav />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 py-9 sm:px-8 lg:py-12">{children}</main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground sm:px-8">
          <span>Signed in as {account.email}</span>
          <span className="flex gap-5">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact us
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
