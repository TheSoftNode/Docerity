import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ClockIcon, SwordsIcon, ZapIcon } from "lucide-react";

import { getCurrentAccount } from "@/lib/account/session";
import { listCourses } from "@/lib/academy/courses";
import { getAchievements, getStanding } from "@/lib/academy/standing";
import { PHASE_LABEL, battlePhase, phaseEndsAt, watLabel } from "@/lib/academy/battles";
import { getLiveBattle } from "@/lib/academy/battle-store";
import { XP, allLessons, courseMinutes, courseProgress, findLesson, openModules } from "@/lib/academy/rules";
import { database } from "@/lib/config/env";
import { allTimeLeaders, listEnrollments, weeklyLeaders } from "@/lib/repositories/academy.repository";
import { BUILD_XP } from "@/lib/academy/briefs";
import { getBriefs } from "@/lib/academy/pool";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StandingPanel } from "@/components/academy/standing-panel";
import { Achievements } from "@/components/academy/achievements";
import { Countdown } from "@/components/academy/countdown";
import { AcademyHero, Avatar, LEVEL_TONE, SectionHead, btn, inkCard } from "@/components/academy/kit";
import { CheckPicture, LearningConsole, ShipPicture, WatchPicture } from "@/components/academy/pictures";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Academy",
  description: "Free software courses from Docerity: video lessons, quizzes that mark themselves, real projects, build battles, and XP for every step. Start with web development.",
  alternates: { canonical: "/academy" },
};
export const dynamic = "force-dynamic";

const hours = (minutes: number) => (minutes >= 90 ? `${Math.round(minutes / 60)} hours` : `${minutes} minutes`);
const pad = (n: number) => String(n).padStart(2, "0");

const STEPS = [
  { title: "Watch", body: "Short video lessons with notes and code under each one. Pick up where you left off, on any device.", xp: `+${XP.lesson} XP a lesson`, Picture: WatchPicture, tone: "bg-[#0b1433] text-[#f4f5fa] ld-keep-dark", soft: "text-[#c4cbe3]", chip: "text-[#afc4ff]" },
  { title: "Check", body: "A quiz ends every module and marks itself on the spot, with the reason for each answer. Pass it to open the next.", xp: `+${XP.quizPass} XP a pass`, Picture: CheckPicture, tone: "bg-[var(--ld-card)] text-[var(--ld-ink)] ring-1 ring-[rgb(8_16_46/0.06)]", soft: "text-[var(--ld-text-2)]", chip: "text-[var(--ld-deep)]" },
  { title: "Ship", body: "Take a brief from the project pool, build it, and hand in the code and the live site. Approved builds go in the showcase.", xp: `+${BUILD_XP.Beginner}–${BUILD_XP.Advanced} XP a project`, Picture: ShipPicture, tone: "bg-[var(--ld-deep)] text-white", soft: "text-[#d5dffc]", chip: "text-[#ffb59f]" },
] as const;

const PODIUM = [
  { place: "1st", card: "bg-[var(--ld-accent)] text-[#08102e]", sub: "text-[#08102e]/70", lift: "sm:-translate-y-4" },
  { place: "2nd", card: "bg-[var(--ld-deep)] text-white", sub: "text-[#c9d5ff]", lift: "" },
  { place: "3rd", card: "ld-keep-dark bg-[#0b1433] text-[#f4f5fa]", sub: "text-[#9aa7cf]", lift: "" },
];

/**
 * The Academy's front door: what it is, the courses, the project pool, how
 * learning works here, and the leaderboard. A signed-in student sees their
 * level and streak and goes straight back to where they were.
 */
export default async function AcademyPage({ searchParams }: { searchParams: Promise<{ board?: string }> }) {
  const board = (await searchParams).board === "all" ? "all" : "week";
  const [account, courses, briefs, battle] = await Promise.all([getCurrentAccount(), listCourses(), getBriefs(), getLiveBattle()]);
  const [standing, enrollments, leaders] = await Promise.all([
    account ? getStanding(account.id) : null,
    account && database.isConfigured ? listEnrollments(account.id).catch(() => []) : [],
    database.isConfigured ? (board === "all" ? allTimeLeaders(10) : weeklyLeaders(10)).catch(() => []) : [],
  ]);
  const achievements = account && standing ? await getAchievements(account.id, standing) : null;
  const battlePhaseNow = battle ? battlePhase(battle) : null;
  const battleEnds = battle && battlePhaseNow ? phaseEndsAt(battle, battlePhaseNow) : null;
  const enrolledIn = new Map(enrollments.map((row) => [row.courseSlug, row] as const));
  const first = courses[0];
  const resume = enrollments[0];
  const resumeCourse = resume ? courses.find((course) => course.slug === resume.courseSlug) : undefined;
  const resumeLesson = resumeCourse && resume?.lastLesson ? findLesson(resumeCourse, resume.lastLesson)?.lesson : undefined;
  const resumeProgress = resumeCourse && resume ? courseProgress(resumeCourse, { completed: resume.completed, passed: resume.passed }) : null;
  const resumeHref = resume ? `/academy/${resume.courseSlug}${resume.lastLesson ? `/${resume.lastLesson}` : ""}` : null;

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <AcademyHero
          current="courses"
          title={
            <>
              Learn to build software the way we <span className="text-[var(--ld-accent)]">ship it.</span>
            </>
          }
          lede="Free courses with short video lessons, quizzes that mark themselves, real projects to build, and XP for every step. Start with web development and finish with a site of your own on the internet."
          actions={
            <>
              {resumeHref ? (
                <Link href={resumeHref} className={btn.accent}>
                  Continue learning <ArrowRightIcon className="size-4" />
                </Link>
              ) : first ? (
                <Link href={`/academy/${first.slug}`} className={btn.accent}>
                  Start the free course <ArrowRightIcon className="size-4" />
                </Link>
              ) : null}
              <a href="#how" className={btn.ghostDark}>
                How it works
              </a>
            </>
          }
        >
          {standing && resumeCourse ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
              <Link href={resumeHref ?? "#"} className={cn(inkCard, "group flex flex-col justify-between gap-6 p-6 sm:p-8")}>
                <div>
                  <p className="text-[14px] text-[#9aa7cf]">Pick up where you left off</p>
                  <p className="ld-display mt-2 text-[clamp(26px,3vw,40px)] leading-[1.02] font-extrabold tracking-[-0.035em]">{resumeLesson?.title ?? resumeCourse.title}</p>
                  <p className="mt-2 text-[15px] text-[#c4cbe3]">{resumeCourse.title}</p>
                </div>
                <div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[rgb(175_196_255/0.14)]">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#afc4ff,#ff7a59)]" style={{ width: `${resumeProgress?.percent ?? 0}%` }} />
                  </div>
                  <p className="mt-3 flex items-center justify-between text-[14px] font-semibold">
                    <span className="text-[#c4cbe3]">{resumeProgress?.percent ?? 0}% of the course</span>
                    <span className="inline-flex items-center gap-1.5 text-[#ff9a80]">
                      Continue <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </p>
                </div>
              </Link>
              <StandingPanel standing={standing} className="rounded-[28px] shadow-[inset_0_0_0_1px_rgb(175_196_255/0.12)]" />
            </div>
          ) : standing ? (
            <StandingPanel standing={standing} className="max-w-[560px] rounded-[28px]" />
          ) : first ? (
            <LearningConsole modules={first.modules.map((module) => ({ title: module.title, lessons: module.lessons.length }))} lesson={allLessons(first)[0]?.title ?? first.title} />
          ) : null}
        </AcademyHero>

        {battle && battlePhaseNow && battleEnds ? (
          <section aria-label="Build battle" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
            <div className="doc-shell pt-[clamp(28px,4vw,48px)]">
              <Link href={`/academy/battles/${battle.slug}`} className="group relative flex flex-col gap-4 overflow-hidden rounded-[28px] bg-[var(--ld-deep)] p-5 text-white transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-6" data-battle-strip>
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -bottom-24 size-64 rounded-full bg-[radial-gradient(circle,rgb(255_122_89/0.35),transparent_65%)]" />
                <span className="relative grid size-14 shrink-0 place-items-center rounded-[18px] bg-[var(--ld-accent)] text-[#08102e]">
                  <SwordsIcon className="size-6" />
                </span>
                <span className="relative min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[14px] font-semibold text-[#ffb59f]">
                    <span className="size-2 animate-pulse rounded-full bg-[#ff7a59]" aria-hidden="true" /> Build battle · {PHASE_LABEL[battlePhaseNow]}
                  </span>
                  <span className="ld-display mt-0.5 block truncate text-[clamp(22px,2.4vw,30px)] font-extrabold tracking-[-0.03em]">{battle.title}</span>
                </span>
                <span className="relative flex items-center justify-between gap-6 sm:justify-end">
                  <span className="text-right">
                    <span className="block text-[13px] text-[#c9d5ff]">{battlePhaseNow === "open" ? "Entries close in" : "Voting ends in"}</span>
                    <Countdown to={battleEnds} fallback={watLabel(battleEnds)} className="ld-display text-[24px] font-extrabold tabular-nums tracking-[-0.02em]" />
                  </span>
                  <span className="inline-flex h-12 items-center gap-1.5 rounded-full bg-white px-5 text-[15px] font-bold text-[#08102e]">
                    {battlePhaseNow === "open" ? "Enter" : "Vote"} <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </div>
          </section>
        ) : null}

        <section aria-labelledby="courses-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell py-[clamp(56px,7vw,112px)]">
            <SectionHead id="courses-title" title="Courses." lede="Free while we're getting started. Each one ends with something real you built and shipped." />
            <ul className="grid gap-5">
              {courses.map((course) => {
                const enrollment = enrolledIn.get(course.slug);
                const input = { completed: enrollment?.completed ?? [], passed: enrollment?.passed ?? [] };
                const progress = enrollment ? courseProgress(course, input) : null;
                const open = openModules(course, input);
                return (
                  <li key={course.slug}>
                    <Link href={`/academy/${course.slug}`} className="group grid overflow-hidden rounded-[32px] bg-[var(--ld-card)] shadow-[0_30px_60px_-40px_rgb(8_16_46/0.35)] ring-1 ring-[rgb(8_16_46/0.06)] transition-transform hover:-translate-y-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div className="ld-keep-dark relative flex flex-col overflow-hidden bg-[#0b1433] p-7 text-[#f4f5fa] sm:p-10">
                        <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full bg-[radial-gradient(circle,rgb(64_110_230/0.45),transparent_65%)]" />
                        <p className="relative flex flex-wrap gap-x-3 gap-y-1 text-[14px] text-[#9aa7cf]">
                          <span>{course.level}</span>
                          <span aria-hidden="true">·</span>
                          <span>{allLessons(course).length} lessons</span>
                          <span aria-hidden="true">·</span>
                          <span>about {hours(courseMinutes(course))}</span>
                        </p>
                        <h3 className="ld-display relative mt-3 text-[clamp(32px,3.6vw,52px)] leading-[0.98] font-extrabold tracking-[-0.045em] text-balance">{course.title}</h3>
                        <p className="relative mt-4 max-w-[34rem] text-[16.5px] leading-relaxed text-[#c4cbe3]">{course.tagline}</p>
                        <div className="relative mt-auto pt-8">
                          {progress ? (
                            <>
                              <div className="h-2.5 overflow-hidden rounded-full bg-[rgb(175_196_255/0.14)]">
                                <div className="h-full rounded-full bg-[linear-gradient(90deg,#afc4ff,#ff7a59)]" style={{ width: `${progress.percent}%` }} />
                              </div>
                              <p className="mt-3 flex items-center justify-between text-[15px] font-semibold">
                                {progress.percent}% done
                                <span className="inline-flex items-center gap-1.5 text-[#ff9a80]">
                                  Continue <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                                </span>
                              </p>
                            </>
                          ) : (
                            <span className="inline-flex h-12 items-center gap-2 rounded-full bg-[#ff7a59] px-6 text-[15px] font-semibold text-[#08102e]">
                              {course.price ? `₦${course.price.toLocaleString()}` : "Free"} · See the course <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                            </span>
                          )}
                        </div>
                      </div>
                      <ol className="grid content-center gap-1 p-5 sm:p-8">
                        {course.modules.map((module, index) => {
                          const done = enrollment ? module.lessons.every((lesson) => input.completed.includes(lesson.id)) : false;
                          const current = enrollment && open.has(module.id) && !done;
                          return (
                            <li key={module.id} className={cn("flex items-center gap-4 rounded-2xl px-3 py-3", current && "bg-[#e6ecff]")}>
                              <span
                                className={cn(
                                  "ld-display grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-bold",
                                  done ? "bg-[#e3f6ec] text-[#1d7a52]" : current ? "bg-[var(--ld-deep)] text-white" : "bg-[var(--ld-paper-2)] text-[var(--ld-text-muted)]"
                                )}
                              >
                                {done ? <CheckIcon className="size-4" /> : pad(index + 1)}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[16px] font-semibold">{module.title}</span>
                                <span className="block truncate text-[13.5px] text-[var(--ld-text-muted)]">{module.summary || `${module.lessons.length} lessons`}</span>
                              </span>
                              <span className="shrink-0 text-[13px] text-[var(--ld-text-muted)] tabular-nums">{module.lessons.length}</span>
                            </li>
                          );
                        })}
                      </ol>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {achievements ? (
          <section aria-labelledby="achievements-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
            <div className="doc-shell pb-[clamp(56px,7vw,112px)]">
              <Achievements items={achievements} />
            </div>
          </section>
        ) : null}

        {briefs.length > 0 ? (
          <section aria-labelledby="pool-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
            <div className="doc-shell pb-[clamp(56px,7vw,112px)]">
              <SectionHead
                id="pool-title"
                title="Then build something real."
                lede="Twelve briefs from a first portfolio to a shop with a checkout. Build one, hand it in, and get it reviewed."
                action={
                  <Link href="/academy/projects" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-[var(--ld-deep)]">
                    All {briefs.length} projects <ArrowRightIcon className="size-4" />
                  </Link>
                }
              />
              <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                {[briefs.find((b) => b.level === "Beginner"), briefs.find((b) => b.level === "Intermediate"), briefs.find((b) => b.level === "Advanced")]
                  .filter((brief): brief is NonNullable<typeof brief> => Boolean(brief))
                  .map((brief, index) => {
                    const tone = LEVEL_TONE[brief.level];
                    return (
                      <li key={brief.id} className="w-[84%] max-w-[360px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                        <Link href={`/academy/projects/${brief.id}`} className={cn("group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[28px] p-7 transition-transform hover:-translate-y-1", tone.card)}>
                          <span aria-hidden="true" className={cn("ld-display pointer-events-none absolute -right-2 -bottom-8 text-[150px] leading-none font-extrabold tracking-[-0.06em]", tone.numeral)}>
                            {pad(index + 1)}
                          </span>
                          <span className={cn("relative text-[14px] font-semibold", tone.accent)}>
                            {brief.level} · {BUILD_XP[brief.level]} XP
                          </span>
                          <span className="ld-display relative mt-3 text-[28px] leading-[1.02] font-extrabold tracking-[-0.035em]">{brief.title}</span>
                          <span className={cn("relative mt-3 text-[15.5px] leading-relaxed", tone.text)}>{brief.summary}</span>
                          <span className={cn("relative mt-auto inline-flex items-center gap-1.5 pt-6 text-[15px] font-semibold", tone.accent)}>
                            See the brief <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </section>
        ) : null}

        <section id="how" aria-labelledby="how-title" className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell pb-[clamp(56px,7vw,112px)]">
            <SectionHead id="how-title" title="A little every day adds up." lede="Learn on any day and your streak grows; miss one day a week and it holds. XP adds up to levels and achievements." />
            <ol className="grid gap-4 md:grid-cols-3">
              {STEPS.map(({ title, body, xp, Picture, tone, soft, chip }, index) => (
                <li key={title} className={cn("flex flex-col overflow-hidden rounded-[28px]", tone)}>
                  <Picture />
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="flex items-baseline gap-3">
                      <span className={cn("font-mono text-[13px]", soft)}>{pad(index + 1)}</span>
                      <span className="ld-display text-[28px] font-extrabold tracking-[-0.03em]">{title}</span>
                    </p>
                    <p className={cn("mt-2 text-[15.5px] leading-relaxed", soft)}>{body}</p>
                    <p className={cn("mt-auto inline-flex items-center gap-1.5 pt-5 text-[14px] font-semibold", chip)}>
                      <ZapIcon className="size-4" /> {xp}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {database.isConfigured ? (
          <section aria-labelledby="board-title" className="bg-[var(--ld-ink)] text-[var(--ld-paper)]">
            <div className="doc-shell py-[clamp(56px,7vw,112px)]">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-6 md:mb-12">
                <h2 id="board-title" className="ld-display text-[clamp(36px,5vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
                  Leaderboard.
                </h2>
                <nav aria-label="Leaderboard period" className="flex gap-1 rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] p-1">
                  {[
                    { key: "week", label: "This week", href: "/academy#board-title" },
                    { key: "all", label: "All time", href: "/academy?board=all#board-title" },
                  ].map((tab) => (
                    <Link
                      key={tab.key}
                      href={tab.href}
                      scroll={false}
                      aria-current={board === tab.key ? "page" : undefined}
                      className={cn(
                        "inline-flex min-h-10 items-center rounded-full px-4 text-[14px] font-semibold transition-colors",
                        board === tab.key ? "bg-[var(--ld-paper)] text-[var(--ld-ink)]" : "text-[var(--ld-muted)] hover:text-[var(--ld-paper)]"
                      )}
                    >
                      {tab.label}
                    </Link>
                  ))}
                </nav>
              </div>
              {leaders.length > 0 ? (
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]" data-board={board}>
                  <ol className="grid grid-cols-3 items-end gap-3">
                    {[1, 0, 2].map((rank) => {
                      const leader = leaders[rank];
                      const look = PODIUM[rank];
                      if (!leader) return <li key={rank} />;
                      const you = account?.id === String(leader._id);
                      return (
                        <li key={rank} className={cn("flex flex-col rounded-[24px] p-4 sm:p-6", look.card, look.lift, rank === 0 ? "min-h-[230px]" : "min-h-[190px]")}>
                          <span className="ld-display text-[clamp(30px,3.4vw,48px)] leading-none font-extrabold tracking-[-0.04em]">{look.place}</span>
                          <span className="mt-auto flex items-center gap-2 pt-4">
                            <Avatar name={leader.name} className="hidden size-8 text-[12px] sm:grid" />
                            <span className="truncate text-[16px] font-bold">
                              {leader.name.split(/\s+/)[0]}
                              {you ? " (you)" : ""}
                            </span>
                          </span>
                          <span className={cn("text-[14px] font-semibold tabular-nums", look.sub)}>{leader.xp.toLocaleString()} XP</span>
                        </li>
                      );
                    })}
                  </ol>
                  {leaders.length > 3 ? (
                    <ol start={4} className="overflow-hidden rounded-[24px] border border-[rgb(var(--ld-paper-rgb)/0.12)]">
                      {leaders.slice(3).map((leader, index) => {
                        const you = account?.id === String(leader._id);
                        return (
                          <li key={String(leader._id)} className={cn("flex items-center gap-4 border-t border-[rgb(var(--ld-paper-rgb)/0.1)] px-5 py-3.5 first:border-t-0", you && "bg-[rgb(255_122_89/0.12)]")}>
                            <span className="w-7 font-mono text-[14px] text-[var(--ld-muted)]">{pad(index + 4)}</span>
                            <span className="flex-1 text-[16px] font-semibold">
                              {leader.name.split(/\s+/)[0]}
                              {you ? <span className="font-normal text-[var(--ld-muted)]"> · you</span> : null}
                            </span>
                            <span className="text-[15px] font-bold tabular-nums">{leader.xp.toLocaleString()} XP</span>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="flex items-center gap-3 self-end rounded-[24px] border border-[rgb(var(--ld-paper-rgb)/0.12)] p-6 text-[16px] leading-relaxed text-[var(--ld-muted)]">
                      <ClockIcon className="size-5 shrink-0" /> The board resets every Monday. A few lessons a day is all it takes to climb it.
                    </p>
                  )}
                </div>
              ) : (
                <p className="max-w-[560px] rounded-[24px] border border-[rgb(var(--ld-paper-rgb)/0.14)] p-6 text-[16px] leading-relaxed text-[var(--ld-muted)]">
                  {board === "week" ? "Nobody has earned XP this week yet. One lesson puts you on top." : "The board fills up as students earn XP."}
                </p>
              )}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
