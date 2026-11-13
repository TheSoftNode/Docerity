import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CheckIcon, ClockIcon, StarIcon, ZapIcon } from "lucide-react";

import { getCurrentAccount } from "@/lib/account/session";
import { BUILD_XP } from "@/lib/academy/briefs";
import { getBrief } from "@/lib/academy/pool";
import { LessonNotes } from "@/lib/academy/markdown";
import { database } from "@/lib/config/env";
import { findBuild } from "@/lib/repositories/academy.repository";
import { startBuildAction } from "@/app/academy/projects/actions";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BuildForm } from "@/components/academy/build-form";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const brief = await getBrief((await params).id);
  if (!brief) return { title: "Project not found" };
  return { title: `${brief.title} · Project pool`, description: brief.summary, alternates: { canonical: `/academy/projects/${brief.id}` } };
}

const STEPS = ["Start", "Build", "Hand in", "Reviewed"] as const;

/**
 * One brief: what to build, what must work, the extras, and, for a student
 * who has taken it, the four steps from start to review with the hand-in
 * form right where the next step is.
 */
export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const brief = await getBrief((await params).id);
  if (!brief) notFound();

  const account = await getCurrentAccount();
  const build = account?.verified && database.isConfigured ? await findBuild(account.id, brief.id).catch(() => null) : null;
  const step = !build ? 0 : build.status === "building" || build.status === "changes" ? 1 : build.status === "submitted" ? 2 : 3;

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(900px_520px_at_88%_10%,rgb(28_58_140/0.6),transparent_62%),var(--ld-ink)] pt-[124px] pb-[clamp(44px,5vw,72px)] text-[var(--ld-paper)]">
          <div className="doc-shell">
            <Link href="/academy/projects" className="-my-2 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--ld-muted)] transition-colors hover:text-[var(--ld-paper)]">
              <ArrowLeftIcon className="size-4" /> Project pool
            </Link>
            <p className="mt-5 text-[15px] text-[var(--ld-muted)]">
              {brief.level} · {brief.stack.join(" · ")}
            </p>
            <h1 className="ld-display ld-up mt-2 max-w-[20ch] text-[clamp(38px,5.4vw,76px)] leading-[0.96] font-extrabold tracking-[-0.05em] text-balance">{brief.title}</h1>
            <p className="ld-up ld-delay-2 mt-4 max-w-[40rem] text-[clamp(16px,1.3vw,18px)] leading-relaxed text-[var(--ld-muted)]">{brief.summary}</p>
            <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="size-4 text-[var(--ld-tint)]" /> About {brief.hours} hours
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ZapIcon className="size-4 text-[var(--ld-accent)]" /> {BUILD_XP[brief.level]} XP when approved
              </span>
            </p>
          </div>
        </section>

        <section className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell grid gap-10 py-[clamp(36px,5vw,72px)] lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">
              {brief.brief ? (
                <article className="rounded-[24px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-6 sm:p-8">
                  <h2 className="ld-display text-[26px] font-bold tracking-[-0.025em]">The brief</h2>
                  <div className="mt-3">
                    <LessonNotes source={brief.brief} />
                  </div>
                </article>
              ) : null}

              <div className="mt-6 rounded-[24px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-6 sm:p-8">
                <h2 className="ld-display text-[26px] font-bold tracking-[-0.025em]">What must work</h2>
                <ul className="mt-4 grid gap-3">
                  {brief.requirements.map((item) => (
                    <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-[var(--ld-text-2)]">
                      <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-md border-[1.5px] border-[var(--ld-deep)] text-[var(--ld-deep)]">
                        <CheckIcon className="size-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                {brief.stretch.length ? (
                  <>
                    <h3 className="mt-7 text-[17px] font-semibold">If you want to go further</h3>
                    <ul className="mt-3 grid gap-2.5">
                      {brief.stretch.map((item) => (
                        <li key={item} className="flex gap-3 text-[15.5px] leading-relaxed text-[var(--ld-text-2)]">
                          <StarIcon className="mt-1 size-4 shrink-0 text-[var(--ld-accent)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>

            <aside id="hand-in" className="scroll-mt-24">
              <div className="grid gap-5 lg:sticky lg:top-24">
                <div className="rounded-[24px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-6">
                  <ol className="grid grid-cols-4 gap-2" aria-label="Where your build stands">
                    {STEPS.map((label, index) => (
                      <li key={label}>
                        <span className={cn("block h-1.5 rounded-full", index < step ? "bg-[var(--ld-deep)]" : index === step ? "bg-[var(--ld-accent)]" : "bg-[var(--ld-paper-2)]")} />
                        <span className={cn("mt-2 block text-[12px] font-semibold", index <= step ? "text-[var(--ld-ink)]" : "text-[var(--ld-text-muted)]")}>{label}</span>
                      </li>
                    ))}
                  </ol>

                  {!build ? (
                    <div className="mt-6">
                      <p className="text-[15px] leading-relaxed text-[var(--ld-text-2)]">
                        Take this project and it goes on your list. Build it in your own time, then hand in the code and the live site here.
                      </p>
                      {account?.verified ? (
                        <form action={startBuildAction} className="mt-5">
                          <input type="hidden" name="briefId" value={brief.id} />
                          <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-bold text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5">
                            Take this project <ArrowRightIcon className="size-4" />
                          </button>
                        </form>
                      ) : account ? (
                        <Link href="/account" className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-bold text-[var(--ld-paper)]">
                          Confirm your email first
                        </Link>
                      ) : (
                        <div className="mt-5 grid gap-2">
                          <Link href="/account/signup" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-bold text-[var(--ld-paper)]">
                            Create a free account <ArrowRightIcon className="size-4" />
                          </Link>
                          <Link href={`/account/login?next=${encodeURIComponent(`/academy/projects/${brief.id}`)}`} className="flex min-h-11 items-center justify-center text-[15px] font-semibold text-[var(--ld-deep)]">
                            I have an account
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : build.status === "approved" ? (
                    <div className="mt-6">
                      <p className="ld-display text-[24px] font-bold tracking-[-0.02em] text-[#1d7a52]">Approved. +{BUILD_XP[brief.level]} XP</p>
                      {build.feedback ? <p className="mt-3 rounded-2xl bg-[#e3f6ec] px-4 py-3 text-[15px] leading-relaxed text-[#0f4d33]">{build.feedback}</p> : null}
                      <div className="mt-4 grid gap-2 text-[15px]">
                        <a href={build.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-[var(--ld-deep)]">
                          Live site <ArrowUpRightIcon className="size-4" />
                        </a>
                        <Link href="/academy/showcase" className="inline-flex items-center gap-1.5 font-semibold text-[var(--ld-deep)]">
                          See it in the showcase <ArrowRightIcon className="size-4" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6">
                      {build.status === "submitted" ? (
                        <p className="mb-5 rounded-2xl bg-[#fff3d6] px-4 py-3 text-[15px] leading-relaxed text-[#7a5410]">
                          Handed in. A reviewer will look at it soon; you can still update the links below.
                        </p>
                      ) : null}
                      {build.status === "changes" && build.feedback ? (
                        <div className="mb-5 rounded-2xl bg-[#fff0eb] px-4 py-3 text-[15px] leading-relaxed text-[#7a2a14]">
                          <p className="font-semibold">What to change</p>
                          <p className="mt-1 whitespace-pre-line">{build.feedback}</p>
                        </div>
                      ) : null}
                      <BuildForm briefId={brief.id} initial={{ repoUrl: build.repoUrl, liveUrl: build.liveUrl, note: build.note }} again={build.status !== "building"} />
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
