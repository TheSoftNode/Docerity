import type { EngagementView } from "@/lib/content/blocks/views";

/*
  The How we work page's small rules, kept apart from the components so they
  can be tested without a page.
*/

/** "Review & planning" → "review-planning": the id a card links down to. */
export function engagementId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "option";
}

/**
 * The options the page can actually show. One saved without a name is left
 * out rather than shown as an empty card; blank steps are dropped; and two
 * with the same name get distinct ids, so each card still links to its own
 * description.
 */
export function usableEngagements(raw: readonly Partial<EngagementView>[]): (EngagementView & { id: string })[] {
  const seen = new Map<string, number>();
  return raw
    .filter((item) => item.title?.trim())
    .map((item) => {
      const title = item.title!.trim();
      const base = engagementId(title);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      return {
        title,
        forWho: item.forWho?.trim() ?? "",
        goodFor: item.goodFor?.trim() ?? "",
        steps: (item.steps ?? []).map((step) => step.trim()).filter(Boolean),
        id: count === 0 ? base : `${base}-${count + 1}`,
      };
    });
}
