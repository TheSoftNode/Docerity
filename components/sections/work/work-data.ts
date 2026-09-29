import type { Media } from "@/components/shared/media-placeholder";

/** Real media for a project card: a screenshot, or a short looping clip. */
export type ProjectMedia =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; poster?: string; alt: string };

/** One resolved image on a project page: a URL, plus what it shows. */
export type ProjectImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type CaseStudySection = {
  heading: string;
  paragraphs: string[];
  /* The dashed placeholder, for the entries in this file that never had a real
     one. A database-backed project uses `image` instead. */
  media?: Media;
  image?: ProjectImage;
};

export type ProjectStatus = "Live" | "In progress" | "On hold";

export type Project = {
  index: string;
  slug: string;
  name: string;
  category: string;
  /** Filter buckets for the projects page. A project can sit in more than one. */
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
  /* Added when the work section moved into the database. Absent on every entry
     in this file, which is why both are optional. */
  client?: string;
  gallery?: readonly ProjectImage[];
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
    slug: "uri-social",
    name: "URI Social",
    category: "AI · Social platform",
    groups: ["AI", "Full-stack"],
    description:
      "Social publishing for brands, with the expensive part of the pipeline made cheap: every post is routed to the model that actually fits it rather than to the best one available.",
    tags: ["FastAPI", "Next.js", "MongoDB", "Redis", "GPT-4o", "Gemini"],
    status: "Live",
    preview: "dashboard",
    featured: true,
    client: "URI Creative",
    role: "Lead full-stack engineer",
    timeline: "2025 – present",
    results: [
      "A three-tier router over GPT-4o, Gemini and a rule-based fallback, processing millions of posts at 90% lower routing cost.",
      "Above 99.99% uptime through the period it went from pre-user development into active adoption.",
      "A production retrieval pipeline on 1,536-dimension embeddings with hybrid cosine and metadata search.",
    ],
    body: [
      {
        heading: "Routing by difficulty, not by default",
        paragraphs: [
          "Sending every request to the strongest model is the obvious way to build this and the reason the economics never work: most posts are not hard, and paying top price for the easy ones is where the budget goes.",
          "SmartLLMRouter grades each request and sends it down one of three tiers: GPT-4o where the work genuinely needs it, Gemini for the middle, and a rule-based path for the cases that were never a language problem in the first place. Cost scales with actual difficulty rather than with worst-case difficulty.",
        ],
      },
      {
        heading: "Retrieval that holds up past a demo",
        paragraphs: [
          "Intent analysis runs across Twitter, Facebook and TikTok in real time, over 1,536-dimension embeddings in MongoDB Atlas Vector Search. The search is hybrid: cosine similarity narrowed by metadata filters, because relevance on its own returns the right kind of thing from the wrong account or the wrong month.",
        ],
      },
      {
        heading: "Images, and the quality gate in front of them",
        paragraphs: [
          "A multimodal service of around 2,800 lines pairs GPT-4o Vision and DALL·E 3 with ordinary computer vision: blur detection and exposure analysis, behind platform-specific rules for LinkedIn, Instagram, Twitter and Facebook.",
          "The gates matter more than the generation. A model will return something for any prompt, and the question on a brand account is whether what came back is publishable, which is a different question from whether it is plausible.",
        ],
      },
    ],
  },
  {
    index: "26",
    slug: "uri-unified-inbox",
    name: "URI Unified Inbox",
    category: "Backend · Messaging",
    groups: ["Backend / API", "AI"],
    description:
      "One inbox for a business's Instagram, Messenger and WhatsApp conversations: DMs and comments in a single list, with honest delivery state rather than a hopeful tick.",
    tags: ["FastAPI", "Python", "MongoDB", "Meta Graph API", "WhatsApp"],
    status: "In progress",
    preview: "list",
    client: "URI Creative",
    role: "Lead engineer",
    timeline: "2026",
    results: [
      "153 tests covering webhook authenticity, ordering, the whole send pipeline and cross-workspace isolation.",
      "A standalone service with its own database and deployment, which imports nothing from the main backend.",
      "Runs with one command against an in-memory database and a sandboxed Meta, so a frontend can be built before any account is connected.",
    ],
    body: [
      {
        heading: "Delivery state you can act on",
        paragraphs: [
          "Most inboxes show a message as sent and leave it there. This one moves through pending, accepted, delivered and read, and says failed or unknown when that is what happened, because a reply that silently did not arrive is worse than one that visibly did not.",
          "Eligibility is checked before the send and again at the send itself: the reply window, the channel's capability, the media type and the permission. One command produces one provider call, carrying a client idempotency key, so a retry cannot post twice.",
        ],
      },
      {
        heading: "What the tests actually cover",
        paragraphs: [
          "The suite verifies the things that go wrong in production rather than the happy path: timeouts, crashes mid-send, echo races, rate limits, token expiry, duplicate keys, and repeated webhook delivery.",
          "It also states what it cannot verify. Behaviour against the real Meta APIs, a real DocumentDB and App Review are all outside what a test suite can prove, and the README says so rather than implying the green run covers them.",
        ],
      },
    ],
  },
  {
    index: "27",
    slug: "jane-whatsapp",
    name: "Jane on WhatsApp",
    category: "AI · Conversational",
    groups: ["AI", "Backend / API"],
    description:
      "A WhatsApp assistant that answers customer questions from a brand's own approved facts, and says it does not know rather than inventing a price.",
    tags: ["FastAPI", "Celery", "Redis", "Nginx", "Docker", "AWS"],
    status: "Live",
    preview: "grid",
    client: "URI Creative",
    role: "Lead engineer",
    timeline: "2025 – 2026",
    results: [
      "Nine containers in production: three FastAPI webhook servers, three Celery workers, Redis, Flower and Nginx.",
      "Migrated from Azure to AWS without taking the number offline.",
      "Deterministic and exact-match-only in its first version, so it cannot invent an answer.",
    ],
    body: [
      {
        heading: "Refusing to guess",
        paragraphs: [
          "The first version answers only from the operational facts a brand's playbook carries, matched exactly. Anything outside that is handed to a person.",
          "That is a smaller product than a model answering freely, and it is the right one to ship first on a channel where a wrong price is a commitment a customer can screenshot.",
        ],
      },
      {
        heading: "Why nine containers",
        paragraphs: [
          "WhatsApp webhooks arrive in bursts and must be acknowledged quickly, while the work behind them is slow and occasionally fails. Splitting the webhook servers from the workers means a slow answer cannot cause a missed delivery, and Redis carries the queue between them.",
        ],
      },
    ],
  },
  {
    index: "28",
    slug: "uri-developer-platform",
    name: "URI Developer Platform",
    category: "Backend · Developer platform",
    groups: ["Backend / API"],
    description:
      "The public API and SDK behind URI Social: key issuing, per-key rate limits and a documented surface other people can build against.",
    tags: ["FastAPI", "MongoDB", "TypeScript", "OpenAPI"],
    status: "In progress",
    preview: "dashboard",
    client: "URI Creative",
    role: "Lead engineer",
    timeline: "2026",
    results: [
      "27 SDK endpoints and 6 dashboard endpoints for issuing and revoking keys.",
      "Key authentication in middleware, so a route cannot forget to check.",
      "Rate limits reset on a schedule rather than being trusted to a counter in memory.",
    ],
  },
  {
    index: "29",
    slug: "api-scan-service",
    name: "API Scan Service",
    category: "Security · API scanning",
    groups: ["Backend / API", "Security"],
    description:
      "API security scanning pulled out of a Django monolith and onto its own machines: ZAP, Nuclei and Schemathesis in parallel, with the findings posted back.",
    tags: ["FastAPI", "Python", "OWASP ZAP", "Nuclei", "Schemathesis", "Docker"],
    status: "Live",
    preview: "list",
    featured: true,
    client: "SmartComply",
    role: "Senior full-stack engineer",
    timeline: "2026",
    results: [
      "Scanner image cut from 411MB to 217MB, and the results payload by roughly 170×.",
      "Thread-pool exhaustion at around 40 queued scans replaced with a bounded queue and HTTP 429 backpressure.",
      "Holds no database, no object storage and no merchant data: it receives a URL and a callback address.",
    ],
    body: [
      {
        heading: "Why it had to move out",
        paragraphs: [
          "A scan needs Docker, takes every CPU core it can reach and peaks at about 1.6 GB of memory. Run beside the web application, a handful of them put the whole platform at risk.",
          "So the scanners run on their own server and the platform sends them a URL. The service deliberately holds nothing: no database, no object storage, no merchant data. Compromising it gets an attacker a queue of URLs.",
        ],
      },
      {
        heading: "Backpressure instead of collapse",
        paragraphs: [
          "The first version queued scans as background tasks and fell over at around forty of them, with the thread pool exhausted and no signal that anything was wrong.",
          "A bounded worker queue replaced it, and a full queue now answers 429 rather than accepting work it cannot do. Refusing a request is a better failure than accepting it and losing it.",
        ],
      },
      {
        heading: "Callbacks that cannot duplicate",
        paragraphs: [
          "Results are delivered by callback, and PDF rendering on the receiving end is slow enough that the caller sometimes retried. Every retry produced another report.",
          "Delivery now claims the result with an atomic compare-and-clear, so the second callback finds nothing to send. Idempotency here is not a nicety: a duplicate compliance report is a question somebody has to answer.",
        ],
      },
    ],
  },
  {
    index: "30",
    slug: "qwikpass",
    name: "QwikPass",
    category: "Mobile · Access control",
    groups: ["Mobile", "Full-stack"],
    description:
      "Access control, payments and compliance for gated sites, across five product surfaces, with gates that keep working when the connection does not.",
    tags: ["Flutter", "Firebase", "Next.js", "React", "TypeScript", "Gemini"],
    status: "Live",
    preview: "grid",
    featured: true,
    client: "Coretrix Technologies",
    role: "Lead engineer, and the only one",
    timeline: "2026 – present",
    results: [
      "488+ tests at over 80% coverage on the critical paths.",
      "Gate requests under 307ms and webhook processing under 328ms at the 95th percentile.",
      "42 Firestore rules and more than 40 tamper-evident audit actions.",
    ],
    body: [
      {
        heading: "Five surfaces, one engineer",
        paragraphs: [
          "A Flutter app for residents, a separate Guard APK for the gate, a Next.js console for management, a React surface for events and the public site, over three business lines: access control, payments, communications, compliance, analytics and operations.",
          "Owning all of it end to end is unusual and it is the reason the parts agree with each other. There was nobody to hand an interface to and no second opinion about what a field means.",
        ],
      },
      {
        heading: "A gate with no signal is still a gate",
        paragraphs: [
          "Gates sit where connectivity is worst, and an access system that needs the network to decide is an access system that fails at the exact moment somebody is waiting at a barrier.",
          "Offline verification uses RFC 6238 time-based codes, so the guard's device can check a pass against the clock rather than against a server. The audit trail reconciles when the connection returns.",
        ],
      },
    ],
  },
  {
    index: "31",
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

/** The flagged ones, on the landing page; /work shows everything. */
export const featuredProjects = projects.filter((project) => project.featured);

/**
 * Drop real project media here: one entry per slug, keyed to the projects
 * above. Files live in `public/`, so `/projects/eep.webp` means
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
 *   eep:       { type: "image", src: "/projects/eep.webp", alt: "The EEP dashboard" },
 *   metapilot: { type: "video", src: "/projects/metapilot.mp4", poster: "/projects/metapilot.webp", alt: "MetaPilot rule builder" },
 */
export const projectMedia: Partial<Record<string, ProjectMedia>> = {
  "eep": { type: "image", src: "/projects/eep.webp", alt: "The EEP learning dashboard" },
  "hitoai": { type: "image", src: "/projects/hitoai.webp", alt: "The HitoAI platform home page" },
  "easmark": { type: "image", src: "/projects/easmark.webp", alt: "Easmark's grading workspace" },
  "talentchain-pro": { type: "image", src: "/projects/talentchain-pro.webp", alt: "TalentChainPro skill credentials" },
  "metapilot": { type: "image", src: "/projects/metapilot.webp", alt: "MetaPilot's automation rule builder" },
  "stacktip": { type: "image", src: "/projects/stacktip.webp", alt: "StackTip's tipping interface" },
  "eep-admin": { type: "image", src: "/projects/eep-admin.webp", alt: "The EEP admin dashboard" },
  "neuraltradex": { type: "image", src: "/projects/neuraltradex.webp", alt: "NeuralTradeX strategy view" },
  "yieldnexus": { type: "image", src: "/projects/yieldnexus.webp", alt: "YieldNexus Bitcoin DeFi dashboard" },
  "icplearn": { type: "image", src: "/projects/icplearn.webp", alt: "ICPLearn course and staking view" },
  "realpaytag": { type: "image", src: "/projects/realpaytag.webp", alt: "RealPayTag payments interface" },
  "cryptopilot": { type: "image", src: "/projects/cryptopilot.webp", alt: "CryptoPilot's natural-language wallet" },
  "crossflow": { type: "image", src: "/projects/crossflow.webp", alt: "CrossFlow cross-chain transfer screen" },
  "susnet": { type: "image", src: "/projects/susnet.webp", alt: "SusNet energy analytics" },
  "ai4energy": { type: "image", src: "/projects/ai4energy.webp", alt: "AI4Energy pricing forecasts" },
  "biasadra": { type: "image", src: "/projects/biasadra.webp", alt: "The Biasadra academy site" },
  "smart-treasures": { type: "image", src: "/projects/smart-treasures.webp", alt: "Smart Treasures investment platform" },
  "loan-me": { type: "image", src: "/projects/loan-me.webp", alt: "The loan application flow" },
  "softmeet": { type: "image", src: "/projects/softmeet.webp", alt: "SoftMeet video conferencing" },
  "docmeet": { type: "image", src: "/projects/docmeet.webp", alt: "DocMeet appointment booking" },
  "easmark-api": { type: "image", src: "/projects/easmark-api.webp", alt: "The Easmark API documentation" },
  "alx-connect-api": { type: "image", src: "/projects/alx-connect-api.webp", alt: "ALX Connect API documentation" },
  "tours-api": { type: "image", src: "/projects/tours-api.webp", alt: "The Tours API documentation" },
  "softinven": { type: "image", src: "/projects/softinven.webp", alt: "SoftInven inventory dashboard" },
  "lms-api": { type: "image", src: "/projects/lms-api.webp", alt: "The LMS API documentation" },
};

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
