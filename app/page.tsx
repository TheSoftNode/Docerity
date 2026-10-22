import { HomeNav } from "@/components/sections/home/home-nav";
import { HomeHero } from "@/components/sections/home/home-hero";
import { HomeBands } from "@/components/sections/home/home-bands";
import { HomeTracks } from "@/components/sections/home/home-tracks";
import { HomeWork } from "@/components/sections/home/home-work";
import { HomeMentorship } from "@/components/sections/home/home-mentorship";
import { HomeExplainers } from "@/components/sections/home/home-explainers";
import { HomeReviews } from "@/components/sections/home/home-reviews";
import { HomeContact } from "@/components/sections/home/home-contact";
import { HomeFooter } from "@/components/sections/home/home-footer";

/*
  Revalidated, because the reviews section reads approved reviews.

  Without it the homepage is prerendered once at build and a review approved
  after a deploy would only appear on the next one. Approving also calls
  `revalidatePath("/")`, which makes the change immediate; this window is the
  fallback for an invalidation that never lands, such as one issued while the
  build was still in flight.
*/
export const revalidate = 300;

/**
 * The homepage.
 *
 * Every section reads the same editable content the previous homepage did;
 * what changed is how it is drawn. The page sits on the palette's ink so the
 * floating header has the hero's colour behind it from the first pixel, and
 * each section paints its own band from there.
 */
export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <HomeNav />
      <main className="flex-1">
        <HomeHero />
        <HomeBands />
        <HomeTracks />
        <HomeWork />
        <HomeMentorship />
        <HomeExplainers />
        <HomeReviews />
        <HomeContact />
      </main>
      <HomeFooter />
    </div>
  );
}
