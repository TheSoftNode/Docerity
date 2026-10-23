import { pageMetadata } from "@/lib/content/blocks/metadata";
import { getBlock, getGroup, getHeading } from "@/lib/content/blocks/source";
import type { PairView } from "@/lib/content/blocks/views";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactBand } from "@/components/sections/contact-band/contact-band";
import { ReviewSheet } from "@/components/sections/contribute-page/review-sheet";
import { PairsMarquee } from "@/components/sections/contribute-page/pairs-marquee";
import { ContributeRoute, type Stage } from "@/components/sections/contribute-page/contribute-route";
import { ContributeCraft } from "@/components/sections/contribute-page/contribute-craft";
import { heroDoc, type Piece, type Size } from "@/components/sections/contribute-page/contribute-content";
import { APPLY_HREF } from "@/components/sections/mentorship-page/mentorship-content";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("contribute", "/contribute");

/* The copy is edited in the admin; saving revalidates, and this is the
   ceiling on staleness if that never lands. */
export const revalidate = 300;

/*
  There is deliberately no submission form on this page.

  An open form on a site with any search presence collects AI-generated filler
  and link-building attempts, and every one of them is something that has to be
  read and refused. The people who should write here are already being
  mentored, and they get an account rather than a form. Saying that plainly is
  more useful than a form would be: somebody who genuinely wants to write now
  knows what the route actually is.
*/

type Words = { note: string; primaryLabel: string; secondaryLabel: string };

/**
 * Write for us: the page's own pitch as a draft being edited, the pairs the
 * explainers are built on, the route in, and the craft.
 */
export default async function ContributePage() {
  const [block, hero, route, craft, pairs] = await Promise.all([
    getBlock("contribute"),
    getHeading("contribute", "contribute-hero"),
    getHeading("contribute", "contribute-route"),
    getHeading("contribute", "contribute-craft"),
    getGroup<PairView[]>("explainers", "pairs"),
  ]);

  const draft = (block.draft ?? {}) as { crossedOut?: string; note?: string };
  const example = (block.example ?? {}) as { fileName?: string; byline?: string; stamp?: string; button?: string };
  const invite = (block.invite ?? {}) as Partial<Words>;
  const doc = heroDoc(hero.title, { crossedOut: draft.crossedOut ?? "", note: draft.note ?? "" }, (block.edits ?? []) as Piece[]);

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <ReviewSheet
          doc={doc}
          eyebrow={hero.eyebrow}
          fileName={example.fileName ?? "write-for-us.md"}
          byline={example.byline ?? "your name"}
          stamp={example.stamp ?? "Ready to publish"}
          primary={{ href: "#route", label: example.button ?? "How you get here" }}
          secondary={{ href: "/blog", label: invite.secondaryLabel ?? "Read what is here" }}
        />
        <PairsMarquee />
        <ContributeRoute
          heading={route}
          stages={(block.route ?? []) as Stage[]}
          invite={{
            note: invite.note ?? "",
            primaryLabel: invite.primaryLabel ?? "Talk about mentorship",
            secondaryLabel: invite.secondaryLabel ?? "Read what is here",
            primaryHref: APPLY_HREF,
            secondaryHref: "/blog",
          }}
        />
        <ContributeCraft
          heading={craft}
          paragraphs={(block.craft ?? []) as string[]}
          quote={((block.scope ?? {}) as { quote?: string }).quote ?? ""}
          pairs={pairs ?? []}
          sizes={(block.sizes ?? []) as Size[]}
        />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
