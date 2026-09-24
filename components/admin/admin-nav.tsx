"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  FileTextIcon,
  InboxIcon,
  LayoutDashboardIcon,
  MailIcon,
  StarIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The admin rail.
 *
 * Same `layoutId` shared-element technique as the About page's profile rail, so
 * the active marker slides between items rather than cutting. One visual
 * language across the site, even in the part only one person sees.
 */

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Owner-only items are filtered server-side; this is only the label. */
  ownerOnly?: boolean;
};

const items: NavItem[] = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboardIcon },
  { href: "/admin/enquiries", label: "Enquiries", Icon: InboxIcon },
  { href: "/admin/reviews", label: "Reviews", Icon: StarIcon },
  { href: "/admin/posts", label: "Writing", Icon: FileTextIcon },
  { href: "/admin/subscribers", label: "Subscribers", Icon: MailIcon },
  { href: "/admin/users", label: "Accounts", Icon: UsersIcon, ownerOnly: true },
];

function AdminNav({
  role,
  counts,
}: {
  role: "owner" | "editor";
  counts: { enquiries: number; reviews: number };
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const visible = items.filter((item) => !item.ownerOnly || role === "owner");

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-1">
      {visible.map((item) => {
        /*
          Exact match for /admin, prefix match for the rest. Without the
          special case, /admin would light up on every page because every
          admin path starts with it.
        */
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        const badge =
          item.href === "/admin/enquiries"
            ? counts.enquiries
            : item.href === "/admin/reviews"
              ? counts.reviews
              : 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group/nav relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active ? (
              <motion.span
                layoutId="admin-nav-active"
                className="absolute inset-0 rounded-lg bg-foreground/[0.07]"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            ) : null}

            <item.Icon className="relative size-4 shrink-0" />
            <span className="relative flex-1 truncate">{item.label}</span>

            {badge > 0 ? (
              <span
                className="relative rounded-full bg-primary px-1.5 py-0.5 font-mono text-[0.625rem] leading-none text-primary-foreground"
                /* The number alone reads as decoration to a screen reader. */
                aria-label={`${badge} waiting`}
              >
                {badge > 99 ? "99+" : badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

export { AdminNav };
