/**
 * The shape of every editable page section, described as data.
 *
 * Eight sections of this site were lists of records in a TypeScript file:
 * client logos, the About page's experience and certifications, the mentorship
 * FAQs, the AI and Web3 capability grids, the services page, the explainer
 * pairs, the contact steps. Changing any of them meant editing code and
 * redeploying.
 *
 * They could have become eight collections with eight editors. They are all the
 * same thing, though: a named group of records with a handful of short text
 * fields, sometimes an icon, sometimes an image, sometimes a list of tags. So
 * there is one collection, one editor and one save action, and what differs
 * between them lives here as a description rather than as code.
 *
 * Adding a section is adding an entry to `BLOCKS`. No model, no route, no form.
 */

/* ── Fields ───────────────────────────────────────────────────────────── */

export type FieldKind = "text" | "textarea" | "icon" | "image" | "strings";

export type Field = {
  name: string;
  label: string;
  kind: FieldKind;
  /** Shown under the input. Say why the field exists, not what it is. */
  hint?: string;
  placeholder?: string;
  /** Rejected when empty. Only for the fields a section cannot render without. */
  required?: boolean;
  maxLength?: number;
};

/* ── Groups ───────────────────────────────────────────────────────────── */

/**
 * `list` is the common case: an ordered set of records that renders as cards,
 * rows or a grid. `object` is a single record, for the About page's founder
 * details. `strings` is a bare list of words, for the stack and model chips,
 * where a record with one field would be ceremony.
 */
export type Group =
  | {
      kind: "list";
      name: string;
      label: string;
      description?: string;
      fields: Field[];
      /** Refused past this many. The layouts have geometry, not infinite rows. */
      max: number;
      /** Below this the section reads as broken rather than short. */
      min?: number;
      /** For the "Add" button and the empty state: "capability", "logo". */
      itemNoun: string;
    }
  | {
      kind: "object";
      name: string;
      label: string;
      description?: string;
      fields: Field[];
    }
  | {
      kind: "strings";
      name: string;
      label: string;
      description?: string;
      max: number;
      placeholder?: string;
      /** A paragraph rather than a chip: the About page's story is three of these. */
      long?: boolean;
    };

export type Block = {
  key: BlockKey;
  /** What it is called in the admin list. */
  title: string;
  /** Where it appears, so somebody can go and look at what they changed. */
  page: string;
  path: string;
  description: string;
  groups: Group[];
};

export const BLOCK_KEYS = [
  "clients",
  "about",
  "mentorship",
  "services",
  "ai",
  "web3",
  "explainers",
  "contact",
] as const;

export type BlockKey = (typeof BLOCK_KEYS)[number];

export function isBlockKey(value: unknown): value is BlockKey {
  return typeof value === "string" && (BLOCK_KEYS as readonly string[]).includes(value);
}

/* A record as the editor holds it: field name to value. `strings` fields are
   arrays, everything else is a string. */
export type BlockRecord = Record<string, string | string[]>;

/** A whole section's content: group name to whatever that group holds. */
export type BlockData = Record<string, BlockRecord | BlockRecord[] | string[]>;

/* ── Shared field definitions ─────────────────────────────────────────── */

const ICON: Field = {
  name: "iconName",
  label: "Icon",
  kind: "icon",
  hint: "Shown beside the title.",
};

const DESCRIPTION: Field = {
  name: "description",
  label: "Description",
  kind: "textarea",
  required: true,
  maxLength: 600,
};

/* ── The sections ─────────────────────────────────────────────────────── */

export const BLOCKS: Block[] = [
  {
    key: "clients",
    title: "Client logos",
    page: "Homepage",
    path: "/",
    description:
      "The two rows under the hero. Organisations are who paid for the work; ecosystems are what it was built on, which is why they are not one wall of logos.",
    groups: [
      {
        kind: "list",
        name: "organisations",
        label: "Organisations",
        description: "Companies and teams you have been paid by.",
        itemNoun: "organisation",
        max: 12,
        fields: [
          { name: "name", label: "Name", kind: "text", required: true, maxLength: 80 },
          {
            name: "src",
            label: "Logo",
            kind: "image",
            required: true,
            hint: "Shown small and in one colour, so a wordmark reads better than a full lockup.",
          },
          {
            name: "context",
            label: "Context",
            kind: "text",
            required: true,
            maxLength: 120,
            hint: "Where this logo shows up in the work, so the row is checkable.",
          },
        ],
      },
      {
        kind: "list",
        name: "ecosystems",
        label: "Ecosystems",
        description: "Protocols and platforms the work was built on, not clients.",
        itemNoun: "ecosystem",
        max: 12,
        fields: [
          { name: "name", label: "Name", kind: "text", required: true, maxLength: 80 },
          { name: "src", label: "Logo", kind: "image", required: true },
          { name: "context", label: "Context", kind: "text", required: true, maxLength: 120 },
        ],
      },
    ],
  },

  {
    key: "about",
    title: "About page",
    page: "About",
    path: "/about",
    description:
      "Everything on /about except the project count, which is counted from the work section rather than typed.",
    groups: [
      {
        kind: "object",
        name: "founder",
        label: "Who you are",
        fields: [
          { name: "name", label: "Name", kind: "text", required: true, maxLength: 120 },
          { name: "role", label: "Role", kind: "text", required: true, maxLength: 160 },
          { name: "based", label: "Based in", kind: "text", required: true, maxLength: 120 },
          {
            name: "availability",
            label: "Availability",
            kind: "text",
            required: true,
            maxLength: 200,
            hint: "The practical question a distributed client actually has.",
          },
          {
            name: "hours",
            label: "Availability, short",
            kind: "text",
            required: true,
            maxLength: 40,
            hint: "The same fact cut to fit the narrow rail. Keep the two in step.",
          },
        ],
      },
      {
        kind: "strings",
        name: "story",
        label: "The story",
        description: "Three paragraphs: where you came from, what you do, why Docerity.",
        long: true,
        max: 6,
      },
      {
        kind: "list",
        name: "facts",
        label: "Headline numbers",
        description:
          "Each one should be checkable against something else on the site. The shipped-project count is added automatically and is not listed here.",
        itemNoun: "number",
        max: 6,
        fields: [
          { name: "value", label: "Number", kind: "text", required: true, maxLength: 12 },
          { name: "label", label: "Label", kind: "text", required: true, maxLength: 80 },
          {
            name: "since",
            label: "Where it comes from",
            kind: "text",
            required: true,
            maxLength: 120,
            hint: "How a reader could verify it.",
          },
        ],
      },
      {
        kind: "list",
        name: "experience",
        label: "Experience",
        itemNoun: "role",
        max: 20,
        fields: [
          { name: "role", label: "Role", kind: "text", required: true, maxLength: 160 },
          { name: "org", label: "Organisation", kind: "text", required: true, maxLength: 160 },
          {
            name: "period",
            label: "Period",
            kind: "text",
            required: true,
            maxLength: 40,
            placeholder: "2024 – present",
          },
          { name: "summary", label: "One-line summary", kind: "textarea", required: true, maxLength: 300 },
          {
            name: "points",
            label: "What you did",
            kind: "strings",
            hint: "One specific thing per line. Numbers where you have them.",
          },
        ],
      },
      {
        kind: "list",
        name: "skillGroups",
        label: "Skills",
        description: "Grouped by what each thing is for, so a reader can scan for the part they care about.",
        itemNoun: "group",
        max: 12,
        fields: [
          { name: "title", label: "Group", kind: "text", required: true, maxLength: 60 },
          { name: "items", label: "Skills", kind: "strings" },
        ],
      },
      {
        kind: "list",
        name: "tools",
        label: "Tools",
        description: "The day-to-day toolchain, shown as marks rather than more text.",
        itemNoun: "tool",
        max: 24,
        fields: [
          { name: "name", label: "Name", kind: "text", required: true, maxLength: 60 },
          { name: "src", label: "Logo", kind: "image", required: true },
        ],
      },
      {
        kind: "list",
        name: "education",
        label: "Education",
        itemNoun: "qualification",
        max: 20,
        fields: [
          { name: "qualification", label: "Qualification", kind: "text", required: true, maxLength: 200 },
          { name: "institution", label: "Institution", kind: "text", required: true, maxLength: 160 },
          { name: "period", label: "Period", kind: "text", required: true, maxLength: 40 },
        ],
      },
      {
        kind: "list",
        name: "certifications",
        label: "Certifications",
        description: "A scan you can actually look at is worth more than a line of text claiming it exists.",
        itemNoun: "certification",
        max: 24,
        fields: [
          { name: "name", label: "Name", kind: "text", required: true, maxLength: 200 },
          { name: "issuer", label: "Issuer", kind: "text", required: true, maxLength: 160 },
          { name: "detail", label: "Detail", kind: "text", required: true, maxLength: 200 },
          {
            name: "image",
            label: "Scan",
            kind: "image",
            hint: "Optional. Without one the card falls back to text.",
          },
        ],
      },
    ],
  },

  {
    key: "mentorship",
    title: "Mentorship",
    page: "Mentorship",
    path: "/mentorship",
    description:
      "The programme page and the teaser on the homepage. Testimonials are not here: they come from approved reviews.",
    groups: [
      {
        kind: "list",
        name: "audiences",
        label: "Who it is for",
        itemNoun: "audience",
        max: 6,
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
          DESCRIPTION,
        ],
      },
      {
        kind: "list",
        name: "stages",
        label: "The path",
        description: "Rendered as numbered stages, so the order is the path.",
        itemNoun: "stage",
        max: 8,
        fields: [
          { name: "label", label: "Stage", kind: "text", required: true, maxLength: 60 },
          { name: "summary", label: "One line", kind: "text", required: true, maxLength: 120 },
          DESCRIPTION,
        ],
      },
      {
        kind: "list",
        name: "checkpoints",
        label: "Homepage teaser",
        description:
          "The short version of the path, on the homepage. Kept separate because that card has room for four short lines and no more.",
        itemNoun: "checkpoint",
        max: 4,
        fields: [
          { name: "label", label: "Label", kind: "text", required: true, maxLength: 40 },
          { name: "detail", label: "Detail", kind: "text", required: true, maxLength: 80 },
        ],
      },
      {
        kind: "list",
        name: "formatSteps",
        label: "What you get",
        itemNoun: "item",
        max: 8,
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
          DESCRIPTION,
        ],
      },
      {
        kind: "list",
        name: "faqs",
        label: "Questions",
        itemNoun: "question",
        max: 20,
        fields: [
          { name: "question", label: "Question", kind: "text", required: true, maxLength: 200 },
          { name: "answer", label: "Answer", kind: "textarea", required: true, maxLength: 900 },
        ],
      },
    ],
  },

  {
    key: "services",
    title: "Services",
    page: "Work",
    path: "/work",
    description: "The capability grid and the process on the work page. Projects are edited under Work.",
    groups: [
      {
        kind: "list",
        name: "capabilities",
        label: "What you build",
        itemNoun: "capability",
        max: 8,
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
          DESCRIPTION,
          ICON,
        ],
      },
      {
        kind: "list",
        name: "process",
        label: "How you work",
        description: "Rendered in order, as numbered steps.",
        itemNoun: "step",
        max: 8,
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
          { name: "summary", label: "One line", kind: "text", required: true, maxLength: 160 },
          DESCRIPTION,
          ICON,
        ],
      },
      {
        kind: "strings",
        name: "stack",
        label: "Stack",
        description: "Shown as chips under the capabilities.",
        max: 16,
        placeholder: "TypeScript",
      },
    ],
  },

  {
    key: "ai",
    title: "AI page",
    page: "AI",
    path: "/ai",
    description: "The AI work and capabilities. These are separate from the Work section's projects on purpose.",
    groups: [
      {
        kind: "list",
        name: "projects",
        label: "AI work",
        itemNoun: "project",
        max: 8,
        fields: [
          { name: "slug", label: "Slug", kind: "text", required: true, maxLength: 80 },
          { name: "name", label: "Name", kind: "text", required: true, maxLength: 120 },
          {
            name: "stat",
            label: "Headline figure",
            kind: "text",
            required: true,
            maxLength: 80,
            hint: "The one number worth leading with.",
          },
          DESCRIPTION,
          { name: "tags", label: "Tags", kind: "strings" },
          ICON,
        ],
      },
      {
        kind: "list",
        name: "capabilities",
        label: "Capabilities",
        itemNoun: "capability",
        max: 8,
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
          DESCRIPTION,
          ICON,
        ],
      },
      { kind: "strings", name: "models", label: "Models and services", max: 16, placeholder: "GPT-4o" },
    ],
  },

  {
    key: "web3",
    title: "Web3 page",
    page: "Web3",
    path: "/web3",
    description: "The Web3 work, ecosystems and capabilities.",
    groups: [
      {
        kind: "list",
        name: "projects",
        label: "Web3 work",
        itemNoun: "project",
        max: 8,
        fields: [
          { name: "slug", label: "Slug", kind: "text", required: true, maxLength: 80 },
          { name: "name", label: "Name", kind: "text", required: true, maxLength: 120 },
          {
            name: "badge",
            label: "Badge",
            kind: "text",
            required: true,
            maxLength: 120,
            hint: "The line above the name, such as a hackathon win.",
          },
          DESCRIPTION,
          { name: "tags", label: "Tags", kind: "strings" },
          ICON,
        ],
      },
      { kind: "strings", name: "ecosystems", label: "Ecosystems", max: 16, placeholder: "Solana" },
      {
        kind: "list",
        name: "capabilities",
        label: "Capabilities",
        itemNoun: "capability",
        max: 8,
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
          DESCRIPTION,
          ICON,
        ],
      },
      { kind: "strings", name: "stack", label: "Stack", max: 16, placeholder: "Solidity" },
    ],
  },

  {
    key: "explainers",
    title: "Explainer pairs",
    page: "Homepage",
    path: "/",
    description:
      "The band that tickers a technical idea against an everyday one. Written articles are edited under Writing.",
    groups: [
      {
        kind: "list",
        name: "pairs",
        label: "Pairs",
        description: "Each one is a concept and the everyday thing it is compared to.",
        itemNoun: "pair",
        max: 12,
        min: 2,
        fields: [
          {
            name: "id",
            label: "Reference",
            kind: "text",
            required: true,
            maxLength: 60,
            hint: "Lowercase, for React keys. Never shown.",
          },
          { name: "conceptLabel", label: "Concept", kind: "text", required: true, maxLength: 80 },
          { name: "conceptCaption", label: "Concept caption", kind: "text", required: true, maxLength: 120 },
          { name: "conceptIcon", label: "Concept icon", kind: "icon" },
          { name: "analogyLabel", label: "Analogy", kind: "text", required: true, maxLength: 120 },
          { name: "analogyCaption", label: "Analogy caption", kind: "text", required: true, maxLength: 120 },
          { name: "analogyIcon", label: "Analogy icon", kind: "icon" },
        ],
      },
    ],
  },

  {
    key: "contact",
    title: "Contact steps",
    page: "Contact",
    path: "/contact",
    description: "What happens after somebody sends the form.",
    groups: [
      {
        kind: "list",
        name: "steps",
        label: "Steps",
        itemNoun: "step",
        max: 6,
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
          DESCRIPTION,
        ],
      },
    ],
  },
];

export function blockFor(key: BlockKey): Block {
  const block = BLOCKS.find((candidate) => candidate.key === key);
  /* Unreachable through the routes, which narrow with `isBlockKey` first, but
     a thrown error beats rendering an editor with no fields. */
  if (!block) throw new Error(`Unknown content block: ${key}`);
  return block;
}
