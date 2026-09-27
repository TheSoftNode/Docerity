import { nameForIcon } from "@/lib/content/icons";
import type { BlockData, BlockKey } from "@/lib/content/blocks/schema";

import { organisations, ecosystems } from "@/components/sections/clients/clients-data";
import {
  certifications,
  education,
  experience,
  facts,
  founder,
  skillGroups,
  story,
  tools,
} from "@/components/sections/about/about-data";
import {
  audiences,
  faqs,
  formatSteps,
  stages,
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
  clients: {
    organisations: organisations.map((logo) => ({ ...logo })),
    ecosystems: ecosystems.map((logo) => ({ ...logo })),
  },

  about: {
    founder: { ...founder },
    story: [...story],
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
    audiences: audiences.map((entry) => ({ ...entry })),
    stages: stages.map((entry) => ({ ...entry })),
    checkpoints: checkpoints.map((entry) => ({ ...entry })),
    formatSteps: formatSteps.map((entry) => ({ ...entry })),
    faqs: faqs.map((entry) => ({ ...entry })),
  },

  services: {
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
    steps: contactSteps.map((step) => ({ ...step })),
  },
};
