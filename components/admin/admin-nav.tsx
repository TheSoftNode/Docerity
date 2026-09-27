"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  BriefcaseIcon,
  FileTextIcon,
  ImagesIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  MailIcon,
  StarIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { can, type Role } from "@/lib/auth/permissions";

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
  /*
    Whether this role should see the link at all.

    Hiding a link is not access control, and is not treated as such: each page
    and every action re-checks for itself. This only decides what is worth
    showing, so a contributor is not looking at four tabs that would turn them
    away.
  */
  visible: (role: Role) => boolean;
};

const items: NavItem[] = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboardIcon, visible: can.readEnquiries },
  { href: "/admin/enquiries", label: "Enquiries", Icon: InboxIcon, visible: can.readEnquiries },
  { href: "/admin/reviews", label: "Reviews", Icon: StarIcon, visible: can.moderateReviews },
  { href: "/admin/posts", label: "Writing", Icon: FileTextIcon, visible: can.writePosts },
  { href: "/admin/work", label: "Work", Icon: BriefcaseIcon, visible: can.publishPosts },
  /* Everything written on the site that is not a project, a post or a review:
     the client logos, the About page, the mentorship programme, the service and
     capability grids, the explainer pairs and the contact steps. */
  { href: "/admin/content", label: "Page content", Icon: LayoutTemplateIcon, visible: can.publishPosts },
  { href: "/admin/media", label: "Media", Icon: ImagesIcon, visible: can.publishPosts },
  { href: "/admin/subscribers", label: "Subscribers", Icon: MailIcon, visible: can.readSubscribers },
  { href: "/admin/users", label: "Accounts", Icon: UsersIcon, visible: can.manageAccounts },
];

function AdminNav({
  role,
  counts,
}: {
  role: Role;
  counts: { enquiries: number; reviews: number; posts: number };
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const visible = items.filter((item) => item.visible(role));

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
              : item.href === "/admin/posts"
                ? counts.posts
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
                /*
                  Brand-tinted rather than a grey wash, and with a coloured bar
                  down its leading edge. A neutral pill said "this one" and
                  nothing else; the bar is what makes the current section
                  findable at a glance down a list of nine.
                */
                className="absolute inset-0 rounded-lg border border-primary/25 bg-primary/[0.12] before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-[linear-gradient(to_bottom,var(--brand-primary),var(--brand-violet))] before:content-['']"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            ) : null}

            <item.Icon
              className={cn(
                "relative size-4 shrink-0 transition-colors",
                active ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground"
              )}
            />
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
