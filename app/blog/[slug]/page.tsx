import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteConfig } from "@/lib/config/site";
import { getEntry, getEntrySlugs, getPublishedEntries } from "@/lib/content/posts";
import { toArticleView, toExplainerView } from "@/lib/content/entry-view";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PostHero } from "@/components/sections/blog-page/post-hero";
import { PostBody } from "@/components/sections/blog-page/post-body";
import { PostNext } from "@/components/sections/blog-page/post-next";
import { ReadingBar } from "@/components/sections/blog-page/reading-bar";
import { BlogSubscribe } from "@/components/sections/blog-page/blog-subscribe";
import { readingOrder, toElements } from "@/components/sections/blog-page/blog-content";

/*
  Revalidated, because posts come from the database now.

  Without it a published post is baked in at build time and editing one would
  need a redeploy to show. Publishing also calls `revalidatePath`, so an edit
  appears immediately; this is the ceiling on staleness if that invalidation
  never lands.
*/
export const revalidate = 300;

/* Slugs that exist at build time are prerendered; anything published later is
   rendered on demand and then cached, rather than 404ing. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getEntrySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) return { title: "Not found" };

  const title = entry.type === "explainer" ? entry.analogy.label : entry.title;

  return {
    title,
    description: entry.hook,
    openGraph: {
      type: "article",
      title,
      description: entry.hook,
      url: `${siteConfig.url}/blog/${entry.slug}`,
      publishedTime: entry.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: entry.hook,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) notFound();

  const title = entry.type === "explainer" ? entry.analogy.label : entry.title;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: entry.hook,
    datePublished: entry.publishedAt,
    /* The real author when a contributor wrote it, so search engines
       attribute it to them rather than to the site. That attribution is most of
       what makes contributing worth somebody's time. */
    author: entry.author
      ? {
          "@type": "Person",
          name: entry.author.name,
          ...(entry.author.link ? { url: entry.author.link } : {}),
        }
      : {
          "@type": "Person",
          name: siteConfig.name,
        },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    mainEntityOfPage: `${siteConfig.url}/blog/${entry.slug}`,
  };

  /* The whole published list, for this piece's element number and what to
     read next. One extra query on a route cached for five minutes. */
  const all = await getPublishedEntries();
  const elements = toElements(
    (all.some((candidate) => candidate.slug === entry.slug) ? all : [...all, entry]).map((candidate) =>
      candidate.type === "explainer" ? toExplainerView(candidate) : toArticleView(candidate)
    )
  );
  const element = elements.find((candidate) => candidate.slug === entry.slug)!;
  const { next, related } = readingOrder(elements, entry.slug);
  const sharedTags = related.some((candidate) => candidate.tags.some((tag) => entry.tags.includes(tag)));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingBar />
      <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
        <SiteHeader />
        <main className="flex-1">
          <PostHero element={element} author={entry.author} />
          <PostBody entry={entry} url={`${siteConfig.url}/blog/${entry.slug}`} title={title} />
          <PostNext
            next={next}
            related={related}
            relatedLabel={sharedTags ? `More on ${entry.tags.slice(0, 2).join(" & ")}` : "More to read"}
          />
          <BlogSubscribe />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
