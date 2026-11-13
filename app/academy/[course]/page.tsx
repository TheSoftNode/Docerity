import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, CheckIcon, ClipboardCheckIcon, FileTextIcon, LockIcon, PencilIcon, PlayIcon } from "lucide-react";

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
import { AcademyHero, paperCard } from "@/components/academy/kit";

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
        <AcademyHero
          back={{ href: "/academy", label: "Academy" }}
          size="lg"
          meta={
            <>
              <span>{course.level}</span>
              <span aria-hidden="true">·</span>
              <span>{course.modules.length} modules</span>
              <span aria-hidden="true">·</span>
              <span>{lessons.length} lessons</span>
              <span aria-hidden="true">·</span>
              <span>about {Math.max(1, Math.round(minutes / 60))} hours</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[var(--ld-accent)]">{course.price ? `₦${course.price.toLocaleString()}` : "Free"}</span>
            </>
          }
          title={course.title}
          aside={
            <>
              <p className="mb-6 text-[clamp(16.5px,1.35vw,19px)] leading-relaxed text-[var(--ld-muted)]">{course.tagline}</p>
                  <div className="ld-keep-dark rounded-[28px] bg-[#0b1433] p-7 text-[#f4f5fa] shadow-[inset_0_0_0_1px_rgb(175_196_255/0.14),0_40px_80px_-40px_rgb(0_0_0/0.7)]">
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
            </>
          }
        />

        <section aria-labelledby="outline-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell grid gap-8 py-[clamp(48px,6vw,112px)] lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-12">
            <div>
              <div className="relative overflow-hidden rounded-[28px] bg-[var(--ld-deep)] p-7 text-white sm:p-8 lg:sticky lg:top-24">
                <span aria-hidden="true" className="pointer-events-none absolute -right-16 -bottom-20 size-64 rounded-full bg-[radial-gradient(circle,rgb(255_122_89/0.3),transparent_65%)]" />
                <h2 className="ld-display relative text-[clamp(28px,3vw,38px)] leading-[1] font-extrabold tracking-[-0.04em]">By the end, you can</h2>
                <ul className="relative mt-6 grid gap-3.5">
                  {course.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-3 text-[16px] leading-relaxed text-[#d5dffc]">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[var(--ld-accent)] text-[#08102e]">
                        <CheckIcon className="size-3.5" />
                      </span>
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h2 id="outline-title" className="ld-display mb-6 text-[clamp(36px,4.4vw,64px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
                The course.
              </h2>
              <ol className="grid gap-4">
                {course.modules.map((module, moduleIndex) => {
                  const isOpen = open.has(module.id);
                  const doneHere = module.lessons.filter((lesson) => progressInput.completed.includes(lesson.id)).length;
                  const allDone = enrollment && doneHere === module.lessons.length;
                  return (
                    <li key={module.id} className={cn(paperCard, "overflow-hidden")}>
                      <div className="flex items-start gap-4 p-5 sm:p-6">
                        <span
                          className={cn(
                            "ld-display grid size-12 shrink-0 place-items-center rounded-[16px] text-[17px] font-extrabold",
                            allDone ? "bg-[#e3f6ec] text-[#1d7a52]" : isOpen && enrollment ? "bg-[var(--ld-deep)] text-white" : "bg-[var(--ld-paper-2)] text-[var(--ld-text-muted)]"
                          )}
                        >
                          {allDone ? <CheckIcon className="size-5" /> : String(moduleIndex + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="ld-display text-[21px] leading-tight font-bold tracking-[-0.02em]">{module.title}</h3>
                          <p className="mt-1 text-[15px] leading-relaxed text-[var(--ld-text-muted)]">{module.summary}</p>
                        </div>
                        {enrollment ? (
                          <span className="mt-1 shrink-0 text-[13px] font-semibold text-[var(--ld-text-muted)] tabular-nums">
                            {isOpen ? `${doneHere}/${module.lessons.length}` : <LockIcon className="size-4" aria-label="Locked" />}
                          </span>
                        ) : null}
                      </div>
                      <ul className="border-t border-[var(--ld-line-3)] px-2 py-2 sm:px-3">
                        {module.lessons.map((lesson) => {
                          const Icon = KIND_ICON[lesson.kind];
                          const done = progressInput.completed.includes(lesson.id);
                          const reachable = (enrollment && isOpen) || lesson.id === previewId;
                          const row = (
                            <>
                              <span className={cn("grid size-8 shrink-0 place-items-center rounded-full", done ? "bg-[#e3f6ec] text-[#1d7a52]" : lesson.kind === "assignment" ? "bg-[#fff0eb] text-[#b4401f]" : lesson.kind === "quiz" ? "bg-[#e6ecff] text-[var(--ld-deep)]" : "bg-[var(--ld-paper-2)] text-[var(--ld-text-muted)]")}>
                                {done ? <CheckIcon className="size-4" /> : <Icon className="size-4" />}
                              </span>
                              <span className="min-w-0 flex-1 text-[15px] font-medium">{lesson.title}</span>
                              {lesson.id === previewId && !enrollment ? <span className="shrink-0 rounded-full bg-[#fff0eb] px-2.5 py-0.5 text-[12px] font-semibold text-[#b4401f]">Free preview</span> : null}
                              <span className="shrink-0 text-[13px] text-[var(--ld-text-muted)] tabular-nums">{lesson.minutes} min</span>
                            </>
                          );
                          return (
                            <li key={lesson.id}>
                              {reachable ? (
                                <Link href={`/academy/${course.slug}/${lesson.id}`} className="flex min-h-12 items-center gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-[var(--ld-paper)]">
                                  {row}
                                </Link>
                              ) : (
                                <span className="flex min-h-12 items-center gap-3 px-3 py-2 opacity-55">{row}</span>
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
