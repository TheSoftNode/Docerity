import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";

import { requireStaff } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { BUILD_XP } from "@/lib/academy/briefs";
import { getBriefs } from "@/lib/academy/pool";
import { listSubmittedBuilds } from "@/lib/repositories/academy.repository";
import { AdminEmptyState, AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";
import { BuildReview } from "@/components/admin/academy-review";
import { timeAgo } from "@/components/admin/admin-content";

export const metadata: Metadata = { title: "Builds to review" };
export const dynamic = "force-dynamic";

/**
 * Builds students have handed in, oldest first. Open the live site and the
 * code, then approve (the student earns the XP and the build goes in the
 * showcase) or ask for changes with a note.
 */
export default async function AdminBuildsPage() {
  await requireStaff("/admin/academy/builds");
  if (!database.isConfigured) return <AdminNoDatabase what="The Academy" />;

  const [builds, briefs] = await Promise.all([listSubmittedBuilds(), getBriefs()]);
  const byId = new Map(briefs.map((brief) => [brief.id, brief] as const));

  return (
    <>
      <Link href="/admin/academy" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Academy
      </Link>
      <AdminPageHeader eyebrow="Academy" title="Builds to review" description="Open the live site and the code. Approving earns the student the project's XP and puts the build in the showcase." />
      {builds.length === 0 ? (
        <AdminEmptyState title="Nothing waiting" description="Handed-in builds appear here, oldest first." />
      ) : (
        <ul className="grid gap-4">
          {builds.map((build) => {
            const brief = byId.get(build.briefId);
            return (
              <li key={String(build._id)} className="grid gap-5 rounded-[24px] border border-border bg-card p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="min-w-0">
                  <p className="text-[13px] text-muted-foreground">
                    {brief?.level ?? "Project"} · {brief ? `${BUILD_XP[brief.level]} XP` : ""} · handed in {timeAgo(build.submittedAt)}
                  </p>
                  <h2 className="mt-1 font-heading text-[20px] font-bold text-foreground">{brief?.title ?? build.briefId}</h2>
                  <p className="mt-1 text-[14px] text-foreground">
                    {build.name} <span className="text-muted-foreground">· {build.email}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-[14px] font-semibold">
                    <a href={build.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary">
                      Live site <ArrowUpRightIcon className="size-4" />
                    </a>
                    <a href={build.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary">
                      Code <ArrowUpRightIcon className="size-4" />
                    </a>
                  </div>
                  {build.note ? <p className="mt-3 rounded-2xl bg-muted px-4 py-3 text-[14px] leading-relaxed whitespace-pre-line text-foreground">{build.note}</p> : null}
                  {brief ? (
                    <details className="mt-3 text-[14px]">
                      <summary className="cursor-pointer font-semibold text-muted-foreground">What must work</summary>
                      <ul className="mt-2 list-disc pl-5 text-foreground">
                        {brief.requirements.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  ) : null}
                </div>
                <BuildReview buildId={String(build._id)} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
