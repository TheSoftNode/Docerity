import { pageMetadata } from "@/lib/content/blocks/metadata";

import { getSiteSettings } from "@/lib/content/blocks/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReviewsPage } from "@/components/sections/reviews/reviews-page";
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
  const [reviews, site, hero, form, empty, process] = await Promise.all([
    getPublicReviews(),
    getSiteSettings(),
    getHeading("reviews", "reviews-hero"),
    getHeading("reviews", "reviews-form"),
    getGroup<{ lede: string; formTitle: string }>("reviews", "empty"),
    getGroup<{ title: string; description: string }[]>("reviews", "process"),
  ]);

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
      <Navbar />
      <main className="flex-1">
        <ReviewsPage
          reviews={reviews}
          copy={{ hero, form, empty: empty ?? { lede: hero.lede, formTitle: form.title }, process: process ?? [] }}
        />
      </main>
      <Footer />
    </>
  );
}
