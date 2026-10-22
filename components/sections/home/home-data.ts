/*
  The homepage's structural copy.

  Everything a visitor reads as *content* (the hero, section headings, the
  projects, the clients, the mentorship stages, the explainer pairs, reviews)
  comes from the editable blocks and the work section, exactly as it did before
  the redesign. What lives here is the design's own scaffolding: the names of
  the three tracks, the labels on the Now Board, the boarding pass. These are
  part of the layout in the way a column header is, and making them editable
  would let the page say "Build" in one place and "Engineering" in another.
*/

export type TrackKey = "build" | "mentor" | "explain";

export const tracks = [
  {
    key: "build",
    number: "01",
    label: "Build",
    headline:
      "Production software that survives real traffic, and the operations that run beside it.",
    action: { label: "Scope a project", href: "/contact" },
  },
  {
    key: "mentor",
    number: "02",
    label: "Mentor",
    headline: "A real plan to your next level, not open-ended office hours.",
    action: { label: "Apply for mentorship", href: "/contact?type=mentorship" },
  },
  {
    key: "explain",
    number: "03",
    label: "Explain",
    headline: "Hard technical ideas, paired with everyday things you already understand.",
    action: { label: "Read the blog", href: "/blog" },
  },
] as const satisfies readonly {
  key: TrackKey;
  number: string;
  label: string;
  headline: string;
  action: { label: string; href: string };
}[];

/*
  The Mentor panel's week. It describes the rhythm of the programme rather than
  promising particular days, which is why the days carry roles and not dates.
*/
export const mentorWeek = [
  { day: "Mon" },
  { day: "Tue", role: "1:1", tone: "accent" },
  { day: "Wed" },
  { day: "Thu", role: "Review", tone: "ink" },
  { day: "Fri" },
  { day: "Sat", role: "Plan", tone: "tint" },
  { day: "Sun" },
] as const;

/*
  The Now Board's three rows, in the order the hero headline cycles through
  them. `status` is what the lamp at the end of the row says, and is a fixed
  description of the track rather than a live reading.
*/
export const boardRows = [
  { track: "build", number: "01", label: "Build", status: "Live", lamp: "#54D696" },
  { track: "mentor", number: "02", label: "Mentor", status: "Open", lamp: "#FFC94A" },
  { track: "explain", number: "03", label: "Explain", status: "On blog", lamp: "var(--ld-tint)" },
] as const satisfies readonly {
  track: TrackKey;
  number: string;
  label: string;
  status: string;
  lamp: string;
}[];

/** How many tiles a board row has. Words longer than this are cut, not wrapped. */
export const BOARD_WIDTH = 13;

/** How long the board holds a word, and the headline a line, before moving on. */
export const BOARD_INTERVAL_MS = 3600;

/** The boarding pass that floats in front of the board and leads to /contact. */
export const boardingPass = {
  code: "DCR 001",
  from: "Idea",
  to: "Prod",
  fields: [
    { label: "Passenger", value: "You" },
    { label: "Gate", value: "Contact" },
    { label: "Reply", value: "1–2 days" },
  ],
  stub: "Board",
} as const;
