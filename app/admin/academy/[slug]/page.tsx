import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";

import { requireStaff } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { SHIPPED, getCourse } from "@/lib/academy/courses";
import { allLessons } from "@/lib/academy/rules";
import { listCourseStudents } from "@/lib/repositories/academy.repository";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";
import { CourseEditor } from "@/components/admin/academy-course-editor";
import { timeAgo } from "@/components/admin/admin-content";

export const metadata: Metadata = { title: "Edit course" };
export const dynamic = "force-dynamic";

/** One course: its students at the top, the editor below. */
export default async function AdminAcademyCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireStaff(`/admin/academy/${slug}`);
  if (!database.isConfigured) return <AdminNoDatabase what="The Academy" />;

  const course = await getCourse(slug, { drafts: true });
  if (!course) notFound();
  const students = await listCourseStudents(slug).catch(() => []);
  const total = allLessons(course).length;

  return (
    <>
      <Link href="/admin/academy" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> All courses
      </Link>
      <AdminPageHeader eyebrow="Academy" title={course.title} description={`${course.modules.length} modules · ${total} lessons · ${students.length} students`}>
        <Link href={`/academy/${course.slug}`} target="_blank" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold text-foreground">
          View the course <ArrowUpRightIcon className="size-4" />
        </Link>
      </AdminPageHeader>

      {students.length > 0 ? (
        <section className="mb-8 overflow-hidden rounded-[24px] border border-border bg-card">
          <h2 className="px-6 pt-5 font-heading text-[20px] font-bold text-foreground">Students</h2>
          <table className="mt-3 w-full text-left text-[14px]">
            <thead className="text-[12px] text-muted-foreground">
              <tr>
                <th className="px-6 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Progress</th>
                <th className="px-3 py-2 font-medium">Last active</th>
              </tr>
            </thead>
            <tbody>
              {students.slice(0, 50).map((student) => (
                <tr key={String(student._id)} className="border-t border-border">
                  <td className="px-6 py-3">
                    <span className="font-medium text-foreground">{student.name || "Unnamed"}</span>
                    <span className="block text-[12px] text-muted-foreground">{student.email}</span>
                  </td>
                  <td className="px-3 py-3 text-foreground">
                    {student.completedAt ? "Finished" : `${Math.round(((student.completed?.length ?? 0) / Math.max(1, total)) * 100)}%`}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{timeAgo(student.lastActiveAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <CourseEditor initial={course} shipped={SHIPPED.some((item) => item.slug === course.slug)} />
    </>
  );
}
