import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireStaff } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { findClientProject } from "@/lib/repositories/client-project.repository";
import { accountStatusFor } from "@/lib/repositories/client-account.repository";
import { ClientProjectEditor, type EditorProject } from "@/components/admin/client-project-editor";

export const metadata: Metadata = { title: "Client project" };

/** A date as the date input wants it: "2026-11-05", or empty. */
const day = (value: Date | string | null | undefined) => (value ? new Date(value).toISOString().slice(0, 10) : "");

export default async function ClientProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStaff(`/admin/client-projects/${id}`);
  if (!database.isConfigured || !/^[a-f0-9]{24}$/i.test(id)) notFound();

  const project = await findClientProject(id);
  if (!project) notFound();

  /* Plain values only: the editor runs in the browser, which cannot take database documents. */
  const view: EditorProject = {
    id,
    title: project.title,
    clientEmail: project.clientEmail,
    clientName: project.clientName ?? "",
    summary: project.summary ?? "",
    status: project.status,
    startDate: day(project.startDate),
    targetDate: day(project.targetDate),
    nextStep: project.nextStep ?? "",
    links: (project.links ?? []).map((link: { label: string; url: string }) => ({ label: link.label, url: link.url })),
    archived: Boolean(project.archivedAt),
    milestones: (project.milestones ?? []).map((milestone: { _id: unknown; title: string; detail?: string; status: string; due?: Date | null }) => ({
      id: String(milestone._id),
      title: milestone.title,
      detail: milestone.detail ?? "",
      status: milestone.status,
      due: day(milestone.due),
    })),
    updates: (project.updates ?? []).map((update: { _id: unknown; kind: string; title: string; body?: string; link?: string; by?: string; createdAt: Date }) => ({
      id: String(update._id),
      kind: update.kind,
      title: update.title,
      body: update.body ?? "",
      link: update.link ?? "",
      by: update.by ?? "",
      createdAt: new Date(update.createdAt).toISOString(),
    })),
    account: await accountStatusFor(project.clientEmail),
  };

  return <ClientProjectEditor key={project.updatedAt ? new Date(project.updatedAt).getTime() : id} project={view} />;
}
