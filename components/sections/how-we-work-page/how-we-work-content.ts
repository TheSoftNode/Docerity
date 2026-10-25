import type { EngagementView } from "@/lib/content/blocks/views";

/*
  The How we work page's small rules, kept apart from the components so they
  can be tested without a page.
*/

/** "Discovery & audit" → "discovery-audit": the id a row is linked by. */
export function engagementId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "engagement";
}

/**
 * The engagements the page can actually show. One saved without a name or a
 * need cannot finish the hero's sentence, so it is left out rather than shown
 * half-made; blank steps are dropped, and two with the same name get distinct
 * ids so each row's link still lands on that row.
 */
export function usableEngagements(raw: readonly Partial<EngagementView>[]): (EngagementView & { id: string })[] {
  const seen = new Map<string, number>();
  return raw
    .filter((item) => item.title?.trim() && item.need?.trim())
    .map((item) => {
      const title = item.title!.trim();
      const base = engagementId(title);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return {
        title,
        need: item.need!.trim(),
        choice: item.choice?.trim() || title,
        summary: item.summary?.trim() ?? "",
        bestWhen: item.bestWhen?.trim() ?? "",
        steps: (item.steps ?? []).map((step) => step.trim()).filter(Boolean),
        id: count === 0 ? base : `${base}-${count + 1}`,
      };
    });
}

/** "a" or "an" before the engagement's name, so the hero reads "That's an audit". */
export function withArticle(answer: string, title: string): string {
  const trimmed = answer.trim();
  if (!/\ban?$/i.test(trimmed)) return trimmed;
  const article = /^[aeiou]/i.test(title.trim()) ? "an" : "a";
  return trimmed.replace(/\ban?$/i, (match) => (match[0] === "A" ? article[0].toUpperCase() + article.slice(1) : article));
}
