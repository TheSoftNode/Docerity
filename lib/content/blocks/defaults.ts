import { nameForIcon } from "@/lib/content/icons";
import type { BlockData, BlockKey } from "@/lib/content/blocks/schema";

import { organisations, ecosystems } from "@/components/sections/clients/clients-data";
import * as howWeWork from "@/components/sections/how-we-work-page/how-we-work-data";
import { privacy, terms } from "@/components/sections/legal-page/legal-data";
import {
  certifications,
  education,
  experience,
  facts,
  founder,
  fullStory,
  skillGroups,
  story,
  tools,
} from "@/components/sections/about/about-data";
import {
  applySteps,
  audiences,
  faqs,
  formatSteps,
  specialties,
  stages,
  teamPrinciples,
} from "@/components/sections/mentorship-program/mentorship-program-data";
import { checkpoints } from "@/components/sections/mentorship/mentorship-data";
import {
  capabilities as serviceCapabilities,
  process as serviceProcess,
  stack as serviceStack,
} from "@/components/sections/work-program/work-program-data";
import {
  capabilities as aiCapabilities,
  models as aiModels,
  projects as aiProjects,
} from "@/components/sections/ai/ai-data";
import {
  capabilities as web3Capabilities,
  ecosystems as web3Ecosystems,
  projects as web3Projects,
  stack as web3Stack,
} from "@/components/sections/web3/web3-data";
import { pairs } from "@/components/sections/explainers/explainers-data";
import { steps as contactSteps } from "@/components/sections/contact/contact-data";
import { FORM_COPY } from "@/components/sections/contact/contact-content";

/**
 * What each section renders when the database has nothing to say.
 *
 * Not placeholder content. This is the copy that is live today, read straight
 * out of the files it already lives in, which means three things at once: a
 * fresh clone with no MONGODB_URI renders the real site, the e2e suite runs
 * without a database, and an unreachable Atlas during a deploy shows the
 * previous copy rather than an empty page.
 *
 * It is also what the admin imports on first use, so the first edit starts from
 * what is on the site rather than from a blank form.
 *
 * Icons are converted to registry names here, because a React component cannot
 * round-trip through MongoDB and the editor stores what the database can hold.
 */

export const DEFAULTS: Record<BlockKey, BlockData> = {
  site: {
      "identity": {
        "name": "Docerity",
        "tagline": "Software · Data · Operations · Mentorship",
        "description": "Docerity builds production software, prepares the data behind AI systems, and puts trained assistants on the operational work around both. We also mentor the engineers who do it.",
        "email": "thesoftnode@gmail.com",
        "bookingUrl": "",
        "bookingLabel": "Book a 20-minute call"
      },
      "socials": [
        {
          "label": "GitHub",
          "url": "https://github.com",
                  },
        {
          "label": "LinkedIn",
          "url": "https://linkedin.com",
                  },
        {
          "label": "X",
          "url": "https://x.com",
                  }
      ],
      "navLinks": [
    {
      "label": "Projects",
      "href": "/projects"
    },
    {
      "label": "AI",
      "href": "/ai"
    },
    {
      "label": "Web3",
      "href": "/web3"
    },
    {
      "label": "Mentorship",
      "href": "/mentorship"
    },
    {
      "label": "Blog",
      "href": "/blog"
    },
    {
      "label": "About",
      "href": "/about"
    }
  ],
      "footerLinks": [
    {
      "label": "Projects",
      "href": "/projects"
    },
    {
      "label": "AI",
      "href": "/ai"
    },
    {
      "label": "Web3",
      "href": "/web3"
    },
    {
      "label": "Mentorship",
      "href": "/mentorship"
    },
    {
      "label": "Blog",
      "href": "/blog"
    },
    {
      "label": "How we work",
      "href": "/how-we-work"
    },
    {
      "label": "About",
      "href": "/about"
    },
    {
      "label": "Reviews",
      "href": "/reviews"
    },
    {
      "label": "Write for us",
      "href": "/contribute"
    }
  ]
    },

  seo: {
      "pages": {
        "home": {
          "title": "Docerity · Engineering, Mentorship & Tech Explainers",
          "description": "Docerity builds production software, prepares the data behind AI systems, and puts trained assistants on the operational work around both. We also mentor the engineers who do it."
        },
        "services": {
          "title": "Services",
          "description": "Software engineering, AI and LLM work, data annotation and evaluation, data engineering, virtual assistants, Web3 and mentorship, from one team."
        },
        "work": {
          "title": "Projects",
          "description": "Production software shipped for real teams: fintech dashboards, commerce platforms, offline-first mobile apps, and the process behind them."
        },
        "ai": {
          "title": "AI Engineering",
          "description": "Production LLM systems, RAG, multi-modal AI pipelines, and conversational agents, plus model evaluation and RLHF training data design."
        },
        "web3": {
          "title": "Web3",
          "description": "Hackathon-winning dApps and smart contract systems across Solana, Stacks, and beyond: DeFi automation, real-world asset tokenization, and AI x Web3."
        },
        "mentorship": {
          "title": "Mentorship",
          "description": "Weekly 1:1s, honest code review, and a real plan. Mentorship for junior engineers, career switchers, and mid-level engineers leveling up."
        },
        "blog": {
          "title": "Tech Explainers",
          "description": "Complex engineering concepts explained through everyday analogies: caching, load balancing, API requests, concurrency, and more."
        },
        "about": {
          "title": "About",
          "description": "The engineer behind Docerity: nine years teaching, production software in Python, Node and TypeScript, smart contracts across six blockchain ecosystems."
        },
        "contact": {
          "title": "Contact",
          "description": "Start a project, apply for mentorship, or just say hello. Tell Docerity what you're building."
        },
        "reviews": {
          "title": "Reviews",
          "description": "Reviews from clients and mentees, and a form to leave one. Every review is read before it appears."
        },
        "contribute": {
          "title": "Writing for Docerity",
          "description": "How the engineers we mentor end up with their name on an explainer."
        },
        "how-we-work": {
          "title": "How we work",
          "description": "Four ways to work with Docerity: a project build, monthly support, engineers for your team, or a review and plan first. What you can expect on every project."
        },
        "privacy": {
          "title": "Privacy policy",
          "description": "What Docerity collects through this site, why, who stores it, and how to see, correct or delete your data."
        },
        "terms": {
          "title": "Terms of use",
          "description": "The terms for using the Docerity website: our content, what you send us, and how client work is agreed."
        }
      }
    },

  "services-page": {
    "headings": {
      "services-hero": {
        "eyebrow": "What we do",
        "title": "One team, for the parts a project actually needs.",
        "lede": "Most of this work arrives together: something to build, data to prepare for it, and the operational load around both. Rather than three suppliers who do not talk to each other, it is one team."
      },
      "services-lines": {
        "eyebrow": "Services",
        "title": "What we build, and what we run alongside it.",
        "lede": ""
      }
    },
    "lines": [
    {
      "title": "Software engineering",
      "summary": "Web applications, APIs and mobile, built to survive production",
      "description": "Full-stack products from first commit to the version after launch: the interface somebody uses, the services behind it, and the data model that decides how much of it has to be rewritten in a year.",
      "href": "/projects",
      "iconName": "MonitorSmartphoneIcon"
    },
    {
      "title": "AI and LLM engineering",
      "summary": "Retrieval, routing and evaluation that hold up at real volume",
      "description": "Getting a model to answer once is the easy part. We build the routing that keeps it affordable, the retrieval that keeps it grounded, and the evaluation that tells you whether either is working.",
      "href": "/ai",
      "iconName": "BrainIcon"
    },
    {
      "title": "Web3 and blockchain",
      "summary": "Smart contract systems across several ecosystems",
      "description": "Contracts in Solidity, Clarity and Rust, plus the DeFi automation and asset tokenisation around them. Designed for the fact that a contract holding real value is hard to change once it is live.",
      "href": "/web3",
      "iconName": "LinkIcon"
    },
    {
      "title": "Data annotation and evaluation",
      "summary": "Labelling and rubrics by people who can read what they are judging",
      "description": "Training samples, annotation rubrics and RLHF evaluation across technical tasks, done by engineers rather than by a crowd. On code, the difference between an answer that is correct and one that only sounds correct is the whole job.",
      "href": "",
      "iconName": "ClipboardCheckIcon"
    },
    {
      "title": "Data engineering",
      "summary": "Pipelines, migrations and the plumbing under a reporting layer",
      "description": "Getting data out of wherever it is stuck and into something you can query: ingestion, transformation, vector and relational stores, and the monitoring that tells you when a feed went quiet.",
      "href": "",
      "iconName": "DatabaseIcon"
    },
    {
      "title": "Virtual assistants and operations",
      "summary": "Trained assistants for the repeatable work that eats a week",
      "description": "Inbox, scheduling, research, data entry and customer replies, handled by assistants we train and supervise. Useful when the bottleneck is not a feature but the hours around it.",
      "href": "",
      "iconName": "UsersIcon"
    },
    {
      "title": "Mentorship and training",
      "summary": "Weekly 1:1s and honest code review for engineers levelling up",
      "description": "The reason the bench exists. Engineers are trained here before they are put on client work, and the same programme is open to anyone who wants it.",
      "href": "/mentorship",
      "iconName": "CompassIcon"
    }
  ]
  },

  homepage: {
      "hero": {
        "eyebrow": "Software · Data · Operations · Mentorship",
        "title": "Software, data,\nand the people to run it.",
        "lede": "We build the software, prepare and label the data behind your AI, and put trained assistants on the work around both. One team we train and manage, instead of three hires.",
        "primaryLabel": "Start a project",
        "secondaryLabel": "See what we do"
      },
      "headings": {
        "home-work": {
          "eyebrow": "Selected Work",
          "title": "Recent work, real outcomes.",
          "lede": "A few of the systems we have shipped, picked for what they solved rather than how they look."
        },
        "home-testimonials": {
          "eyebrow": "What people say",
          "title": "Trusted by teams, engineers and readers.",
          "lede": ""
        },
        "home-mentorship": {
          "eyebrow": "Mentorship",
          "title": "A clear path to your next level.",
          "lede": "Weekly 1:1s, honest code review, and a real plan you can follow between sessions."
        },
        "home-cta": {
          "eyebrow": "Available for new work",
          "title": "Got work *worth doing properly*?",
          "lede": "A build, a data set, an assistant, or just a question. A person reads every email, and replies."
        }
      },
      contactOptions: {
        project: { title: "A new project", detail: "Scope, build and ship production software." },
        mentorship: { title: "Mentorship", detail: "Weekly 1:1s and honest code review." },
        question: { title: "Just a question", detail: "" },
      },
    },

  clients: {
    headings: {
      "clients": {
        "eyebrow": "Worked with",
        "title": "Teams, and the ground it was built on.",
        "lede": "Two different things, kept apart on purpose: the organisations the work was for, and the protocols it was built on."
      }
    },
    organisations: organisations.map((logo) => ({ ...logo })),
    ecosystems: ecosystems.map((logo) => ({ ...logo })),
  },

  about: {
    headings: {
      "about-hero": {
        "eyebrow": "About",
        "title": "Every branch merged into *one studio.*",
        "lede": "Docerity is a software studio founded by Theophilus Uchechukwu. It builds software, explains it clearly, and trains the engineers who maintain it."
      },
      "about-story": {
        "eyebrow": "The story",
        "title": "Built first, explained second, taught third.",
        "lede": "The studio is three things that turned out to be one skill. Read it in the founder's own words."
      },
      "about-team": {
        "eyebrow": "The team",
        "title": "The people behind the work.",
        "lede": "Docerity is a team of engineers who build, review and ship the work together."
      },
      "about-experience": {
        "eyebrow": "Experience",
        "title": "What shipped, and where.",
        "lede": "Every role, newest first. Open one for its release notes."
      },
      "about-toolkit": {
        "eyebrow": "Toolkit",
        "title": "The stack, by what it is for.",
        "lede": "Pick a part of the system and see what we reach for. Every one of these has been in production, not just in a tutorial."
      },
      "about-credentials": {
        "eyebrow": "Credentials",
        "title": "Studied, certified, and checkable.",
        "lede": "The certificates themselves, not a line claiming them. Pick one to look at it properly."
      }
    },
    founder: {
      ...founder,
      /* The portrait was a constant in `about-hero.tsx`. Its path is the
         default; replacing it is now an upload rather than a commit. */
      portrait: "/about/headshot.webp",
    },
    team: [],
    story: [...story],
    fullStory: { ...fullStory },
    facts: facts
      /* The shipped-project count is counted from the work section rather than
         stored, so it is not offered for editing and not seeded here. */
      .filter((fact) => fact.label !== "Shipped projects")
      .map((fact) => ({ ...fact })),
    experience: experience.map((entry) => ({ ...entry, points: [...entry.points] })),
    skillGroups: skillGroups.map((group) => ({ ...group, items: [...group.items] })),
    tools: tools.map((tool) => ({ ...tool })),
    education: education.map((entry) => ({ ...entry })),
    certifications: certifications.map((entry) => ({ ...entry, image: entry.image ?? "" })),
  },

  mentorship: {
    headings: {
      "mentorship-hero": {
        "eyebrow": "Mentorship",
        "title": "A clear path to your next level.",
        "lede": "Weekly 1:1s, honest code review, and a real plan you can follow between sessions. For engineers who want someone invested in their growth, not a subscription to a video course."
      },
      "mentorship-audience": {
        "eyebrow": "Who this is for",
        "title": "Three starting points, one honest process.",
        "lede": ""
      },
      "mentorship-path": {
        "eyebrow": "How it works",
        "title": "One path, four stages.",
        "lede": "You start where you actually are, and move on when the work shows you are ready, not when a calendar says so."
      },
      "mentorship-format": {
        "eyebrow": "What you get",
        "title": "Not just office hours.",
        "lede": "A standing session, feedback between sessions, a plan that moves with you, and a way to reach out when something can't wait."
      },
      "mentorship-team": {
        "eyebrow": "Who reviews your code",
        "title": "A team that ships, not a lone tutor.",
        "lede": "Your reviews come from engineers on the Docerity team, the same people building the systems on our projects page. You keep one lead for continuity, and get a specialist when the work calls for one."
      },
      "mentorship-testimonials": {
        "eyebrow": "From mentees",
        "title": "Real progress, in their words.",
        "lede": ""
      },
      "mentorship-faq": {
        "eyebrow": "FAQ",
        "title": "Questions before you apply.",
        "lede": "The things people usually ask before a first call."
      },
      "mentorship-apply": {
        "eyebrow": "Taking new mentees",
        "title": "Your next level starts with a *short note.*",
        "lede": ""
      }
    },
    audiences: audiences.map((entry) => ({ ...entry })),
    stages: stages.map((entry) => ({ ...entry })),
    checkpoints: checkpoints.map((entry) => ({ ...entry })),
    formatSteps: formatSteps.map((entry) => ({ ...entry })),
    teamPrinciples: teamPrinciples.map((entry) => ({ ...entry })),
    specialties: [...specialties],
    applySteps: applySteps.map((entry) => ({ ...entry })),
    faqs: faqs.map((entry) => ({ ...entry })),
  },

  services: {
    headings: {
      "work-hero": {
        "eyebrow": "Selected Work",
        "title": "Software built for what happens after launch.",
        "lede": "A few production systems, picked for the problems they actually solved, plus how projects like these usually go, start to finish."
      },
      "work-capabilities": {
        "eyebrow": "What we build",
        "title": "Four kinds of problems, one way of working.",
        "lede": "Different surfaces, same discipline: understand the problem, design for the version after this one, and ship it in pieces you can review."
      },
      "work-showcase": {
        "eyebrow": "Selected work",
        "title": "Everything shipped, and where it runs.",
        "lede": "Every one of them live or in active build. Filter by what you came to see."
      },
      "work-process": {
        "eyebrow": "How it works",
        "title": "From first call to shipped software.",
        "lede": "Four stages, each ending in something you can look at, not a status update."
      },
      "work-stack": {
        "eyebrow": "The stack",
        "title": "Boring where it counts, sharp where it matters.",
        "lede": "Proven tools for the parts that must not surprise anyone, and newer ones only where they earn their place."
      },
      "work-testimonials": {
        "eyebrow": "From clients",
        "title": "What it's like to work together.",
        "lede": ""
      }
    },
    capabilities: serviceCapabilities.map(({ Icon, ...rest }) => ({
      ...rest,
      iconName: nameForIcon(Icon),
    })),
    process: serviceProcess.map(({ Icon, ...rest }) => ({
      ...rest,
      iconName: nameForIcon(Icon),
    })),
    stack: [...serviceStack],
  },

  ai: {
    headings: {
      "ai-hero": {
        "eyebrow": "AI & LLM Engineering",
        "title": "AI systems that run in production, not a demo.",
        "lede": "LLM routing, RAG, multi-modal pipelines, and conversational agents, processing millions of real requests, plus the model evaluation work behind training data that actually improves a model."
      },
      "ai-projects": {
        "eyebrow": "Systems",
        "title": "Built for real traffic, not a proof of concept.",
        "lede": ""
      },
      "ai-capabilities": {
        "eyebrow": "What we build",
        "title": "The part after the demo works.",
        "lede": "Getting a model to answer once is the easy part. These are the pieces that keep it answering cheaply, reliably, and at real volume."
      },
      "ai-models": {
        "eyebrow": "Models & platforms",
        "title": "Picked per task, not one model for everything.",
        "lede": "Each call goes to the model that fits it, weighing quality against cost instead of paying top price for every request."
      }
    },
    projects: aiProjects.map(({ Icon, tags, ...rest }) => ({
      ...rest,
      tags: [...tags],
      iconName: nameForIcon(Icon),
    })),
    capabilities: aiCapabilities.map(({ Icon, ...rest }) => ({
      ...rest,
      iconName: nameForIcon(Icon),
    })),
    models: [...aiModels],
  },

  web3: {
    headings: {
      "web3-hero": {
        "eyebrow": "Web3 & Blockchain",
        "title": "Hackathon-winning dApps, shipped on real chains.",
        "lede": "Smart contract systems, DeFi automation, and real-world asset tokenization across Solana, Stacks, and beyond. Three hackathon wins came out of it, and the contracts are live."
      },
      "web3-projects": {
        "eyebrow": "Projects",
        "title": "Built, shipped, and recognized.",
        "lede": ""
      },
      "web3-ecosystems": {
        "eyebrow": "Ecosystems",
        "title": "Cross-chain, not locked to one network.",
        "lede": "The chain follows the problem. Contracts in Solidity, Clarity or Rust, depending on where the users and the liquidity already are."
      },
      "web3-capabilities": {
        "eyebrow": "What we build",
        "title": "On-chain systems that hold up under real use.",
        "lede": "Contracts are hard to change once they hold real value, so they are designed for security and maintenance from the first line."
      }
    },
    projects: web3Projects.map(({ Icon, tags, ...rest }) => ({
      ...rest,
      tags: [...tags],
      iconName: nameForIcon(Icon),
    })),
    ecosystems: [...web3Ecosystems],
    capabilities: web3Capabilities.map(({ Icon, ...rest }) => ({
      ...rest,
      iconName: nameForIcon(Icon),
    })),
    stack: [...web3Stack],
  },

  explainers: {
    headings: {
      "explainers": {
        "eyebrow": "Tech Explainers",
        "title": "Complex ideas, explained through things you already know.",
        "lede": "Every post pairs a real technical concept with an everyday analogy, so it actually sticks."
      }
    },
    /* Flattened. The pair is a concept object beside an analogy object, and
       nesting one record inside another would mean a second kind of group in
       the editor for one section's benefit. */
    pairs: pairs.map((pair) => ({
      id: pair.id,
      conceptLabel: pair.concept.label,
      conceptCaption: pair.concept.caption,
      conceptIcon: nameForIcon(pair.concept.Icon),
      analogyLabel: pair.analogy.label,
      analogyCaption: pair.analogy.caption,
      analogyIcon: nameForIcon(pair.analogy.Icon),
    })),
  },

  contact: {
    headings: {
      "contact": {
        "eyebrow": "New project",
        "title": "Tell us what you're building.",
        "lede": "A few details now save a lot of back-and-forth later. Every message is read by a person who could do the work."
      },
      "contact-mentorship": {
        "eyebrow": "Mentorship · taking new mentees",
        "title": "Tell us where you are.",
        "lede": "Where you are now, where you want to get to, and a little of your code if you have it. The intro call takes it from there."
      },
      "contact-speaking": {
        "eyebrow": "Speaking & workshops",
        "title": "Tell us about your audience.",
        "lede": "Who will be in the room, what they should leave knowing, and when. Talks, workshops and team sessions."
      },
      "contact-other": {
        "eyebrow": "Say hello",
        "title": "Ask us anything.",
        "lede": "A question, an idea, a collaboration. It still goes to a person, not a queue."
      }
    },
    steps: contactSteps.map((step) => ({ ...step })),
    /* The icon and where the receipt links stay with the code: they belong to
       the kind of enquiry rather than to its wording. */
    forms: Object.fromEntries(
      Object.entries(FORM_COPY).map(([kind, copy]) => [
        kind,
        {
          label: copy.label,
          sub: copy.sub,
          sheetLabel: copy.sheetLabel,
          detailsTitle: copy.detailsTitle,
          timelineLabel: copy.timelineLabel,
          messageLabel: copy.messageLabel,
          placeholder: copy.placeholder,
          hint: copy.hint,
          filesLabel: copy.filesLabel,
          submit: copy.submit,
          sentTitle: copy.sentTitle,
          nextLabel: copy.next.label,
        },
      ])
    ),
  },

  contribute: {
    headings: {
      "contribute-hero": {
        "eyebrow": "Write for us · open to people we mentor",
        "title": "Getting your name on *an explainer.*",
        "lede": ""
      },
      "contribute-route": {
        "eyebrow": "The route",
        "title": "An account, not a form.",
        "lede": "An open form collects AI filler and link-building, and every one has to be read and refused. The people who write here are already being mentored, so they get an account instead."
      },
      "contribute-craft": {
        "eyebrow": "What makes a good one",
        "title": "One idea, one everyday thing it works like.",
        "lede": ""
      }
    },
    draft: {
      crossedOut: "a blog post",
      note: "An explainer, not a post: one idea, one analogy.",
    },
    edits: [
      {
        before: "On this page we will explain how you can write for Docerity.",
        after: "",
        note: "Start with the point, not the announcement.",
      },
      {
        before: "Anyone can submit a blog post about any tech topic they like, and we will publish it.",
        after: "There is no submit button here, and that is deliberate.",
        note: "Not anyone, and not anything. Say what actually happens.",
      },
      {
        before: "Explaining something clearly is hard,",
        after: "Explaining something clearly is hard,",
        note: "",
      },
      {
        before: "so we try to publish as many posts as we can.",
        after: "and these pieces are worth reading because somebody edited them properly.",
        note: "The value is the editing, not the volume.",
      },
    ],
    example: {
      fileName: "write-for-us.md",
      byline: "your name",
      stamp: "Ready to publish",
      button: "How you get here",
    },
    route: [
      {
        status: "Mentee",
        title: "We are already working together",
        description: "Every explainer here is written by somebody we know well enough to review honestly. That is the filter, and the only one.",
        cardNote: "in a 1:1",
      },
      {
        status: "Invited",
        title: "You get an account",
        description: "An invitation link, a password you choose, and the same editor we use. Your drafts stay private until you send them.",
        cardNote: "drafting in the editor",
      },
      {
        status: "In review",
        title: "We read it before anybody else",
        description: "Nothing publishes itself. We edit for clarity, and go back and forth if it needs it.",
        cardNote: "notes to resolve",
      },
      {
        status: "Published",
        title: "It goes up with your name on it",
        description: "Your byline, on a piece somebody will still remember a year later.",
        cardNote: "live on the blog",
      },
    ],
    invite: {
      note: "If you are being mentored here, writing one is part of it. If you are not and want to be, that conversation starts the same way everything else does.",
      primaryLabel: "Talk about mentorship",
      secondaryLabel: "Read what is here",
    },
    craft: [
      "The pieces that work here take a single concept somebody is stuck on and pair it with something they already understand. The analogy is not decoration on top of the explanation, it is the explanation.",
      "The ones that do not work try to cover a whole area. Size it so it fits in four minutes.",
    ],
    scope: {
      quote: "Write it for the person you were six months before you understood it.",
    },
    sizes: [
      { upTo: "2", topic: "Why an index makes a query faster", why: "Four minutes somebody remembers a year later." },
      { upTo: "4", topic: "How database indexes work", why: "Good, but it is three explainers wearing one title." },
      { upTo: "8", topic: "Indexing strategies, compared", why: "A talk, not an explainer." },
      { upTo: "12", topic: "Databases", why: "A textbook chapter nobody finishes." },
    ],
  },

  "how-we-work": {
    headings: {
      "hww-hero": {
        eyebrow: "How we work",
        title: "Four ways to work with us.",
        lede: "Pick the one that matches where you are. If you're not sure, tell us what you need and we'll recommend one on the first call.",
      },
      "hww-engagements": {
        eyebrow: "The options",
        title: "How each one works",
        lede: "You can start with one and switch later. A review often turns into a build, and a build often turns into monthly support.",
      },
      "hww-habits": {
        eyebrow: "Every project",
        title: "What you can expect on every project",
        lede: "",
      },
      "hww-faq": {
        eyebrow: "Questions",
        title: "Common questions",
        lede: "Anything else? Email",
      },
    },
    engagements: howWeWork.engagements.map((engagement) => ({ ...engagement, steps: [...engagement.steps] })),
    habits: howWeWork.habits.map((habit) => ({ ...habit })),
    faqs: howWeWork.faqs.map((faq) => ({ ...faq })),
    words: { ...howWeWork.words },
    links: { ...howWeWork.links },
  },

  legal: {
    privacy: { ...privacy },
    terms: { ...terms },
  },

  reviews: {
    headings: {
      "reviews-hero": {
        "eyebrow": "Record · Reviews",
        "title": "The people who *paid for the work*, in their words.",
        "lede": "Clients and the engineers we have mentored. Nothing here was written by us, and nothing appears until it has been read."
      },
      "reviews-record": {
        "eyebrow": "Every one read first",
        "title": "Nothing here was written by us.",
        "lede": ""
      },
      "reviews-form": {
        "eyebrow": "Leave a review",
        "title": "Worked together? Add yours.",
        "lede": ""
      }
    },
    empty: {
      lede: "Clients and the engineers we have mentored. There is nothing here yet, which is the honest state of a page that only publishes what people actually send.",
      formTitle: "Worked together? Be the first.",
    },
    process: [
      { title: "You write it", description: "Two minutes. Honest is more useful to the next person than flattering." },
      { title: "We read it", description: "Every one. If something needs checking we email you before it goes up." },
      { title: "It goes up", description: "With your name and role, and a link to your work if you gave one." },
    ],
  },

  pages: {
    notFound: {
      eyebrow: "Lost signal",
      title: "This page doesn't exist.",
      lede: "The link might be broken, or the page may have moved. Let's get you back on track.",
      primaryLabel: "Back to home",
      secondaryLabel: "Read the blog",
      concept: "404 Not Found",
      conceptCaption: "The server looked, and nothing lives at that address.",
      analogy: "A gap on a bookshelf",
      analogyCaption: "The shelf is real. That one book is not on it.",
      shelfNote: "Every spine is a page that exists. Pick one.",
    },
    unsubscribe: {
      doneTitle: "You are unsubscribed",
      doneBody: "No more explainers will reach you. No hard feelings, and you can subscribe again whenever you like.",
      failedTitle: "That link did not work",
      failedBody: "The link may have been cut short by your mail client, or it may already have been used. Email us and we will take you off the list ourselves.",
      blogLabel: "Read the explainers",
      contactLabel: "Get in touch",
      listName: "Docerity explainers",
      listTagline: "One idea, one analogy, now and then",
    },
  },
};
