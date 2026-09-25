import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteConfig } from "@/lib/config/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BlogArticle } from "@/components/sections/blog/blog-article";
import { getEntry, getEntrySlugs } from "@/lib/content/posts";

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <BlogArticle entry={entry} />
      </main>
      <Footer />
    </>
  );
}
