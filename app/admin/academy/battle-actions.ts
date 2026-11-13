"use server";

import { revalidatePath } from "next/cache";

import { requireStaffOrThrow } from "@/lib/auth/dal";
import { BATTLE_XP, battlePhase, draftBattle, normaliseBattle, podium } from "@/lib/academy/battles";
import { slugify } from "@/lib/academy/normalise";
import { getBattle } from "@/lib/academy/battle-store";
import {
  awardXp,
  deleteBattleRecord,
  findBattleRecord,
  listBattleEntries,
  saveBattleRecord,
  setBattleEntryHidden,
} from "@/lib/repositories/academy.repository";
import { createLogger } from "@/lib/core/logger";

/**
 * Running build battles: create, edit, take out an entry, delete, and
 * confirm the results. Staff only, checked in every action.
 */

const logger = createLogger("admin.battles");

export type BattleResult = { ok: true; slug?: string } | { ok: false; message: string };

const refresh = (slug: string) => {
  revalidatePath("/academy/battles");
  revalidatePath(`/academy/battles/${slug}`);
  revalidatePath("/academy");
  revalidatePath("/admin/academy/battles");
  revalidatePath(`/admin/academy/battles/${slug}`);
};

export async function createBattleAction(title: string): Promise<BattleResult> {
  try {
    const user = await requireStaffOrThrow();
    const slug = slugify(title.trim());
    if (!slug) return { ok: false, message: "Give the battle a title." };
    if (await findBattleRecord(slug)) return { ok: false, message: "A battle with that name already exists." };
    await saveBattleRecord(slug, draftBattle(title.trim().slice(0, 120)), user.email);
    refresh(slug);
    return { ok: true, slug };
  } catch (error) {
    logger.error("create battle failed", error);
    return { ok: false, message: "The battle couldn't be created." };
  }
}

export async function saveBattleAction(slug: string, draft: unknown): Promise<BattleResult> {
  try {
    const user = await requireStaffOrThrow();
    const stored = await findBattleRecord(slug);
    if (!stored) return { ok: false, message: "That battle doesn't exist any more." };
    const result = normaliseBattle({ ...(draft as object), results: (stored.data as { results?: unknown }).results ?? null, finishedAt: (stored.data as { finishedAt?: unknown }).finishedAt ?? null }, slug);
    if ("error" in result) return { ok: false, message: result.error };
    await saveBattleRecord(slug, result.battle, user.email);
    refresh(slug);
    return { ok: true, slug };
  } catch (error) {
    logger.error("save battle failed", error);
    return { ok: false, message: "The battle didn't save. Try again." };
  }
}

export async function deleteBattleAction(slug: string): Promise<BattleResult> {
  try {
    await requireStaffOrThrow();
    const battle = await getBattle(slug, { drafts: true });
    if (battle?.results) return { ok: false, message: "A finished battle keeps its results; unpublish it instead." };
    await deleteBattleRecord(slug);
    refresh(slug);
    return { ok: true };
  } catch (error) {
    logger.error("delete battle failed", error);
    return { ok: false, message: "The battle couldn't be deleted." };
  }
}

export async function hideEntryAction(entryId: string, hidden: boolean): Promise<BattleResult> {
  try {
    await requireStaffOrThrow();
    const entry = await setBattleEntryHidden(entryId, hidden);
    if (!entry) return { ok: false, message: "That entry doesn't exist." };
    const battle = await getBattle(entry.battleSlug, { drafts: true });
    if (battle?.results) {
      await setBattleEntryHidden(entryId, !hidden);
      return { ok: false, message: "The results are confirmed; entries can't change now." };
    }
    refresh(entry.battleSlug);
    return { ok: true };
  } catch (error) {
    logger.error("hide entry failed", error);
    return { ok: false, message: "That didn't save. Try again." };
  }
}

/**
 * Confirms the podium once voting has ended: the top three by votes (ties to
 * the earliest entry), from the entries still in. Awards the podium XP once
 * and fixes the order for good.
 */
export async function finaliseBattleAction(slug: string): Promise<BattleResult> {
  try {
    const user = await requireStaffOrThrow();
    const battle = await getBattle(slug, { drafts: true });
    if (!battle) return { ok: false, message: "That battle doesn't exist." };
    if (battle.results) return { ok: false, message: "The results are already confirmed." };
    if (battlePhase(battle) !== "judging") return { ok: false, message: "Results can be confirmed once voting has ended." };

    const entries = await listBattleEntries(slug);
    if (!entries.length) return { ok: false, message: "No entries to place." };
    const [first = "", second = "", third = ""] = podium(entries.map((entry) => ({ id: String(entry._id), votes: entry.votes, submittedAt: entry.submittedAt })));
    const byId = new Map(entries.map((entry) => [String(entry._id), entry] as const));

    await saveBattleRecord(slug, { ...battle, results: { first, second, third }, finishedAt: new Date().toISOString() }, user.email);
    const prizes = [
      [first, "battle-win", BATTLE_XP.first],
      [second, "battle-podium", BATTLE_XP.second],
      [third, "battle-podium", BATTLE_XP.third],
    ] as const;
    for (const [id, kind, xp] of prizes) {
      const entry = id ? byId.get(id) : undefined;
      if (entry) await awardXp(String(entry.accountId), kind, slug, xp);
    }
    refresh(slug);
    return { ok: true };
  } catch (error) {
    logger.error("finalise battle failed", error);
    return { ok: false, message: "The results didn't save. Try again." };
  }
}
