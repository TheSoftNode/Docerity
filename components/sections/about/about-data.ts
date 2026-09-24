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
     has, and the portfolio made a point of it. */
  availability: "Works across European and US time zones",
} as const;

/** The narrative. Three beats: where I came from, what I do, why Docerity. */
export const story = [
  "I started out as a power technology engineer, tracing faults through UPS systems and leading maintenance teams on installations where being wrong was expensive. That work taught me the habit I still lean on hardest: find the actual cause before touching anything, and document what you found so the next person isn't guessing.",
  "Software became the thing I did after hours until it became the thing I did. I went deep through ALX's software engineering and data science programmes, then into production work — architecting microservices in Python, FastAPI, NestJS and Node, building the interfaces on top in React and Next.js, and shipping the whole thing rather than handing off a half-finished piece. Most recently as full-stack lead at HitoAI, where I ran the development lifecycle end to end and mentored the juniors on the team.",
  "Docerity exists because those three things — building software, explaining it clearly, and growing the engineers who will maintain it — are the same skill wearing different clothes. I have been teaching since 2016, long before I had a company to put around it. This is the version with the structure it always needed.",
] as const;

/*
  Headline numbers, every one checkable against something else on the site.

  The project count is derived rather than typed, because a hand-written "20+"
  drifts the moment a project is added or removed — and a number nobody can
  reconcile with the work page is worth less than no number at all.
*/
export const facts = [
  { value: "9+", label: "Years teaching and mentoring", since: "since 2016" },
  { value: "4", label: "Hackathon wins", since: "Web3 competitions" },
  {
    value: String(projects.length),
    label: "Shipped projects",
    since: "every one listed on the work page",
  },
  {
    value: "6",
    label: "Blockchain ecosystems",
    since: "Ethereum, Stacks, Hedera, NEAR, Stellar, ICP",
  },
] as const;

/*
  Condensed from the portfolio's six long-form experience entries. The originals
  ran 120+ words each, which reads as a wall on a company About page; each one
  here keeps the specifics and drops the restatement.
*/
export const experience = [
  {
    role: "Full-stack Development Lead",
    org: "HitoAI",
    period: "2024 — present",
    summary:
      "Led the team building AI-powered products end to end, from architecture to deployment.",
    points: [
      "Architected scalable microservices in Python, FastAPI, NestJS and Node, with React, Next.js and TypeScript on the front.",
      "Set the engineering standards — code review process and testing strategy — that lifted code quality by 35%.",
      "Worked alongside the data science team to move machine learning models into production, including NLP capability.",
      "Cut API response times 40% through database design and Redis caching.",
      "Ran sprint planning, standups and retrospectives, and mentored the junior engineers.",
    ],
  },
  {
    role: "Web3 & Blockchain Engineer",
    org: "Open source contributor",
    period: "2023 — present",
    summary:
      "Smart contracts and decentralised applications across five ecosystems, in TypeScript, Rust and Solidity.",
    points: [
      "Built and deployed contracts implementing token standards on Ethereum and Stacks, with security and gas efficiency as the constraint.",
      "Shipped dApps across NEAR, Stellar and Stacks — the Bitcoin layer — from DeFi to NFT platforms.",
      "Led teams to four hackathon wins.",
      "Contributed upstream, mostly on cross-chain compatibility and the user experience gap that keeps Web3 niche.",
    ],
  },
  {
    role: "Software Engineering Intern, then contractor",
    org: "ALX · Holberton",
    period: "2023 — 2024",
    summary:
      "Twelve months of intensive full-stack work, from a shell written in C to production web applications.",
    points: [
      "Built a custom shell in C, an AirBnB clone in Python and Flask, a doctor appointment system in React and Node, and an inventory system in C#, .NET and Blazor Server.",
      "Went deep on system design, data structures and algorithms.",
      "Picked up the DevOps toolchain in anger: Docker, Kubernetes, Terraform, Ansible, Puppet, Datadog.",
      "Mentored peers across frameworks — the part I kept doing after the programme ended.",
    ],
  },
  {
    role: "Freelance software developer",
    org: "Independent",
    period: "2020 — 2024",
    summary:
      "Four years of contract delivery across industries, backend through frontend.",
    points: [
      "E-commerce platforms with Stripe, employee and school management systems, real estate applications, tournament trackers.",
      "Backends in C#, .NET, Node and NestJS; frontends in React, Next.js and Blazor.",
      "Infrastructure with Docker, Kubernetes, SQL and NoSQL, Ansible and Terraform.",
    ],
  },
  {
    role: "IT tutor and mentor",
    org: "Individuals and groups",
    period: "2016 — present",
    summary:
      "Teaching programming, web development, Web3, networking and data science, from absolute beginners to working engineers.",
    points: [
      "Nine years of one-to-one and group teaching, adjusting the explanation until it lands rather than repeating it louder.",
      "Covers CCNA and IT fundamentals as well as application development.",
      "This is the thread that became Docerity's mentorship work.",
    ],
  },
  {
    role: "Lead IT support & field engineer",
    org: "Integrated Power Technology",
    period: "2021 — 2023",
    summary:
      "Where the debugging instinct came from: UPS maintenance, fault tracing and technical documentation at scale.",
    points: [
      "Led teams on large-scale UPS maintenance projects.",
      "Fault tracing on live systems, where reliability is not a nice-to-have.",
      "Wrote the technical documentation — the habit that still shows up in every codebase I touch.",
    ],
  },
] as const;

/** Grouped, because the portfolio's flat 36-item list read as a keyword dump. */
export const skillGroups = [
  {
    title: "Frontend",
    items: ["TypeScript", "React", "Next.js", "Redux", "Tailwind CSS", "Blazor", "HTML & CSS"],
  },
  {
    title: "Backend",
    items: ["Node.js", "NestJS", "Python", "FastAPI", "Django", "C#", ".NET", "C"],
  },
  {
    title: "Data & AI",
    items: ["Data science", "Prompt engineering", "ML model integration", "Pandas & NumPy"],
  },
  {
    title: "Databases",
    items: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQLite", "Firebase"],
  },
  {
    title: "Web3",
    items: ["Solidity", "Rust", "Clarity", "Ethereum", "Stacks", "NEAR", "Stellar"],
  },
  {
    title: "Infrastructure",
    items: ["Docker", "Kubernetes", "AWS", "GCP", "Terraform", "Ansible", "CI/CD", "Bash"],
  },
  {
    title: "Practice",
    items: ["System design", "Microservices", "Data structures & algorithms", "Code review", "Agile delivery", "Technical writing"],
  },
  {
    title: "Also",
    items: ["CCNA", "IT support", "Automation", "Datadog", "Prometheus", "Grafana"],
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
