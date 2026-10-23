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
  /**
   * A fixed set of named records, each with the same fields.
   *
   * Unlike a `list`, the entries cannot be added, removed or reordered: they
   * exist because a component reads one by name. Section headings are the
   * case this is for, where the heading on the capabilities band is looked up
   * as "ai-capabilities" and renaming that key would not move the heading, it
   * would lose it.
   */
  | {
      kind: "keyed";
      name: string;
      label: string;
      description?: string;
      fields: Field[];
      entries: { key: string; label: string; hint?: string }[];
    }
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
  "site",
  "seo",
  "homepage",
  "services-page",
  "clients",
  "about",
  "mentorship",
  "services",
  "ai",
  "web3",
  "explainers",
  "contact",
  "contribute",
  "reviews",
  "pages",
] as const;

export type BlockKey = (typeof BLOCK_KEYS)[number];

export function isBlockKey(value: unknown): value is BlockKey {
  return typeof value === "string" && (BLOCK_KEYS as readonly string[]).includes(value);
}

/* A record as the editor holds it: field name to value. `strings` fields are
   arrays, everything else is a string. */
export type BlockRecord = Record<string, string | string[]>;

/** A whole section's content: group name to whatever that group holds. */
export type BlockData = Record<
  string,
  BlockRecord | BlockRecord[] | string[] | Record<string, BlockRecord>
>;

/* ── Shared field definitions ─────────────────────────────────────────── */

const ICON: Field = {
  name: "iconName",
  label: "Icon",
  kind: "icon",
  hint: "Shown beside the title.",
};

/*
  Every section on the site is an eyebrow, a title and usually a lede. Naming
  the three once means a heading group is three lines wherever it appears, and
  that the labels are the same on every page of the admin.
*/
const HEADING_FIELDS: Field[] = [
  {
    name: "eyebrow",
    label: "Eyebrow",
    kind: "text",
    required: true,
    maxLength: 60,
    hint: "The small line above the heading.",
  },
  {
    name: "title",
    label: "Heading",
    kind: "text",
    required: true,
    maxLength: 160,
    hint: "Wrap part of it in *asterisks* to pick that part out in colour, where the section supports it.",
  },
  {
    name: "lede",
    label: "Lede",
    kind: "textarea",
    maxLength: 400,
    hint: "Optional. Left blank, the section goes straight from heading to content.",
  },
];

function headings(
  entries: { key: string; label: string; hint?: string }[],
  description = "The eyebrow, heading and lede above each section."
): Group {
  return {
    kind: "keyed",
    name: "headings",
    label: "Section headings",
    description,
    fields: HEADING_FIELDS,
    entries,
  };
}

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
    key: "site",
    title: "Site settings",
    page: "Everywhere",
    path: "/",
    description:
      "Your name, the address people reach you on, the links in the header and footer. These appear on every page, so a mistake here is a mistake everywhere.",
    groups: [
      {
        kind: "object",
        name: "identity",
        label: "Identity",
        fields: [
          { name: "name", label: "Site name", kind: "text", required: true, maxLength: 60 },
          {
            name: "tagline",
            label: "Tagline",
            kind: "text",
            required: true,
            maxLength: 120,
            hint: "Under the mark in the footer, and in the social card.",
          },
          {
            name: "description",
            label: "Description",
            kind: "textarea",
            required: true,
            maxLength: 300,
            hint: "The default description search engines show. A page with its own overrides it.",
          },
          {
            name: "email",
            label: "Email",
            kind: "text",
            required: true,
            maxLength: 200,
            hint: "Shown publicly and used as the reply-to on notifications.",
          },
        ],
      },
      {
        kind: "list",
        name: "socials",
        label: "Social links",
        description: "Shown in the footer. An empty list hides the row rather than showing dead icons.",
        itemNoun: "social link",
        max: 8,
        fields: [
          {
            name: "label",
            label: "Name",
            kind: "text",
            required: true,
            maxLength: 40,
            placeholder: "GitHub",
            hint: "GitHub, LinkedIn and X get their own mark. Anything else gets a link icon.",
          },
          { name: "url", label: "URL", kind: "text", required: true, maxLength: 400 },
        ],
      },
      {
        kind: "list",
        name: "navLinks",
        label: "Header links",
        description:
          "In order, left to right. The header fits about six before the row crowds the button beside it.",
        itemNoun: "header link",
        max: 8,
        fields: [
          { name: "label", label: "Label", kind: "text", required: true, maxLength: 30 },
          {
            name: "href",
            label: "Path",
            kind: "text",
            required: true,
            maxLength: 200,
            placeholder: "/projects",
          },
        ],
      },
      {
        kind: "list",
        name: "footerLinks",
        label: "Footer links",
        description: "Usually the header links plus the pages that do not fit up there.",
        itemNoun: "footer link",
        max: 14,
        fields: [
          { name: "label", label: "Label", kind: "text", required: true, maxLength: 30 },
          { name: "href", label: "Path", kind: "text", required: true, maxLength: 200 },
        ],
      },
    ],
  },

  {
    key: "seo",
    title: "Titles and descriptions",
    page: "Everywhere",
    path: "/",
    description:
      "What a search result and a shared link say for each page. Blog posts and project pages write their own from their title and hook, so they are not listed here.",
    groups: [
      {
        kind: "keyed",
        name: "pages",
        label: "Pages",
        description:
          "The title shows in the browser tab and as the headline of a search result; the description is the grey text under it. Around 60 and 155 characters respectively is what most engines show before truncating.",
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
          {
            name: "description",
            label: "Description",
            kind: "textarea",
            required: true,
            maxLength: 300,
          },
        ],
        entries: [
          { key: "home", label: "Homepage" },
          { key: "work", label: "Projects" },
          { key: "ai", label: "AI" },
          { key: "web3", label: "Web3" },
          { key: "mentorship", label: "Mentorship" },
          { key: "blog", label: "Blog" },
          { key: "about", label: "About" },
          { key: "contact", label: "Contact" },
          { key: "reviews", label: "Reviews" },
          { key: "contribute", label: "Write for us" },
        ],
      },
    ],
  },

  {
    key: "homepage",
    title: "Homepage copy",
    page: "Homepage",
    path: "/",
    description:
      "The hero and the headings above each band. What each band contains is edited in its own section.",
    groups: [
      {
        kind: "object",
        name: "hero",
        label: "Hero",
        fields: [
          { name: "eyebrow", label: "Eyebrow", kind: "text", required: true, maxLength: 60 },
          {
            name: "title",
            label: "Heading",
            kind: "textarea",
            required: true,
            maxLength: 200,
            hint: "Three short sentences work best here; the last one is picked out in colour.",
          },
          { name: "lede", label: "Lede", kind: "textarea", required: true, maxLength: 400 },
          {
            name: "primaryLabel",
            label: "Main button",
            kind: "text",
            required: true,
            maxLength: 40,
          },
          {
            name: "secondaryLabel",
            label: "Second button",
            kind: "text",
            required: true,
            maxLength: 40,
          },
        ],
      },
      headings([
        { key: "home-work", label: "Selected work" },
        { key: "home-testimonials", label: "What people say" },
        { key: "home-mentorship", label: "Mentorship teaser" },
        { key: "home-cta", label: "The closing call to action" },
      ]),
    ],
  },

  {
    key: "services-page",
    title: "What else we do",
    page: "Homepage",
    path: "/",
    description:
      "The band on the homepage listing every line of work Docerity takes on. It had a page of its own once; seven lines, three of which already have their own section, did not need a destination — they needed to be visible to somebody already on the site. The key is unchanged so the saved content came with it.",
    groups: [
      headings([{ key: "services-hero", label: "Hero" }, { key: "services-lines", label: "The list" }]),
      {
        kind: "list",
        name: "lines",
        label: "What we do",
        description:
          "In order. A line with a page of its own carries a link to it; the rest are described here and nowhere else.",
        itemNoun: "service",
        max: 12,
        min: 1,
        fields: [
          { name: "title", label: "Service", kind: "text", required: true, maxLength: 80 },
          {
            name: "summary",
            label: "One line",
            kind: "text",
            required: true,
            maxLength: 160,
            hint: "What it is, in the words somebody would use when asking for it.",
          },
          DESCRIPTION,
          {
            name: "href",
            label: "Its own page",
            kind: "text",
            maxLength: 200,
            hint: "Optional. A path like /ai, where one exists.",
          },
          ICON,
        ],
      },
    ],
  },

  {
    key: "clients",
    title: "Client logos",
    page: "Homepage",
    path: "/",
    description:
      "The two rows under the hero. Organisations are who paid for the work; ecosystems are what it was built on, which is why they are not one wall of logos.",
    groups: [
      headings([{ key: "clients", label: "The logo band" }]),
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
      headings([
        { key: "about-hero", label: "Hero", hint: "Wrap words in *asterisks* to light them; the career graph is drawn from Experience." },
        { key: "about-story", label: "The story" },
        { key: "about-experience", label: "Experience" },
        { key: "about-toolkit", label: "Toolkit" },
        { key: "about-credentials", label: "Credentials" },
      ]),
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
          {
            name: "portrait",
            label: "Photo",
            kind: "image",
            hint: "Not shown on the current About page, which is about the studio rather than a headshot. Kept so it can come back without a re-upload.",
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
      headings([
        { key: "mentorship-hero", label: "Hero" },
        { key: "mentorship-audience", label: "Who it is for" },
        { key: "mentorship-path", label: "The path" },
        { key: "mentorship-format", label: "What you get" },
        { key: "mentorship-team", label: "Who reviews your code" },
        { key: "mentorship-testimonials", label: "From mentees" },
        { key: "mentorship-faq", label: "Questions" },
        {
          key: "mentorship-apply",
          label: "Closing call to apply",
          hint: "The page's last section. Mark the words to light up with *asterisks*.",
        },
      ]),
      {
        kind: "list",
        name: "audiences",
        label: "Who it is for",
        itemNoun: "audience",
        max: 4,
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
          DESCRIPTION,
          {
            name: "startsAt",
            label: "Usually starts at",
            kind: "text",
            maxLength: 60,
            hint: "The name of a stage under The path, exactly as written there. Picking this audience on the page marks that stage. Left blank, or not matching a stage, it points at the first one.",
          },
          {
            name: "short",
            label: "Short name",
            kind: "text",
            maxLength: 20,
            hint: "For the marker on the path: \"Juniors start here\". Left blank, the marker just says \"You start here\".",
          },
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
        name: "teamPrinciples",
        label: "Who reviews your code",
        description: "How the team reviews, beside the specialties. Three reads best.",
        itemNoun: "principle",
        max: 4,
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 80 },
          { ...DESCRIPTION, maxLength: 240 },
        ],
      },
      {
        kind: "strings",
        name: "specialties",
        label: "Specialties",
        description:
          "Arranged around \"You\" in the team section, lit one at a time. Between three and six fit the circle.",
        max: 6,
        placeholder: "Backend & APIs",
      },
      {
        kind: "list",
        name: "applySteps",
        label: "What happens after applying",
        description: "The steps under the closing call to apply, in order.",
        itemNoun: "step",
        max: 5,
        fields: [
          { name: "title", label: "Step", kind: "text", required: true, maxLength: 40 },
          {
            name: "when",
            label: "When",
            kind: "text",
            maxLength: 30,
            hint: "A short time label, such as \"After the call\". Only promise what actually happens.",
          },
          { ...DESCRIPTION, maxLength: 240 },
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
    page: "Projects",
    path: "/projects",
    description: "The capability grid and the process on the projects page. Projects are edited under Work.",
    groups: [
      headings([
        { key: "work-hero", label: "Hero" },
        { key: "work-capabilities", label: "What you build" },
        { key: "work-showcase", label: "The project grid" },
        { key: "work-process", label: "How you work" },
        { key: "work-stack", label: "The stack" },
        { key: "work-testimonials", label: "From clients" },
      ]),
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
      headings([
        { key: "ai-hero", label: "Hero" },
        { key: "ai-projects", label: "AI work" },
        { key: "ai-capabilities", label: "Capabilities" },
        { key: "ai-models", label: "Models" },
      ]),
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
      headings([
        { key: "web3-hero", label: "Hero" },
        { key: "web3-projects", label: "Web3 work" },
        { key: "web3-ecosystems", label: "Ecosystems" },
        { key: "web3-capabilities", label: "Capabilities" },
      ]),
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
      headings([{ key: "explainers", label: "The band" }]),
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
    title: "Contact",
    page: "Contact",
    path: "/contact",
    description:
      "The contact page's heading for each kind of enquiry, and what happens after somebody sends the form.",
    groups: [
      headings(
        [
          { key: "contact", label: "Software project", hint: "Also the page's default." },
          { key: "contact-mentorship", label: "Mentorship" },
          { key: "contact-speaking", label: "Speaking" },
          { key: "contact-other", label: "Something else" },
        ],
        "The page's heading changes with what somebody picks on the form. The last word, or the words in *asterisks*, is lit."
      ),
      {
        kind: "list",
        name: "steps",
        label: "Steps",
        itemNoun: "step",
        max: 4,
        fields: [
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
          DESCRIPTION,
          {
            name: "when",
            label: "When",
            kind: "text",
            maxLength: 30,
            hint: "A short time label beside the step, such as \"Same day\". Only promise what actually happens.",
          },
        ],
      },
      {
        kind: "keyed",
        name: "forms",
        label: "The form, per kind of enquiry",
        description:
          "The words on the form for each choice. Which fields a kind asks for is fixed, except that blanking the timeline or files label removes that field.",
        fields: [
          { name: "label", label: "Choice", kind: "text", required: true, maxLength: 40, hint: "The tile somebody picks." },
          { name: "sub", label: "Under the choice", kind: "text", required: true, maxLength: 60 },
          { name: "sheetLabel", label: "Form header", kind: "text", required: true, maxLength: 80 },
          { name: "detailsTitle", label: "Details heading", kind: "text", required: true, maxLength: 60 },
          {
            name: "timelineLabel",
            label: "Timeline question",
            kind: "text",
            maxLength: 80,
            hint: "Blank removes the timeline field for this kind.",
          },
          { name: "messageLabel", label: "Message question", kind: "text", required: true, maxLength: 80 },
          { name: "placeholder", label: "Message placeholder", kind: "text", maxLength: 160 },
          { name: "hint", label: "Under the message", kind: "text", maxLength: 160 },
          {
            name: "filesLabel",
            label: "Attachments label",
            kind: "text",
            maxLength: 80,
            hint: "Blank removes the file upload for this kind.",
          },
          { name: "submit", label: "Send button", kind: "text", required: true, maxLength: 40 },
          { name: "sentTitle", label: "After sending", kind: "text", required: true, maxLength: 60 },
          { name: "nextLabel", label: "Link after sending", kind: "text", required: true, maxLength: 60 },
        ],
        entries: [
          { key: "software", label: "Software project" },
          { key: "mentorship", label: "Mentorship" },
          { key: "speaking", label: "Speaking" },
          { key: "other", label: "Something else" },
        ],
      },
    ],
  },

  {
    key: "contribute",
    title: "Write for us",
    page: "Write for us",
    path: "/contribute",
    description:
      "The page for writing an explainer. The concept and analogy pairs it shows come from the Explainer pairs section.",
    groups: [
      headings([
        { key: "contribute-hero", label: "Hero", hint: "The lit words are where the crossed-out phrase is replaced." },
        { key: "contribute-route", label: "How you get here" },
        { key: "contribute-craft", label: "What makes a good one" },
      ]),
      {
        kind: "object",
        name: "draft",
        label: "The heading's edit",
        fields: [
          {
            name: "crossedOut",
            label: "Crossed out",
            kind: "text",
            maxLength: 40,
            hint: "Struck through just before the heading's lit words, as if an editor replaced it. Blank for no edit.",
          },
        ],
      },
      {
        kind: "object",
        name: "example",
        label: "The example draft",
        description: "The manuscript beside the heading: a first draft, the editor's changes, and the final version.",
        fields: [
          { name: "fileName", label: "File name", kind: "text", required: true, maxLength: 40, placeholder: "caching.md" },
          { name: "kicker", label: "Above the title", kind: "text", maxLength: 40, placeholder: "Explainer · 4 min" },
          { name: "draftTitle", label: "Title, first draft", kind: "text", required: true, maxLength: 80 },
          { name: "finalTitle", label: "Title, final", kind: "text", required: true, maxLength: 80 },
          { name: "byline", label: "Byline", kind: "text", required: true, maxLength: 40, hint: "Where the writer's name goes." },
          { name: "stamp", label: "Stamp on the final", kind: "text", required: true, maxLength: 30 },
        ],
      },
      {
        kind: "list",
        name: "edits",
        label: "The edits",
        description:
          "The draft in order, a piece at a time. Before empty is an addition, After empty is a cut, the same in both is text left alone. A note numbers the change in the margin.",
        itemNoun: "edit",
        max: 8,
        min: 1,
        fields: [
          { name: "before", label: "Before", kind: "textarea", maxLength: 400 },
          { name: "after", label: "After", kind: "textarea", maxLength: 400 },
          { name: "note", label: "Editor's note", kind: "text", maxLength: 120 },
        ],
      },
      {
        kind: "list",
        name: "route",
        label: "How you get here",
        description: "The stages a writer moves through, left to right.",
        itemNoun: "stage",
        max: 5,
        min: 2,
        fields: [
          { name: "status", label: "Stage", kind: "text", required: true, maxLength: 24 },
          { name: "title", label: "Title", kind: "text", required: true, maxLength: 80 },
          DESCRIPTION,
          { name: "cardNote", label: "On the card", kind: "text", maxLength: 40, hint: "What the moving card says at this stage." },
        ],
      },
      {
        kind: "object",
        name: "invite",
        label: "Under the stages",
        fields: [
          { name: "note", label: "Note", kind: "textarea", required: true, maxLength: 300 },
          { name: "primaryLabel", label: "Main button", kind: "text", required: true, maxLength: 40, hint: "Goes to the mentorship form." },
          { name: "secondaryLabel", label: "Second button", kind: "text", required: true, maxLength: 40, hint: "Goes to the blog." },
        ],
      },
      {
        kind: "strings",
        name: "craft",
        label: "What makes a good one",
        description: "A paragraph each.",
        long: true,
        max: 4,
      },
      {
        kind: "object",
        name: "scope",
        label: "Sizing it",
        fields: [
          { name: "quote", label: "Pull quote", kind: "text", required: true, maxLength: 160 },
          { name: "wideTopic", label: "Too wide: topic", kind: "text", required: true, maxLength: 60 },
          { name: "wideNote", label: "Too wide: why", kind: "text", required: true, maxLength: 100 },
          { name: "wideSize", label: "Too wide: size", kind: "text", maxLength: 30, placeholder: "≈ 40 min · 12 ideas" },
          { name: "rightTopic", label: "Right size: topic", kind: "text", required: true, maxLength: 80 },
          { name: "rightNote", label: "Right size: why", kind: "text", required: true, maxLength: 100 },
          { name: "rightSize", label: "Right size: size", kind: "text", maxLength: 30, placeholder: "≈ 4 min · 1 idea" },
        ],
      },
    ],
  },

  {
    key: "reviews",
    title: "Reviews page",
    page: "Reviews",
    path: "/reviews",
    description: "The words around the reviews. The reviews themselves are moderated under Reviews.",
    groups: [
      headings([
        { key: "reviews-hero", label: "Hero" },
        { key: "reviews-form", label: "Leave a review" },
      ]),
      {
        kind: "object",
        name: "empty",
        label: "Before the first review",
        description: "Used instead of the hero's lede and the form's heading while there are no reviews yet.",
        fields: [
          { name: "lede", label: "Hero lede", kind: "textarea", required: true, maxLength: 400 },
          { name: "formTitle", label: "Form heading", kind: "text", required: true, maxLength: 120 },
        ],
      },
      {
        kind: "list",
        name: "process",
        label: "What happens to a review",
        itemNoun: "step",
        max: 4,
        min: 1,
        fields: [{ name: "title", label: "Title", kind: "text", required: true, maxLength: 60 }, DESCRIPTION],
      },
    ],
  },

  {
    key: "pages",
    title: "Small pages",
    page: "Not found, Unsubscribe",
    path: "/unsubscribe",
    description: "The page for a link that goes nowhere, and the page an unsubscribe link lands on.",
    groups: [
      {
        kind: "object",
        name: "notFound",
        label: "Page not found",
        fields: [
          { name: "eyebrow", label: "Eyebrow", kind: "text", required: true, maxLength: 60 },
          { name: "title", label: "Heading", kind: "text", required: true, maxLength: 120 },
          { name: "lede", label: "Lede", kind: "textarea", required: true, maxLength: 300 },
          { name: "primaryLabel", label: "Main button", kind: "text", required: true, maxLength: 40, hint: "Goes to the homepage." },
          { name: "secondaryLabel", label: "Second button", kind: "text", required: true, maxLength: 40, hint: "Goes to the blog." },
        ],
      },
      {
        kind: "object",
        name: "unsubscribe",
        label: "Unsubscribe",
        fields: [
          { name: "doneTitle", label: "Heading, unsubscribed", kind: "text", required: true, maxLength: 80 },
          { name: "doneBody", label: "Text, unsubscribed", kind: "textarea", required: true, maxLength: 300 },
          { name: "failedTitle", label: "Heading, link did not work", kind: "text", required: true, maxLength: 80 },
          {
            name: "failedBody",
            label: "Text, link did not work",
            kind: "textarea",
            required: true,
            maxLength: 300,
            hint: "Keep it vague about why: saying an address is not on the list tells anyone who tries the link who is.",
          },
          { name: "blogLabel", label: "Blog button", kind: "text", required: true, maxLength: 40 },
          { name: "contactLabel", label: "Contact button", kind: "text", required: true, maxLength: 40, hint: "Shown only when the link did not work." },
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
