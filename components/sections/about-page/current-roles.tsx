import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type CurrentRole = {
  role: string;
  org: string;
  period: string;
  summary: string;
  /** The case study that shows the work, when there is one. */
  href?: string;
};

const DELAYS = ["ld-delay-2", "ld-delay-3", "ld-delay-4"];

/**
 * What the founder does now, in plain words: the roles he holds today, each
 * with one line on what it involves and a link to the work. Written for a
 * recruiter reading in a hurry, so it says "Currently" rather than speaking
 * git, and the live dot is the only decoration. Ongoing side work beyond the
 * first three is named in one line underneath rather than given a row.
 */
function CurrentRoles({ roles, more }: { roles: CurrentRole[]; more: string[] }) {
  if (roles.length === 0) return null;

  return (
    <aside
      aria-labelledby="currently-title"
      className="ld-keep-dark ld-up ld-delay-2 rounded-[22px] border border-[rgb(var(--ld-tint-rgb)/0.16)] bg-[rgb(17_35_88/0.45)] p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="currently-title" className="ld-display text-[19px] font-semibold tracking-[-0.02em] text-[var(--ld-paper)]">
          Currently
        </h2>
        <span className="inline-flex items-center gap-2 font-mono text-[11.5px] text-[var(--ld-muted-3)]">
          <span aria-hidden="true" className="ld-live size-2 rounded-full bg-[#54d696]" />
          {roles.length} active {roles.length === 1 ? "role" : "roles"}
        </span>
      </div>

      <ul className="mt-4 divide-y divide-[rgb(var(--ld-tint-rgb)/0.12)]">
        {roles.map((item, index) => {
          const body = (
            <>
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block text-[15.5px] leading-snug font-semibold text-[var(--ld-paper)]">{item.role}</span>
                  <span className="mt-0.5 block text-[14px] text-[var(--ld-muted)]">
                    {item.org}
                    <span aria-hidden="true" className="mx-1.5 text-[var(--ld-muted-3)]">
                      ·
                    </span>
                    <span className="text-[var(--ld-muted-3)]">{item.period}</span>
                  </span>
                </span>
                {item.href ? (
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="mt-1 size-4 shrink-0 text-[var(--ld-muted-3)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[var(--ld-accent)]"
                  />
                ) : null}
              </span>
              {item.summary ? (
                <span className="mt-1.5 line-clamp-2 block text-[13.5px] leading-relaxed text-[var(--ld-muted-3)]">{item.summary}</span>
              ) : null}
            </>
          );
          return (
            <li key={`${item.org}-${item.role}`} className={cn("ld-up", DELAYS[index % DELAYS.length])}>
              {item.href ? (
                <Link
                  href={item.href}
                  aria-label={`${item.role} at ${item.org}: see the work`}
                  className="group -mx-2 block rounded-xl px-2 py-3.5 transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.05)] focus-visible:bg-[rgb(var(--ld-paper-rgb)/0.05)] focus-visible:outline-none"
                >
                  {body}
                </Link>
              ) : (
                <div className="py-3.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      {more.length > 0 ? (
        <p className="mt-2 border-t border-[rgb(var(--ld-tint-rgb)/0.12)] pt-3.5 text-[13px] text-[var(--ld-muted-3)]">
          Also ongoing: {more.join(", ")}
        </p>
      ) : null}
    </aside>
  );
}

export { CurrentRoles };
