import type { BlockRecord } from "@/lib/content/blocks/schema";
import type { ProjectType } from "@/lib/contact/schema";

/*
  The contact form's words for each kind of enquiry.

  The heading above the form and these words are both editable per kind (the
  contact block in the admin); FORM_COPY is the built-in wording and what a
  blank field falls back to. The icon and where the receipt links stay here,
  because they belong to the kind of enquiry rather than to its wording. The
  words change with what somebody picked because a mentorship applicant
  should not be asked for a budget or a PRD. Pure, so it is tested without a
  browser (see e2e/contact-content.spec.ts).
*/

export type FormCopy = {
  /** The tile on the form. */
  label: string;
  sub: string;
  icon: string;
  /** The small line at the top of the sheet. */
  sheetLabel: string;
  detailsTitle: string;
  /** Empty: the kind has no timeline question. */
  timelineLabel: string;
  messageLabel: string;
  placeholder: string;
  hint: string;
  /** Empty: the kind takes no attachments. */
  filesLabel: string;
  submit: string;
  sentTitle: string;
  /** Where the receipt sends somebody next, and what that link says. */
  next: { href: string; label: string };
};

export const FORM_COPY: Record<ProjectType, FormCopy> = {
  software: {
    label: "Software project",
    sub: "Build, rescue or scale",
    icon: "⌘",
    sheetLabel: "New project · about 2 minutes",
    detailsTitle: "The project",
    timelineLabel: "Timeline",
    messageLabel: "What are you building?",
    placeholder: "Who it is for, what it has to do, and what success looks like.",
    hint: "The more context you give, the more useful the first reply.",
    filesLabel: "A PRD, spec or designs",
    submit: "Send enquiry",
    sentTitle: "Enquiry received",
    next: { href: "/projects", label: "See our projects" },
  },
  mentorship: {
    label: "Mentorship",
    sub: "1:1 growth, weekly",
    icon: "⇡",
    sheetLabel: "Mentorship application · about 2 minutes",
    detailsTitle: "Where you want to go",
    timelineLabel: "When would you like to start?",
    messageLabel: "Where do you want to get to?",
    placeholder: "The role, the skill or the kind of work you are aiming for, and what is in the way.",
    hint: "No wrong answers. The first call is for finding your real starting point.",
    filesLabel: "A CV or a code sample (optional)",
    submit: "Send application",
    sentTitle: "Application received",
    next: { href: "/mentorship", label: "Back to mentorship" },
  },
  speaking: {
    label: "Speaking",
    sub: "Talks and workshops",
    icon: "◎",
    sheetLabel: "Speaking · about 2 minutes",
    detailsTitle: "The event",
    timelineLabel: "When is it?",
    messageLabel: "Tell us about the event",
    placeholder: "The audience, the format, the length, and the topic you have in mind.",
    hint: "A date, even a rough one, helps.",
    filesLabel: "An agenda or brief (optional)",
    submit: "Send request",
    sentTitle: "Request received",
    next: { href: "/blog", label: "Read our explainers" },
  },
  other: {
    label: "Something else",
    sub: "A question or idea",
    icon: "✳",
    sheetLabel: "A message · about a minute",
    detailsTitle: "Your message",
    timelineLabel: "",
    messageLabel: "Your message",
    placeholder: "What is on your mind?",
    hint: "",
    filesLabel: "",
    submit: "Send message",
    sentTitle: "Message received",
    next: { href: "/", label: "Back to the homepage" },
  },
};

/** The words a stored entry can replace. Both optional labels may be blanked on purpose. */
const WORDS = ["label", "sub", "sheetLabel", "detailsTitle", "messageLabel", "placeholder", "hint", "submit", "sentTitle"] as const;
const OPTIONAL = ["timelineLabel", "filesLabel"] as const;

/**
 * The form's wording per kind: what the admin stored over the built-in copy.
 * A required word left blank falls back to the built-in one; the two
 * optional labels are taken as stored, since blanking one removes its field.
 */
export function formCopyFrom(stored: Record<string, BlockRecord> | undefined): Record<ProjectType, FormCopy> {
  return Object.fromEntries(
    (Object.keys(FORM_COPY) as ProjectType[]).map((kind) => {
      const base = FORM_COPY[kind];
      const entry = (stored?.[kind] ?? {}) as Record<string, string | undefined>;
      const copy: FormCopy = { ...base, next: { ...base.next } };
      for (const word of WORDS) if (entry[word]?.trim()) copy[word] = entry[word]!.trim();
      for (const word of OPTIONAL) if (typeof entry[word] === "string") copy[word] = entry[word]!.trim();
      if (entry.nextLabel?.trim()) copy.next.label = entry.nextLabel.trim();
      return [kind, copy];
    })
  ) as Record<ProjectType, FormCopy>;
}

/** The heading entry in the contact block for each kind; software is the page's default. */
export const HEADING_KEYS: Record<ProjectType, string> = {
  software: "contact",
  mentorship: "contact-mentorship",
  speaking: "contact-speaking",
  other: "contact-other",
};

/**
 * Which fields a kind of enquiry asks for. Company and role are about a
 * client; budget is a client's question too (mentorship pricing is talked
 * through on the call); the starting point and code link are a mentee's.
 */
export function fieldsFor(type: ProjectType, copy: FormCopy = FORM_COPY[type]) {
  return {
    company: type === "software",
    role: type === "software",
    budget: type === "software",
    stage: type === "mentorship",
    codeLink: type === "mentorship",
    timeline: copy.timelineLabel !== "",
    files: copy.filesLabel !== "",
  };
}

/**
 * How far through the form somebody is, as sections done out of three:
 * picking a kind always counts; "about you" counts once a name and email are
 * in; the details count once the message is long enough to send.
 */
export function progressOf(state: { name: string; email: string; message: string }): number {
  let done = 1;
  if (state.name.trim().length >= 2 && state.email.includes("@")) done += 1;
  if (state.message.trim().length >= 20) done += 1;
  return done;
}
