export const projects = [
  {
    index: "01",
    name: "Ledger",
    category: "Fintech · Dashboard",
    description:
      "A real-time finance dashboard rebuilt from the ground up for a team drowning in spreadsheet exports.",
    tags: ["Next.js", "TypeScript", "Postgres"],
    metric: "40% faster close",
    href: "#",
    preview: "dashboard",
  },
  {
    index: "02",
    name: "Northwind",
    category: "Commerce · Platform",
    description:
      "A headless commerce platform that unified three regional storefronts into one system without downtime.",
    tags: ["Node.js", "GraphQL", "Redis"],
    metric: "3x checkout throughput",
    href: "#",
    preview: "grid",
  },
  {
    index: "03",
    name: "Fieldnote",
    category: "Mobile · CRM",
    description:
      "A mobile-first CRM for field teams working offline-first in low-connectivity environments.",
    tags: ["React Native", "SQLite", "Sync"],
    metric: "Shipped in 6 weeks",
    href: "#",
    preview: "list",
  },
] as const;
