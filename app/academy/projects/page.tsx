import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ClockIcon, ZapIcon } from "lucide-react";

import { getCurrentAccount } from "@/lib/account/session";
import { BUILD_XP } from "@/lib/academy/briefs";
import { getBriefs } from "@/lib/academy/pool";
import { COURSE_LEVELS, type CourseLevel } from "@/lib/academy/types";
import { database } from "@/lib/config/env";
import { listBuildsFor } from "@/lib/repositories/academy.repository";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AcademyNav } from "@/components/academy/academy-nav";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Project pool",
  description: "Pick a real project, build it, hand it in for review and XP. Briefs for beginners through to advanced.",
  alternates: { canonical: "/academy/projects" },
};
export const dynamic = "force-dynamic";

const STATUS = {
  building: { label: "Building", tone: "bg-[#e6ecff] text-[#1c3a8c]" },
  submitted: { label: "Handed in", tone: "bg-[#fff3d6] text-[#7a5410]" },
  changes: { label: "Changes asked", tone: "bg-[#fff0eb] text-[#9a3412]" },
  approved: { label: "Approved", tone: "bg-[#e3f6ec] text-[#1d7a52]" },
} as const;

/**
 * The project pool: every brief as a card, filtered by level through the
 * address (?level=Intermediate) so a filtered view survives Back and can be
 * shared. A signed-in student sees where each of their builds stands.
 */
export default async function ProjectPoolPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const { level } = await searchParams;
  const active = (COURSE_LEVELS as readonly string[]).includes(level ?? "") ? (level as CourseLevel) : null;
  const [briefs, account] = await Promise.all([getBriefs(), getCurrentAccount()]);
  const builds = account?.verified && database.isConfigured ? await listBuildsFor(account.id).catch(() => []) : [];
  const status = new Map(builds.map((build) => [build.briefId, build.status] as const));
  const shown = active ? briefs.filter((brief) => brief.level === active) : briefs;
  const approved = builds.filter((build) => build.status === "approved").length;

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(900px_520px_at_88%_10%,rgb(28_58_140/0.6),transparent_62%),var(--ld-ink)] pt-[124px] pb-[clamp(48px,6vw,80px)] text-[var(--ld-paper)]">
          <div className="doc-shell">
            <AcademyNav current="projects" />
            <h1 className="ld-display ld-up mt-8 max-w-[16ch] text-[clamp(42px,6vw,84px)] leading-[0.95] font-extrabold tracking-[-0.05em] text-balance">
              Build something <span className="text-[var(--ld-accent)]">real.</span>
            </h1>
            <p className="ld-up ld-delay-2 mt-5 max-w-[40rem] text-[clamp(16px,1.3vw,18px)] leading-relaxed text-[var(--ld-muted)]">
              Pick a brief, build it your way, and hand in the code and the live site. We review every build; approved ones earn XP and go in the showcase for everyone to see.
            </p>
            {builds.length ? (
              <p className="mt-6 text-[15px] text-[var(--ld-muted)]">
                You have {builds.length} {builds.length === 1 ? "build" : "builds"} on the go · {approved} approved
              </p>
            ) : null}
          </div>
        </section>

        <section aria-label="Project briefs" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell py-[clamp(40px,5vw,80px)]">
            <nav aria-label="Filter by level" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              {[null, ...COURSE_LEVELS].map((item) => {
                const count = item ? briefs.filter((brief) => brief.level === item).length : briefs.length;
                const on = item === active;
                return (
                  <Link
                    key={item ?? "all"}
                    href={item ? `/academy/projects?level=${item}` : "/academy/projects"}
                    scroll={false}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                      on ? "border-[var(--ld-ink)] bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "border-[var(--ld-line-2)] hover:border-[var(--ld-ink)]"
                    )}
                  >
                    {item ?? "All"} <span className="font-mono text-xs opacity-60">{count}</span>
                  </Link>
                );
              })}
            </nav>

            <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((brief) => {
                const state = status.get(brief.id);
                return (
                  <li key={brief.id}>
                    <Link href={`/academy/projects/${brief.id}`} className="group flex h-full flex-col rounded-[24px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-6 transition-transform hover:-translate-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-semibold text-[var(--ld-deep)]">{brief.level}</span>
                        {state ? (
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold", STATUS[state].tone)}>
                            {state === "approved" ? <CheckIcon className="size-3.5" /> : null}
                            {STATUS[state].label}
                          </span>
                        ) : null}
                      </div>
                      <h2 className="ld-display mt-2 text-[23px] leading-tight font-bold tracking-[-0.025em]">{brief.title}</h2>
                      <p className="mt-2 text-[15px] leading-relaxed text-[var(--ld-text-2)]">{brief.summary}</p>
                      <p className="mt-4 text-[13px] text-[var(--ld-text-muted)]">{brief.stack.join(" · ")}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--ld-line)] pt-4 text-[13.5px]">
                        <span className="inline-flex items-center gap-3 text-[var(--ld-text-muted)]">
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon className="size-3.5" /> ~{brief.hours}h
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-[var(--ld-ink)]">
                            <ZapIcon className="size-3.5" /> {BUILD_XP[brief.level]} XP
                          </span>
                        </span>
                        <ArrowRightIcon className="size-4 text-[var(--ld-deep)] transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
