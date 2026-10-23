import { pageMetadata } from "@/lib/content/blocks/metadata";

import { getSiteSettings } from "@/lib/content/blocks/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactBand } from "@/components/sections/contact-band/contact-band";
import { CaptionReel } from "@/components/sections/reviews-page/caption-reel";
import { ReviewRecord } from "@/components/sections/reviews-page/review-record";
import { LeaveReview, LEAVE_A_REVIEW_ID } from "@/components/sections/reviews-page/leave-review";
import { getGroup, getHeading } from "@/lib/content/blocks/source";
import { getPublicReviews } from "@/lib/reviews/display";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("reviews", "/reviews");

/*
  Revalidated rather than dynamic.

  The page is identical for everyone, so re-querying Mongo on every view buys
  nothing. Five minutes is the ceiling on staleness, and approving a review
  calls `revalidatePath("/reviews")`, so in practice a newly approved review
  appears immediately rather than in five minutes.
*/
export const revalidate = 300;

export default async function Reviews() {
  const [reviews, site, hero, form, record, empty, process] = await Promise.all([
    getPublicReviews(),
    getSiteSettings(),
    getHeading("reviews", "reviews-hero"),
    getHeading("reviews", "reviews-form"),
    getHeading("reviews", "reviews-record"),
    getGroup<{ lede: string; formTitle: string }>("reviews", "empty"),
    getGroup<{ title: string; description: string }[]>("reviews", "process"),
  ]);

  const copy = {
    empty: empty ?? { lede: hero.lede, formTitle: form.title },
    process: process ?? [],
    recordEyebrow: record.eyebrow,
    recordTitle: record.title,
  };

  const jsonLd =
    reviews.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          url: site.url,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (
              reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            ).toFixed(1),
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.slice(0, 10).map((review) => ({
            "@type": "Review",
            author: { "@type": "Person", name: review.fullName },
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: 5,
            },
            reviewBody: review.body,
            datePublished: review.publishedAt,
          })),
        }
      : null;

  return (
    <>
      {/* Only emitted when there is something to describe. An AggregateRating
          with a reviewCount of 0 is a structured-data error, not an empty one. */}
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
        <SiteHeader />
        <main className="flex-1">
          <CaptionReel
            heading={hero}
            emptyLede={copy.empty.lede}
            reviews={reviews}
            formHref={`#${LEAVE_A_REVIEW_ID}`}
          />
          <ReviewRecord reviews={reviews} eyebrow={copy.recordEyebrow} title={copy.recordTitle} />
          <LeaveReview heading={form} title={reviews.length > 0 ? form.title : copy.empty.formTitle} process={copy.process} />
          <ContactBand />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
