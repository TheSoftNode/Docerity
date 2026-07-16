import { Container } from "@/components/shared/container";
import { MentorshipAudienceBackground } from "@/components/sections/mentorship-program/mentorship-audience-background";
import { audiences } from "@/components/sections/mentorship-program/mentorship-program-data";

function MentorshipAudience() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-card py-16 sm:py-20">
      <MentorshipAudienceBackground />

      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Who this is for
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Three starting points, one honest process.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className="relative rounded-xl border border-border/80 bg-background p-6"
            >
              <h3 className="font-heading text-base font-medium text-foreground">
                {audience.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { MentorshipAudience };
