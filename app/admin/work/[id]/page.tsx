import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireStaff } from "@/lib/auth/dal";
import { storage } from "@/lib/config/env";
import { findProjectById } from "@/lib/repositories/project.repository";
import { ProjectEditor } from "@/components/admin/project-editor";
import type { ProjectInput } from "@/lib/content/project-schema";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireStaff(`/admin/work/${id}`);

  /* Mongoose throws a CastError on anything that is not 24 hex characters,
     which would surface as a 500 rather than a 404. */
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  const project = await findProjectById(id);
  if (!project) notFound();

  const initial: ProjectInput = {
    slug: project.slug,
    name: project.name,
    category: project.category ?? "",
    groups: project.groups ?? [],
    description: project.description,
    tags: project.tags ?? [],
    status: project.status as ProjectInput["status"],
    preview: (project.preview ?? "dashboard") as ProjectInput["preview"],
    liveUrl: project.liveUrl ?? "",
    repoUrl: project.repoUrl ?? "",
    media: project.media
      ? {
          type: (project.media.type ?? "image") as "image" | "video",
          publicId: project.media.publicId ?? "",
          src: project.media.src ?? "",
          alt: project.media.alt ?? "",
          poster: project.media.poster ?? "",
        }
      : null,
    featured: Boolean(project.featured),
    published: Boolean(project.published),
    sortOrder: project.sortOrder ?? 0,
    role: project.role ?? "",
    timeline: project.timeline ?? "",
    results: project.results ?? [],
    body: (project.body ?? []).map((section) => ({
      heading: section.heading,
      paragraphs: section.paragraphs ?? [],
    })),
  };

  const cloudName = storage.isConfigured ? storage.credentials.cloudName : "";

  return <ProjectEditor initial={initial} projectId={id} cloudName={cloudName} />;
}
