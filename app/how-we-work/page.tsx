import { pageMetadata } from "@/lib/content/blocks/metadata";
import { getBlock, getHeading } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";
import type { EngagementView, FaqView, HabitView } from "@/lib/content/blocks/views";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactBand } from "@/components/sections/contact-band/contact-band";
import { HowWeWorkHero } from "@/components/sections/how-we-work-page/how-we-work-hero";
import { HowWeWorkOptions } from "@/components/sections/how-we-work-page/how-we-work-options";
import { HowWeWorkHabits } from "@/components/sections/how-we-work-page/how-we-work-habits";
import { HowWeWorkFaq } from "@/components/sections/how-we-work-page/how-we-work-faq";
import { usableEngagements } from "@/components/sections/how-we-work-page/how-we-work-content";

/* Read per request, so the title a search result shows can be edited
   without a deploy. */
export const generateMetadata = pageMetadata("how-we-work", "/how-we-work");

/* The copy is edited in the admin; saving revalidates, and this is the
   ceiling on staleness if that never lands. */
export const revalidate = 300;

type Words = { cardLink?: string; unsure?: string; ask?: string; goodFor?: string; steps?: string };

/**
 * How we work: what hiring the team is like, written for a client deciding
 * whether to, in words they understand at a glance. The options as cards,
 * each one in full, what every project has, and common questions. There are
 * no prices on this page, by the founder's choice.
 */
export default async function HowWeWorkPage() {
  const [block, hero, optionsHeading, habitsHeading, faqHeading, site] = await Promise.all([
    getBlock("how-we-work"),
    getHeading("how-we-work", "hww-hero"),
    getHeading("how-we-work", "hww-engagements"),
    getHeading("how-we-work", "hww-habits"),
    getHeading("how-we-work", "hww-faq"),
    getSiteSettings(),
  ]);

  const words = (block.words ?? {}) as Words;
  const options = usableEngagements((block.engagements ?? []) as Partial<EngagementView>[]);

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <HowWeWorkHero
          heading={hero}
          options={options}
          words={{ cardLink: words.cardLink || "See how it works", unsure: words.unsure ?? "", ask: words.ask || "Ask us" }}
        />
        <HowWeWorkOptions
          heading={optionsHeading}
          options={options}
          words={{ goodFor: words.goodFor || "Good for", steps: words.steps || "How it works" }}
        />
        <HowWeWorkHabits heading={habitsHeading} habits={(block.habits ?? []) as HabitView[]} />
        <HowWeWorkFaq heading={faqHeading} faqs={(block.faqs ?? []) as FaqView[]} email={site.email} />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
