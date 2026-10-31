import { connectDB } from "@/lib/db/connect";
import { ClientProjectModel } from "@/lib/db/models/client-project.model";
import type { MilestoneStatus, ProjectStatus, UpdateKind } from "@/lib/account/rules";

const normalise = (email: string) => email.trim().toLowerCase();

export type MilestoneInput = { id?: string; title: string; detail: string; status: MilestoneStatus; due: Date | null };
export type ProjectInput = {
  title: string;
  clientEmail: string;
  clientName: string;
  summary: string;
  status: ProjectStatus;
  startDate: Date | null;
  targetDate: Date | null;
  nextStep: string;
  links: { label: string; url: string }[];
};

/* ── Staff ────────────────────────────────────────────────────────────── */

export async function listClientProjects(options: { archived?: boolean } = {}) {
  await connectDB();
  return ClientProjectModel.find({ archivedAt: options.archived ? { $ne: null } : null })
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean();
}

export async function findClientProject(id: string) {
  await connectDB();
  return ClientProjectModel.findById(id).lean();
}

export async function createClientProject(input: ProjectInput) {
  await connectDB();
  const created = await ClientProjectModel.create({ ...input, clientEmail: normalise(input.clientEmail) });
  return String(created._id);
}

export async function saveClientProject(id: string, input: ProjectInput) {
  await connectDB();
  const result = await ClientProjectModel.updateOne({ _id: id }, { $set: { ...input, clientEmail: normalise(input.clientEmail) } });
  return result.matchedCount > 0;
}

/**
 * Replaces the milestone list, keeping each one's id and finish date when it
 * is still there, and stamping a finish date on any that have just been
 * marked done.
 */
export async function saveMilestones(id: string, milestones: MilestoneInput[]) {
  await connectDB();
  const project = await ClientProjectModel.findById(id).select("milestones").lean();
  if (!project) return false;
  const before = new Map(project.milestones.map((milestone) => [String(milestone._id), milestone] as const));
  const now = new Date();
  const next = milestones.map((milestone) => {
    const previous = milestone.id ? before.get(milestone.id) : undefined;
    return {
      ...(previous ? { _id: previous._id } : {}),
      title: milestone.title,
      detail: milestone.detail,
      status: milestone.status,
      due: milestone.due,
      doneAt: milestone.status === "done" ? (previous?.doneAt ?? now) : null,
    };
  });
  await ClientProjectModel.updateOne({ _id: id }, { $set: { milestones: next } });
  return true;
}

export async function addProjectUpdate(id: string, update: { kind: UpdateKind; title: string; body: string; link: string; by: string }) {
  await connectDB();
  const result = await ClientProjectModel.findOneAndUpdate(
    { _id: id },
    { $push: { updates: { $each: [{ ...update, createdAt: new Date() }], $position: 0 } } },
    { new: true, projection: "title clientEmail clientName" }
  ).lean();
  return result;
}

export async function removeProjectUpdate(id: string, updateId: string) {
  await connectDB();
  const result = await ClientProjectModel.updateOne({ _id: id }, { $pull: { updates: { _id: updateId } } });
  return result.modifiedCount > 0;
}

export async function setProjectArchived(id: string, archived: boolean) {
  await connectDB();
  await ClientProjectModel.updateOne({ _id: id }, { $set: { archivedAt: archived ? new Date() : null } });
}

export async function deleteClientProject(id: string) {
  await connectDB();
  const result = await ClientProjectModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

/* ── Clients ──────────────────────────────────────────────────────────── */

/** A client's projects, newest activity first. Only ever called with a verified address. */
export async function listProjectsForEmail(email: string) {
  await connectDB();
  return ClientProjectModel.find({ clientEmail: normalise(email), archivedAt: null }).sort({ updatedAt: -1 }).lean();
}

/**
 * One project, only if it belongs to this address. The address is part of the
 * query rather than checked after, so a guessed id belonging to somebody else
 * is simply not found.
 */
export async function findProjectForEmail(id: string, email: string) {
  await connectDB();
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  return ClientProjectModel.findOne({ _id: id, clientEmail: normalise(email), archivedAt: null }).lean();
}
