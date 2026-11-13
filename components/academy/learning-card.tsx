import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { listCourses } from "@/lib/academy/courses";
import { courseProgress, nextLesson } from "@/lib/academy/rules";
import { getStanding } from "@/lib/academy/standing";
import { database } from "@/lib/config/env";
import { listEnrollments } from "@/lib/repositories/academy.repository";
import { StreakFlame } from "@/components/academy/standing-panel";

/**
 * "Your learning" in the account: the course in progress with a way straight
 * back into it, and the student's level, XP and streak. Someone not yet
 * learning sees a short invitation to the free course instead.
 */
export async function LearningCard({ accountId }: { accountId: string }) {
  if (!database.isConfigured) return null;
  const [enrollments, courses, standing] = await Promise.all([listEnrollments(accountId).catch(() => []), listCourses(), getStanding(accountId)]);
  const current = enrollments[0];
  const course = current ? courses.find((item) => item.slug === current.courseSlug) : undefined;

  if (!current || !course) {
    const first = courses[0];
    if (!first) return null;
    return (
      <section aria-labelledby="learning-title" className="mt-12 grid items-center gap-6 rounded-[26px] border border-border bg-card p-7 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <h2 id="learning-title" className="font-heading text-[26px] font-bold tracking-[-0.025em] text-foreground">
            Learn with us, free
          </h2>
          <p className="mt-1.5 max-w-[56ch] text-[15px] leading-relaxed text-muted-foreground">
            {first.title}: short video lessons, quizzes that mark themselves, XP and a daily streak.
          </p>
        </div>
        <Link href={`/academy/${first.slug}`} className="inline-flex h-12 items-center gap-2 justify-self-start rounded-full bg-[#08102e] px-5 text-[15px] font-bold text-[#f4f5fa] transition-transform hover:-translate-y-0.5 dark:bg-[#afc4ff] dark:text-[#08102e]">
          See the course <ArrowRightIcon className="size-4" />
        </Link>
      </section>
    );
  }

  const progressInput = { completed: current.completed, passed: current.passed };
  const progress = courseProgress(course, progressInput);
  const next = nextLesson(course, progressInput);

  return (
    <section aria-labelledby="learning-title" className="mt-12">
      <h2 id="learning-title" className="mb-4 font-heading text-[26px] font-bold tracking-[-0.025em] text-foreground">
        Your learning
      </h2>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Link href={next ? `/academy/${course.slug}/${next.id}` : `/academy/${course.slug}`} className="group rounded-[26px] bg-[#08102e] p-7 text-[#f4f5fa] transition-transform hover:-translate-y-0.5">
          <p className="text-[13px] text-[#9aa7cf]">{progress.percent}% done</p>
          <p className="mt-1 font-heading text-[26px] leading-tight font-bold tracking-[-0.03em]">{course.title}</p>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[rgb(175_196_255/0.14)]">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#afc4ff,#ff7a59)]" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-[#ff9a80]">
            {next ? `Continue: ${next.title}` : "Course finished. See it again"}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </p>
        </Link>
        <dl className="grid grid-cols-3 overflow-hidden rounded-[26px] border border-border bg-card">
          <div className="flex flex-col justify-center px-5 py-5">
            <dt className="text-[13px] text-muted-foreground">Level</dt>
            <dd className="font-heading text-[34px] leading-none font-extrabold tracking-[-0.04em] text-foreground">{standing.level}</dd>
          </div>
          <div className="flex flex-col justify-center border-l border-border px-5 py-5">
            <dt className="text-[13px] text-muted-foreground">XP</dt>
            <dd className="font-heading text-[34px] leading-none font-extrabold tracking-[-0.04em] text-foreground">{standing.xp}</dd>
          </div>
          <div className="flex flex-col justify-center border-l border-border px-5 py-5">
            <dt className="text-[13px] text-muted-foreground">Streak</dt>
            <dd className="flex items-center gap-1 font-heading text-[34px] leading-none font-extrabold tracking-[-0.04em] text-foreground">
              <StreakFlame lit={standing.streak > 0} className="size-6 text-muted-foreground" />
              {standing.streak}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
