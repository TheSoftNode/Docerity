import { COURSE_LEVELS, type CourseLevel } from "@/lib/academy/types";
import { slugify } from "@/lib/academy/normalise";

/**
 * Build battles: a timed challenge everyone builds at once.
 *
 * A battle moves through its phases by the clock alone:
 *   upcoming → open (entries) → voting → judging (waiting on the admin) → finished
 * "finished" is the one phase a person sets: the admin confirms the results,
 * which awards the podium XP and fixes the order.
 *
 * Times are stored as ISO strings in UTC and shown, and typed in the admin,
 * in West Africa Time (UTC+1, no daylight saving).
 */

export type BattleResults = { first: string; second: string; third: string };

export type Battle = {
  slug: string;
  title: string;
  /** One line under the title. */
  tagline: string;
  /** The challenge in full (the same light Markdown as lesson notes). */
  brief: string;
  rules: string[];
  level: CourseLevel;
  startsAt: string;
  submitBy: string;
  voteBy: string;
  status: "draft" | "published";
  /** Entry ids in podium order, set when the admin confirms the results. */
  results: BattleResults | null;
  finishedAt: string | null;
};

export type BattlePhase = "upcoming" | "open" | "voting" | "judging" | "finished";

export const BATTLE_XP = { entry: 50, first: 500, second: 300, third: 150 } as const;
/** Upvotes each student can give in one battle: few enough that each one counts. */
export const VOTES_PER_BATTLE = 3;

export const PHASE_LABEL: Record<BattlePhase, string> = {
  upcoming: "Starts soon",
  open: "Open for entries",
  voting: "Voting",
  judging: "Results coming",
  finished: "Finished",
};

export function battlePhase(battle: Pick<Battle, "startsAt" | "submitBy" | "voteBy" | "results">, now: Date = new Date()): BattlePhase {
  if (battle.results) return "finished";
  const at = now.getTime();
  if (at < Date.parse(battle.startsAt)) return "upcoming";
  if (at < Date.parse(battle.submitBy)) return "open";
  if (at < Date.parse(battle.voteBy)) return "voting";
  return "judging";
}

/** The moment the current phase ends, or null when nothing is counting down. */
export function phaseEndsAt(battle: Battle, phase: BattlePhase = battlePhase(battle)): string | null {
  if (phase === "upcoming") return battle.startsAt;
  if (phase === "open") return battle.submitBy;
  if (phase === "voting") return battle.voteBy;
  return null;
}

/**
 * The top three by votes. A tie goes to whoever entered first; an entry with
 * no votes can still place, so a quiet battle still has a podium.
 */
export function podium(entries: { id: string; votes: number; submittedAt: Date | string }[]): string[] {
  const at = (value: Date | string) => new Date(value).getTime();
  return [...entries]
    .sort((a, b) => b.votes - a.votes || at(a.submittedAt) - at(b.submittedAt))
    .slice(0, 3)
    .map((entry) => entry.id);
}

/** "2d 4h", "3h 12m", "12m 05s": the most useful two units of a duration. */
export function timeLeft(ms: number): string {
  if (ms <= 0) return "0m 00s";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${String(s % 60).padStart(2, "0")}s`;
}

/* ── West Africa Time ───────────────────────────────────────────────────── */

const WAT_MS = 60 * 60 * 1000;

/** "2026-11-20T18:00" typed in West Africa Time → ISO in UTC, or "" if it isn't a time. */
export function fromWat(local: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local.trim());
  if (!match) return "";
  const [, y, mo, d, h, mi] = match.map(Number);
  const utc = Date.UTC(y, mo - 1, d, h, mi) - WAT_MS;
  return Number.isFinite(utc) ? new Date(utc).toISOString() : "";
}

/** ISO → "2026-11-20T18:00" in West Africa Time, for a datetime-local input. */
export function toWat(iso: string): string {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return "";
  return new Date(at + WAT_MS).toISOString().slice(0, 16);
}

/** "Fri 20 Nov, 6:00 pm" in West Africa Time. */
export function watLabel(iso: string): string {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(at);
}

/* ── Cleaning what the admin saves ──────────────────────────────────────── */

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const iso = (value: unknown) => {
  const at = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isFinite(at) ? new Date(at).toISOString() : "";
};

/**
 * A battle as the admin saved it, cleaned. Returns an error instead when the
 * battle could not run: no title, or times that are missing or out of order.
 */
export function normaliseBattle(raw: unknown, slug?: string): { battle: Battle } | { error: string } {
  const value = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const title = text(value.title, 120);
  if (!title) return { error: "Give the battle a title." };
  const startsAt = iso(value.startsAt);
  const submitBy = iso(value.submitBy);
  const voteBy = iso(value.voteBy);
  if (!startsAt || !submitBy || !voteBy) return { error: "Set when it starts, when entries close and when voting ends." };
  if (!(Date.parse(startsAt) < Date.parse(submitBy))) return { error: "Entries must close after the battle starts." };
  if (!(Date.parse(submitBy) < Date.parse(voteBy))) return { error: "Voting must end after entries close." };

  const results = value.results && typeof value.results === "object" ? (value.results as Record<string, unknown>) : null;
  const rules = (Array.isArray(value.rules) ? value.rules : typeof value.rules === "string" ? value.rules.split("\n") : [])
    .map((item) => text(item, 240))
    .filter(Boolean)
    .slice(0, 12);

  return {
    battle: {
      slug: slugify(slug || text(value.slug, 80) || title) || "battle",
      title,
      tagline: text(value.tagline, 200),
      brief: text(value.brief, 8000),
      rules,
      level: (COURSE_LEVELS as readonly string[]).includes(String(value.level)) ? (value.level as CourseLevel) : "Beginner",
      startsAt,
      submitBy,
      voteBy,
      status: value.status === "published" ? "published" : "draft",
      results: results ? { first: text(results.first, 40), second: text(results.second, 40), third: text(results.third, 40) } : null,
      finishedAt: iso(value.finishedAt) || null,
    },
  };
}

/** A new draft battle: a week of building from tomorrow at 6 pm, then three days of voting. */
export function draftBattle(title: string, now: Date = new Date()): Battle {
  const day = 24 * 60 * 60 * 1000;
  const tomorrow = toWat(new Date(now.getTime() + day).toISOString()).slice(0, 10);
  const start = Date.parse(fromWat(`${tomorrow}T18:00`));
  return {
    slug: slugify(title) || "battle",
    title,
    tagline: "",
    brief: "",
    rules: ["Build it on your own; libraries and tutorials are fine, copying a finished project is not.", "Hand in a public GitHub repo and a live link before entries close.", "You can update your entry until entries close."],
    level: "Beginner",
    startsAt: new Date(start).toISOString(),
    submitBy: new Date(start + 7 * day).toISOString(),
    voteBy: new Date(start + 10 * day).toISOString(),
    status: "draft",
    results: null,
    finishedAt: null,
  };
}
