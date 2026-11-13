"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentAccount } from "@/lib/account/session";
import { safeHttps } from "@/lib/account/rules";
import { githubRepo } from "@/lib/academy/briefs";
import { getBrief } from "@/lib/academy/pool";
import { findBuild, startBuild, submitBuild, toggleVote, touchStreak } from "@/lib/repositories/academy.repository";
import { createLogger } from "@/lib/core/logger";

/**
 * The project pool, from the student's side: take a brief, hand in the
 * build, upvote others in the showcase. Each action checks the account on
 * the server.
 */

const logger = createLogger("academy.projects");

export async function startBuildAction(formData: FormData): Promise<void> {
  const briefId = String(formData.get("briefId") ?? "");
  const account = await getCurrentAccount();
  if (!account) redirect(`/account/login?next=${encodeURIComponent(`/academy/projects/${briefId}`)}`);
  if (!account.verified) redirect("/account");
  const brief = await getBrief(briefId);
  if (!brief) redirect("/academy/projects");
  await startBuild(account.id, brief.id);
  await touchStreak(account.id);
  revalidatePath(`/academy/projects/${brief.id}`);
  revalidatePath("/academy/projects");
  redirect(`/academy/projects/${brief.id}#hand-in`);
}

export type SubmitState = {
  ok?: boolean;
  message?: string;
  errors?: { repoUrl?: string; liveUrl?: string };
  values?: { repoUrl: string; liveUrl: string; note: string };
};

export async function submitBuildAction(_previous: SubmitState, formData: FormData): Promise<SubmitState> {
  const briefId = String(formData.get("briefId") ?? "");
  const values = {
    repoUrl: String(formData.get("repoUrl") ?? "").trim().slice(0, 300),
    liveUrl: String(formData.get("liveUrl") ?? "").trim().slice(0, 500),
    note: String(formData.get("note") ?? "").trim().slice(0, 2000),
  };
  try {
    const account = await getCurrentAccount();
    if (!account?.verified) return { message: "Sign in with a confirmed account to hand in a build.", values };
    const brief = await getBrief(briefId);
    if (!brief) return { message: "That project isn't in the pool any more.", values };
    const build = await findBuild(account.id, brief.id);
    if (!build) return { message: "Start the project first.", values };
    if (build.status === "approved") return { message: "This build is already approved.", values };

    const repo = githubRepo(values.repoUrl);
    const live = safeHttps(values.liveUrl);
    const errors: SubmitState["errors"] = {};
    if (!repo) errors.repoUrl = "A public GitHub repository, like https://github.com/you/project.";
    if (!live) errors.liveUrl = "The live site's address, starting with https://.";
    if (errors.repoUrl || errors.liveUrl) return { errors, values };

    await submitBuild(account.id, brief.id, { repoUrl: repo, liveUrl: live, note: values.note });
    await touchStreak(account.id);
    revalidatePath(`/academy/projects/${brief.id}`);
    return { ok: true, message: "Handed in. We'll review it and you'll see the result here.", values: { repoUrl: repo, liveUrl: live, note: values.note } };
  } catch (error) {
    logger.error("submit build failed", error);
    return { message: "That didn't send. Try again in a moment.", values };
  }
}

export async function voteAction(buildId: string): Promise<{ ok: boolean; votes?: number; voted?: boolean; message?: string }> {
  try {
    const account = await getCurrentAccount();
    if (!account?.verified) return { ok: false, message: "Sign in to upvote." };
    const result = await toggleVote(buildId, account.id);
    if (!result) return { ok: false, message: "You can't upvote your own build." };
    revalidatePath("/academy/showcase");
    return { ok: true, ...result };
  } catch (error) {
    logger.error("vote failed", error);
    return { ok: false, message: "That didn't count. Try again." };
  }
}
