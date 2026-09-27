import { pageMetadata } from "@/lib/content/blocks/metadata";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { MentorshipProgramHero } from "@/components/sections/mentorship-program/mentorship-program-hero";
import { MentorshipAudience } from "@/components/sections/mentorship-program/mentorship-audience";
import { MentorshipPath } from "@/components/sections/mentorship-program/mentorship-path";
import { MentorshipFormat } from "@/components/sections/mentorship-program/mentorship-format";
import { MentorshipTestimonials } from "@/components/sections/mentorship-program/mentorship-testimonials";
import { MentorshipFaq } from "@/components/sections/mentorship-program/mentorship-faq";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("mentorship");

export default function MentorshipPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <MentorshipProgramHero />
        <MentorshipAudience />
        <MentorshipPath />
        <MentorshipFormat />
        <MentorshipTestimonials />
        <MentorshipFaq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
