import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteConfig } from "@/lib/config/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BlogArticle } from "@/components/sections/blog/blog-article";
import { entries, getEntryBySlug } from "@/components/sections/blog/blog-data";

export function generateStaticParams() {
  return entries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);

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
  const entry = getEntryBySlug(slug);

  if (!entry) notFound();

  const title = entry.type === "explainer" ? entry.analogy.label : entry.title;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: entry.hook,
    datePublished: entry.publishedAt,
    author: {
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
