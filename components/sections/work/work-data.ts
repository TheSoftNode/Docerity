import type { Media } from "@/components/shared/media-placeholder";

/** Real media for a project card: a screenshot, or a short looping clip. */
export type ProjectMedia =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; poster?: string; alt: string };

export type CaseStudySection = {
  heading: string;
  paragraphs: string[];
  media?: Media;
};

export type ProjectStatus = "Live" | "In progress" | "On hold";

export type Project = {
  index: string;
  slug: string;
  name: string;
  category: string;
  /** Filter buckets for the work page. A project can sit in more than one. */
  groups: readonly string[];
  description: string;
  tags: readonly string[];
  status: ProjectStatus;
  preview: "dashboard" | "grid" | "list";
  /** Shown on the landing page; the rest appear on /work. */
  featured?: boolean;
  liveUrl?: string;
  repoUrl?: string;
  /*
    A written case study, where one exists. Optional on purpose: these are real
    projects and most do not have a published write-up yet. A detail page
    renders the overview from the facts above and gains the narrative when it
    is actually written, rather than shipping an invented one.
  */
  role?: string;
  timeline?: string;
  results?: readonly string[];
  body?: readonly CaseStudySection[];
};

/*
  Real work, migrated from the standalone portfolio.

  What was here before (Ledger, Northwind and Fieldnote) was placeholder
  fiction: invented clients with invented metrics ("40% faster close") and no
  live URLs. Plausible-looking numbers on a company's work page are a
  liability the first time a prospect asks about one, and meanwhile 25 real
  shipped projects were sitting on a separate domain.

  Everything below links to something that exists. `status` replaces the old
  `metric` field because it is a fact rather than a claim.
*/
export const projects: readonly Project[] = [
  {
    index: "01",
    slug: "eep",
    name: "EEP",
    category: "AI · Learning platform",
    groups: ["AI", "Full-stack"],
    description:
      "An AI-assisted learning and mentorship platform: structured project management, real-time collaboration, and guided feedback for developers building toward industry work.",
    tags: ["Next.js", "TypeScript", "Node.js", "Firebase", "GCP", "Stripe"],
    status: "In progress",
    preview: "dashboard",
    featured: true,
    liveUrl: "https://eep-v2-app-4b7msmz37a-uc.a.run.app/",
  },
  {
    index: "02",
    slug: "hitoai",
    name: "HitoAI",
    category: "AI · Corporate platform",
    groups: ["AI", "Full-stack"],
    description:
      "The corporate platform for HitoAI's educational technology, covering the assessment tooling institutions use for marking and reporting.",
    tags: ["React", "Vite", "Node.js", "MongoDB", "Tailwind CSS"],
    status: "In progress",
    preview: "grid",
    featured: true,
    liveUrl: "https://hitoai.ai/",
  },
  {
    index: "03",
    slug: "easmark",
    name: "Easmark",
    category: "AI · EdTech",
    groups: ["AI", "Full-stack"],
    description:
      "Grading support for educators: an AI-assisted pass over thesis papers and code submissions that shortens the turnaround without taking the judgement call away from the marker.",
    tags: ["Next.js", "TypeScript", "Django", "PostgreSQL", "Stripe"],
    status: "In progress",
    preview: "list",
    featured: true,
    liveUrl: "https://easmark-vercel.vercel.app/",
  },
  {
    index: "04",
    slug: "talentchain-pro",
    name: "TalentChainPro",
    category: "Web3 · Hedera",
    groups: ["Web3", "Hackathon"],
    description:
      "Verifiable skill credentials as soulbound tokens, with AI-assisted talent matching on top. Professional reputation that a candidate carries rather than re-proves.",
    tags: ["Next.js", "Hedera SDK", "Hashgraph", "Tailwind CSS"],
    status: "In progress",
    preview: "grid",
    featured: true,
    liveUrl: "https://talent-chain-frontend-navy.vercel.app/",
    repoUrl: "https://github.com/austinLorenzMccoy/talentchainpro",
  },
  {
    index: "05",
    slug: "metapilot",
    name: "MetaPilot",
    category: "Web3 · Automation",
    groups: ["Web3", "Hackathon"],
    description:
      "Automates the routine parts of holding a governance position (DAO voting, reward claiming, scheduled token purchases) against rules the holder sets once.",
    tags: ["Next.js", "MetaMask SDK", "Tailwind CSS", "shadcn/ui"],
    status: "Live",
    preview: "dashboard",
    featured: true,
    liveUrl: "https://metapilot-frontend.vercel.app/",
    repoUrl: "https://github.com/TheSoftNode/metapilot-frontend",
  },
  {
    index: "06",
    slug: "stacktip",
    name: "StackTip",
    category: "Web3 · Bitcoin",
    groups: ["Web3", "Full-stack", "Hackathon"],
    description:
      "Instant tipping and rewards on the Stacks layer, built so a creator can be paid across borders without the transfer fees eating the tip.",
    tags: ["Clarity", "Next.js", "Node.js", "Smart contracts"],
    status: "Live",
    preview: "list",
    featured: true,
    liveUrl: "https://stack-tip-peach.vercel.app/",
    repoUrl: "https://github.com/Arowolokehinde/STX-TIP",
  },
  {
    index: "07",
    slug: "eep-admin",
    name: "EEP Admin",
    category: "AI · Admin dashboard",
    groups: ["AI", "Full-stack"],
    description:
      "The administrative side of EEP: user management, analytics and system configuration behind two-factor authentication.",
    tags: ["Next.js", "TypeScript", "Node.js", "Firebase", "GCP", "2FA"],
    status: "In progress",
    preview: "dashboard",
    liveUrl: "https://eep-v2-app-4b7msmz37a-uc.a.run.app/admin",
  },
  {
    index: "08",
    slug: "neuraltradex",
    name: "NeuralTradeX",
    category: "Web3 · AI trading",
    groups: ["Web3", "AI", "Hackathon"],
    description:
      "Algorithmic trading strategies packaged for individual traders, running continuously on NEAR without requiring the user to write or tune the models.",
    tags: ["NEAR Protocol", "NEAR AI", "Next.js", "TypeScript"],
    status: "Live",
    preview: "dashboard",
    liveUrl: "https://nueraltraderx.vercel.app/",
    repoUrl: "https://github.com/TheSoftNode/NUERALTRADERX",
  },
  {
    index: "09",
    slug: "yieldnexus",
    name: "YieldNexus",
    category: "Web3 · Bitcoin DeFi",
    groups: ["Web3", "Hackathon"],
    description:
      "A single surface for Bitcoin-based DeFi across Stacks protocols, built so the beginner path and the advanced path are the same interface at different depths.",
    tags: ["sBTC", "Clarity", "Stacks", "Next.js", "Hiro"],
    status: "In progress",
    preview: "grid",
    liveUrl: "https://sbtc-yield-nexus.vercel.app/",
    repoUrl: "https://github.com/emmanuelist/yield-nexus",
  },
  {
    index: "10",
    slug: "icplearn",
    name: "ICPLearn",
    category: "Web3 · Internet Computer",
    groups: ["Web3", "Hackathon"],
    description:
      "Ties staking rewards to completed coursework on ICP, so the incentive to learn the protocol and the incentive to hold it point the same way.",
    tags: ["Next.js", "FastAPI", "Kybra SDK", "Internet Identity"],
    status: "In progress",
    preview: "list",
    liveUrl: "https://icplearn.vercel.app/",
    repoUrl: "https://github.com/TheSoftNode/icplearn_full",
  },
  {
    index: "11",
    slug: "realpaytag",
    name: "RealPayTag",
    category: "Web3 · Payments",
    groups: ["Web3", "Hackathon"],
    description:
      "Payments backed by real-world assets, aimed at the gap between slow bank transfers and volatile crypto rails.",
    tags: ["Next.js", "MetaMask SDK", "Tailwind CSS", "shadcn/ui"],
    status: "Live",
    preview: "grid",
    liveUrl: "https://real-pay-tag-f7uw.vercel.app/",
    repoUrl: "https://github.com/TheSoftNode/realpaytag",
  },
  {
    index: "12",
    slug: "cryptopilot",
    name: "CryptoPilot",
    category: "Web3 · AI",
    groups: ["Web3", "AI", "Hackathon"],
    description:
      "Wallet operations driven by natural language instead of transaction forms, wired through MetaMask so the signing step stays where the user expects it.",
    tags: ["Next.js", "Solidity", "Ethereum", "MetaMask SDK", "ML"],
    status: "On hold",
    preview: "dashboard",
    liveUrl: "https://crypto-pilot-sigma.vercel.app/",
    repoUrl: "https://github.com/TheSoftNode/CryptoPilot",
  },
  {
    index: "13",
    slug: "crossflow",
    name: "CrossFlow",
    category: "Web3 · Stellar",
    groups: ["Web3", "Hackathon"],
    description:
      "Low-fee USDC transfers between Ethereum and Stellar, with fiat on- and off-ramps for African currencies at both ends.",
    tags: ["Next.js", "Stellar SDK", "Tailwind CSS", "shadcn/ui"],
    status: "On hold",
    preview: "list",
    liveUrl: "https://cross-flow.vercel.app/",
  },
  {
    index: "14",
    slug: "susnet",
    name: "SusNet",
    category: "AI · Energy",
    groups: ["AI", "Full-stack"],
    description:
      "Energy management with predictive analytics and automation, turning meter data into decisions a building operator can act on.",
    tags: ["React", "Vite", "Django", "Tailwind CSS"],
    status: "In progress",
    preview: "dashboard",
    liveUrl:
      "https://susnet-frontend-383182311508.europe-west2.run.app/",
  },
  {
    index: "15",
    slug: "ai4energy",
    name: "AI4Energy",
    category: "AI · Forecasting",
    groups: ["AI", "Full-stack"],
    description:
      "Pricing optimisation for fuel stations, combining predictive analytics with market and competitor trend analysis.",
    tags: ["Python", "TensorFlow", "Django", "PostgreSQL", "AWS", "Docker"],
    status: "On hold",
    preview: "grid",
    liveUrl: "https://ai-4-energy-v2.vercel.app/",
  },
  {
    index: "16",
    slug: "biasadra",
    name: "Biasadra",
    category: "AI · Education",
    groups: ["AI", "Full-stack"],
    description:
      "An enterprise AI academy connecting universities and businesses, with an application path into partner institutions.",
    tags: ["Next.js", "Tailwind CSS", "shadcn/ui"],
    status: "Live",
    preview: "list",
    liveUrl: "https://biasadra.com/",
  },
  {
    index: "17",
    slug: "smart-treasures",
    name: "Smart Treasures",
    category: "Fintech · Investment",
    groups: ["Fintech", "Full-stack"],
    description:
      "The public platform for a global investment group, covering their network and the programmes they run across regions.",
    tags: ["Next.js", "TypeScript", "Node.js", "Tailwind CSS"],
    status: "Live",
    preview: "grid",
    liveUrl: "https://smart-treasures.vercel.app/",
  },
  {
    index: "18",
    slug: "loan-me",
    name: "Loan App",
    category: "Fintech · Lending",
    groups: ["Fintech", "Full-stack"],
    description:
      "Personal and business lending with a short application path, credit assessment and repayment tracking built in.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "RTK Query"],
    status: "On hold",
    preview: "dashboard",
    liveUrl: "https://loan-me-v2.vercel.app/",
    repoUrl: "https://github.com/TheSoftNode/loan-me-v2",
  },
  {
    index: "19",
    slug: "softmeet",
    name: "SoftMeet",
    category: "Platform · Video",
    groups: ["Full-stack"],
    description:
      "Video conferencing with screen sharing and persistent virtual rooms, built on Stream with Clerk handling identity.",
    tags: ["Next.js", "Stream API", "Clerk", "Tailwind CSS", "shadcn/ui"],
    status: "Live",
    preview: "list",
    liveUrl: "https://softmeet-v2.vercel.app/",
    repoUrl: "https://github.com/TheSoftNode/softmeet_v2",
  },
  {
    index: "20",
    slug: "docmeet",
    name: "DocMeet",
    category: "Platform · Healthcare",
    groups: ["Full-stack"],
    description:
      "Appointment scheduling between patients and healthcare providers, including booking, management and virtual consultation.",
    tags: ["React", "Vite", "Node.js", "MongoDB", "Mongoose"],
    status: "Live",
    preview: "grid",
    liveUrl: "https://do-cmeet-web-app.vercel.app/",
    repoUrl: "https://github.com/Henryno111/DOCmeet_web_app",
  },
  {
    index: "21",
    slug: "easmark-api",
    name: "Easmark API",
    category: "Backend · API",
    groups: ["Backend / API"],
    description:
      "The service behind Easmark: authentication, submission handling and the grading pipeline, documented through Swagger.",
    tags: ["Django", "JWT", "SQLite", "WebSockets", "Swagger"],
    status: "In progress",
    preview: "list",
    liveUrl: "https://benstacks.pythonanywhere.com/swagger/",
  },
  {
    index: "22",
    slug: "alx-connect-api",
    name: "ALX Connect API",
    category: "Backend · API",
    groups: ["Backend / API"],
    description:
      "Developer matching by skill, experience and learning goal. Authentication, the matching algorithm, mentorship connections and CV review, behind one API.",
    tags: ["Django", "JWT", "SQLite", "WebSockets", "Swagger"],
    status: "On hold",
    preview: "dashboard",
    liveUrl: "https://alxconnect.pythonanywhere.com/swagger/",
  },
  {
    index: "23",
    slug: "tours-api",
    name: "Tours API",
    category: "Backend · API",
    groups: ["Backend / API"],
    description:
      "A REST service for tour management: listings, booking, authentication, payments and reviews, with Swagger documentation.",
    tags: ["Node.js", "Express", "MongoDB", "JWT", "Stripe", "Swagger"],
    status: "Live",
    preview: "grid",
    repoUrl: "https://github.com/TheSoftNode/TourApp/tree/main",
  },
  {
    index: "24",
    slug: "softinven",
    name: "SoftInven",
    category: "Platform · Inventory",
    groups: ["Full-stack"],
    description:
      "Inventory management for production firms supplying retailers: live stock tracking, order processing and sales reporting, pushed to clients over SignalR.",
    tags: ["C#", ".NET Core", "Blazor Server", "SQL Server", "SignalR", "Docker"],
    status: "Live",
    preview: "list",
    repoUrl: "https://github.com/TheSoftNode/Soft-Inven",
  },
  {
    index: "25",
    slug: "lms-api",
    name: "LMS API",
    category: "Backend · API",
    groups: ["Backend / API"],
    description:
      "Course delivery, enrolment and progress tracking as a documented service, built to sit behind more than one front end.",
    tags: ["Django", "JWT", "SQLite", "Swagger"],
    status: "In progress",
    preview: "dashboard",
  },
] as const;

export type ProjectSlug = (typeof projects)[number]["slug"];

/** The six on the landing page; /work shows everything. */
export const featuredProjects = projects.filter((project) => project.featured);

/**
 * Drop real project media here: one entry per slug, keyed to the projects
 * above. Files live in `public/`, so `/work/eep.webp` means
 * `public/work/eep.webp`.
 *
 * The portfolio carries 40MB of screenshots in its own `public/work`. They are
 * deliberately not copied in: at that size they slow every clone and deploy,
 * and they belong in Blob storage or an optimised `public/` set instead.
 *
 * Anything left out falls back to that project's generated SVG preview, so
 * the section is presentable with no assets at all and each card upgrades
 * independently as real media arrives. Nothing else needs editing.
 *
 *   eep:       { type: "image", src: "/work/eep.webp", alt: "The EEP dashboard" },
 *   metapilot: { type: "video", src: "/work/metapilot.mp4", poster: "/work/metapilot.webp", alt: "MetaPilot rule builder" },
 */
export const projectMedia: Partial<Record<string, ProjectMedia>> = {
  "eep": { type: "image", src: "/work/eep.webp", alt: "The EEP learning dashboard" },
  "hitoai": { type: "image", src: "/work/hitoai.webp", alt: "The HitoAI platform home page" },
  "easmark": { type: "image", src: "/work/easmark.webp", alt: "Easmark's grading workspace" },
  "talentchain-pro": { type: "image", src: "/work/talentchain-pro.webp", alt: "TalentChainPro skill credentials" },
  "metapilot": { type: "image", src: "/work/metapilot.webp", alt: "MetaPilot's automation rule builder" },
  "stacktip": { type: "image", src: "/work/stacktip.webp", alt: "StackTip's tipping interface" },
  "eep-admin": { type: "image", src: "/work/eep-admin.webp", alt: "The EEP admin dashboard" },
  "neuraltradex": { type: "image", src: "/work/neuraltradex.webp", alt: "NeuralTradeX strategy view" },
  "yieldnexus": { type: "image", src: "/work/yieldnexus.webp", alt: "YieldNexus Bitcoin DeFi dashboard" },
  "icplearn": { type: "image", src: "/work/icplearn.webp", alt: "ICPLearn course and staking view" },
  "realpaytag": { type: "image", src: "/work/realpaytag.webp", alt: "RealPayTag payments interface" },
  "cryptopilot": { type: "image", src: "/work/cryptopilot.webp", alt: "CryptoPilot's natural-language wallet" },
  "crossflow": { type: "image", src: "/work/crossflow.webp", alt: "CrossFlow cross-chain transfer screen" },
  "susnet": { type: "image", src: "/work/susnet.webp", alt: "SusNet energy analytics" },
  "ai4energy": { type: "image", src: "/work/ai4energy.webp", alt: "AI4Energy pricing forecasts" },
  "biasadra": { type: "image", src: "/work/biasadra.webp", alt: "The Biasadra academy site" },
  "smart-treasures": { type: "image", src: "/work/smart-treasures.webp", alt: "Smart Treasures investment platform" },
  "loan-me": { type: "image", src: "/work/loan-me.webp", alt: "The loan application flow" },
  "softmeet": { type: "image", src: "/work/softmeet.webp", alt: "SoftMeet video conferencing" },
  "docmeet": { type: "image", src: "/work/docmeet.webp", alt: "DocMeet appointment booking" },
  "easmark-api": { type: "image", src: "/work/easmark-api.webp", alt: "The Easmark API documentation" },
  "alx-connect-api": { type: "image", src: "/work/alx-connect-api.webp", alt: "ALX Connect API documentation" },
  "tours-api": { type: "image", src: "/work/tours-api.webp", alt: "The Tours API documentation" },
  "softinven": { type: "image", src: "/work/softinven.webp", alt: "SoftInven inventory dashboard" },
  "lms-api": { type: "image", src: "/work/lms-api.webp", alt: "The LMS API documentation" },
};

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
