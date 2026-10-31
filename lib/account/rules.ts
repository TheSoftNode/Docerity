/*
  The client portal's rules, kept free of the server and the database so they
  can be tested on their own and shared by the admin and the portal.
*/

export type ProjectStatus = "planning" | "in-progress" | "review" | "paused" | "done";
export type MilestoneStatus = "todo" | "doing" | "done";
export type UpdateKind = "update" | "milestone" | "preview" | "question";

/** What each project status is called, to a client. */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  "in-progress": "In progress",
  review: "With you for review",
  paused: "Paused",
  done: "Delivered",
};

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  todo: "Not started",
  doing: "In progress",
  done: "Done",
};

export const UPDATE_KIND_LABELS: Record<UpdateKind, string> = {
  update: "Update",
  milestone: "Milestone reached",
  preview: "Something to try",
  question: "Needs your input",
};

/**
 * How far along a project is, from its milestones: each finished one counts
 * in full and each one being worked on counts for half. A delivered project
 * is 100 whatever its milestones say; one with no milestones is 0 until it is.
 */
export function projectProgress(milestones: readonly { status: MilestoneStatus | string }[], status?: ProjectStatus | string): number {
  if (status === "done") return 100;
  if (milestones.length === 0) return 0;
  const score = milestones.reduce((sum, milestone) => sum + (milestone.status === "done" ? 1 : milestone.status === "doing" ? 0.5 : 0), 0);
  return Math.round((score / milestones.length) * 100);
}

/** The milestone being worked on now: the first in progress, else the first not started. */
export function currentMilestoneIndex(milestones: readonly { status: MilestoneStatus | string }[]): number {
  const doing = milestones.findIndex((milestone) => milestone.status === "doing");
  if (doing >= 0) return doing;
  return milestones.findIndex((milestone) => milestone.status !== "done");
}

/** What an enquiry's status means to the person who sent it. Spam is never shown to them. */
export function requestStatusLabel(status: string): string | null {
  switch (status) {
    case "new":
      return "Received";
    case "read":
      return "Being looked at";
    case "replied":
      return "We've replied";
    case "archived":
      return "Closed";
    default:
      return null;
  }
}

export const ACCOUNT_PASSWORD_MIN = 10;

/** Checks a sign-up before anything is stored. Returns field messages, empty when it is fine. */
export function validateSignup(input: { name: string; email: string; password: string }): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = input.name.trim();
  const email = input.email.trim();
  if (name.length < 2) errors.name = "Tell us your name.";
  else if (name.length > 120) errors.name = "Keep it under 120 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) errors.email = "Enter a valid email address.";
  if (input.password.length < ACCOUNT_PASSWORD_MIN) errors.password = `Use at least ${ACCOUNT_PASSWORD_MIN} characters.`;
  else if (input.password.length > 200) errors.password = "Keep it under 200 characters.";
  return errors;
}

/** Only https links are ever shown to a client; anything else becomes nothing. */
export function safeHttps(value: string | undefined | null): string {
  const text = (value ?? "").trim();
  if (!text) return "";
  try {
    return new URL(text).protocol === "https:" ? text : "";
  } catch {
    return "";
  }
}

/** A request's place on its way, 0 to 2 (received, looked at, replied); closed counts as the end. */
export function requestStep(status: string): number {
  if (status === "read") return 1;
  if (status === "replied" || status === "archived") return 2;
  return 0;
}

/**
 * How many things on a client's projects are waiting on them: a project sent
 * to them for review, and every "needs your input" update they have not
 * answered yet.
 */
export function waitingOnClient(projects: readonly { status: string; updates: readonly { kind: string; replies?: readonly { from: string }[] }[] }[]): number {
  return projects.reduce((count, project) => {
    const review = project.status === "review" ? 1 : 0;
    const questions = project.updates.filter((update) => update.kind === "question" && !(update.replies ?? []).some((reply) => reply.from === "client")).length;
    return count + review + questions;
  }, 0);
}
