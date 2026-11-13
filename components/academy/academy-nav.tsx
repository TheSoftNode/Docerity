import Link from "next/link";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/academy", label: "Courses", key: "courses" },
  { href: "/academy/projects", label: "Project pool", key: "projects" },
  { href: "/academy/battles", label: "Battles", key: "battles" },
  { href: "/academy/showcase", label: "Showcase", key: "showcase" },
] as const;

/** The Academy's rooms, as a row of pills at the top of each Academy page. */
export function AcademyNav({ current }: { current: (typeof LINKS)[number]["key"] }) {
  return (
    <nav aria-label="Academy" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      {LINKS.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          aria-current={link.key === current ? "page" : undefined}
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-[14px] font-semibold whitespace-nowrap transition-colors",
            link.key === current
              ? "bg-[var(--ld-paper)] text-[var(--ld-ink)]"
              : "border border-[rgb(var(--ld-paper-rgb)/0.2)] text-[var(--ld-muted)] hover:text-[var(--ld-paper)]"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
