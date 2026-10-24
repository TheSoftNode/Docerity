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
     a sentence, kept beside the long form so the two cannot drift. */
  availability: "Works across European and US time zones",
  hours: "EU / US overlap",
} as const;

/** The narrative. Three beats: where I came from, what I do, why Docerity. */
/*
  Rewritten against the CVs. The previous version opened on a career in power
  technology, tracing faults through UPS systems, which came from the old
  portfolio and appears in none of the six CVs. It was load-bearing for the
  whole narrative, so the arc is redrawn from what the CVs actually record.
*/
export const story = [
  "I started on contract work: .NET middleware for Nigerian banking rails, NIBSS BVN validation and IBPS integrations, then a run of client systems across financial services, real estate and education. Unglamorous, and the best training I could have had. When the thing you built handles someone's identity verification, you learn quickly that correctness is not a matter of taste.",
  "Backend engineering at ALX came next, then AI products at HitoAI, where two of the things I built went on to raise €123K and €100K. Since then it has been three engagements at once: leading QwikPass end to end as its only engineer, taking three SaaS products at URI from pre-user development into real adoption, and pulling a security scanner out of a Django monolith at SmartComply. Along the way, three Web3 hackathon wins.",
  "The explaining came from an unexpected direction. I spent a few years evaluating AI models: writing rubrics, calibrating prompts until the model fails, checking whether an answer is actually correct or only sounds it. That turns out to be the same work as explaining a system to a junior engineer. You have to know exactly what you know, and exactly how you know it. Docerity is the company around all three things: building software, explaining it clearly, and growing the engineers who will maintain it. It has outgrown what one person can deliver, so the work goes out through a team I train and lead, which is why the mentorship is not a side project but where that team comes from.",
] as const;

/*
  Headline numbers, every one checkable against something else on the site.

  The project count is derived rather than typed, because a hand-written "20+"
  drifts the moment a project is added or removed, and a number nobody can
  reconcile with the projects page is worth less than no number at all.
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
    since: "every one listed on the projects page",
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
  it still led with HitoAI as the current role and carried two entries, an IT
  tutoring thread since 2016 and a field-engineering post at Integrated Power
  Technology, that appear in no CV. Both are left out here rather than
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
    period: "2026 – present",
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
    period: "2026 – present",
    summary:
      "Sole engineer on QwikPass, across five product surfaces and three business lines.",
    points: [
      "Owned access control, payments, communications, compliance, analytics and operations end to end across Flutter mobile, a Guard APK, Next.js management, React events and the public web.",
      "Built backend workflows across 15+ Firebase Functions categories, including a Gemini integration.",
      "Implemented security with Firebase Auth custom claims, 42 Firestore rules, 40+ tamper-evident audit actions and RFC 6238 offline TOTP for low-connectivity gates.",
      "Established 488+ passing tests at 80%+ critical-path coverage, holding gate requests under 307ms and webhook processing under 328ms at p95.",
      "Automated Android and iOS delivery through Codemagic across App Bundle, IPA, TestFlight and Google Play.",
    ],
  },
  {
    role: "Lead Full-Stack Software Engineer",
    org: "URI Creative",
    period: "2025 – present",
    summary:
      "Led three SaaS products from pre-user development into active adoption.",
    points: [
      "Architected microservices across FastAPI, NestJS, .NET 8, MongoDB and Redis for social publishing, lead generation, analytics and a public developer API.",
      "Built a three-tier SmartLLMRouter over GPT-4o, Gemini and a rule-based fallback, processing millions of posts at 90% lower routing cost and above 99.99% uptime.",
      "Shipped a production RAG pipeline on 1,536-dimension embeddings and MongoDB Atlas Vector Search with cosine similarity and metadata filtering.",
      "Engineered a 2,800-line multimodal vision service using GPT-4o Vision and DALL·E 3, with blur, exposure and platform-specific quality gates.",
      "Deployed a nine-container WhatsApp architecture (three FastAPI webhook servers, three Celery workers, Redis, Flower and Nginx), then migrated production from Azure to AWS.",
    ],
  },
  {
    role: "AI & frontend engineering, on contract",
    org: "ApplyLoop",
    period: "2024 – present",
    summary:
      "Four engagements: RLHF evaluation, training-data design, prompt engineering, and a React build.",
    points: [
      "Evaluated 150+ technical model responses and produced golden annotations, verifying claims by executing the code rather than reading it.",
      "Designed 207+ training samples across eight application categories, with rubrics spanning five verification dimensions and three difficulty bands.",
      "Built repository-comprehension prompts carrying 20–40 weighted criteria each, calibrated to a 50% model failure rate to find where models fabricate fields, operators and source locations.",
      "Built LeaguesFun in React 19 and TypeScript, with live leaderboards, a drag-and-drop lineup editor and wallet auth over Ethers.js, Wagmi, Viem and Privy.",
    ],
  },
  {
    role: "Blockchain Developer",
    org: "Web3 hackathons",
    period: "2024 – present",
    summary:
      "Three hackathon wins, across Solana, Stacks, NEAR, Stellar and MetaMask.",
    points: [
      "Built MetaPilot, a MetaMask × Solana winner: a four-program DeFi automation protocol in 2,000+ lines of Rust and Anchor for DAO voting, scheduling and AI-guided workflows.",
      "Built VeriAI, also a MetaMask × Solana winner, turning AI outputs into immutable verification certificates through Solana's oracle network.",
      "Engineered RealPayTag as a 9,700-line Rust multi-program system for real-world asset tokenisation, covering asset registry, identity, an asset-backed stablecoin and payroll.",
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
      "Built HyQ for gas-quality analytics and the SusNet MVP for household energy. Those two products secured €123K and €100K in funding.",
      "Integrated Selwell across Next.js, Django REST and Flask to connect a trading interface to a trained bot.",
      "Delivered Easmark for AI-assisted thesis grading, plus the HitoAI and Biasadra web experiences.",
    ],
  },
  {
    role: "Backend Engineer",
    org: "ALX Africa",
    period: "2023 – 2024",
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
    period: "2020 – 2023",
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
  specific than the portfolio's flat 36-item list; that one ended in "and
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
    period: "2023 – 2024",
  },
  {
    qualification: "Data Science",
    institution: "ALX · ExploreAI Academy",
    period: "2023 – 2024",
  },
  {
    qualification: "AI Career Essentials",
    institution: "ALX",
    period: "2023 – 2024",
  },
  {
    qualification: "B.Eng Electrical & Electronic Engineering, 2nd class upper",
    institution: "Federal University of Technology, Owerri",
    period: "2012 – 2018",
  },
  {
    qualification: "Google IT Support Professional Certificate",
    institution: "Coursera",
    period: "2022 – 2024",
  },
  {
    qualification: "Google IT Automation with Python",
    institution: "Coursera",
    period: "2023 – 2024",
  },
  {
    qualification: "Cisco Certified Network Associate (CCNA)",
    institution: "NIIT · Cisco",
    period: "2022 – 2024",
  },
] as const;

/*
  The scans themselves, converted to WebP at 640px: 6.4MB of PNG and JPEG in
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

/*
  The full story, in the founder's own words, behind "Read the full story"
  on the About page. Plain text: a blank line starts a paragraph, a line
  starting "## " is a subheading, and `backticks` mark code. Its opening
  paragraphs are what the page shows before it is opened.
*/
export const fullStory = {
  title: "My Journey Into Technology",
  body: "My journey into technology was not a straight line, and I think that is one of the things I appreciate most about it.\n\nEven as a child, I was always interested in how things worked. I liked fixing things, joining wires together, taking things apart, and trying to build small things of my own. Sometimes it was something as simple as trying to make a little toy car work. I did not know anything about engineering then. I just enjoyed the feeling of being able to understand something and make it do what I wanted.\n\nBut I also had a very creative side.\n\nI loved art, aesthetics, writing, and anything that required imagination and deep thinking. At one point, writing was a serious part of my life. I wrote several stories and novels, and a few of them came close to being published. Unfortunately, I did not have much guidance or mentorship around me at the time. I had ideas, but I did not really have someone who understood the vision well enough to help me take it further, so that part of my life gradually faded into the background.\n\nLooking back now, I do not think the writing disappeared completely. It shows up differently today. It affects how I think about products, how I explain technical ideas, how I teach, how I design user experiences, and even how I approach solving engineering problems.\n\nBy secondary school, I knew I wanted to do something with computers. My original plan was to study Computer Engineering. When it was time to apply to university, however, I was advised that Computer Engineering was not really an option available to me, so I went into Electrical and Electronics Engineering instead.\n\nIt turned out to be a useful detour.\n\nDuring my second year at university, we were introduced to Java and C++. That was the point where computers stopped being something I simply liked and became something I wanted to understand deeply.\n\nProgramming fascinated me because it gave me the same feeling I had when I was younger and playing with wires: you could understand a system, give it instructions, change its behaviour, make mistakes, correct them, and eventually create something that did not exist before.\n\nI became very interested in C++ in particular. I bought a physical copy of Deitel's C++ book and started going through the exercises. At the beginning, I did not even have my own laptop, so learning was not as convenient as it is now. When I eventually got one, I spent a lot more time practising C++ and Java.\n\nI also had a friend who became a kind of informal mentor to me. He was extremely intelligent and much more intense about programming than I was at that stage. He would go ahead, learn things, experiment with them and then come back and explain them to me. That relationship had a big influence on me. It also probably explains why teaching and mentoring later became such a natural part of my own career.\n\nAround 2015, that same friend introduced me to web development.\n\nI started with the fundamentals: HTML, CSS and plain JavaScript. Then came PHP, Apache, XAMPP, AJAX, JSON and the typical web stack we were using at the time.\n\nThere were no frameworks hiding much from me in the beginning. If I wanted something to happen in the browser, I had to understand the DOM, events, browser behaviour and how JavaScript actually worked. I spent a lot of time writing vanilla JavaScript, manipulating the DOM and making asynchronous requests manually.\n\nI am grateful for that period because when frameworks eventually became a major part of my work, I already understood what was happening underneath them.\n\nAround 2016, I became curious about data analytics and picked up Python.\n\nPython ended up becoming one of the longest-running technologies in my career.\n\nInterestingly, my bigger ambition at the time was actually cybersecurity. I thought that eventually I would become a cybersecurity specialist, so I was learning technologies that I believed would take me in that direction: Python, networking, Linux, scripting, automation and later cloud computing.\n\nBut while I was preparing for a future in security, I was already becoming a software engineer.\n\nI was building web applications, helping people with projects, freelancing, teaching Python and web development, and tutoring people who were trying to understand programming. I used Python for scripts, backend development, data work and automation, and over time started working with frameworks such as Django and later FastAPI.\n\nAfter university, around 2018, I was still exploring Java because I wanted a stronger backend language and was also interested in desktop applications. PHP had taught me a lot, but I was looking for something that felt more suitable for the kinds of systems I wanted to build.\n\nThen Node.js entered the picture for me around 2019.\n\nBeing able to use JavaScript on both sides of an application was exciting. I was already very comfortable with JavaScript in the browser, so Node.js opened another door.\n\nAround the same period, I moved seriously into React.\n\nI started using React back when class components and lifecycle methods like `componentDidMount` were still normal. Then I watched the ecosystem move toward hooks and functional components, and I moved with it.\n\nThat period became the foundation of the full-stack engineer I am today.\n\nI worked with JavaScript, Node.js, React, MongoDB and the surrounding ecosystem, and over time moved into TypeScript, Next.js and NestJS. I used them in personal projects, freelance work and professional environments, while still teaching and mentoring people around me.\n\nAt the same time, I kept following the infrastructure and cybersecurity side of computing.\n\nI completed my CCNA training because I wanted a proper understanding of networking. I spent time learning AWS, Google Cloud and Azure. I worked with Linux, Bash, automation and deployment. Even though I did not eventually abandon software engineering to become a traditional cybersecurity professional, that knowledge has been extremely useful.\n\nIt is one of the reasons I am comfortable moving beyond application code into infrastructure, deployments, containers, networking, authentication, security and distributed systems.\n\nI also added C# to my stack.\n\nPart of the motivation was that I wanted experience with a strongly typed enterprise language alongside JavaScript and Python. I was also interested in banking and financial systems, where .NET was widely used.\n\nThat eventually led to a brief opportunity working as a C# developer at First Bank.\n\nAt the time, I was also working remotely in a full-stack engineering role. Managing the conditions of the banking job alongside my other engineering responsibilities became difficult, so I eventually chose to leave the role. But I did not leave C#. I continued learning and building with C# and .NET, and it later became part of the technology mix I used in larger systems.\n\nAnother important phase of my career was going through intensive software engineering and data science training.\n\nI completed a 12-month software engineering programme where I spent a significant amount of time working with C, Linux, Bash, Python, algorithms, backend development and systems concepts. Working with C was especially useful because it forced me to think differently about memory, processes and what higher-level languages were doing for me automatically.\n\nBash also became useful for scripting and automation.\n\nAlongside that, I completed a data science programme. Because I had already been using Python for years, I was not learning the language from zero. Instead, I was seeing it from another angle: data processing, analytics, modelling and working with larger datasets.\n\nThe two programmes complemented each other well. One deepened my understanding of software systems; the other pushed me further into data.\n\nBy 2024, a lot of the different things I had been learning separately started coming together professionally.\n\nAt HITOAI, I worked across a range of AI-focused products rather than just one application. I contributed to EEP, an AI-powered education platform; Selwell, an AI trading platform; Easmark, an AI-assisted thesis and code-assessment platform; and AI4Energy, which used predictive analytics around fuel pricing.\n\nI also worked on HyQ, an AI-driven gas-quality monitoring platform that combined software with energy-domain data and IoT concepts. The project went on to secure EUR123,000 in funding. SusNet, another AI-powered energy-management product I worked on, secured EUR100,000 in funding.\n\nThat experience was important because AI stopped being something I was only studying and became something I was integrating into actual products.\n\nMy Python background became particularly useful there. Django, FastAPI, Flask and Python scripts appeared repeatedly in the systems we were building.\n\nI also worked on ALX Connect as part of a small backend team. We built APIs with Django REST Framework, authentication with JWT, real-time communication using WebSockets, email services and features around developer matching, mentorship, CV reviews and profiles.\n\nAt the same time, I became much more involved in AI evaluation itself.\n\nThrough Applyloop, I started working on something quite different from normal application development: understanding where AI models fail.\n\nI designed technical prompts against real codebases, built evaluation rubrics, verified answers directly against source code and looked for the difference between a model genuinely understanding a repository and simply producing an answer that sounded believable.\n\nSome of the tasks required hours of manually tracing code across files before I could even design the evaluation properly.\n\nThat eventually expanded into AI training-data engineering and RLHF quality work. I created more than 200 structured training samples for applications and evaluated more than 150 technical model tasks across areas including C, C++, Python, JavaScript, TypeScript, Bash, R, SQL, Linux and web development.\n\nWhat I found interesting about that work was that it combined almost every part of my background: programming, writing, analysis, attention to detail and the ability to explain why something was correct or wrong.\n\nI even returned to frontend engineering within the same environment, working on LeaguesFun, a blockchain fantasy-sports application built with React, TypeScript and Web3 technologies.\n\nWeb3 itself became another important part of my journey.\n\nI began experimenting with smart contracts and decentralized applications using Solidity, Clarity and eventually Rust. I built across ecosystems including Stacks, Solana and Hedera and participated in several hackathons.\n\nSome of those experiments became wins.\n\nVeriAI, which focused on proving the authenticity and provenance of AI-generated content, won in a MetaMask x Solana hackathon. MetaPilot, another winning project, explored using AI agents to automate activities such as DAO voting, reward claiming and token operations.\n\nI also went much deeper into Rust and Solana, building multi-program systems rather than only small demonstration contracts.\n\nWhat attracted me to Web3 was not simply cryptocurrency. It was another systems problem: distributed state, trust, identity, ownership, automation and how applications behave when the database is effectively a shared network.\n\nThen my work started shifting toward engineering leadership.\n\nAt URI Creative, I moved into a Lead Full-Stack Software Engineer role and worked across URI Social, URI Insights and the URI SDK Gateway.\n\nThat role forced me to think beyond individual features.\n\nWe were dealing with Next.js and TypeScript on the frontend, FastAPI and NestJS services, C#/.NET components, MongoDB, Redis, messaging systems, Docker and cloud infrastructure.\n\nOn the AI side, I worked on LLM integrations involving GPT-4o, Claude and Gemini. I built RAG systems using vector search, conversational AI for lead qualification, multimodal pipelines for analysing and generating images, and a routing layer that decided which model or fallback path should handle different workloads.\n\nOne of the systems processed millions of social posts while reducing AI-related cost significantly and maintaining very high availability.\n\nI also built a WhatsApp-based conversational system where a user could send a message or product image, explain what they wanted to publish, have the AI understand the request, generate content and imagery, and schedule the result across social platforms.\n\nThe production architecture behind that became a distributed system of FastAPI webhook servers, Celery workers, Redis, Nginx and Docker containers.\n\nBut one of the things I value most from URI is not really a particular technology.\n\nI was involved when the products were still in a pre-user stage and helped take them into the point where real users were beginning to adopt the platform. I also helped lead the migration of the infrastructure from Azure to AWS.\n\nThat experience changed how I looked at engineering. It was no longer enough for the code to work. Architecture, costs, reliability, users, deployment, product decisions and the ability of a team to maintain what we built all mattered.\n\nAt Coretrix Technologies, that responsibility became even more direct.\n\nAs Lead Engineer and the sole engineer behind QwikPass, I have had to own practically the entire technical surface of the product.\n\nQwikPass is not one application. It spans a Flutter mobile application, a separate Guard application, a Next.js management platform, event interfaces and the public web experience.\n\nBehind those interfaces are Firebase services and functions covering authentication, visitor passes, notifications, payments, reporting, security, emergency workflows, communication, utilities and AI integrations.\n\nWorking on it has required me to move continuously between mobile development, frontend development, backend architecture, security, testing, product thinking and deployment.\n\nThat kind of ownership teaches you very quickly that being a full-stack engineer is not just about knowing frontend and backend frameworks. Sometimes you are the person who has to understand why the entire system exists and make sure all the pieces actually work together.\n\nMore recently, at SmartComply, my work has brought me surprisingly close to the cybersecurity direction that interested me years ago.\n\nI work on a compliance and API-security platform using Django, React, FastAPI, PostgreSQL, Celery, Redis and Docker.\n\nOne of the larger pieces of work involved pulling API-security scanning out of the main Django application into its own service. The scanner coordinates tools such as OWASP ZAP, Nuclei and Schemathesis.\n\nThat project involved much more than writing endpoints. I had to deal with worker saturation under load, backpressure, retries, idempotency, Docker orchestration, report generation, deployment failures and security boundaries.\n\nAt one point, load testing showed that around 40 queued scans could exhaust the service's thread pool. I redesigned that part around bounded processing and proper backpressure so the service could remain responsive instead of collapsing under the workload.\n\nI also worked on reducing an API response that had become unnecessarily large by roughly 170 times and reduced the scanner container image from about 411 MB to 217 MB.\n\nIt is funny in a way. I spent years thinking that one day I would leave software development and move into cybersecurity. Instead, software engineering became broad enough that security came back into my work naturally.\n\nAnd that probably describes my career better than listing the languages I know.\n\nI have worked with C, C++, Java, JavaScript, TypeScript, Python, C#, Bash, Solidity, Clarity and Rust at different points. I have worked across React, Next.js, Node.js, NestJS, Django, FastAPI and .NET. I have built with MongoDB, PostgreSQL, Redis, Firebase and other databases. I have deployed systems across AWS, GCP and Azure. I have worked in AI, Web3, mobile development, backend engineering, frontend engineering, infrastructure and security.\n\nBut I do not see my career as a collection of technologies.\n\nFor me, there has always been one thread running through all of it: curiosity.\n\nThe child joining wires together wanted to know why something worked.\n\nThe university student struggling through C++ exercises wanted to know how to make a computer obey an idea.\n\nThe young web developer writing vanilla JavaScript wanted to understand what was really happening inside the browser.\n\nThe person studying networking and security wanted to understand what was happening underneath the application.\n\nThe AI engineer evaluating models wants to know whether the system actually understands what it claims to understand.\n\nAnd today, when I am designing a distributed service, an AI workflow, a mobile product or a security system, I still find myself asking essentially the same questions.\n\nHow does this really work?\n\nWhere will it break?\n\nCan it be simpler?\n\nCan it be faster?\n\nCan it be safer?\n\nAnd can I understand it well enough to explain it to somebody else?\n\nTeaching has stayed with me throughout the journey as well. I have tutored people in programming, helped friends learn technologies, mentored developers and spent years explaining concepts while I was still learning new ones myself.\n\nThat part matters to me because I know what it feels like to have ability and curiosity but not always have someone available to point you in the right direction.\n\nSo when I look back, the journey makes much more sense than it did while I was living through it.\n\nThe writing was not wasted.\n\nElectrical and Electronics Engineering was not a wrong turn.\n\nThe years I spent thinking about cybersecurity were not a distraction.\n\nLearning networking was not separate from software engineering.\n\nData science was not separate from backend development.\n\nWeb3 was not separate from distributed systems.\n\nAnd AI did not suddenly appear in my career when ChatGPT became popular. It grew naturally out of years of working with Python, data, automation and software systems.\n\nToday, I would describe myself as a full-stack software and AI engineer, but even that title only explains part of what I do.\n\nWhat I really enjoy is taking difficult technical problems, understanding the systems behind them, and turning them into products that actually work.\n\nThat is what has kept me in technology all these years.\n\nAnd I still feel like I am only getting started.",
};
