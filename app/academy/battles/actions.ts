"use server";

import { revalidatePath } from "next/cache";

import { getCurrentAccount } from "@/lib/account/session";
import { safeHttps } from "@/lib/account/rules";
import { githubRepo } from "@/lib/academy/briefs";
import { BATTLE_XP, VOTES_PER_BATTLE, battlePhase } from "@/lib/academy/battles";
import { getBattle } from "@/lib/academy/battle-store";
import { awardXp, saveBattleEntry, toggleBattleVote } from "@/lib/repositories/academy.repository";
import { createLogger } from "@/lib/core/logger";

/**
 * A build battle from the student's side: enter (and update the entry while
 * entries are open), and vote while voting is open. The clock is checked on
 * the server, so a page left open past a deadline can't sneak one in.
 */

const logger = createLogger("academy.battles");

export type EntryState = {
  ok?: boolean;
  message?: string;
  xp?: number;
  errors?: { title?: string; repoUrl?: string; liveUrl?: string };
  values?: { title: string; repoUrl: string; liveUrl: string; note: string };
};

export async function enterBattleAction(_previous: EntryState, formData: FormData): Promise<EntryState> {
  const slug = String(formData.get("battle") ?? "");
  const values = {
    title: String(formData.get("title") ?? "").trim().slice(0, 120),
    repoUrl: String(formData.get("repoUrl") ?? "").trim().slice(0, 300),
    liveUrl: String(formData.get("liveUrl") ?? "").trim().slice(0, 500),
    note: String(formData.get("note") ?? "").trim().slice(0, 2000),
  };
  try {
    const account = await getCurrentAccount();
    if (!account?.verified) return { message: "Sign in with a confirmed account to enter.", values };
    const battle = await getBattle(slug);
    if (!battle) return { message: "That battle isn't running.", values };
    if (battlePhase(battle) !== "open") return { message: "Entries for this battle are closed.", values };

    const repo = githubRepo(values.repoUrl);
    const live = safeHttps(values.liveUrl);
    const errors: EntryState["errors"] = {};
    if (!values.title) errors.title = "Give your entry a name.";
    if (!repo) errors.repoUrl = "A public GitHub repository, like https://github.com/you/project.";
    if (!live) errors.liveUrl = "The live site's address, starting with https://.";
    if (errors.title || errors.repoUrl || errors.liveUrl) return { errors, values };

    const clean = { ...values, repoUrl: repo, liveUrl: live };
    const { created } = await saveBattleEntry(battle.slug, account.id, clean);
    const xp = created ? await awardXp(account.id, "battle-entry", battle.slug, BATTLE_XP.entry) : 0;
    revalidatePath(`/academy/battles/${battle.slug}`);
    return {
      ok: true,
      xp,
      message: created ? "You're in. You can change your entry until entries close." : "Entry updated.",
      values: clean,
    };
  } catch (error) {
    logger.error("enter battle failed", error);
    return { message: "That didn't send. Try again in a moment.", values };
  }
}

export async function battleVoteAction(slug: string, entryId: string): Promise<{ ok: boolean; votes?: number; voted?: boolean; message?: string }> {
  try {
    const account = await getCurrentAccount();
    if (!account?.verified) return { ok: false, message: "Sign in to vote." };
    const battle = await getBattle(slug);
    if (!battle || battlePhase(battle) !== "voting") return { ok: false, message: "Voting is closed." };
    const result = await toggleBattleVote(battle.slug, entryId, account.id, VOTES_PER_BATTLE);
    if ("refused" in result) {
      return {
        ok: false,
        message: result.refused === "own" ? "That's your own entry." : result.refused === "cap" ? `You've used all ${VOTES_PER_BATTLE} votes. Take one back to move it.` : "That entry isn't in the battle.",
      };
    }
    revalidatePath(`/academy/battles/${battle.slug}`);
    return { ok: true, ...result };
  } catch (error) {
    logger.error("battle vote failed", error);
    return { ok: false, message: "That didn't count. Try again." };
  }
}
