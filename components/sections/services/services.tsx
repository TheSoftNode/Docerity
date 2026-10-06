import { Container } from "@/components/shared/container";
import { Eyebrow, Lede, SectionTitle } from "@/components/shared/section-kit";
import { ServicesBand } from "@/components/sections/services/services-band";
import { getBlock, getHeading } from "@/lib/content/blocks/source";
import type { ServiceLineView } from "@/lib/content/blocks/views";

/**
 * What else the team takes on, on the homepage.
 *
 * `id="services"` because /services redirects here: the address was indexed,
 * it is the landing page of a running ad campaign, and a redirect that drops
 * somebody at the top of the homepage has technically not broken while having
 * entirely failed.
 *
 * A thin Server Component in front of a Client one, which is the shape every
 * animated section here takes: the content is read during this render and
 * handed down, and the motion runs in the browser.
 */
async function Services() {
  const [block, heading] = await Promise.all([
    getBlock("services-page"),
    getHeading("services-page", "services-lines"),
  ]);

  return (
    <section
      id="services"
      className="relative scroll-mt-[var(--nav-h)] border-b border-border/80 bg-surface-raised py-16 sm:py-20"
    >
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>{heading.eyebrow}</Eyebrow>
          <SectionTitle>{heading.title}</SectionTitle>
          {heading.lede ? <Lede>{heading.lede}</Lede> : null}
        </div>

        <ServicesBand
          lines={block.lines as ServiceLineView[]}
          heading={{ eyebrow: heading.eyebrow, title: heading.title }}
        />
      </Container>
    </section>
  );
}

export { Services };
