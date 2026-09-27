import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon, ExternalLinkIcon } from "lucide-react";

import { requireStaff } from "@/lib/auth/dal";
import { database, storage } from "@/lib/config/env";
import {
  countProjectsByState,
  listAllProjects,
} from "@/lib/repositories/project.repository";
import { cloudinaryImageUrl } from "@/lib/storage/public-url";
import {
  AdminEmptyState,
  AdminNoDatabase,
  AdminPageHeader,
} from "@/components/admin/admin-page-header";
import { ProjectRow, type ProjectSummary } from "@/components/admin/project-row";
import { ImportProjectsButton } from "@/components/admin/import-projects-button";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Work" };

export default async function AdminWorkPage() {
  await requireStaff("/admin/work");

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader
          title="Work"
          description="The projects on the work page and the homepage."
        />
        <div className="mt-6">
          <AdminNoDatabase what="Projects" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            The site is still serving the twenty-five projects built into the
            code, so the work page is unaffected.
          </p>
        </div>
      </>
    );
  }

  const [counts, rows] = await Promise.all([countProjectsByState(), listAllProjects()]);

  const projects: ProjectSummary[] = rows.map((row, index) => ({
    id: String(row._id),
    slug: row.slug,
    name: row.name,
    category: row.category ?? "",
    groups: row.groups ?? [],
    status: row.status,
    published: Boolean(row.published),
    featured: Boolean(row.featured),
    /* Cloudinary when it was uploaded here, the `public/` path when it came
       from the import. Either way it is already the right size. */
    thumbnailUrl: row.media?.publicId
      ? storage.isConfigured
        ? cloudinaryImageUrl(row.media.publicId, { width: 160, height: 110 })
        : ""
      : (row.media?.src ?? ""),
    position: index + 1,
    isFirst: index === 0,
    isLast: index === rows.length - 1,
  }));

  return (
    <>
      <AdminPageHeader
        title="Work"
        description="The order here is the order on the site. Starred projects also show on the homepage."
      >
        <Button size="sm" nativeButton={false} render={<Link href="/admin/work/new" />}>
          <PlusIcon />
          New project
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/work" target="_blank" />}
        >
          <ExternalLinkIcon />
          Work page
        </Button>
      </AdminPageHeader>

      <dl className="mt-5 grid grid-cols-3 gap-3">
        {[
          ["On the site", counts.published],
          ["Drafts", counts.draft],
          ["On the homepage", counts.featured],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-border bg-card px-4 py-3">
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1 font-heading text-xl font-semibold tabular-nums text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 space-y-2">
        {projects.length === 0 ? (
          <AdminEmptyState
            title="Nothing here yet"
            description="The site is currently serving the twenty-five projects built into the code. Import them to edit them here, or start a new one."
          >
            <ImportProjectsButton />
          </AdminEmptyState>
        ) : (
          projects.map((project) => <ProjectRow key={project.id} project={project} />)
        )}
      </div>
    </>
  );
}
