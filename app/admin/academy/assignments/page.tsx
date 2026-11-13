import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon, SparklesIcon } from "lucide-react";

import { requireStaff } from "@/lib/auth/dal";
import { ai, database } from "@/lib/config/env";
import { listCourses } from "@/lib/academy/courses";
import { findLesson } from "@/lib/academy/rules";
import { countSubmissionsToReview, listSubmissionsToReview } from "@/lib/repositories/academy.repository";
import { AdminEmptyState, AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";
import { GradeForm } from "@/components/admin/academy-grade-form";
import { timeAgo } from "@/components/admin/admin-content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Assignments" };
export const dynamic = "force-dynamic";

/**
 * Hand-ins that need a person: those waiting for a mark (no AI, the AI was
 * unsure, or the student ran out of AI attempts), and AI marks nobody has
 * checked yet. Oldest first.
 */
export default async function AdminAssignmentsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireStaff("/admin/academy/assignments");
  if (!database.isConfigured) return <AdminNoDatabase what="The Academy" />;
  const show = (await searchParams).show === "check" ? "check" : "waiting";
  const [rows, counts, courses] = await Promise.all([listSubmissionsToReview(show), countSubmissionsToReview(), listCourses({ drafts: true })]);
  const bySlug = new Map(courses.map((course) => [course.slug, course] as const));

  return (
    <>
      <Link href="/admin/academy" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Academy
      </Link>
      <AdminPageHeader
        eyebrow="Academy"
        title="Assignments"
        description={
          ai.isConfigured
            ? "Claude marks each hand-in the moment it arrives. Mark the ones it passed to you, and check its grades when you can."
            : "AI marking is off until ANTHROPIC_API_KEY is set, so every hand-in waits here for you to mark."
        }
      />
      <nav aria-label="Which hand-ins" className="mb-5 flex gap-2">
        {[
          { key: "waiting", label: "To mark", count: counts.waiting, href: "/admin/academy/assignments" },
          { key: "check", label: "AI marks to check", count: counts.check, href: "/admin/academy/assignments?show=check" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={show === tab.key ? "page" : undefined}
            className={cn("inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold", show === tab.key ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground")}
          >
            {tab.label} <span className="tabular-nums opacity-70">{tab.count}</span>
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <AdminEmptyState title={show === "waiting" ? "Nothing to mark" : "Nothing to check"} description={show === "waiting" ? "Hand-ins that need a person appear here, oldest first." : "Grades the AI gave appear here until you confirm or change them."} />
      ) : (
        <ul className="grid gap-4">
          {rows.map((row) => {
            const course = bySlug.get(row.courseSlug);
            const lesson = course ? findLesson(course, row.lessonId)?.lesson : null;
            const rubric = lesson?.rubric ?? [];
            const fromAi = row.criteria?.length === rubric.length ? row.criteria : null;
            return (
              <li key={String(row._id)} className="grid gap-5 rounded-[24px] border border-border bg-card p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]" data-submission>
                <div className="min-w-0">
                  <p className="text-[13px] text-muted-foreground">
                    {course?.title ?? row.courseSlug} · attempt {row.attempts} · handed in {timeAgo(row.submittedAt)}
                  </p>
                  <h2 className="mt-1 font-heading text-[20px] font-bold text-foreground">{lesson?.title ?? row.lessonId}</h2>
                  <p className="mt-1 text-[14px] text-foreground">
                    {row.name} <span className="text-muted-foreground">· {row.email}</span>
                  </p>
                  {row.repoUrl || row.liveUrl ? (
                    <div className="mt-3 flex flex-wrap gap-4 text-[14px] font-semibold">
                      {row.repoUrl ? (
                        <a href={row.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary">
                          Code <ArrowUpRightIcon className="size-4" />
                        </a>
                      ) : null}
                      {row.liveUrl ? (
                        <a href={row.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary">
                          Live site <ArrowUpRightIcon className="size-4" />
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                  <pre className="mt-3 max-h-[360px] overflow-auto rounded-2xl bg-muted px-4 py-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">{row.answer}</pre>
                  {row.aiNote || (show === "check" && row.score !== null) ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                      <SparklesIcon className="size-4" /> {row.aiNote || `AI gave ${row.score}% (${row.passed ? "passed" : "not passed"}). The student can already see it.`}
                    </p>
                  ) : null}
                </div>
                {rubric.length ? (
                  <GradeForm
                    id={String(row._id)}
                    confirmLabel={show === "check" ? "Confirm grade" : "Save grade"}
                    feedback={row.feedback}
                    lines={rubric.map((item, index) => ({ criterion: item.criterion, max: item.points, points: fromAi ? fromAi[index].points : "", comment: fromAi ? fromAi[index].comment : "" }))}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">This assignment has no marking guide any more.</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
