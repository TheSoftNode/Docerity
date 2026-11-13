import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ClipboardCheckIcon, FileTextIcon, LockIcon, PencilIcon, PlayIcon } from "lucide-react";

import { getCurrentAccount } from "@/lib/account/session";
import { getCourse } from "@/lib/academy/courses";
import { allLessons, courseMinutes, courseProgress, nextLesson, openModules } from "@/lib/academy/rules";
import type { LessonKind } from "@/lib/academy/types";
import { database } from "@/lib/config/env";
import { findEnrollment } from "@/lib/repositories/academy.repository";
import { enrolAction } from "@/app/academy/actions";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }): Promise<Metadata> {
  const course = await getCourse((await params).course);
  if (!course) return { title: "Course not found" };
  return { title: course.title, description: course.tagline, alternates: { canonical: `/academy/${course.slug}` } };
}

const KIND_ICON: Record<LessonKind, typeof PlayIcon> = { video: PlayIcon, reading: FileTextIcon, quiz: ClipboardCheckIcon, assignment: PencilIcon };

/**
 * One course: what it is, what you will be able to do, the way in (enrol, or
 * continue where you were), and the whole outline. Lessons in a module that
 * is not open yet show with a lock; the first lesson is open to anyone as a
 * preview.
 */
export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const course = await getCourse((await params).course);
  if (!course) notFound();

  const account = await getCurrentAccount();
  const enrollment = account?.verified && database.isConfigured ? await findEnrollment(account.id, course.slug).catch(() => null) : null;
  const progressInput = { completed: enrollment?.completed ?? [], passed: enrollment?.passed ?? [] };
  const progress = courseProgress(course, progressInput);
  const open = openModules(course, progressInput);
  const resume = enrollment ? nextLesson(course, progressInput) : null;
  const lessons = allLessons(course);
  const previewId = lessons[0]?.id;
  const minutes = courseMinutes(course);

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(900px_520px_at_90%_10%,rgb(28_58_140/0.6),transparent_62%),var(--ld-ink)] pt-[124px] pb-[clamp(48px,6vw,80px)] text-[var(--ld-paper)]">
          <div className="doc-shell">
            <Link href="/academy" className="-my-2 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--ld-muted)] transition-colors hover:text-[var(--ld-paper)]">
              <ArrowLeftIcon className="size-4" /> Academy
            </Link>
            <div className="mt-6 grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div>
                <h1 className="ld-display ld-up text-[clamp(40px,5.6vw,80px)] leading-[0.96] font-extrabold tracking-[-0.05em] text-balance">{course.title}</h1>
                <p className="ld-up ld-delay-2 mt-5 max-w-[40rem] text-[clamp(16px,1.3vw,18px)] leading-relaxed text-[var(--ld-muted)]">{course.tagline}</p>
                <p className="mt-5 text-[15px] text-[var(--ld-muted)]">
                  {course.level} · {course.modules.length} modules · {lessons.length} lessons · about {Math.max(1, Math.round(minutes / 60))} hours · {course.price ? `₦${course.price.toLocaleString()}` : "Free"}
                </p>
              </div>

              <div className="ld-keep-dark rounded-[26px] border border-[rgb(175_196_255/0.16)] bg-[#0b1433] p-6 text-[#f4f5fa]">
                {enrollment ? (
                  <>
                    <p className="text-[13px] text-[#9aa7cf]">Your progress</p>
                    <p className="ld-display mt-1 text-[44px] leading-none font-extrabold tracking-[-0.04em]">{progress.percent}%</p>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[rgb(175_196_255/0.14)]">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#afc4ff,#ff7a59)]" style={{ width: `${progress.percent}%` }} />
                    </div>
                    <p className="mt-2 text-[14px] text-[#c4cbe3]">
                      {progress.done} of {progress.total} lessons done
                    </p>
                    {resume ? (
                      <Link href={`/academy/${course.slug}/${resume.id}`} className="mt-5 flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#ff7a59] px-6 text-[16px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5">
                        Continue: {resume.title} <ArrowRightIcon className="size-4 shrink-0" />
                      </Link>
                    ) : (
                      <p className="mt-5 rounded-2xl bg-[#e3f6ec] px-4 py-3 text-[15px] font-semibold text-[#0f4d33]">You finished this course. Well done.</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="ld-display text-[24px] leading-tight font-bold tracking-[-0.02em]">{course.price ? "Enrol to start" : "Free. Start now."}</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#c4cbe3]">
                      {account ? (account.verified ? "Your progress, XP and streak are saved to your account." : "Confirm your email first, then come back to enrol.") : "Create a free account to save your progress, earn XP and keep a streak."}
                    </p>
                    {account ? (
                      account.verified ? (
                        <form action={enrolAction} className="mt-5">
                          <input type="hidden" name="slug" value={course.slug} />
                          <button type="submit" className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#ff7a59] px-6 text-[16px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5">
                            Enrol for free <ArrowRightIcon className="size-4" />
                          </button>
                        </form>
                      ) : (
                        <Link href="/account" className="mt-5 flex min-h-13 items-center justify-center rounded-full bg-[#afc4ff] px-6 text-[16px] font-bold text-[#08102e]">
                          Go to your account
                        </Link>
                      )
                    ) : (
                      <div className="mt-5 grid gap-2">
                        <Link href="/account/signup" className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#ff7a59] px-6 text-[16px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5">
                          Create a free account <ArrowRightIcon className="size-4" />
                        </Link>
                        <Link href={`/account/login?next=${encodeURIComponent(`/academy/${course.slug}`)}`} className="flex min-h-11 items-center justify-center text-[15px] font-semibold text-[#afc4ff]">
                          I have an account
                        </Link>
                      </div>
                    )}
                    {previewId ? (
                      <Link href={`/academy/${course.slug}/${previewId}`} className="mt-3 flex min-h-11 items-center justify-center text-[14px] text-[#c4cbe3] underline decoration-[#ff7a59] underline-offset-4">
                        Watch the first lesson free
                      </Link>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="outline-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell grid gap-12 py-[clamp(48px,6vw,96px)] lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
            <div>
              <h2 className="ld-display text-[clamp(28px,3.4vw,40px)] leading-tight font-extrabold tracking-[-0.035em]">By the end, you can</h2>
              <ul className="mt-5 grid gap-3">
                {course.outcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-3 text-[16px] leading-relaxed text-[var(--ld-text-2)]">
                    <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--ld-accent)] text-[#08102e]">
                      <CheckIcon className="size-3.5" />
                    </span>
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 id="outline-title" className="ld-display text-[clamp(28px,3.4vw,40px)] leading-tight font-extrabold tracking-[-0.035em]">
                The course
              </h2>
              <ol className="mt-5 grid gap-4">
                {course.modules.map((module, moduleIndex) => {
                  const isOpen = open.has(module.id);
                  const doneHere = module.lessons.filter((lesson) => progressInput.completed.includes(lesson.id)).length;
                  return (
                    <li key={module.id} className="overflow-hidden rounded-[22px] border border-[var(--ld-line)] bg-[var(--ld-card)]">
                      <div className="flex items-start gap-4 p-5">
                        <span className={cn("ld-display grid size-10 shrink-0 place-items-center rounded-full text-[17px] font-bold", isOpen && enrollment ? "bg-[var(--ld-deep)] text-white" : "bg-[var(--ld-paper-2)] text-[var(--ld-text-muted)]")}>
                          {moduleIndex + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[18px] font-semibold">{module.title}</h3>
                          <p className="mt-1 text-[14.5px] leading-relaxed text-[var(--ld-text-muted)]">{module.summary}</p>
                        </div>
                        {enrollment ? (
                          <span className="shrink-0 text-[13px] font-semibold text-[var(--ld-text-muted)]">
                            {isOpen ? `${doneHere}/${module.lessons.length}` : <LockIcon className="size-4" aria-label="Locked" />}
                          </span>
                        ) : null}
                      </div>
                      <ul className="border-t border-[var(--ld-line)]">
                        {module.lessons.map((lesson) => {
                          const Icon = KIND_ICON[lesson.kind];
                          const done = progressInput.completed.includes(lesson.id);
                          const reachable = (enrollment && isOpen) || lesson.id === previewId;
                          const row = (
                            <>
                              <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", done ? "bg-[#e3f6ec] text-[#1d7a52]" : "bg-[var(--ld-paper-2)] text-[var(--ld-text-muted)]")}>
                                {done ? <CheckIcon className="size-4" /> : <Icon className="size-4" />}
                              </span>
                              <span className="min-w-0 flex-1 text-[15px] font-medium">{lesson.title}</span>
                              <span className="shrink-0 text-[13px] text-[var(--ld-text-muted)]">{lesson.minutes} min</span>
                            </>
                          );
                          return (
                            <li key={lesson.id} className="border-t border-[var(--ld-line)] first:border-t-0">
                              {reachable ? (
                                <Link href={`/academy/${course.slug}/${lesson.id}`} className="flex min-h-13 items-center gap-3 px-5 py-2.5 transition-colors hover:bg-[var(--ld-paper)]">
                                  {row}
                                </Link>
                              ) : (
                                <span className="flex min-h-13 items-center gap-3 px-5 py-2.5 opacity-60">{row}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
