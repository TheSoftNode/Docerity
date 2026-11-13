import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";

import { getCurrentAccount } from "@/lib/account/session";
import { getBriefs } from "@/lib/academy/pool";
import { database } from "@/lib/config/env";
import { listShowcase } from "@/lib/repositories/academy.repository";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AcademyHero, Avatar, BrowserFrame, coverFor, inkCard } from "@/components/academy/kit";
import { cn } from "@/lib/utils";
import { VoteButton } from "@/components/academy/vote-button";

export const metadata: Metadata = {
  title: "Showcase",
  description: "Projects built and shipped by Docerity Academy students, reviewed by us.",
  alternates: { canonical: "/academy/showcase" },
};
export const dynamic = "force-dynamic";

/**
 * What students have shipped: every approved build, most upvoted first, with
 * the live site and the code. Signed-in students upvote others' work.
 */
export default async function ShowcasePage() {
  const [account, briefs] = await Promise.all([getCurrentAccount(), getBriefs()]);
  const builds = database.isConfigured ? await listShowcase().catch(() => []) : [];
  const titles = new Map(briefs.map((brief) => [brief.id, brief] as const));

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <AcademyHero
          current="showcase"
          title={
            <>
              Built by our <span className="text-[var(--ld-accent)]">students.</span>
            </>
          }
          lede="Every project here came from the project pool, was built by a student, and passed our review. Open the live site, read the code, and upvote the ones you like."
        >
          <dl className="grid grid-cols-3 gap-3 sm:max-w-[640px]">
            {[
              { label: "Builds shipped", value: builds.length },
              { label: "Students", value: new Set(builds.map((build) => String(build.accountId))).size },
              { label: "Upvotes", value: builds.reduce((sum, build) => sum + build.votes, 0) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[20px] bg-[rgb(var(--ld-tint-rgb)/0.07)] p-4 ring-1 ring-[rgb(var(--ld-tint-rgb)/0.14)] sm:p-5">
                <dt className="text-[13px] text-[var(--ld-muted)]">{stat.label}</dt>
                <dd className="ld-display mt-1 text-[clamp(26px,3vw,40px)] leading-none font-extrabold tracking-[-0.03em] tabular-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </AcademyHero>

        <section aria-label="Approved builds" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell py-[clamp(40px,5vw,96px)]">
            {builds.length === 0 ? (
              <div className={cn(inkCard, "grid items-center gap-8 overflow-hidden p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
                <div>
                  <p className="ld-display text-[clamp(28px,3vw,40px)] leading-[1] font-extrabold tracking-[-0.035em]">The first builds are on their way.</p>
                  <p className="mt-3 text-[16px] leading-relaxed text-[#c4cbe3]">Take a project from the pool, ship it, and yours could be the first one here.</p>
                  <Link href="/academy/projects" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#ff7a59] px-6 text-[15px] font-semibold text-[#08102e]">
                    Open the project pool <ArrowRightIcon className="size-4" />
                  </Link>
                </div>
                <div aria-hidden="true" className="relative hidden h-56 lg:block">
                  {["your-portfolio.vercel.app", "your-quiz-game.netlify.app", "your-kanban.vercel.app"].map((host, index) => (
                    <BrowserFrame key={host} url={`https://${host}`} className={cn("absolute w-[78%] opacity-90", ["top-0 left-0", "top-10 left-[11%]", "top-20 left-[22%]"][index])}>
                      <div className={cn("h-28", coverFor(host))} />
                    </BrowserFrame>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {builds.map((build) => {
                  const brief = titles.get(build.briefId);
                  const mine = account?.id === String(build.accountId);
                  const voted = account ? build.voters.some((voter) => String(voter) === account.id) : false;
                  return (
                    <li key={String(build._id)} className="flex flex-col rounded-[28px] bg-[var(--ld-card)] p-3 shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)]">
                      <a href={build.liveUrl} target="_blank" rel="noopener noreferrer" className="group block" aria-label={`Open ${brief?.title ?? "the build"} by ${build.name}`}>
                        <BrowserFrame url={build.liveUrl}>
                          <div className={cn("relative flex h-44 items-end p-5", coverFor(String(build._id)))}>
                            <span className="ld-display text-[26px] leading-[1] font-extrabold tracking-[-0.035em] text-white transition-transform group-hover:-translate-y-1">{brief?.title ?? build.briefId}</span>
                            <ArrowUpRightIcon className="absolute top-4 right-4 size-5 text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </div>
                        </BrowserFrame>
                      </a>
                      <div className="flex flex-1 flex-col px-3 pt-4 pb-2">
                        <div className="flex items-center gap-3">
                          <Avatar name={build.name} className="size-9 text-[13px]" />
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold">{build.name}</p>
                            <p className="text-[13px] text-[var(--ld-text-muted)]">{brief ? `${brief.level} · ${brief.stack.slice(0, 2).join(" · ")}` : "Project"}</p>
                          </div>
                        </div>
                        {build.note ? <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-[var(--ld-text-2)]">{build.note}</p> : null}
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                          <a href={build.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 text-[14px] font-semibold text-[var(--ld-deep)]">
                            Read the code <ArrowUpRightIcon className="size-4" />
                          </a>
                          <VoteButton
                            buildId={String(build._id)}
                            votes={build.votes}
                            voted={voted}
                            disabled={!account?.verified || mine}
                            hint={mine ? "Your own build" : "Sign in to upvote"}
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
