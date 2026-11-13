import "server-only";

import { database } from "@/lib/config/env";
import { battlePhase, normaliseBattle, type Battle, type BattlePhase } from "@/lib/academy/battles";
import { findBattleRecord, listBattleRecords } from "@/lib/repositories/academy.repository";

const ORDER: Record<BattlePhase, number> = { open: 0, voting: 1, upcoming: 2, judging: 3, finished: 4 };

const clean = (record: { slug: string; data: unknown }): Battle | null => {
  const result = normaliseBattle(record.data, record.slug);
  return "battle" in result ? result.battle : null;
};

/**
 * Every battle, the live ones first, then what's coming, then past ones
 * newest first. Drafts only for the admin.
 */
export async function getBattles({ drafts = false } = {}): Promise<Battle[]> {
  if (!database.isConfigured) return [];
  try {
    const now = new Date();
    return (await listBattleRecords())
      .map(clean)
      .filter((battle): battle is Battle => Boolean(battle) && (drafts || battle!.status === "published"))
      .sort((a, b) => ORDER[battlePhase(a, now)] - ORDER[battlePhase(b, now)] || (battlePhase(a, now) === "upcoming" ? Date.parse(a.startsAt) - Date.parse(b.startsAt) : Date.parse(b.voteBy) - Date.parse(a.voteBy)));
  } catch {
    return [];
  }
}

export async function getBattle(slug: string, { drafts = false } = {}): Promise<Battle | null> {
  if (!database.isConfigured) return null;
  try {
    const record = await findBattleRecord(slug);
    const battle = record ? clean(record) : null;
    return battle && (drafts || battle.status === "published") ? battle : null;
  } catch {
    return null;
  }
}

/** The battle to point people at right now: one taking entries, else one in voting. */
export async function getLiveBattle(): Promise<Battle | null> {
  const battles = await getBattles();
  return battles.find((battle) => ["open", "voting"].includes(battlePhase(battle))) ?? null;
}
