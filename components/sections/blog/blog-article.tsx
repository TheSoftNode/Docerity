import { Fragment } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  explainerPosts,
  articlePosts,
  type BlogEntry,
} from "@/components/sections/blog/blog-data";
import { BlogIntroBackground } from "@/components/sections/blog/blog-intro-background";
import { MediaPlaceholder } from "@/components/shared/media-placeholder";
import { ReadingProgress } from "@/components/sections/blog/blog-reading-progress";
import { BlogSubscribe } from "@/components/sections/blog/blog-subscribe";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function entryTitle(entry: BlogEntry) {
  return entry.type === "explainer" ? entry.analogy.label : entry.title;
}

function Sidenote({ sidenote }: { sidenote: string }) {
  return (
    <div className="rounded-lg border-l-2 border-primary/50 bg-primary/[0.04] py-3 pl-4">
      <p className="font-mono text-[11px] tracking-[0.15em] text-primary/80 uppercase">
        Like this
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[#070b16]/70">
        {sidenote}
      </p>
    </div>
  );
}

function BlogArticle({ entry }: { entry: BlogEntry }) {
  const isExplainer = entry.type === "explainer";
  const pool = isExplainer ? explainerPosts : articlePosts;

  const byTag = pool.filter(
    (p) => p.slug !== entry.slug && p.tags.some((tag) => entry.tags.includes(tag))
  );
  const related = (byTag.length > 0 ? byTag : pool.filter((p) => p.slug !== entry.slug)).slice(
    0,
    2
  );

  const currentIndex = pool.findIndex((p) => p.slug === entry.slug);
  const prevPost = currentIndex > 0 ? pool[currentIndex - 1] : null;
  const nextPost = currentIndex < pool.length - 1 ? pool[currentIndex + 1] : null;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/80 bg-background py-4">
        <BlogIntroBackground />
        <Container className="relative">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" />
            All {isExplainer ? "explainers" : "articles"}
          </Link>
        </Container>
      </section>

      <section className="bg-[#f5f7fb] pt-10 pb-28 sm:pt-14 sm:pb-32">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col gap-4 border-b border-[#070b16]/10 pb-8 sm:flex-row sm:items-center sm:gap-5">
              {isExplainer ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-[#070b16]/15 bg-white/60">
                    <entry.concept.Icon className="size-5 text-[#070b16]" strokeWidth={1.75} />
                  </span>
                  <span className="font-heading text-muted-foreground">&asymp;</span>
                  <span className="flex size-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                    <entry.analogy.Icon className="size-5 text-primary" strokeWidth={1.75} />
                  </span>
                </div>
              ) : (
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#070b16]/15 bg-white/60">
                  <entry.Icon className="size-5 text-[#070b16]" strokeWidth={1.75} />
                </span>
              )}

              <div>
                <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
                  {isExplainer ? entry.concept.label : entry.topic}
                </p>
                <h1 className="mt-1 font-heading text-2xl font-medium tracking-tight text-[#070b16] sm:text-3xl">
                  {entryTitle(entry)}
                </h1>
                <p className="mt-1 text-xs text-[#070b16]/50">
                  {formatDate(entry.publishedAt)} &middot; {entry.readTime}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 sm:ml-auto">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#070b16]/10 px-3 py-1 text-xs text-[#070b16]/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <ReadingProgress>
              <div className="mt-10">
                {isExplainer ? (
                  <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[1fr_300px]">
                    {entry.body.map((section, index) => (
                      <Fragment key={section.heading}>
                        <div style={{ gridRow: index + 1 }} className="lg:col-start-1">
                          <h2 className="font-heading text-xl font-medium text-[#070b16] sm:text-2xl">
                            {section.heading}
                          </h2>
                          {section.paragraphs.map((paragraph) => (
                            <p
                              key={paragraph.slice(0, 24)}
                              className="mt-3 text-sm leading-relaxed text-[#070b16]/75 sm:text-base"
                            >
                              {paragraph}
                            </p>
                          ))}
                          {section.media && <MediaPlaceholder media={section.media} />}
                          {section.sidenote && (
                            <div className="mt-4 lg:hidden">
                              <Sidenote sidenote={section.sidenote} />
                            </div>
                          )}
                        </div>

                        {section.sidenote && (
                          <div style={{ gridRow: index + 1 }} className="hidden lg:col-start-2 lg:block">
                            <div className="sticky top-24">
                              <Sidenote sidenote={section.sidenote} />
                            </div>
                          </div>
                        )}
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="mx-auto max-w-2xl">
                    {entry.body.map((section) => (
                      <div key={section.heading} className="mb-8">
                        <h2 className="font-heading text-xl font-medium text-[#070b16] sm:text-2xl">
                          {section.heading}
                        </h2>
                        {section.paragraphs.map((paragraph) => (
                          <p
                            key={paragraph.slice(0, 24)}
                            className="mt-3 text-sm leading-relaxed text-[#070b16]/75 sm:text-base"
                          >
                            {paragraph}
                          </p>
                        ))}
                        {section.media && <MediaPlaceholder media={section.media} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ReadingProgress>

            <div className="mx-auto mt-14 flex max-w-2xl flex-col items-center gap-4 border-t border-[#070b16]/10 pt-10 text-center">
              <p className="text-sm text-[#070b16]/70">
                {isExplainer
                  ? "Got a concept you want explained like this?"
                  : "Got a project or idea you want to talk through?"}
              </p>
              <Button
                size="lg"
                className="h-11 px-6 text-sm"
                nativeButton={false}
                render={<Link href="/contact" />}
              >
                {isExplainer ? "Ask me about it" : "Get in touch"}
                <ArrowRightIcon />
              </Button>
            </div>

            {(prevPost || nextPost) && (
              <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-4 border-t border-[#070b16]/10 pt-10">
                <div>
                  {prevPost && (
                    <Link
                      href={`/blog/${prevPost.slug}`}
                      className="group flex flex-col gap-1 rounded-xl border border-[#070b16]/10 bg-white/60 p-4 transition-colors hover:bg-white"
                    >
                      <span className="flex items-center gap-1 text-xs text-[#070b16]/50">
                        <ArrowLeftIcon className="size-3" />
                        Previous
                      </span>
                      <span className="font-heading text-sm font-medium text-[#070b16]">
                        {entryTitle(prevPost)}
                      </span>
                    </Link>
                  )}
                </div>
                <div>
                  {nextPost && (
                    <Link
                      href={`/blog/${nextPost.slug}`}
                      className="group flex flex-col items-end gap-1 rounded-xl border border-[#070b16]/10 bg-white/60 p-4 text-right transition-colors hover:bg-white"
                    >
                      <span className="flex items-center gap-1 text-xs text-[#070b16]/50">
                        Next
                        <ArrowRightIcon className="size-3" />
                      </span>
                      <span className="font-heading text-sm font-medium text-[#070b16]">
                        {entryTitle(nextPost)}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {related.length > 0 && (
              <div className="mx-auto mt-14 max-w-2xl border-t border-[#070b16]/10 pt-10">
                <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
                  {isExplainer ? "Related explainers" : "More articles"}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {related.map((relatedEntry) => (
                    <Link
                      key={relatedEntry.slug}
                      href={`/blog/${relatedEntry.slug}`}
                      className="flex items-center gap-4 rounded-xl border border-[#070b16]/10 bg-white/60 p-4 transition-colors hover:bg-white"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#070b16]/15 bg-[#f5f7fb]">
                        {relatedEntry.type === "explainer" ? (
                          <relatedEntry.concept.Icon
                            className="size-5 text-[#070b16]"
                            strokeWidth={1.75}
                          />
                        ) : (
                          <relatedEntry.Icon
                            className="size-5 text-[#070b16]"
                            strokeWidth={1.75}
                          />
                        )}
                      </span>
                      <span>
                        <span className="block font-heading text-base font-medium text-[#070b16]">
                          {entryTitle(relatedEntry)}
                        </span>
                        <span className="mt-0.5 block font-mono text-xs text-[#070b16]/50">
                          {relatedEntry.type === "explainer"
                            ? relatedEntry.concept.label
                            : relatedEntry.topic}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mx-auto mt-14 max-w-2xl">
              <BlogSubscribe />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export { BlogArticle };
