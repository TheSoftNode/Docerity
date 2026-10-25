/*
  The How we work page's built-in copy. Edited in the admin; this is what a
  fresh database shows and what an emptied field falls back to.

  Written for a client deciding whether to hire the team, so plain words over
  clever ones. Every claim was confirmed by the founder: the four options,
  NDAs, ownership agreed per contract, weekly updates, a shared Slack or
  Teams channel, and live preview links. Prices are left off the page on
  purpose, so nothing here should mention one.
*/

export const engagements = [
  {
    title: "Project build",
    forWho: "You need a product built, from plan to launch.",
    goodFor: "New products, first versions (MVPs), and rebuilds of systems that have outgrown themselves.",
    steps: [
      "We agree the scope, milestones and timeline in writing.",
      "We build it in stages. You can try each stage on a live link as soon as it's done.",
      "We hand over the code, the documentation and the live product.",
    ],
  },
  {
    title: "Monthly support",
    forWho: "Your product is live and needs ongoing work.",
    goodFor: "Live products that need new features, fixes and upkeep, without hiring a full-time team.",
    steps: [
      "We agree how much of our time you get each month.",
      "You decide what we work on first, from one shared list.",
      "Every week you get an update on what's done and what's next.",
    ],
  },
  {
    title: "Engineers for your team",
    forWho: "Your team needs more hands, or a skill it doesn't have.",
    goodFor: "Teams with a plan but not enough people, or who need AI, Web3 or mobile experience they don't have in-house.",
    steps: [
      "Our engineers join your chat, your code and your meetings.",
      "Their work goes through your normal review process.",
      "We document what we build, so your team can carry it on.",
    ],
  },
  {
    title: "Review & planning",
    forWho: "You want an expert opinion before you build.",
    goodFor: "Code you're worried about, or an idea that needs a clear plan before anyone starts building it.",
    steps: [
      "We review your code, or work through the idea with you.",
      "You get a written report: the risks, your options, and the plan we'd recommend.",
      "The report is yours to keep, whether or not you hire us to build it.",
    ],
  },
];

export const habits = [
  { title: "We'll sign an NDA", description: "Before you share the details, if you'd like one." },
  { title: "Ownership agreed upfront", description: "Who owns the code is written into the contract before any work starts." },
  { title: "Direct contact", description: "A shared Slack or Teams channel with the people building your product." },
  { title: "Weekly updates", description: "A short written update or call every week, so you always know where things stand." },
  { title: "Something you can try", description: "Finished work goes on a live link you can click through, not just a report." },
];

export const faqs = [
  {
    question: "How do I know which option is right for me?",
    answer:
      "Tell us what you need, through the contact form or on a call, and we'll recommend one. If you're unsure, Review & planning is a small first step you can decide after.",
  },
  {
    question: "Who owns the code?",
    answer:
      "It's agreed in the contract for each project, before any work starts, so you know exactly what is handed over and when. If you need to own everything outright, tell us on the first call.",
  },
  {
    question: "Can I talk directly to the developers?",
    answer:
      "Yes. You get a shared Slack or Teams channel with the engineers building your product, and a weekly update from them.",
  },
  {
    question: "What happens after launch?",
    answer:
      "We hand over the code, the documentation and the live product. If you'd like us to keep improving it, that's what Monthly support is for. It's not required.",
  },
  {
    question: "What time zones do you work in?",
    answer: "We're based in Lagos and work across European and US time zones, so there's overlap for calls on both.",
  },
];

export const words = {
  cardLink: "See how it works",
  unsure: "Not sure which one?",
  ask: "Ask us",
  goodFor: "Good for",
  steps: "How it works",
};

export const links = {
  projects: "How we work with clients",
  contact: "How we work with clients",
};
