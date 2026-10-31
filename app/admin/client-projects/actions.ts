"use server";

import { revalidatePath } from "next/cache";

import { requireStaffOrThrow } from "@/lib/auth/dal";
import { MILESTONE_STATUS_LABELS, PROJECT_STATUS_LABELS, UPDATE_KIND_LABELS, safeHttps, type MilestoneStatus, type ProjectStatus, type UpdateKind } from "@/lib/account/rules";
import {
  addProjectUpdate,
  addTeamReply,
  createClientProject,
  deleteClientProject,
  removeProjectUpdate,
  saveClientProject,
  saveMilestones,
  setProjectArchived,
  type ProjectInput,
} from "@/lib/repositories/client-project.repository";
import { sendMail } from "@/lib/email/mailer";
import { renderProjectUpdate, renderTeamReply } from "@/lib/email/templates/account";
import { runtime } from "@/lib/config/env";
import { isAppError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";

/**
 * Managing the projects clients follow in their accounts. Staff only, checked
 * in every action: a Server Action is a POST anybody can send, whatever the
 * page that shows its button.
 */

const logger = createLogger("admin.client-projects");

export type Result = { ok: true; id?: string } | { ok: false; message: string };

export type ProjectFields = {
  title: string;
  clientEmail: string;
  clientName: string;
  summary: string;
  status: string;
  startDate: string;
  targetDate: string;
  nextStep: string;
  links: { label: string; url: string }[];
};

export type MilestoneFields = { id?: string; title: string; detail: string; status: string; due: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Checks and tidies the project's fields, or says what is wrong in words. */
function clean(fields: ProjectFields): ProjectInput | string {
  const title = fields.title.trim();
  const clientEmail = fields.clientEmail.trim().toLowerCase();
  if (title.length < 2 || title.length > 140) return "Give the project a name, under 140 characters.";
  if (!EMAIL.test(clientEmail)) return "Enter the client's email address. It is how the project finds them.";
  if (!(fields.status in PROJECT_STATUS_LABELS)) return "Pick a status.";
  const links = fields.links
    .map((link) => ({ label: link.label.trim().slice(0, 80), url: safeHttps(link.url) }))
    .filter((link) => link.label && link.url)
    .slice(0, 12);
  return {
    title,
    clientEmail,
    clientName: fields.clientName.trim().slice(0, 120),
    summary: fields.summary.trim().slice(0, 1200),
    status: fields.status as ProjectStatus,
    startDate: toDate(fields.startDate),
    targetDate: toDate(fields.targetDate),
    nextStep: fields.nextStep.trim().slice(0, 300),
    links,
  };
}

function fail(error: unknown, what: string): Result {
  if (isAppError(error)) return { ok: false, message: error.publicMessage };
  logger.error(`${what} failed`, error);
  return { ok: false, message: "That did not work. Please try again." };
}

function refresh(id?: string) {
  revalidatePath("/admin/client-projects");
  if (id) revalidatePath(`/admin/client-projects/${id}`);
  revalidatePath("/account", "layout");
}

export async function createProjectAction(fields: ProjectFields): Promise<Result> {
  try {
    await requireStaffOrThrow();
    const input = clean(fields);
    if (typeof input === "string") return { ok: false, message: input };
    const id = await createClientProject(input);
    refresh(id);
    return { ok: true, id };
  } catch (error) {
    return fail(error, "creating a client project");
  }
}

export async function saveProjectAction(id: string, fields: ProjectFields): Promise<Result> {
  try {
    await requireStaffOrThrow();
    const input = clean(fields);
    if (typeof input === "string") return { ok: false, message: input };
    if (!(await saveClientProject(id, input))) return { ok: false, message: "That project no longer exists." };
    refresh(id);
    return { ok: true };
  } catch (error) {
    return fail(error, "saving a client project");
  }
}

export async function saveMilestonesAction(id: string, milestones: MilestoneFields[]): Promise<Result> {
  try {
    await requireStaffOrThrow();
    if (milestones.length > 30) return { ok: false, message: "Thirty milestones at most." };
    const clean = [];
    for (const milestone of milestones) {
      const title = milestone.title.trim();
      if (!title) return { ok: false, message: "Every milestone needs a name." };
      if (!(milestone.status in MILESTONE_STATUS_LABELS)) return { ok: false, message: "Pick a status for every milestone." };
      clean.push({ id: milestone.id, title: title.slice(0, 120), detail: milestone.detail.trim().slice(0, 600), status: milestone.status as MilestoneStatus, due: toDate(milestone.due) });
    }
    if (!(await saveMilestones(id, clean))) return { ok: false, message: "That project no longer exists." };
    refresh(id);
    return { ok: true };
  } catch (error) {
    return fail(error, "saving milestones");
  }
}

export async function postUpdateAction(
  id: string,
  update: { kind: string; title: string; body: string; link: string; notify: boolean }
): Promise<Result & { emailed?: boolean }> {
  try {
    const user = await requireStaffOrThrow();
    const title = update.title.trim();
    if (!title) return { ok: false, message: "Give the update a headline." };
    if (!(update.kind in UPDATE_KIND_LABELS)) return { ok: false, message: "Pick what kind of update it is." };
    if (update.link.trim() && !safeHttps(update.link)) return { ok: false, message: "Links must start with https://." };

    const project = await addProjectUpdate(id, {
      kind: update.kind as UpdateKind,
      title: title.slice(0, 160),
      body: update.body.trim().slice(0, 6000),
      link: safeHttps(update.link),
      by: user.name.split(" ")[0],
    });
    if (!project) return { ok: false, message: "That project no longer exists." };

    let emailed = false;
    if (update.notify) {
      /* To the project's own address only: the same one their account is matched by. */
      const mail = renderProjectUpdate({
        name: project.clientName || "there",
        project: project.title,
        kind: UPDATE_KIND_LABELS[update.kind as keyof typeof UPDATE_KIND_LABELS],
        title,
        body: update.body.trim(),
        url: `${runtime.siteUrl.replace(/\/$/, "")}/account/projects/${id}`,
      });
      const delivery = await sendMail({ to: project.clientEmail, subject: mail.subject, html: mail.html, text: mail.text });
      emailed = delivery.ok;
      if (!delivery.ok) logger.error("project update email failed", new Error(delivery.error), { projectId: id });
    }

    refresh(id);
    return { ok: true, emailed };
  } catch (error) {
    return fail(error, "posting an update");
  }
}

export async function removeUpdateAction(id: string, updateId: string): Promise<Result> {
  try {
    await requireStaffOrThrow();
    await removeProjectUpdate(id, updateId);
    refresh(id);
    return { ok: true };
  } catch (error) {
    return fail(error, "removing an update");
  }
}

export async function archiveProjectAction(id: string, archived: boolean): Promise<Result> {
  try {
    await requireStaffOrThrow();
    await setProjectArchived(id, archived);
    refresh(id);
    return { ok: true };
  } catch (error) {
    return fail(error, "archiving a project");
  }
}

export async function deleteProjectAction(id: string): Promise<Result> {
  try {
    await requireStaffOrThrow();
    await deleteClientProject(id);
    refresh();
    return { ok: true };
  } catch (error) {
    return fail(error, "deleting a project");
  }
}

/** The team's answer under an update, emailed to the client unless unticked. */
export async function replyAsTeamAction(id: string, updateId: string, body: string, notify: boolean): Promise<Result & { emailed?: boolean }> {
  try {
    const user = await requireStaffOrThrow();
    const text = body.trim();
    if (!text) return { ok: false, message: "Write a reply first." };
    if (text.length > 4000) return { ok: false, message: "Keep it under 4,000 characters." };

    const project = await addTeamReply(id, updateId, { name: user.name.split(" ")[0], body: text });
    if (!project) return { ok: false, message: "That update is no longer there." };

    let emailed = false;
    if (notify) {
      const update = (project.updates ?? []).find((item) => String(item._id) === updateId);
      const mail = renderTeamReply({
        name: project.clientName || "there",
        project: project.title,
        update: update?.title ?? "your project",
        body: text,
        url: `${runtime.siteUrl.replace(/\/$/, "")}/account/projects/${id}`,
      });
      const delivery = await sendMail({ to: project.clientEmail, subject: mail.subject, html: mail.html, text: mail.text });
      emailed = delivery.ok;
      if (!delivery.ok) logger.error("team reply email failed", new Error(delivery.error), { projectId: id });
    }

    refresh(id);
    return { ok: true, emailed };
  } catch (error) {
    return fail(error, "replying on an update");
  }
}
