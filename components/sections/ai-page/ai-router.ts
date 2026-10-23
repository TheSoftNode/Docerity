/*
  The AI page's "try the router": an illustration of routing by difficulty.

  It is not the production router and calls no model. A handful of readable
  rules notice what a request needs, add up a score, and pick a tier, so a
  visitor can see the idea behind SmartLLMRouter with their own words. The
  page says as much beside the input. Pure, so it is tested without a browser
  (see e2e/ai-router.spec.ts).
*/

export type Signal = { label: string; weight: number };

type Rule = { pattern: RegExp; label: string; weight: number };

const RULES: readonly Rule[] = [
  { pattern: /\b(photo|image|picture|screenshot|logo|video|frame)s?\b/i, label: "Needs to see an image", weight: 2 },
  { pattern: /\b(write|draft|compose|post|caption|hooks?|campaign|story|tone)\b/i, label: "Writes something new", weight: 1 },
  { pattern: /\b(brand|our voice|style guide|on-brand)\b/i, label: "Has to match a brand voice", weight: 1 },
  { pattern: /\b(summari[sz]e|translate|rewrite|shorten|explain|compare)\b/i, label: "Transforms existing text", weight: 1 },
  {
    pattern: /\b(is this|spam|yes or no|tag|categor\w*|sentiment|opening hours|hours|price|in stock|detect|classify)\b/i,
    label: "Has a short, known answer",
    weight: -1,
  },
];

/** Past this many characters a request carries real context. */
export const LONG_REQUEST = 90;

export type Tier = {
  id: "complex" | "medium" | "simple";
  label: string;
  model: string;
  /** Cost of one call relative to the top model. */
  cost: number;
  why: string;
};

/** Strongest first, which is also the fallback order. */
export const TIERS: readonly Tier[] = [
  {
    id: "complex",
    label: "Complex",
    model: "GPT-4o",
    cost: 1,
    why: "It needs judgement a smaller model gets wrong, so it gets the strongest one. Worth paying for here, and only here.",
  },
  {
    id: "medium",
    label: "Medium",
    model: "Gemini",
    cost: 0.12,
    why: "Real language work, but nothing a mid-sized model cannot do well, at a fraction of the price.",
  },
  {
    id: "simple",
    label: "Simple",
    model: "Rule-based",
    cost: 0.005,
    why: "This was never a language problem. A rule answers it instantly, for almost nothing, with no model at all.",
  },
];

/** Requests a visitor can try with one tap, one for each tier and a couple more. */
export const EXAMPLES: readonly string[] = [
  "Describe this product photo for Instagram",
  "Is this comment spam?",
  "Summarise these 40 replies",
  "Draft a launch post in our brand voice",
  "What are your opening hours?",
];

export type Route = {
  signals: Signal[];
  score: number;
  /** Index into TIERS. */
  tier: number;
  /** Saving against sending this request to the top model, 0 to 1. */
  saving: number;
};

/** What a request needs, and so where it goes. */
export function route(request: string): Route {
  const text = request.trim();
  const signals: Signal[] = RULES.filter((rule) => rule.pattern.test(text)).map(({ label, weight }) => ({ label, weight }));
  if (text.length > LONG_REQUEST) signals.push({ label: "Long request, lots of context", weight: 1 });

  const score = signals.reduce((sum, signal) => sum + signal.weight, 0);
  const tier = score >= 2 ? 0 : score >= 1 ? 1 : 2;
  return { signals, score, tier, saving: 1 - TIERS[tier].cost };
}

/** A weight as the console shows it: "+2", "−1", "0". */
export function formatWeight(weight: number): string {
  if (weight > 0) return `+${weight}`;
  if (weight < 0) return `−${Math.abs(weight)}`;
  return "0";
}

/** A relative cost as a multiplier: "1.00×", "0.12×", "0.005×". */
export function formatCost(cost: number): string {
  return `${cost.toFixed(cost < 0.1 ? 3 : 2)}×`;
}
