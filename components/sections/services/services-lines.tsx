import { Container } from "@/components/shared/container";
import { Eyebrow, Lede, SectionTitle } from "@/components/shared/section-kit";
import { ServicesGrid } from "@/components/sections/services/services-grid";
import { getBlock, getHeading } from "@/lib/content/blocks/source";
import type { ServiceLineView } from "@/lib/content/blocks/views";

/**
 * Every line of work, on one page.
 *
 * The capability grid on /projects is the short version of this and stops at
 * what gets built. This is the page somebody lands on wanting to know whether
 * the thing they need is something we do at all, which for half the list was
 * not previously possible to find out anywhere on the site.
 *
 * A thin Server Component in front of a Client one, which is the shape every
 * animated section here takes: the cards track the pointer and enter on
 * scroll, so they run in the browser; the content is read during this render
 * and handed down as plain data.
 */
async function ServicesLines() {
  const [block, heading] = await Promise.all([
    getBlock("services-page"),
    getHeading("services-page", "services-lines"),
  ]);

  return (
    <section
      id="services"
      className="relative scroll-mt-[var(--nav-h)] border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>{heading.eyebrow}</Eyebrow>
          <SectionTitle>{heading.title}</SectionTitle>
          {heading.lede ? <Lede>{heading.lede}</Lede> : null}
        </div>

        <ServicesGrid lines={block.lines as ServiceLineView[]} />
      </Container>
    </section>
  );
}

export { ServicesLines };
