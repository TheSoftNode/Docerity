import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { requireStaff } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { listCourses } from "@/lib/academy/courses";
import { allLessons } from "@/lib/academy/rules";
import { countSubmittedBuilds, courseStats } from "@/lib/repositories/academy.repository";
import { getBriefs } from "@/lib/academy/pool";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";
import { NewCourseButton } from "@/components/admin/academy-new-course";

export const metadata: Metadata = { title: "Academy" };
export const dynamic = "force-dynamic";

/**
 * The Academy's courses, each with how many students it has, how many were
 * active this week and how many finished. Open one to edit its lessons,
 * paste in YouTube links, and write its quizzes.
 */
export default async function AdminAcademyPage() {
  await requireStaff("/admin/academy");

  const header = (
    <AdminPageHeader eyebrow="Academy" title="Courses" description="Your courses, their students, and where each one is up to. Paste a YouTube link into a lesson to put its video live.">
      {database.isConfigured ? <NewCourseButton /> : null}
    </AdminPageHeader>
  );

  if (!database.isConfigured) {
    return (
      <>
        {header}
        <AdminNoDatabase what="The Academy" />
      </>
    );
  }

  const [courses, waiting, briefs] = await Promise.all([listCourses({ drafts: true }), countSubmittedBuilds().catch(() => 0), getBriefs()]);
  const stats = await Promise.all(courses.map((course) => courseStats(course.slug).catch(() => ({ enrolled: 0, finished: 0, activeWeek: 0 }))));

  return (
    <>
      {header}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/academy/builds" className="group flex items-center justify-between gap-4 rounded-[24px] border border-border bg-card p-6 transition-colors hover:border-foreground/25">
          <span>
            <span className="block text-[13px] text-muted-foreground">Builds to review</span>
            <span className="font-heading text-[30px] font-bold text-foreground">{waiting}</span>
          </span>
          {waiting > 0 ? <span className="rounded-full bg-[#ff7a59] px-3 py-1 text-[13px] font-bold text-[#08102e]">Waiting on you</span> : <ArrowRightIcon className="size-5 text-muted-foreground" />}
        </Link>
        <Link href="/admin/academy/briefs" className="group flex items-center justify-between gap-4 rounded-[24px] border border-border bg-card p-6 transition-colors hover:border-foreground/25">
          <span>
            <span className="block text-[13px] text-muted-foreground">Project pool</span>
            <span className="font-heading text-[30px] font-bold text-foreground">{briefs.length} projects</span>
          </span>
          <ArrowRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <ul className="grid gap-4 lg:grid-cols-2">
        {courses.map((course, index) => {
          const lessons = allLessons(course);
          const withVideo = lessons.filter((lesson) => lesson.kind === "video" && lesson.youtubeId).length;
          const videos = lessons.filter((lesson) => lesson.kind === "video").length;
          return (
            <li key={course.slug}>
              <Link href={`/admin/academy/${course.slug}`} className="group block rounded-[24px] border border-border bg-card p-6 transition-colors hover:border-foreground/25">
                <p className="text-[13px] text-muted-foreground">
                  {course.status === "draft" ? "Draft" : "Published"} · {course.modules.length} modules · {lessons.length} lessons
                </p>
                <h2 className="mt-1 font-heading text-[22px] leading-tight font-bold tracking-[-0.02em] text-foreground">{course.title}</h2>
                <dl className="mt-5 grid grid-cols-4 gap-3 border-t border-border pt-4">
                  {[
                    ["Students", stats[index].enrolled],
                    ["Active this week", stats[index].activeWeek],
                    ["Finished", stats[index].finished],
                    ["Videos in", `${withVideo}/${videos}`],
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <dt className="text-[12px] text-muted-foreground">{label}</dt>
                      <dd className="font-heading text-[22px] font-bold text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                  Edit the course <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
