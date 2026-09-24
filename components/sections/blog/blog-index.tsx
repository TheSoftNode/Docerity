import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow } from "@/components/shared/section-kit";
import { BlogConsole } from "@/components/sections/blog/blog-console";
import { BlogPairTicker } from "@/components/sections/blog/blog-pair-ticker";
import { ScrambleText } from "@/components/shared/scramble-text";
import type { ArticlePost, ExplainerPost } from "@/components/sections/blog/blog-data";
import { toArticleView, toExplainerView } from "@/lib/content/entry-view";
import { getPublishedEntries } from "@/lib/content/posts";

/**
 * A Server Component, so posts are read during the render.
 *
 * The console and the ticker below animate and so have to stay Client
 * Components; they receive the posts as props rather than importing them,
 * because the source is now the database.
 */
async function BlogIndex() {
  const entries = await getPublishedEntries();

  /*
    Converted to the serialisable view before crossing into the console and the
    ticker, both of which are Client Components. A `BlogEntry` carries `Icon` as
    a component, and React refuses to serialise a function across that boundary.
  */
  const explainers = entries
    .filter((entry): entry is ExplainerPost => entry.type === "explainer")
    .map(toExplainerView);
  const articles = entries
    .filter((entry): entry is ArticlePost => entry.type === "article")
    .map(toArticleView);

  return (
    /*
      An index page, not a landing page: the console is what people came for,
      so the header stays compact and sits on one row. A full hero-scale title
      stacked above its lede pushed the console's first article to 551px on a
      900px viewport, with most of the fold spent on a heading.
    */
    <section className="relative overflow-hidden border-b border-border/80 bg-background pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20">
      <Bloom tone="violet" className="top-0 right-0 translate-x-1/3 -translate-y-1/3" />
      <Bloom className="bottom-0 left-0 -translate-x-1/3 translate-y-1/3" />

      <Container className="relative">
        {/* Title left, lede right: it fills the space the stacked layout left
            empty and costs no extra height. */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:items-end lg:gap-12">
          <div>
            <Eyebrow className="flex items-center gap-2.5">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-teal opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand-teal" />
              </span>
              <ScrambleText text="Tech Explainers" />
              <span className="text-muted-foreground">
                {`/ ${String(entries.length).padStart(2, "0")} pieces`}
              </span>
            </Eyebrow>

            <h1 className="mt-3 text-balance font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
              Complex ideas, explained through{" "}
              <span className="bg-[linear-gradient(120deg,var(--brand-primary),var(--brand-violet))] bg-clip-text text-transparent">
                things you already know
              </span>
              .
            </h1>
          </div>

          {/* The premise, shown rather than stated. */}
          <BlogPairTicker explainerPosts={explainers} />
        </div>

        <div className="mt-8 lg:mt-10">
          <BlogConsole explainers={explainers} articles={articles} />
        </div>
      </Container>
    </section>
  );
}

export { BlogIndex };
