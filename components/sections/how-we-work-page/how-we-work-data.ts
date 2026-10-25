/*
  The How we work page's built-in copy. Edited in the admin; this is what a
  fresh database shows and what an emptied field falls back to.

  Every claim here was confirmed by the founder: the four engagements, NDAs
  before a detailed call, ownership agreed per contract, a weekly update, a
  shared Slack or Teams channel, and live preview links. Prices are left off
  the page on purpose, so nothing here should mention one.
*/

export const sentence = {
  lead: "I need",
  answer: "That's a",
  more: "How it runs",
  or: "Or",
};

export const engagements = [
  {
    title: "Fixed-scope project",
    need: "a product built, start to finish.",
    choice: "Build it start to finish",
    summary: "An agreed scope, timeline and finish line, built in slices you can click through as they land.",
    bestWhen: "You know what you need built: a new product, an MVP, or a rebuild of something that has outgrown itself.",
    steps: [
      "Scope, milestones and ownership agreed in writing first",
      "Built in working slices, each on a live preview link",
      "Handed over with the code, the docs and the deployment",
    ],
  },
  {
    title: "Monthly retainer",
    need: "steady help on a product that's live.",
    choice: "Steady help on a live product",
    summary: "A standing place on our calendar for a product that keeps moving.",
    bestWhen: "Your product is live and needs a steady flow of features, fixes and upkeep, without hiring for it.",
    steps: [
      "An agreed amount of capacity each month",
      "One shared queue that you put in order",
      "A weekly note on what shipped and what is next",
    ],
  },
  {
    title: "Team extension",
    need: "more senior hands on my team.",
    choice: "More hands on my team",
    summary: "Our engineers inside your team, on your tools and in your standups.",
    bestWhen: "You have the roadmap but not the hands, or you need a specialty your team lacks: AI, Web3 or mobile.",
    steps: [
      "We join your channels, repos and rituals",
      "Work goes through your own review process",
      "What we learn is written down for your team",
    ],
  },
  {
    title: "Discovery & audit",
    need: "a second opinion before I commit.",
    choice: "A second opinion first",
    summary: "A short, paid look before anyone commits to a build.",
    bestWhen: "You have code you are unsure about, or an idea that needs scoping before it needs building.",
    steps: [
      "We read the code, or map the problem with you",
      "A written report: risks, options and a plan",
      "Yours to keep, whether or not we build it",
    ],
  },
];

export const habits = [
  {
    title: "NDA first",
    description: "Happy to sign one before the first detailed call, so you can tell us what you are actually building.",
  },
  {
    title: "Ownership in writing",
    description: "Who owns the code and the IP is agreed in the contract, before any work starts. No surprises at handover.",
  },
  {
    title: "A shared channel",
    description: "Slack or Teams, straight to the people doing the work. No account manager in between.",
  },
  {
    title: "A weekly update",
    description: "A written note or a call every week: what shipped, what is next, and anything blocking it.",
  },
  {
    title: "Live previews",
    description: "Every working slice is deployed somewhere you can click, not described in a status report.",
  },
];

export const faqs = [
  {
    question: "Can we start with something small?",
    answer:
      "Yes. A discovery or an audit is the usual first step: a short, paid piece of work that ends in a written plan. If it turns into a build, the plan is where the build starts.",
  },
  {
    question: "Who owns the code?",
    answer:
      "It is agreed in the contract for each project, before any work starts, so both sides know exactly what is handed over and when. If you need to own everything outright, say so on the first call.",
  },
  {
    question: "Will we talk to the people writing the code?",
    answer:
      "Yes. You get a shared Slack or Teams channel with the engineers doing the work, and a weekly update from them. There is no account manager passing messages along.",
  },
  {
    question: "What happens after launch?",
    answer:
      "Launch is handed over with the code, the docs and the deployment. Most products need a steady hand after that, which is what a monthly retainer is for; it is not required.",
  },
  {
    question: "Which time zones do you work in?",
    answer: "The team is based in Lagos and works across European and US time zones, with overlap for calls on both.",
  },
];

export const links = {
  projects: "How working together runs",
  contact: "How working with us works",
};
