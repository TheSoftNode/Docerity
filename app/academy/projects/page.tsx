import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ClockIcon } from "lucide-react";

import { getCurrentAccount } from "@/lib/account/session";
import { BUILD_XP } from "@/lib/academy/briefs";
import { getBriefs } from "@/lib/academy/pool";
import { COURSE_LEVELS, type CourseLevel } from "@/lib/academy/types";
import { database } from "@/lib/config/env";
import { listBuildsFor } from "@/lib/repositories/academy.repository";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AcademyHero, LEVEL_TONE } from "@/components/academy/kit";
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
        <AcademyHero
          current="projects"
          title={
            <>
              Build something <span className="text-[var(--ld-accent)]">real.</span>
            </>
          }
          lede={
            <>
              Pick a brief, build it your way, and hand in the code and the live site. We review every build; approved ones earn XP and go in the showcase.
              {builds.length ? (
                <span className="mt-4 block text-[15px] font-semibold text-[var(--ld-paper)]">
                  You have {builds.length} {builds.length === 1 ? "build" : "builds"} on the go · {approved} approved
                </span>
              ) : null}
            </>
          }
        >
          <ul className="grid gap-3 sm:grid-cols-3">
            {COURSE_LEVELS.map((item) => {
              const these = briefs.filter((brief) => brief.level === item);
              const tone = LEVEL_TONE[item];
              const hours = these.map((brief) => brief.hours);
              return (
                <li key={item}>
                  <Link href={`/academy/projects?level=${item}#briefs`} scroll={false} className={cn("group flex h-full flex-col rounded-[24px] p-5 transition-transform hover:-translate-y-1 sm:p-6", tone.card)}>
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="ld-display text-[24px] font-extrabold tracking-[-0.03em]">{item}</span>
                      <span className={cn("text-[14px] font-semibold", tone.accent)}>{BUILD_XP[item]} XP</span>
                    </span>
                    <span className={cn("mt-1 text-[14.5px]", tone.text)}>
                      {these.length} {these.length === 1 ? "project" : "projects"}
                      {hours.length ? ` · ${Math.min(...hours)}–${Math.max(...hours)} hours each` : ""}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </AcademyHero>

        <section id="briefs" aria-label="Project briefs" className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell py-[clamp(40px,5vw,96px)]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="ld-display text-[clamp(36px,5vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]">{active ? `${active}.` : "Every brief."}</h2>
              <nav aria-label="Filter by level" className="-mx-5 flex max-w-[100vw] gap-1 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:rounded-full sm:bg-[var(--ld-card)] sm:p-1 sm:ring-1 sm:ring-[rgb(8_16_46/0.08)] [&::-webkit-scrollbar]:hidden">
                {[null, ...COURSE_LEVELS].map((item) => {
                  const count = item ? briefs.filter((brief) => brief.level === item).length : briefs.length;
                  const on = item === active;
                  return (
                    <Link
                      key={item ?? "all"}
                      href={item ? `/academy/projects?level=${item}#briefs` : "/academy/projects#briefs"}
                      scroll={false}
                      aria-current={on ? "page" : undefined}
                      className={cn(
                        "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-semibold whitespace-nowrap transition-colors",
                        on ? "bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "text-[var(--ld-text-2)] hover:text-[var(--ld-ink)] max-sm:ring-1 max-sm:ring-[var(--ld-line-2)]"
                      )}
                    >
                      {item ?? "All"} <span className="tabular-nums opacity-60">{count}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((brief) => {
                const state = status.get(brief.id);
                const tone = LEVEL_TONE[brief.level];
                const number = briefs.indexOf(brief) + 1;
                return (
                  <li key={brief.id}>
                    <Link href={`/academy/projects/${brief.id}`} className={cn("group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[28px] p-6 transition-transform hover:-translate-y-1 sm:p-7", tone.card)}>
                      <span aria-hidden="true" className={cn("ld-display pointer-events-none absolute -right-2 -bottom-8 text-[140px] leading-none font-extrabold tracking-[-0.06em]", tone.numeral)}>
                        {String(number).padStart(2, "0")}
                      </span>
                      <div className="relative flex items-center justify-between gap-3">
                        <span className={cn("text-[14px] font-semibold", tone.accent)}>
                          {brief.level} · {BUILD_XP[brief.level]} XP
                        </span>
                        {state ? (
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold", STATUS[state].tone)}>
                            {state === "approved" ? <CheckIcon className="size-3.5" /> : null}
                            {STATUS[state].label}
                          </span>
                        ) : null}
                      </div>
                      <h3 className="ld-display relative mt-3 text-[27px] leading-[1.02] font-extrabold tracking-[-0.035em]">{brief.title}</h3>
                      <p className={cn("relative mt-3 text-[15.5px] leading-relaxed", tone.text)}>{brief.summary}</p>
                      <div className="relative mt-auto pt-6">
                        <ul className="flex flex-wrap gap-1.5">
                          {brief.stack.map((item) => (
                            <li key={item} className={cn("rounded-full border px-2.5 py-1 text-[12.5px] font-medium", tone.chip)}>
                              {item}
                            </li>
                          ))}
                        </ul>
                        <p className={cn("mt-4 flex items-center justify-between text-[14px]", tone.soft)}>
                          <span className="inline-flex items-center gap-1.5">
                            <ClockIcon className="size-4" /> About {brief.hours} hours
                          </span>
                          <ArrowRightIcon className={cn("size-5 transition-transform group-hover:translate-x-1", tone.accent)} />
                        </p>
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
