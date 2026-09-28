/**
 * The record shapes each section renders, named once.
 *
 * `getGroup` returns whatever the caller asks for, which puts the burden of
 * agreeing with `schema.ts` on every call site. These types are that agreement
 * written down: a section imports the one it renders, and
 * `e2e/content-blocks.spec.ts` walks every block asserting the defaults and the
 * descriptions still line up with them.
 *
 * Plain data, no React components. Several of these cross into Client
 * Components, and an icon travels as its registry name because a function
 * cannot be serialised across that boundary.
 */

export type LogoView = { name: string; src: string; context: string };

export type FounderView = {
  name: string;
  role: string;
  based: string;
  availability: string;
  hours: string;
  /** "" falls back to the file the page shipped with. */
  portrait: string;
};

export type FactView = { value: string; label: string; since: string };

export type ExperienceView = {
  role: string;
  org: string;
  period: string;
  summary: string;
  points: string[];
};

export type SkillGroupView = { title: string; items: string[] };

export type ToolView = { name: string; src: string };

export type EducationView = { qualification: string; institution: string; period: string };

export type CertificationView = {
  name: string;
  issuer: string;
  detail: string;
  image: string;
};

export type TitledView = { title: string; description: string };

export type StageView = { label: string; summary: string; description: string };

export type CheckpointView = { label: string; detail: string };

export type FaqView = { question: string; answer: string };

export type CapabilityView = { title: string; description: string; iconName: string };

export type ProcessStepView = {
  title: string;
  summary: string;
  description: string;
  iconName: string;
};

export type AiProjectView = {
  slug: string;
  name: string;
  stat: string;
  description: string;
  tags: string[];
  iconName: string;
};

export type Web3ProjectView = {
  slug: string;
  name: string;
  badge: string;
  description: string;
  tags: string[];
  iconName: string;
};

export type PairView = {
  id: string;
  conceptLabel: string;
  conceptCaption: string;
  conceptIcon: string;
  analogyLabel: string;
  analogyCaption: string;
  analogyIcon: string;
};

/**
 * The whole About block, which the page reads once and hands down.
 *
 * Its five panels are rendered inside a Client Component, so none of them can
 * read the content themselves. The page reads it and passes slices, which also
 * means one query rather than five.
 */
export type AboutContent = {
  founder: FounderView;
  story: string[];
  facts: FactView[];
  experience: ExperienceView[];
  skillGroups: SkillGroupView[];
  tools: ToolView[];
  education: EducationView[];
  certifications: CertificationView[];
};

/** The homepage hero: the one section whose buttons are editable too. */
export type HeroCopy = {
  eyebrow: string;
  title: string;
  lede: string;
  primaryLabel: string;
  secondaryLabel: string;
};

/** One line of work on the services page. `href` is "" where no page exists. */
export type ServiceLineView = {
  title: string;
  summary: string;
  description: string;
  href: string;
  iconName: string;
};
