import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";

import { getCurrentAccount } from "@/lib/account/session";
import { getBriefs } from "@/lib/academy/pool";
import { database } from "@/lib/config/env";
import { listShowcase } from "@/lib/repositories/academy.repository";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AcademyNav } from "@/components/academy/academy-nav";
import { VoteButton } from "@/components/academy/vote-button";

export const metadata: Metadata = {
  title: "Showcase",
  description: "Projects built and shipped by Docerity Academy students, reviewed by us.",
  alternates: { canonical: "/academy/showcase" },
};
export const dynamic = "force-dynamic";

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(900px_520px_at_88%_10%,rgb(255_122_89/0.14),transparent_62%),var(--ld-ink)] pt-[124px] pb-[clamp(48px,6vw,80px)] text-[var(--ld-paper)]">
          <div className="doc-shell">
            <AcademyNav current="showcase" />
            <h1 className="ld-display ld-up mt-8 max-w-[16ch] text-[clamp(42px,6vw,84px)] leading-[0.95] font-extrabold tracking-[-0.05em] text-balance">
              Built by our <span className="text-[var(--ld-accent)]">students.</span>
            </h1>
            <p className="ld-up ld-delay-2 mt-5 max-w-[40rem] text-[clamp(16px,1.3vw,18px)] leading-relaxed text-[var(--ld-muted)]">
              Every project here came from the project pool, was built by a student, and passed our review. Open the live site, read the code, and upvote the ones you like.
            </p>
          </div>
        </section>

        <section aria-label="Approved builds" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell py-[clamp(40px,5vw,80px)]">
            {builds.length === 0 ? (
              <div className="grid max-w-[560px] gap-4 rounded-[24px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-7">
                <p className="ld-display text-[26px] leading-tight font-bold tracking-[-0.025em]">The first builds are on their way.</p>
                <p className="text-[16px] leading-relaxed text-[var(--ld-text-2)]">Take a project from the pool, ship it, and yours could be the first one here.</p>
                <Link href="/academy/projects" className="inline-flex h-12 items-center gap-2 justify-self-start rounded-full bg-[var(--ld-ink)] px-5 text-[15px] font-bold text-[var(--ld-paper)]">
                  Open the project pool <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {builds.map((build) => {
                  const brief = titles.get(build.briefId);
                  const mine = account?.id === String(build.accountId);
                  const voted = account ? build.voters.some((voter) => String(voter) === account.id) : false;
                  return (
                    <li key={String(build._id)} className="flex flex-col rounded-[24px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-6">
                      <div className="flex items-center gap-3">
                        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--ld-deep)] text-[14px] font-bold text-white">
                          {initials(build.name) || "?"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold">{build.name}</p>
                          <p className="text-[13px] text-[var(--ld-text-muted)]">{brief?.level ?? "Project"}</p>
                        </div>
                      </div>
                      <h2 className="ld-display mt-4 text-[22px] leading-tight font-bold tracking-[-0.02em]">{brief?.title ?? build.briefId}</h2>
                      {build.note ? <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-[var(--ld-text-2)]">{build.note}</p> : null}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ld-line)] pt-4">
                        <span className="flex gap-4 text-[14px] font-semibold">
                          <a href={build.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-[var(--ld-deep)]">
                            Live <ArrowUpRightIcon className="size-4" />
                          </a>
                          <a href={build.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 text-[var(--ld-deep)]">
                            Code <ArrowUpRightIcon className="size-4" />
                          </a>
                        </span>
                        <VoteButton
                          buildId={String(build._id)}
                          votes={build.votes}
                          voted={voted}
                          disabled={!account?.verified || mine}
                          hint={mine ? "Your own build" : "Sign in to upvote"}
                        />
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
