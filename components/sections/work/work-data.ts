import type { Media } from "@/components/shared/media-placeholder";

type CaseStudySection = {
  heading: string;
  paragraphs: string[];
  media?: Media;
};

export const projects = [
  {
    index: "01",
    slug: "ledger",
    name: "Ledger",
    category: "Fintech · Dashboard",
    description:
      "A real-time finance dashboard rebuilt from the ground up for a team drowning in spreadsheet exports.",
    tags: ["Next.js", "TypeScript", "Postgres"],
    metric: "40% faster close",
    preview: "dashboard",
    role: "Full-stack engineer",
    timeline: "9 weeks",
    results: [
      "40% faster month-end close",
      "Reconciliation errors caught same-day instead of at month-end",
      "Leadership gets a live view instead of a weekly export",
    ],
    body: [
      {
        heading: "The problem",
        paragraphs: [
          "The finance team's month-end close ran on a chain of spreadsheet exports: pull data from the accounting system, paste it into a workbook, cross-check it against three other workbooks, and hope nobody's version was stale. Reconciliation errors weren't caught until close — sometimes days later — by which point tracing the source meant reopening every export in the chain.",
          "Leadership's only view into the numbers was whatever the last export said, which meant every strategic conversation was working from data that was, at best, a few days old.",
        ],
        media: {
          type: "image",
          alt: "Screenshot of the original spreadsheet-based close process",
          caption: "The old process: a chain of exports, each one a potential point of drift.",
        },
      },
      {
        heading: "The approach",
        paragraphs: [
          "Instead of exporting data out of the accounting system, we built a dashboard that reads from it directly — a live sync layer that pulls transactions, categorizes them against the existing chart of accounts, and flags discrepancies as they appear rather than at month-end.",
          "The close workflow itself became a checklist inside the dashboard: each reconciliation step shows its current state, who last touched it, and whether the underlying numbers have changed since. Nobody has to ask \"is this the latest version\" again, because there's only ever one version.",
        ],
      },
      {
        heading: "The result",
        paragraphs: [
          "Close went from a multi-day scramble to a same-day checklist. Discrepancies get caught as they happen instead of surfacing weeks later buried in a spreadsheet, and leadership can look at the dashboard for a real-time number instead of waiting for the next export.",
        ],
      },
    ] satisfies CaseStudySection[],
  },
  {
    index: "02",
    slug: "northwind",
    name: "Northwind",
    category: "Commerce · Platform",
    description:
      "A headless commerce platform that unified three regional storefronts into one system without downtime.",
    tags: ["Node.js", "GraphQL", "Redis"],
    metric: "3x checkout throughput",
    preview: "grid",
    role: "Backend architect",
    timeline: "4 months",
    results: [
      "3x checkout throughput during peak sales events",
      "One inventory system instead of three regional copies",
      "Zero downtime across the entire migration",
    ],
    body: [
      {
        heading: "The problem",
        paragraphs: [
          "Three regional storefronts had grown up independently, each with its own inventory database, its own checkout flow, and its own quirks. A single SKU could show different stock levels in two regions at once, and during peak sales events, checkout would buckle under load that any one storefront's original architecture was never built to share.",
        ],
      },
      {
        heading: "The approach",
        paragraphs: [
          "We built a headless commerce layer behind all three storefronts: one product catalog, one inventory service, one checkout API, with each regional frontend calling into it instead of maintaining its own copy of the truth. The migration ran region by region, with the old and new systems reading from the same inventory source during the transition, so a region could cut over without ever showing a customer stale stock.",
        ],
        media: {
          type: "video",
          caption: "Walkthrough of the phased cutover for the second region.",
        },
      },
      {
        heading: "The result",
        paragraphs: [
          "Checkout throughput tripled during the next major sales event, handled by infrastructure that scales as one system instead of three uncoordinated ones. Inventory discrepancies between regions — previously a recurring support ticket — stopped being possible, since there's now exactly one number to ask.",
        ],
      },
    ] satisfies CaseStudySection[],
  },
  {
    index: "03",
    slug: "fieldnote",
    name: "Fieldnote",
    category: "Mobile · CRM",
    description:
      "A mobile-first CRM for field teams working offline-first in low-connectivity environments.",
    tags: ["React Native", "SQLite", "Sync"],
    metric: "Shipped in 6 weeks",
    preview: "list",
    role: "Mobile engineer",
    timeline: "6 weeks",
    results: [
      "Shipped end to end in 6 weeks",
      "Field teams work fully offline, no lost visit notes",
      "Sync conflicts resolved automatically instead of manually",
    ],
    body: [
      {
        heading: "The problem",
        paragraphs: [
          "Field reps visiting sites with little or no signal were falling back to paper notes, then re-entering everything once they got back to an office with Wi-Fi — assuming they remembered to, and assuming nothing got lost in the meantime. The existing CRM simply didn't function without a live connection.",
        ],
      },
      {
        heading: "The approach",
        paragraphs: [
          "Fieldnote was built offline-first from the data layer up: every action — a note, a status update, a photo — writes to a local SQLite store immediately, whether or not there's a connection. A sync layer reconciles that local store with the server whenever a connection appears, and resolves the conflicts that come from two reps editing the same record while both were offline, instead of just picking a winner and silently discarding the other change.",
        ],
        media: {
          type: "image",
          alt: "Screenshot of the offline sync status indicator in the field app",
          caption: "The sync indicator: reps always know what's saved locally versus confirmed on the server.",
        },
      },
      {
        heading: "The result",
        paragraphs: [
          "The whole thing shipped in six weeks, and field teams stopped losing visit notes to dead zones entirely — every entry is saved the instant it's made, connection or not, and reconciles cleanly once a signal comes back.",
        ],
      },
    ] satisfies CaseStudySection[],
  },
] as const;

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
