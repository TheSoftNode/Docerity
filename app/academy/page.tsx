import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ClipboardCheckIcon, PlayIcon, RocketIcon, ZapIcon } from "lucide-react";

import { getCurrentAccount } from "@/lib/account/session";
import { listCourses } from "@/lib/academy/courses";
import { getStanding } from "@/lib/academy/standing";
import { XP, allLessons, courseMinutes, courseProgress } from "@/lib/academy/rules";
import { database } from "@/lib/config/env";
import { listEnrollments, weeklyLeaders } from "@/lib/repositories/academy.repository";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StandingPanel } from "@/components/academy/standing-panel";
import { AcademyNav } from "@/components/academy/academy-nav";
import { BUILD_XP } from "@/lib/academy/briefs";
import { getBriefs } from "@/lib/academy/pool";

export const metadata: Metadata = {
  title: "Academy",
  description: "Free software courses from Docerity: video lessons, quizzes that mark themselves, and XP for every step. Start with web development.",
  alternates: { canonical: "/academy" },
};
export const dynamic = "force-dynamic";

const hours = (minutes: number) => (minutes >= 90 ? `${Math.round(minutes / 60)} hours` : `${minutes} minutes`);

/**
 * The Academy's front door: what it is, the courses, how learning works here,
 * and this week's leaderboard. A signed-in student sees their level and
 * streak and goes straight back to where they were.
 */
export default async function AcademyPage() {
  const [account, courses, briefs] = await Promise.all([getCurrentAccount(), listCourses(), getBriefs()]);
  const [standing, enrollments, leaders] = await Promise.all([
    account ? getStanding(account.id) : null,
    account && database.isConfigured ? listEnrollments(account.id).catch(() => []) : [],
    database.isConfigured ? weeklyLeaders(5).catch(() => []) : [],
  ]);
  const enrolledIn = new Map(enrollments.map((row) => [row.courseSlug, row] as const));
  const first = courses[0];
  const resume = enrollments[0];

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(900px_520px_at_85%_20%,rgb(28_58_140/0.6),transparent_62%),radial-gradient(700px_420px_at_10%_110%,rgb(255_122_89/0.12),transparent_60%),var(--ld-ink)] pt-[128px] pb-[clamp(56px,7vw,96px)] text-[var(--ld-paper)]">
          <div className="doc-shell">
            <AcademyNav current="courses" />
          </div>
          <div className="doc-shell mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div>
              <h1 className="ld-display ld-up text-[clamp(44px,6.4vw,92px)] leading-[0.95] font-extrabold tracking-[-0.05em] text-balance">
                Learn to build software the way we <span className="text-[var(--ld-accent)]">ship it.</span>
              </h1>
              <p className="ld-up ld-delay-2 mt-6 max-w-[36rem] text-[clamp(17px,1.4vw,19px)] leading-relaxed text-[var(--ld-muted)]">
                Free courses with short video lessons, quizzes that mark themselves, and XP for every step you take. Start with web development and finish with a site of your own on the internet.
              </p>
              <div className="ld-up ld-delay-3 mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                {resume ? (
                  <Link
                    href={`/academy/${resume.courseSlug}${resume.lastLesson ? `/${resume.lastLesson}` : ""}`}
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[var(--ld-accent)] px-6 text-[16px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5"
                  >
                    Continue learning <ArrowRightIcon className="size-4" />
                  </Link>
                ) : first ? (
                  <Link
                    href={`/academy/${first.slug}`}
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[var(--ld-accent)] px-6 text-[16px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5"
                  >
                    Start the free course <ArrowRightIcon className="size-4" />
                  </Link>
                ) : null}
                <a href="#how" className="inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[15px] font-semibold text-[var(--ld-tint)] sm:border-[1.5px] sm:border-[rgb(var(--ld-paper-rgb)/0.3)] sm:text-[var(--ld-paper)]">
                  How it works
                </a>
              </div>
            </div>

            {standing ? (
              <StandingPanel standing={standing} className="ld-up ld-delay-3" />
            ) : first ? (
              <div className="ld-keep-dark rounded-[26px] border border-[rgb(175_196_255/0.16)] bg-[#0b1433] p-7 text-[#f4f5fa] max-md:hidden" data-academy-preview>
                <p className="text-[13px] text-[#9aa7cf]">First course</p>
                <p className="ld-display mt-1 text-[28px] leading-tight font-bold tracking-[-0.03em]">{first.title}</p>
                <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-[rgb(175_196_255/0.14)] pt-5">
                  <div>
                    <dt className="text-[13px] text-[#9aa7cf]">Modules</dt>
                    <dd className="text-[24px] font-bold">{first.modules.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-[#9aa7cf]">Lessons</dt>
                    <dd className="text-[24px] font-bold">{allLessons(first).length}</dd>
                  </div>
                  <div>
                    <dt className="text-[13px] text-[#9aa7cf]">Price</dt>
                    <dd className="text-[24px] font-bold text-[#ff7a59]">Free</dd>
                  </div>
                </dl>
                <ul className="mt-6 grid gap-2.5">
                  {first.modules.slice(0, 5).map((module, index) => (
                    <li key={module.id} className="flex items-center gap-3 text-[15px] text-[#c4cbe3]">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[rgb(175_196_255/0.12)] text-[13px] font-bold text-[#afc4ff]">{index + 1}</span>
                      {module.title}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="courses-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell py-[clamp(56px,7vw,104px)]">
            <h2 id="courses-title" className="ld-display text-[clamp(34px,4.6vw,60px)] leading-[0.98] font-extrabold tracking-[-0.045em]">
              Courses
            </h2>
            <ul className="mt-8 grid gap-5 md:grid-cols-2">
              {courses.map((course) => {
                const enrollment = enrolledIn.get(course.slug);
                const progress = enrollment ? courseProgress(course, { completed: enrollment.completed, passed: enrollment.passed }) : null;
                return (
                  <li key={course.slug}>
                    <Link
                      href={`/academy/${course.slug}`}
                      className="group flex h-full flex-col rounded-[26px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-7 transition-transform hover:-translate-y-1"
                    >
                      <p className="text-[14px] text-[var(--ld-text-muted)]">
                        {course.level} · {allLessons(course).length} lessons · about {hours(courseMinutes(course))} · {course.price ? `₦${course.price.toLocaleString()}` : "Free"}
                      </p>
                      <h3 className="ld-display mt-2 text-[28px] leading-tight font-bold tracking-[-0.03em]">{course.title}</h3>
                      <p className="mt-3 text-[16px] leading-relaxed text-[var(--ld-text-2)]">{course.tagline}</p>
                      <div className="mt-auto pt-6">
                        {progress ? (
                          <>
                            <div className="h-2 overflow-hidden rounded-full bg-[var(--ld-paper-2)]">
                              <div className="h-full rounded-full bg-[var(--ld-deep)]" style={{ width: `${progress.percent}%` }} />
                            </div>
                            <p className="mt-2 flex items-center justify-between text-[14px] font-semibold">
                              {progress.percent}% done
                              <span className="inline-flex items-center gap-1.5 text-[var(--ld-deep)]">
                                Continue <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                              </span>
                            </p>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-[var(--ld-deep)]">
                            See the course <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {briefs.length > 0 ? (
          <section aria-labelledby="pool-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
            <div className="doc-shell pb-[clamp(56px,7vw,104px)]">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="pool-title" className="ld-display text-[clamp(34px,4.6vw,60px)] leading-[0.98] font-extrabold tracking-[-0.045em]">
                  Then build something real
                </h2>
                <Link href="/academy/projects" className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-[var(--ld-deep)]">
                  All {briefs.length} projects <ArrowRightIcon className="size-4" />
                </Link>
              </div>
              <ul className="-mx-5 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                {briefs.slice(0, 3).map((brief) => (
                  <li key={brief.id} className="w-[82%] max-w-[340px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                    <Link href={`/academy/projects/${brief.id}`} className="group flex h-full flex-col rounded-[24px] bg-[var(--ld-deep)] p-6 text-white transition-transform hover:-translate-y-1">
                      <span className="text-[13px] font-semibold text-[#afc4ff]">
                        {brief.level} · {BUILD_XP[brief.level]} XP
                      </span>
                      <span className="ld-display mt-2 text-[22px] leading-tight font-bold tracking-[-0.02em]">{brief.title}</span>
                      <span className="mt-2 text-[15px] leading-relaxed text-[#c9d5ff]">{brief.summary}</span>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[14px] font-semibold text-[#ff9a80]">
                        See the brief <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section id="how" aria-labelledby="how-title" className="scroll-mt-24 bg-[var(--ld-ink)] text-[var(--ld-paper)]">
          <div className="doc-shell py-[clamp(56px,7vw,104px)]">
            <h2 id="how-title" className="ld-display max-w-[16ch] text-[clamp(34px,4.6vw,60px)] leading-[0.98] font-extrabold tracking-[-0.045em]">
              Learn a little every day. It adds up.
            </h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                { Icon: PlayIcon, title: "Watch", body: "Short lessons on video, with notes and code under each one. Pick up where you left off on any device.", xp: `+${XP.lesson} XP a lesson` },
                { Icon: ClipboardCheckIcon, title: "Check", body: "A quiz ends every module and marks itself on the spot, with the reason for each answer. Pass it to open the next.", xp: `+${XP.quizPass} XP a pass, +${XP.quizPerfect} for a perfect score` },
                { Icon: RocketIcon, title: "Ship", body: "Take a brief from the project pool, build it, and hand in the code and the live site. Approved builds go in the showcase.", xp: `+${BUILD_XP.Beginner} to ${BUILD_XP.Advanced} XP a project` },
              ].map(({ Icon, title, body, xp }) => (
                <li key={title} className="rounded-[24px] border border-[rgb(var(--ld-tint-rgb)/0.16)] bg-[rgb(var(--ld-tint-rgb)/0.05)] p-6">
                  <span className="grid size-11 place-items-center rounded-[14px] bg-[var(--ld-accent)] text-[#08102e]">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="ld-display mt-5 text-[24px] font-bold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--ld-muted)]">{body}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ld-tint)]">
                    <ZapIcon className="size-4" /> {xp}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-8 max-w-[60ch] text-[15.5px] leading-relaxed text-[var(--ld-muted)]">
              Learn on any day and your streak grows; miss one day a week and it holds. XP adds up to levels, and the week&apos;s top learners are on the board below.
            </p>
          </div>
        </section>

        {leaders.length > 0 ? (
          <section aria-labelledby="board-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
            <div className="doc-shell py-[clamp(56px,7vw,96px)]">
              <h2 id="board-title" className="ld-display text-[clamp(30px,4vw,48px)] leading-none font-extrabold tracking-[-0.04em]">
                This week&apos;s leaders
              </h2>
              <ol className="mt-7 max-w-[640px] overflow-hidden rounded-[22px] border border-[var(--ld-line)] bg-[var(--ld-card)]">
                {leaders.map((leader, index) => (
                  <li key={String(leader._id)} className="flex items-center gap-4 border-t border-[var(--ld-line)] px-5 py-4 first:border-t-0">
                    <span className="ld-display w-8 text-[24px] font-extrabold text-[var(--ld-deep)]">{index + 1}</span>
                    <span className="flex-1 text-[16px] font-semibold">{leader.name.split(/\s+/)[0]}</span>
                    <span className="text-[15px] font-bold text-[var(--ld-text-2)]">{leader.xp} XP</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
