import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { MentorshipProgramHero } from "@/components/sections/mentorship-program/mentorship-program-hero";
import { MentorshipAudience } from "@/components/sections/mentorship-program/mentorship-audience";
import { MentorshipPath } from "@/components/sections/mentorship-program/mentorship-path";
import { MentorshipFormat } from "@/components/sections/mentorship-program/mentorship-format";
import { MentorshipTestimonials } from "@/components/sections/mentorship-program/mentorship-testimonials";
import { MentorshipFaq } from "@/components/sections/mentorship-program/mentorship-faq";

export const metadata: Metadata = {
  title: "Mentorship",
  description:
    "Weekly 1:1s, honest code review, and a real plan. Mentorship for junior engineers, career switchers, and mid-level engineers leveling up.",
};

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
