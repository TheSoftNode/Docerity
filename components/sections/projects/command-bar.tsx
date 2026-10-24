"use client";

import { SearchIcon } from "lucide-react";

import { useProjectsFilter } from "@/components/sections/projects/filter-context";
import { ALL_FILTER, type GroupCount } from "@/components/sections/projects/projects-content";

/**
 * The hero's command bar: a way into the work by what somebody came to see.
 *
 * Styled as a command palette, but honest about what it is: links that set
 * the showcase's filter and jump to it, with real counts. Each is an anchor
 * to `#showcase`, so it still scrolls there without JavaScript.
 */
function CommandBar({ total, groups }: { total: number; groups: GroupCount[] }) {
  const { setFilter } = useProjectsFilter();

  return (
    <nav
      aria-label="Jump to projects"
      className="ld-up ld-delay-3 mt-9 w-full max-w-[640px] rounded-[20px] border border-[rgb(var(--ld-paper-rgb)/0.18)] bg-[rgb(var(--ld-ink-rgb)/0.72)] p-2 text-left shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] backdrop-blur-[14px]"
    >
      <a
        href="#showcase"
        onClick={() => setFilter(ALL_FILTER)}
        className="flex min-h-13 items-center gap-3 rounded-[14px] bg-[rgb(var(--ld-paper-rgb)/0.05)] px-3.5 transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.09)]"
      >
        <SearchIcon aria-hidden="true" className="size-[18px] text-[var(--ld-muted-3)]" />
        <span className="flex-1 text-base text-[var(--ld-muted-3)]">
          Find a project
          <span aria-hidden="true" className="ld-blink text-[var(--ld-accent)]">
            ▍
          </span>
        </span>
        <span className="rounded-md border border-[rgb(var(--ld-tint-rgb)/0.3)] px-2 py-1 font-mono text-[11px] text-[var(--ld-muted-3)]">
          All {total}
        </span>
      </a>
      <ul className="flex flex-wrap gap-1.5 px-1.5 pt-2.5 pb-1">
        {groups.map((group) => (
          <li key={group.label}>
            <a
              href="#showcase"
              onClick={() => setFilter(group.label)}
              className="inline-flex min-h-9 items-center gap-2 rounded-[10px] px-3 text-[13.5px] text-[var(--ld-muted)] transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.07)] hover:text-[var(--ld-paper)]"
            >
              <span aria-hidden="true" className="size-1.5 rounded-[2px] bg-[var(--ld-accent)]" />
              {group.label}
              <span className="font-mono text-[11px] text-[var(--ld-muted-3)]">{group.count}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { CommandBar };
