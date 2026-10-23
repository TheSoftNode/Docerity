import { pageMetadata } from "@/lib/content/blocks/metadata";
import { getHeading } from "@/lib/content/blocks/source";
import { getPublishedEntries } from "@/lib/content/posts";
import { toArticleView, toExplainerView } from "@/lib/content/entry-view";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BlogTable } from "@/components/sections/blog-page/blog-table";
import { BlogLatest } from "@/components/sections/blog-page/blog-latest";
import { BlogGlossary } from "@/components/sections/blog-page/blog-glossary";
import { BlogWrite } from "@/components/sections/blog-page/blog-write";
import { BlogSubscribe } from "@/components/sections/blog-page/blog-subscribe";
import { toElements } from "@/components/sections/blog-page/blog-content";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("blog");

/* Posts come from the database; publishing revalidates the page, and this is
   the ceiling on staleness if that never lands. */
export const revalidate = 300;

export default async function BlogPage() {
  const [entries, heading] = await Promise.all([getPublishedEntries(), getHeading("explainers", "explainers")]);

  /* Converted to plain views before crossing into the client components: a
     post carries its icon as a component, which cannot be serialised. */
  const elements = toElements(
    entries.map((entry) => (entry.type === "explainer" ? toExplainerView(entry) : toArticleView(entry)))
  );

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <BlogTable elements={elements} heading={heading} />
        <BlogLatest element={elements.at(-1)} />
        <BlogGlossary elements={elements} />
        <BlogWrite />
        <BlogSubscribe />
      </main>
      <SiteFooter />
    </div>
  );
}
