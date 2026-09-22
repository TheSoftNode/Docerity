import { RepeatIcon, SproutIcon, TrendingUpIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Eyebrow, HoverCard, SectionTitle } from "@/components/shared/section-kit";
import { MentorshipAudienceBackground } from "@/components/sections/mentorship-program/mentorship-audience-background";
import { audiences } from "@/components/sections/mentorship-program/mentorship-program-data";

/* One per audience, in data order: early-career, switchers, mid-level. */
const icons = [SproutIcon, RepeatIcon, TrendingUpIcon];

function MentorshipAudience() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-[#0b1220] py-16 sm:py-20 lg:py-24">
      <MentorshipAudienceBackground />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Who this is for</Eyebrow>
          <SectionTitle>Three starting points, one honest process.</SectionTitle>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-14 lg:gap-6">
          {audiences.map((audience, index) => {
            const Icon = icons[index];
            return (
              <HoverCard key={audience.title} innerClassName="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-background text-primary transition-colors duration-300 group-hover:border-primary/50">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span
                    aria-hidden
                    className="font-heading text-4xl leading-none font-semibold text-foreground/[0.06] transition-colors duration-500 group-hover:text-primary/20"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 font-heading text-lg font-semibold tracking-tight text-foreground">
                  {audience.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {audience.description}
                </p>
              </HoverCard>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export { MentorshipAudience };
