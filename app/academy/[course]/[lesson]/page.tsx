import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon, CheckIcon, ChevronDownIcon, ClipboardCheckIcon, FileTextIcon, LockIcon, PlayIcon } from "lucide-react";

import { getCurrentAccount } from "@/lib/account/session";
import { getCourse } from "@/lib/academy/courses";
import { PASS_MARK, allLessons, courseProgress, findLesson, openModules } from "@/lib/academy/rules";
import type { Course, LessonKind } from "@/lib/academy/types";
import { LessonNotes } from "@/lib/academy/markdown";
import { getStanding } from "@/lib/academy/standing";
import { database } from "@/lib/config/env";
import { findEnrollment } from "@/lib/repositories/academy.repository";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LessonPlayer } from "@/components/academy/lesson-player";
import { Quiz } from "@/components/academy/quiz";
import { StandingPanel } from "@/components/academy/standing-panel";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ course: string; lesson: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { course: slug, lesson: lessonId } = await params;
  const course = await getCourse(slug);
  const found = course ? findLesson(course, lessonId) : null;
  if (!course || !found) return { title: "Lesson not found" };
  return { title: `${found.lesson.title} · ${course.title}`, description: found.lesson.summary, robots: { index: false } };
}

const KIND_ICON: Record<LessonKind, typeof PlayIcon> = { video: PlayIcon, reading: FileTextIcon, quiz: ClipboardCheckIcon };

function Outline({ course, current, completed, open, enrolled }: { course: Course; current: string; completed: string[]; open: Set<string>; enrolled: boolean }) {
  return (
    <ol className="grid gap-5">
      {course.modules.map((module, index) => (
        <li key={module.id}>
          <p className="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-[var(--ld-text-muted)]">
            {index + 1}. {module.title}
            {enrolled && !open.has(module.id) ? <LockIcon className="size-3.5" aria-label="Locked" /> : null}
          </p>
          <ul className="grid gap-0.5">
            {module.lessons.map((lesson) => {
              const Icon = KIND_ICON[lesson.kind];
              const done = completed.includes(lesson.id);
              const here = lesson.id === current;
              const reachable = enrolled && open.has(module.id);
              const body = (
                <>
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-full", done ? "bg-[#e3f6ec] text-[#1d7a52]" : here ? "bg-[var(--ld-deep)] text-white" : "bg-[var(--ld-paper-2)] text-[var(--ld-text-muted)]")}>
                    {done ? <CheckIcon className="size-3.5" /> : <Icon className="size-3" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                </>
              );
              return (
                <li key={lesson.id}>
                  {reachable ? (
                    <Link
                      href={`/academy/${course.slug}/${lesson.id}`}
                      aria-current={here ? "page" : undefined}
                      className={cn("flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-[14px] transition-colors", here ? "bg-[#e6ecff] font-semibold text-[var(--ld-ink)]" : "text-[var(--ld-text-2)] hover:bg-[var(--ld-paper-2)]")}
                    >
                      {body}
                    </Link>
                  ) : (
                    <span className="flex min-h-10 items-center gap-2.5 px-2.5 text-[14px] text-[var(--ld-text-muted)] opacity-70">{body}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/**
 * A lesson: the video (or the reading), the notes, and the way on; or the
 * quiz. The course outline sits beside it on a laptop and folds under the
 * title on a phone. Only enrolled students in an open module save progress;
 * the first lesson is a preview for anyone.
 */
export default async function LessonPage({ params }: { params: Params }) {
  const { course: slug, lesson: lessonId } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  const found = findLesson(course, lessonId);
  if (!found) notFound();
  const { lesson, module, index } = found;

  const account = await getCurrentAccount();
  const enrollment = account?.verified && database.isConfigured ? await findEnrollment(account.id, slug).catch(() => null) : null;
  const progressInput = { completed: enrollment?.completed ?? [], passed: enrollment?.passed ?? [] };
  const open = openModules(course, progressInput);
  const lessons = allLessons(course);
  const isPreview = index === 0;

  if (enrollment && !open.has(module.id)) redirect(`/academy/${slug}`);
  if (!enrollment && !isPreview) redirect(`/academy/${slug}`);

  const tracked = Boolean(enrollment);
  const next = lessons[index + 1];
  const previous = lessons[index - 1];
  const nextReachable = next && tracked ? findLesson(course, next.id) : null;
  const nextHref = next && nextReachable ? `/academy/${slug}/${next.id}` : null;
  const progress = courseProgress(course, progressInput);
  const standing = tracked && account ? await getStanding(account.id) : null;
  const best = enrollment ? ((enrollment.best as Record<string, number> | undefined)?.[lesson.id] ?? null) : null;
  const lessonNumber = module.lessons.findIndex((item) => item.id === lesson.id) + 1;

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative -mt-[76px] bg-[radial-gradient(800px_420px_at_90%_0%,rgb(28_58_140/0.55),transparent_62%),var(--ld-ink)] pt-[116px] pb-10 text-[var(--ld-paper)]">
          <div className="doc-shell">
            <Link href={`/academy/${slug}`} className="-my-2 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--ld-muted)] transition-colors hover:text-[var(--ld-paper)]">
              <ArrowLeftIcon className="size-4" /> {course.title}
            </Link>
            <p className="mt-4 text-[14px] text-[var(--ld-muted)]">
              Module {course.modules.indexOf(module) + 1} · {module.title} · lesson {lessonNumber} of {module.lessons.length}
            </p>
            <h1 className="ld-display mt-2 max-w-[22ch] text-[clamp(32px,4.4vw,60px)] leading-[0.98] font-extrabold tracking-[-0.045em] text-balance">{lesson.title}</h1>
            {lesson.summary ? <p className="mt-4 max-w-[46rem] text-[16.5px] leading-relaxed text-[var(--ld-muted)]">{lesson.summary}</p> : null}
            {tracked ? (
              <div className="mt-6 flex max-w-[460px] items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[rgb(var(--ld-tint-rgb)/0.16)]">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--ld-tint),var(--ld-accent))]" style={{ width: `${progress.percent}%` }} />
                </div>
                <span className="text-[13px] font-semibold text-[var(--ld-muted)]">{progress.percent}% of the course</span>
              </div>
            ) : null}
          </div>
        </section>

        <section className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell grid gap-10 py-[clamp(32px,5vw,64px)] lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0">
              <details className="mb-6 rounded-[18px] border border-[var(--ld-line)] bg-[var(--ld-card)] lg:hidden">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-[15px] font-semibold">
                  Course outline <ChevronDownIcon className="size-4" />
                </summary>
                <div className="border-t border-[var(--ld-line)] p-4">
                  <Outline course={course} current={lesson.id} completed={progressInput.completed} open={open} enrolled={tracked} />
                </div>
              </details>

              {!tracked ? (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-[#e6ecff] px-5 py-4">
                  <p className="text-[15px] text-[var(--ld-ink)]">You are watching a free preview. Enrol to save progress and earn XP.</p>
                  <Link href={`/academy/${slug}`} className="inline-flex h-11 items-center rounded-full bg-[var(--ld-ink)] px-5 text-[15px] font-semibold text-[var(--ld-paper)]">
                    Enrol for free
                  </Link>
                </div>
              ) : null}

              {lesson.kind === "quiz" ? (
                <Quiz
                  slug={slug}
                  lessonId={lesson.id}
                  questions={lesson.questions.map((question) => ({ id: question.id, prompt: question.prompt, code: question.code, options: question.options, multi: question.answer.length > 1 }))}
                  passMark={PASS_MARK}
                  best={best}
                  tracked={tracked}
                  nextHref={nextHref}
                />
              ) : (
                <>
                  <LessonPlayer
                    slug={slug}
                    lessonId={lesson.id}
                    youtubeId={lesson.youtubeId}
                    title={lesson.title}
                    tracked={tracked}
                    initiallyDone={progressInput.completed.includes(lesson.id)}
                    nextHref={nextHref}
                    nextTitle={next?.title ?? null}
                    showVideo={lesson.kind === "video"}
                  />
                  {lesson.notes ? (
                    <article className="mt-10 rounded-[24px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-6 sm:p-9">
                      <LessonNotes source={lesson.notes} />
                    </article>
                  ) : null}
                </>
              )}

              <nav aria-label="Lessons" className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ld-line)] pt-6">
                {previous && tracked ? (
                  <Link href={`/academy/${slug}/${previous.id}`} className="inline-flex min-h-11 items-center gap-2 text-[15px] text-[var(--ld-text-2)] hover:text-[var(--ld-ink)]">
                    <ArrowLeftIcon className="size-4" /> {previous.title}
                  </Link>
                ) : (
                  <span />
                )}
                {nextHref && next ? (
                  <Link href={nextHref} className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-[var(--ld-deep)]">
                    {next.title} →
                  </Link>
                ) : null}
              </nav>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 grid gap-5">
                {standing ? <StandingPanel standing={standing} /> : null}
                <div className="rounded-[22px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-4">
                  <Outline course={course} current={lesson.id} completed={progressInput.completed} open={open} enrolled={tracked} />
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
