export const projectTypes = [
  { value: "software", label: "Software project" },
  { value: "mentorship", label: "Mentorship" },
  { value: "speaking", label: "Speaking / workshop" },
  { value: "other", label: "Something else" },
] as const;

export const steps = [
  {
    title: "You send the details",
    description:
      "Project, mentorship, or just a question — tell me what's on your mind.",
  },
  {
    title: "I read it myself",
    description:
      "No inbox triage, no sales team. Every message reaches me directly.",
  },
  {
    title: "We talk it through",
    description:
      "Expect a reply within 1–2 business days, then we find time for a call if it's a fit.",
  },
] as const;
