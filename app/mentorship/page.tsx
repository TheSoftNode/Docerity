import { pageMetadata } from "@/lib/content/blocks/metadata";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MentorshipHero } from "@/components/sections/mentorship-page/mentorship-hero";
import { AudiencePath } from "@/components/sections/mentorship-page/audience-path";
import { MentorshipFormat } from "@/components/sections/mentorship-page/mentorship-format";
import { MentorshipTeam } from "@/components/sections/mentorship-page/mentorship-team";
import { MentorshipReviews } from "@/components/sections/mentorship-page/mentorship-reviews";
import { MentorshipFaq } from "@/components/sections/mentorship-page/mentorship-faq";
import { MentorshipApply } from "@/components/sections/mentorship-page/mentorship-apply";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("mentorship");

/*
  Revalidated, because the copy comes from the admin and the reviews from the
  database. Saving either revalidates the page; this is the ceiling on
  staleness if that never lands.
*/
export const revalidate = 300;

export default function MentorshipPage() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <MentorshipHero />
        <AudiencePath />
        <MentorshipFormat />
        <MentorshipTeam />
        <MentorshipReviews />
        <MentorshipFaq />
        {/* The page's own ending rather than the shared contact band: it is
            the call to apply, and it runs into the footer below. */}
        <MentorshipApply />
      </main>
      <SiteFooter />
    </div>
  );
}
