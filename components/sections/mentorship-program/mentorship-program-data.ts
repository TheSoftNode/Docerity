/*
  `startsAt` names a stage below; the page marks it on the path when the
  audience is picked. It is where someone like this usually begins, which the
  first call confirms, not a placement.
*/
export const audiences = [
  {
    title: "Junior & early-career engineers",
    description:
      "You can write code, but you're not sure it's good code. You need real code review, not another tutorial.",
    startsAt: "Code Reviews",
    short: "Juniors",
  },
  {
    title: "Career switchers & self-taught",
    description:
      "You came from a bootcamp, another career, or taught yourself. You need structured fundamentals, and the confidence that comes from someone actually checking your work.",
    startsAt: "Foundations",
    short: "Switchers",
  },
  {
    title: "Mid-level engineers leveling up",
    description:
      "You ship features fine, but system design and leadership feel like a different job. You need someone who's done it to show you the way.",
    startsAt: "System Design",
    short: "Mid-levels",
  },
] as const;

export const stages = [
  {
    label: "Foundations",
    summary: "Solid fundamentals, real code",
    description:
      "We start wherever you actually are, not where a curriculum assumes you are. Deliberate practice on the fundamentals actually holding you back, reviewed against real-world code instead of toy exercises.",
  },
  {
    label: "Code Reviews",
    summary: "Honest, weekly feedback",
    description:
      "Every week you bring real code, from your job, a side project, or an assigned exercise, and get direct, specific feedback: the same rigor a senior engineer would apply on your team.",
  },
  {
    label: "System Design",
    summary: "Thinking in whole systems",
    description:
      "Once the fundamentals are solid, we zoom out: how services talk to each other, where data lives, what breaks at scale, and how to reason about trade-offs out loud.",
  },
  {
    label: "Leadership",
    summary: "Ready to mentor others",
    description:
      "The final stage is teaching it back: reviewing someone else's code, explaining a decision in a design doc, or leading a small project. If you can teach it, you've actually learned it.",
  },
] as const;

export const formatSteps = [
  {
    title: "Weekly 1:1 video call",
    description:
      "A standing session, every week, focused entirely on you, not a generic curriculum.",
  },
  {
    title: "Async code review",
    description:
      "Push code between sessions and get direct written feedback before we even talk.",
  },
  {
    title: "A living growth plan",
    description:
      "A real roadmap for where you're headed, updated as you actually progress, not a static checklist.",
  },
  {
    title: "Direct access when you're stuck",
    description:
      "A message away between sessions for the moments that can't wait a week.",
  },
] as const;

export const faqs = [
  {
    question: "How much does mentorship cost?",
    answer:
      "It depends on your goals and how much time we're committing each week, so pricing is discussed after we talk, not a fixed number on a page.",
  },
  {
    question: "How long does the program last?",
    answer:
      "There's no fixed term. Most people stay for several months, long enough to move through the growth path at a pace that actually sticks.",
  },
  {
    question: "What if I'm not sure which stage I'm at?",
    answer:
      "That's normal, and exactly what the first call is for. We figure out where you actually are together, not where you assume.",
  },
  {
    question: "Can I pause or stop anytime?",
    answer:
      "Yes. This isn't a locked-in contract, it's built around your schedule and budget, not the other way around.",
  },
  {
    question: "Do I need to already have a job in tech?",
    answer:
      "No. Junior engineers, career switchers, and working engineers all go through the same honest process, just starting from different points on the path.",
  },
] as const;

/*
  How the team reviews. Mentorship runs through the Docerity team rather than
  one person, so the page says how that works rather than showing a face.
*/
export const teamPrinciples = [
  {
    title: "One lead, start to finish",
    description: "The same mentor runs your sessions and your plan, so nothing is explained twice.",
  },
  {
    title: "A specialist when it matters",
    description:
      "Stuck on a contract, a model or a schema? The engineer who does that daily reviews it.",
  },
  {
    title: "One standard of review",
    description:
      "Every reviewer works to the same written bar, the one our own production code is held to.",
  },
] as const;

export const specialties = [
  "Backend & APIs",
  "Frontend",
  "System design",
  "Web3",
  "AI products",
] as const;

export const applySteps = [
  {
    title: "Apply",
    when: "Today",
    description: "Tell us where you are and where you want to get to. It takes a couple of minutes.",
  },
  {
    title: "Intro call",
    when: "Within days",
    description: "A short call to find your real starting point. No commitment either way.",
  },
  {
    title: "Your plan",
    when: "After the call",
    description: "A written plan for your first stage, so you know what the weeks ahead look like.",
  },
  {
    title: "First session",
    when: "Week one",
    description: "We start on real code: yours, from work or a side project.",
  },
] as const;
