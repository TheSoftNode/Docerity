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

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  /*
    Whether this role should see the link at all. Hiding a link is not access
    control: each page and every action re-checks for itself. This only
    decides what is worth showing.
  */
  visible: (role: Role) => boolean;
};

/* Grouped by what the work is: what has come in, what is on the site, and who can edit it. */
const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "",
    items: [{ href: "/admin", label: "Overview", Icon: LayoutDashboardIcon, visible: can.readEnquiries }],
  },
  {
    label: "Inbox",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", Icon: InboxIcon, visible: can.readEnquiries },
      { href: "/admin/reviews", label: "Reviews", Icon: StarIcon, visible: can.moderateReviews },
      { href: "/admin/subscribers", label: "Subscribers", Icon: MailIcon, visible: can.readSubscribers },
    ],
  },
  {
    label: "Site",
    items: [
      { href: "/admin/posts", label: "Writing", Icon: FileTextIcon, visible: can.writePosts },
      { href: "/admin/projects", label: "Projects", Icon: BriefcaseIcon, visible: can.publishPosts },
      /* The client logos, every page's headings and words, the About page and the rest. */
      { href: "/admin/content", label: "Page content", Icon: LayoutTemplateIcon, visible: can.publishPosts },
      { href: "/admin/media", label: "Media", Icon: ImagesIcon, visible: can.publishPosts },
    ],
  },
  {
    label: "Team",
    items: [{ href: "/admin/users", label: "Accounts", Icon: UsersIcon, visible: can.manageAccounts }],
  },
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

  const badgeFor = (href: string) =>
    href === "/admin/enquiries" ? counts.enquiries : href === "/admin/reviews" ? counts.reviews : href === "/admin/posts" ? counts.posts : 0;

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-5">
      {groups.map((group) => {
        const visible = group.items.filter((item) => item.visible(role));
        if (visible.length === 0) return null;

        return (
          <div key={group.label || "top"}>
            {group.label ? (
              <p className="mb-1.5 px-3 text-xs font-medium text-[#7d8ec0]">{group.label}</p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {visible.map((item) => {
                /* Exact for /admin, by prefix for the rest, or Overview would light up everywhere. */
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const badge = badgeFor(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group/nav relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId="admin-nav-active"
                          aria-hidden
                          className="absolute inset-0 rounded-xl bg-sidebar-accent shadow-[inset_2px_0_0_var(--sidebar-primary)]"
                          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                        />
                      ) : (
                        <span aria-hidden className="absolute inset-0 rounded-xl transition-colors group-hover/nav:bg-[rgb(175_196_255/0.06)]" />
                      )}

                      <item.Icon
                        aria-hidden
                        className={cn("relative size-[18px] shrink-0", active ? "text-sidebar-primary" : "text-[#8b98c4] group-hover/nav:text-sidebar-accent-foreground")}
                      />
                      <span className="relative flex-1 truncate">{item.label}</span>

                      {badge > 0 ? (
                        <span
                          className="relative min-w-6 rounded-full bg-[#ff7a59] px-2 py-0.5 text-center text-xs leading-4 font-bold text-[#08102e]"
                          aria-label={`${badge} waiting`}
                        >
                          {badge > 99 ? "99+" : badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

export { AdminNav };
