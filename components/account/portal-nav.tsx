"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/requests/new", label: "New request" },
  { href: "/account/profile", label: "Profile" },
];

/** The portal's places. A project or request page counts as Overview, where it is reached from. */
function PortalNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Your account" className="flex items-center gap-1">
      {LINKS.map((link) => {
        const active =
          link.href === "/account"
            ? pathname === "/account" || pathname.startsWith("/account/projects") || (pathname.startsWith("/account/requests/") && !pathname.startsWith("/account/requests/new"))
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { PortalNav };
