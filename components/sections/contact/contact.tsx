import { getBlock, getGroup } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";
import type { BlockRecord } from "@/lib/content/blocks/schema";
import type { AudienceView, StageView } from "@/lib/content/blocks/views";
import { projectTypes, type ProjectType } from "@/lib/contact/schema";
import { ContactView, type ContactHeading, type ContactStep } from "@/components/sections/contact/contact-view";
import { HEADING_KEYS, formCopyFrom } from "@/components/sections/contact/contact-content";
import { startStageIndex } from "@/components/sections/mentorship-page/mentorship-content";

/**
 * The contact page: one screen, the heading and what happens next on the
 * left, the form on the right, both changing with what somebody came for.
 *
 * Everything editable is read here: a heading and the form's wording per
 * kind of enquiry, the steps, and the mentorship audiences, so the form offers the same starting
 * points the mentorship page describes. `initialType` comes from the
 * `?type=` the Apply and Start buttons link with.
 */
async function Contact({ initialType }: { initialType: string | undefined }) {
  const [site, contact, steps, audiences, stages, howWeWork] = await Promise.all([
    getSiteSettings(),
    getBlock("contact"),
    getGroup<(ContactStep & { when?: string })[]>("contact", "steps"),
    getGroup<AudienceView[]>("mentorship", "audiences"),
    getGroup<StageView[]>("mentorship", "stages"),
    getGroup<{ contact?: string }>("how-we-work", "links"),
  ]);

  const stored = (contact.headings ?? {}) as Record<string, BlockRecord>;
  const fallback = (stored[HEADING_KEYS.software] ?? {}) as Record<string, string>;
  const headings = Object.fromEntries(
    projectTypes.map(({ value }) => {
      const entry = (stored[HEADING_KEYS[value]] ?? {}) as Record<string, string>;
      const heading: ContactHeading = {
        eyebrow: entry.eyebrow || fallback.eyebrow || "",
        title: entry.title || fallback.title || "",
        lede: entry.lede ?? "",
      };
      return [value, heading];
    })
  ) as Record<ProjectType, ContactHeading>;

  const type = projectTypes.some((option) => option.value === initialType)
    ? (initialType as ProjectType)
    : "software";

  return (
    <ContactView
      initialType={type}
      headings={headings}
      forms={formCopyFrom(contact.forms as Record<string, BlockRecord> | undefined)}
      steps={(steps ?? []).map((step) => ({ title: step.title, description: step.description, when: step.when ?? "" }))}
      audiences={(audiences ?? []).map((audience) => ({
        title: audience.title,
        startsAt: stages?.[startStageIndex(audience.startsAt, stages ?? [])]?.label ?? "",
      }))}
      email={site.email}
      workLink={howWeWork?.contact ?? ""}
    />
  );
}

export { Contact };
