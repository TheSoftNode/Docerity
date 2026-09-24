import {
  BoxesIcon,
  LayoutDashboardIcon,
  MonitorSmartphoneIcon,
  RadarIcon,
  RocketIcon,
  SearchIcon,
  ServerIcon,
  SmartphoneIcon,
  type LucideIcon,
} from "lucide-react";

export const capabilities: {
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Web applications",
    description:
      "Full-stack products from first commit to production, not just the frontend polish.",
    Icon: MonitorSmartphoneIcon,
  },
  {
    title: "APIs & backend systems",
    description:
      "The plumbing that has to stay correct under load: services, data models, integrations.",
    Icon: ServerIcon,
  },
  {
    title: "Mobile apps",
    description:
      "Offline-first, sync-aware mobile experiences for teams that can't assume a connection.",
    Icon: SmartphoneIcon,
  },
  {
    title: "Dashboards & data",
    description:
      "Turning scattered spreadsheets and exports into a single, live source of truth.",
    Icon: LayoutDashboardIcon,
  },
];

export const process: {
  title: string;
  summary: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    title: "Discovery",
    summary: "Understand the real problem",
    description:
      "Before any code, we get specific about what's actually broken, who it affects, and what success looks like. Most scope creep starts from skipping this.",
    Icon: SearchIcon,
  },
  {
    title: "Architecture",
    summary: "Design for the next two years, not only launch day",
    description:
      "A plan for the data model, the integrations, and the parts most likely to change, so the system bends instead of breaking as requirements grow.",
    Icon: RadarIcon,
  },
  {
    title: "Build",
    summary: "Ship in reviewable, working slices",
    description:
      "Working software early and often, in pieces small enough to actually review, not one enormous reveal at the end.",
    Icon: BoxesIcon,
  },
  {
    title: "Ship & support",
    summary: "Launch is the start, not the finish",
    description:
      "Deployed, monitored, and handed off with real documentation, plus support after launch for the issues only production traffic reveals.",
    Icon: RocketIcon,
  },
];

export const stack = [
  "TypeScript",
  "Next.js",
  "React Native",
  "Node.js",
  "GraphQL",
  "Postgres",
  "Redis",
  "SQLite",
] as const;
