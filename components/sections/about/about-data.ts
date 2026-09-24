/*
  The founder content behind Docerity, migrated from the standalone portfolio.

  Framing note: this is the About page of a company site, so the voice is "the
  engineer behind Docerity" rather than a personal homepage. The portfolio
  carried a date of birth and two personal phone numbers in its info panel;
  those are deliberately not here. Contact routes through /contact, which is
  the one place that should collect a conversation.
*/

import { projects } from "@/components/sections/work/work-data";

export const founder = {
  name: "Theophilus Uchechukwu",
  role: "Founder · Full-stack & Web3 Engineer",
  based: "Lagos, Nigeria",
  /* Stated because it is the practical question a distributed client actually
     has, and the portfolio made a point of it. `hours` is the same fact cut
     to fit the dossier rail, which has room for a few characters rather than
     a sentence — kept beside the long form so the two cannot drift. */
  availability: "Works across European and US time zones",
  hours: "EU / US overlap",
} as const;

/** The narrative. Three beats: where I came from, what I do, why Docerity. */
/*
  Rewritten against the CVs. The previous version opened on a career in power
  technology — tracing faults through UPS systems — which came from the old
  portfolio and appears in none of the six CVs. It was load-bearing for the
  whole narrative, so the arc is redrawn from what the CVs actually record.
*/
export const story = [
  "I started on contract work: .NET middleware for Nigerian banking rails, NIBSS BVN validation and IBPS integrations, then a run of client systems across financial services, real estate and education. Unglamorous, and the best possible training — when the thing you built handles someone's identity verification, you learn quickly that correctness is not a matter of taste.",
  "Backend engineering at ALX came next, then AI products at HitoAI, where two of the things I built went on to raise €123K and €100K. Since then it has been three engagements at once: leading QwikPass end to end as its only engineer, taking three SaaS products at URI from pre-user development into real adoption, and pulling a security scanner out of a Django monolith at SmartComply. Along the way, three Web3 hackathon wins.",
  "The explaining came from an unexpected direction. Years of evaluating AI models — writing rubrics, calibrating prompts to the point where models fail, checking whether an answer is correct or merely plausible — turn out to be the same discipline as explaining a system to a junior engineer. You have to know exactly what you know, and exactly how you know it. Docerity is the company around all three: building software, explaining it clearly, and growing the engineers who will maintain it.",
] as const;

/*
  Headline numbers, every one checkable against something else on the site.

  The project count is derived rather than typed, because a hand-written "20+"
  drifts the moment a project is added or removed — and a number nobody can
  reconcile with the work page is worth less than no number at all.
*/
export const facts = [
  {
    value: "6+",
    label: "Years building production software",
    since: "the figure every CV leads with",
  },
  /* Three, not four. Every one of the CVs says "won 3 blockchain hackathons";
     the four came from the old portfolio page and was never corrected. */
  { value: "3", label: "Hackathon wins", since: "MetaPilot and VeriAI among them" },
  {
    value: String(projects.length),
    label: "Shipped projects",
    since: "every one listed on the work page",
  },
  {
    value: "7",
    label: "Blockchain ecosystems",
    since: "Solana, Ethereum, Stacks, Hedera, NEAR, Stellar, ICP",
  },
] as const;

/*
  Condensed from the portfolio's six long-form experience entries. The originals
  ran 120+ words each, which reads as a wall on a company About page; each one
  here keeps the specifics and drops the restatement.
*/
/*
  Taken from the CVs rather than the old portfolio page, which had gone stale:
  it still led with HitoAI as the current role and carried two entries — an IT
  tutoring thread since 2016 and a field-engineering post at Integrated Power
  Technology — that appear in no CV. Both are left out here rather than
  carried forward on the strength of an older source.

  The four ApplyLoop contracts are folded into one entry. Listed separately
  they read as four jobs when they are one ongoing engagement that changed
  shape, and they overlap the Coretrix and URI dates, which makes a
  chronological list look like a contradiction.
*/
export const experience = [
  {
    role: "Senior Full-Stack Software Engineer",
    org: "SmartComply",
    period: "2026 — present",
    summary:
      "Pulled API security scanning out of the Django monolith and into a service of its own.",
    points: [
      "Extracted scanning into a standalone FastAPI service running OWASP ZAP, Nuclei and Schemathesis across three sibling containers, isolating CPU-heavy work from the web servers.",
      "Diagnosed thread-pool exhaustion at around 40 queued scans and replaced background tasks with a bounded worker queue and HTTP 429 backpressure.",
      "Made result delivery idempotent with an atomic compare-and-clear claim, so repeated callbacks during slow PDF rendering stopped producing duplicate reports.",
      "Cut the results payload roughly 170× and the scanner image from 411MB to 217MB.",
      "Built a bulk-import workflow across six formats with deduplication and a 100-endpoint limit, covered by 23 tests spanning the React and Django boundary.",
    ],
  },
  {
    role: "Lead Engineer",
    org: "Coretrix Technologies",
    period: "2026 — present",
    summary:
      "Sole engineer on QwikPass, across five product surfaces and three business lines.",
    points: [
      "Owned access control, payments, communications, compliance, analytics and operations end to end — Flutter mobile, a Guard APK, Next.js management, React events and the public web.",
      "Built backend workflows across 15+ Firebase Functions categories, including a Gemini integration.",
      "Implemented security with Firebase Auth custom claims, 42 Firestore rules, 40+ tamper-evident audit actions and RFC 6238 offline TOTP for low-connectivity gates.",
      "Established 488+ passing tests at 80%+ critical-path coverage, holding gate requests under 307ms and webhook processing under 328ms at p95.",
      "Automated Android and iOS delivery through Codemagic across App Bundle, IPA, TestFlight and Google Play.",
    ],
  },
  {
    role: "Lead Full-Stack Software Engineer",
    org: "URI Creative",
    period: "2025 — present",
    summary:
      "Led three SaaS products from pre-user development into active adoption.",
    points: [
      "Architected microservices across FastAPI, NestJS, .NET 8, MongoDB and Redis for social publishing, lead generation, analytics and a public developer API.",
      "Built a three-tier SmartLLMRouter over GPT-4o, Gemini and a rule-based fallback, processing millions of posts at 90% lower routing cost and above 99.99% uptime.",
      "Shipped a production RAG pipeline on 1,536-dimension embeddings and MongoDB Atlas Vector Search with cosine similarity and metadata filtering.",
      "Engineered a 2,800-line multimodal vision service using GPT-4o Vision and DALL·E 3, with blur, exposure and platform-specific quality gates.",
      "Deployed a nine-container WhatsApp architecture — three FastAPI webhook servers, three Celery workers, Redis, Flower and Nginx — then migrated production from Azure to AWS.",
    ],
  },
  {
    role: "AI & frontend engineering, on contract",
    org: "ApplyLoop",
    period: "2024 — present",
    summary:
      "Four engagements: RLHF evaluation, training-data design, prompt engineering, and a React build.",
    points: [
      "Evaluated 150+ technical model responses and produced golden annotations, verifying claims by executing the code rather than reading it.",
      "Designed 207+ training samples across eight application categories, with rubrics spanning five verification dimensions and three difficulty bands.",
      "Built repository-comprehension prompts carrying 20–40 weighted criteria each, calibrated to a 50% model failure rate to find where models fabricate fields, operators and source locations.",
      "Built LeaguesFun in React 19 and TypeScript — live leaderboards, a drag-and-drop lineup editor and wallet auth over Ethers.js, Wagmi, Viem and Privy.",
    ],
  },
  {
    role: "Blockchain Developer",
    org: "Web3 hackathons",
    period: "2024 — present",
    summary:
      "Three hackathon wins, across Solana, Stacks, NEAR, Stellar and MetaMask.",
    points: [
      "Built MetaPilot, a MetaMask × Solana winner: a four-program DeFi automation protocol in 2,000+ lines of Rust and Anchor for DAO voting, scheduling and AI-guided workflows.",
      "Built VeriAI, also a MetaMask × Solana winner, turning AI outputs into immutable verification certificates through Solana's oracle network.",
      "Engineered RealPayTag as a 9,700-line Rust multi-program system for real-world asset tokenisation — asset registry, identity, asset-backed stablecoin and payroll.",
      "Worked across Solidity, Clarity and Rust, including Hedera Consensus and Smart Contract Services for governance and event ordering.",
    ],
  },
  {
    role: "Fullstack Software Engineer",
    org: "HitoAI",
    period: "2024",
    summary:
      "Six AI products across education, energy, trading and assessment.",
    points: [
      "Built EEP, a microservice learning platform on Firebase, GCP, Node and Next.js with RabbitMQ carrying inter-service events.",
      "Built HyQ for gas-quality analytics and the SusNet MVP for household energy — products that secured €123K and €100K in funding.",
      "Integrated Selwell across Next.js, Django REST and Flask to connect a trading interface to a trained bot.",
      "Delivered Easmark for AI-assisted thesis grading, plus the HitoAI and Biasadra web experiences.",
    ],
  },
  {
    role: "Backend Engineer",
    org: "ALX Africa",
    period: "2023 — 2024",
    summary:
      "Co-architected the ALX Connect API in a two-person backend team.",
    points: [
      "Built developer matching, mentorship connections, CV review and profile management as documented REST endpoints on Django REST Framework and Swagger.",
      "Implemented JWT authentication, WebSockets and SMTP email for access, notifications and verification.",
      "Coordinated schema and API behaviour with the second backend engineer across four workflow areas.",
    ],
  },
  {
    role: "Full-Stack Software Developer",
    org: "Freelance & collaborative projects",
    period: "2020 — 2023",
    summary:
      "Contract delivery across financial services, real estate, tournaments and education.",
    points: [
      "Developed .NET 6 middleware for NIBSS BVN validation and IBPS integration, with cryptographic controls and application-facing API contracts.",
      "Modernised legacy systems while implementing authentication, third-party integrations and performance analytics.",
      "Provided technical mentorship and training, mostly around the .NET ecosystem and web development.",
    ],
  },
] as const;

/** Grouped, because the portfolio's flat 36-item list read as a keyword dump. */
/*
  Taken from the CVs' technical-skills sections, which are considerably more
  specific than the portfolio's flat 36-item list — that one ended in "and
  even more" and put CCNA beside React. Grouped by what each thing is for, so
  someone can scan for the part they care about.

  Mobile and AI are their own groups now because both carry real weight in the
  CVs and neither had anywhere to live before.
*/
export const skillGroups = [
  {
    title: "Frontend",
    items: ["TypeScript", "React", "Next.js", "Vite", "Tailwind CSS", "shadcn/ui", "Material UI", "Recharts"],
  },
  {
    title: "Backend",
    items: ["Python", "FastAPI", "Django", "NestJS", "Node.js", "C#", ".NET", "Celery"],
  },
  {
    title: "AI & LLM",
    items: ["GPT-4o", "Claude", "Gemini", "RAG", "Vector search", "DALL·E 3", "RLHF", "Prompt engineering"],
  },
  {
    title: "Mobile",
    items: ["Flutter", "Dart", "Riverpod", "GoRouter", "SQLite sync", "Push notifications", "Codemagic"],
  },
  {
    title: "Data & messaging",
    items: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Firebase", "RabbitMQ", "Azure Service Bus"],
  },
  {
    title: "Web3",
    items: ["Solidity", "Rust", "Anchor", "Clarity", "Ethers.js", "Wagmi", "Viem", "Hedera"],
  },
  {
    title: "Cloud & DevOps",
    items: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "GitHub Actions", "Nginx", "CI/CD"],
  },
  {
    title: "APIs & security",
    items: ["REST", "GraphQL", "WebSockets", "OAuth 2.0", "JWT", "Swagger", "OWASP ZAP", "Nuclei"],
  },
] as const;

/*
  The day-to-day toolchain, shown as marks rather than more text.

  The skill groups above are already eight lists of words; repeating the same
  format for tools would make the section one long wall. Logos are scannable
  in a way a nineteenth text chip is not.
*/
export const tools = [
  { name: "VS Code", src: "/about/tools/vscode.svg" },
  { name: "Docker", src: "/about/tools/docker.svg" },
  { name: "Kubernetes", src: "/about/tools/kubernetes.svg" },
  { name: "AWS", src: "/about/tools/aws.svg" },
  { name: "GitHub", src: "/about/tools/github.svg" },
  { name: "Postman", src: "/about/tools/postman.svg" },
  { name: "MongoDB", src: "/about/tools/mongodb.svg" },
  { name: "PostgreSQL", src: "/about/tools/postgres.svg" },
  { name: "Firebase", src: "/about/tools/firebase.svg" },
  { name: "Grafana", src: "/about/tools/grafana.svg" },
  { name: "Prometheus", src: "/about/tools/prometheus.svg" },
  { name: "Jira", src: "/about/tools/jira.svg" },
  { name: "Figma", src: "/about/tools/figma.svg" },
  { name: "LeetCode", src: "/about/tools/leetcode.svg" },
] as const;

export const education = [
  {
    qualification: "Software Engineering",
    institution: "ALX · Holberton",
    period: "2023 — 2024",
  },
  {
    qualification: "Data Science",
    institution: "ALX · ExploreAI Academy",
    period: "2023 — 2024",
  },
  {
    qualification: "AI Career Essentials",
    institution: "ALX",
    period: "2023 — 2024",
  },
  {
    qualification: "B.Eng Electrical & Electronic Engineering, 2nd class upper",
    institution: "Federal University of Technology, Owerri",
    period: "2012 — 2018",
  },
  {
    qualification: "Google IT Support Professional Certificate",
    institution: "Coursera",
    period: "2022 — 2024",
  },
  {
    qualification: "Google IT Automation with Python",
    institution: "Coursera",
    period: "2023 — 2024",
  },
  {
    qualification: "Cisco Certified Network Associate (CCNA)",
    institution: "NIIT · Cisco",
    period: "2022 — 2024",
  },
] as const;

/*
  The scans themselves, converted to WebP at 640px — 6.4MB of PNG and JPEG in
  the portfolio comes to about 250KB here. A certificate you can actually look
  at is worth more than a line of text claiming it exists.

  The engineering degree has no scan of its own in the source set, so it
  carries no `image` and the card falls back to text.
*/
export type Certification = {
  name: string;
  issuer: string;
  detail: string;
  /** Optional: the engineering degree has no scan in the source set. */
  image?: string;
};

export const certifications: Certification[] = [
  {
    name: "Fullstack Software Engineering",
    image: "/about/certificates/software-engineering.webp",
    issuer: "ALX in partnership with Holberton",
    detail: "12-month intensive engineering internship.",
  },
  {
    name: "Data Science",
    image: "/about/certificates/data-science.webp",
    issuer: "ALX · ExploreAI Academy",
    detail: "13-month intensive programme with professional development.",
  },
  {
    name: "Google IT Support Specialist",
    image: "/about/certificates/google-it-support.webp",
    issuer: "Google via Coursera",
    detail: "Six-month professional certification.",
  },
  {
    name: "Google IT Automation with Python",
    image: "/about/certificates/google-automation.webp",
    issuer: "Google via Coursera",
    detail: "Six-month professional certification.",
  },
  {
    name: "AI Career Essentials",
    image: "/about/certificates/ai-career-essentials.webp",
    issuer: "ALX",
    detail: "Eight-week AI-augmented professional development.",
  },
  {
    name: "Electrical & Electronic Engineering",
    issuer: "Federal University of Technology, Owerri",
    detail: "Five-year B.Eng degree programme.",
  },
  {
    name: "Socomec Level-1 Maintenance Engineer",
    image: "/about/certificates/socomec-maintenance.webp",
    issuer: "Socomec",
    detail: "UPS systems maintenance certification.",
  },
  {
    name: "Customer Service Fundamentals",
    image: "/about/certificates/customer-service.webp",
    issuer: "Knowledge Accelerators via Coursera",
    detail: "Online non-credit course.",
  },
  {
    name: "Fundamentals of Digital Marketing",
    image: "/about/certificates/digital-marketing.webp",
    issuer: "Google Digital Garage",
    detail: "Certification in digital marketing fundamentals.",
  },
];
