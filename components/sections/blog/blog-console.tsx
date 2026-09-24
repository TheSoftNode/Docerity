"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FramedPanel } from "@/components/shared/section-kit";
import { ContentIcon } from "@/components/shared/content-icon";
import type { ArticleView, EntryView, ExplainerView } from "@/lib/content/entry-view";

type Tab = "explainers" | "articles";

const tabs: { value: Tab; label: string }[] = [
  { value: "explainers", label: "Explainers" },
  { value: "articles", label: "Articles" },
];

function TranslationConnector() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1 rounded-full bg-primary/60"
          animate={
            reduceMotion
              ? { opacity: 0.4 }
              : { opacity: [0.25, 1, 0.25], scale: [1, 1.3, 1] }
          }
          transition={{
            duration: 1.6,
            ease: "easeInOut",
            repeat: Infinity,
            delay: i * 0.25,
          }}
        />
      ))}
    </div>
  );
}

function ExplainerDetail({ post }: { post: ExplainerView }) {
  return (
    <motion.div
      key={post.slug}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-background">
          <ContentIcon
            name={post.concept.iconName}
            className="size-6 text-foreground"
            strokeWidth={1.75}
          />
        </span>
        <TranslationConnector />
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <ContentIcon
            name={post.analogy.iconName}
            className="size-6 text-primary"
            strokeWidth={1.75}
          />
        </span>
      </div>

      <p className="mt-5 font-mono text-xs tracking-[0.15em] text-muted-foreground uppercase">
        {post.concept.label} &middot; explained as
      </p>
      <h3 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {post.analogy.label}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        {post.hook}
      </p>

      <div className="mt-6 flex items-center gap-4">
        <Button
          size="lg"
          className="h-11 px-6 text-sm"
          nativeButton={false}
          render={<Link href={`/blog/${post.slug}`} />}
        >
          Read the full explainer
          <ArrowRightIcon />
        </Button>
        <span className="text-xs text-muted-foreground">{post.readTime}</span>
      </div>
    </motion.div>
  );
}

function ArticleDetail({ post }: { post: ArticleView }) {
  return (
    <motion.div
      key={post.slug}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-background">
        <ContentIcon
          name={post.iconName}
          className="size-6 text-foreground"
          strokeWidth={1.75}
        />
      </span>

      <p className="mt-5 font-mono text-xs tracking-[0.15em] text-muted-foreground uppercase">
        {post.topic}
      </p>
      <h3 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {post.title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        {post.hook}
      </p>

      <div className="mt-6 flex items-center gap-4">
        <Button
          size="lg"
          className="h-11 px-6 text-sm"
          nativeButton={false}
          render={<Link href={`/blog/${post.slug}`} />}
        >
          Read the article
          <ArrowRightIcon />
        </Button>
        <span className="text-xs text-muted-foreground">{post.readTime}</span>
      </div>
    </motion.div>
  );
}

/**
 * Posts arrive as props rather than being imported.
 *
 * They now come from the database, and this is a Client Component, so it cannot
 * read them itself. `blog-index.tsx` fetches on the server and passes them
 * down.
 */
function BlogConsole({
  explainers,
  articles,
}: {
  explainers: ExplainerView[];
  articles: ArticleView[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>(
    /* Opens on whichever tab has something in it. With no explainers published,
       defaulting to that tab would show an empty panel next to a populated
       Articles tab nobody thought to click. */
    explainers.length > 0 ? "explainers" : "articles"
  );
  const [activeExplainer, setActiveExplainer] = useState(explainers[0]?.slug ?? "");
  const [activeArticle, setActiveArticle] = useState(articles[0]?.slug ?? "");

  const list: EntryView[] = activeTab === "explainers" ? explainers : articles;
  const activeSlug = activeTab === "explainers" ? activeExplainer : activeArticle;
  const setActiveSlug =
    activeTab === "explainers" ? setActiveExplainer : setActiveArticle;
  const activeEntry = list.find((entry) => entry.slug === activeSlug) ?? list[0];

  /* Nothing published in either tab. Only reachable with a database connected
     and every post still a draft, since the static fallback is never empty. */
  if (!activeEntry) {
    return (
      <FramedPanel innerClassName="overflow-hidden">
        <div className="rounded-[calc(1rem-1px)] bg-card px-6 py-12 text-center">
          <p className="font-heading text-sm font-semibold text-foreground">
            Nothing published yet
          </p>
          <p className="mx-auto mt-1.5 max-w-[42ch] text-sm text-muted-foreground">
            The first explainers are being written. Subscribe below and they will
            reach you before they reach anyone else.
          </p>
        </div>
      </FramedPanel>
    );
  }

  return (
    <FramedPanel innerClassName="overflow-hidden">
    <div className="flex flex-col overflow-hidden rounded-[calc(1rem-1px)] bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Tech Explainers &middot; Blog
        </p>
        <div className="flex items-center gap-1 rounded-full bg-muted/70 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              aria-pressed={activeTab === tab.value}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: two-pane master/detail console, fills remaining height */}
      <div className="hidden lg:grid lg:grid-cols-[0.85fr_1.15fr]">
        <nav className="flex flex-col divide-y divide-border/70 border-b border-border/70 lg:border-r lg:border-b-0">
          {list.map((entry) => {
            const isActive = entry.slug === activeSlug;
            return (
              <button
                key={entry.slug}
                type="button"
                onClick={() => setActiveSlug(entry.slug)}
                aria-current={isActive}
                className={cn(
                  "flex flex-col gap-1 px-6 py-5 text-left transition-colors",
                  isActive ? "bg-muted/60" : "hover:bg-muted/30"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-colors",
                      isActive ? "bg-primary" : "bg-transparent"
                    )}
                  />
                  <span className="font-mono text-sm font-medium text-foreground">
                    {entry.type === "explainer" ? entry.concept.label : entry.title}
                  </span>
                </span>
                <span className="pl-3.5 text-xs text-muted-foreground">
                  {entry.type === "explainer" ? entry.analogy.label : entry.topic}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="relative flex flex-col justify-center p-8 sm:p-10 lg:p-12">
          <AnimatePresence mode="wait">
            {activeEntry.type === "explainer" ? (
              <ExplainerDetail key={activeEntry.slug} post={activeEntry} />
            ) : (
              <ArticleDetail key={activeEntry.slug} post={activeEntry} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile: direct tappable list, straight to the article */}
      <div className="flex flex-col gap-3 p-4 lg:hidden">
        {list.map((entry) => (
          <Link
            key={entry.slug}
            href={`/blog/${entry.slug}`}
            className="flex items-center gap-4 rounded-xl border border-border/80 bg-background p-4 transition-colors hover:border-primary/40"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card">
              {entry.type === "explainer" ? (
                <ContentIcon
                  name={entry.concept.iconName}
                  className="size-5 text-primary"
                  strokeWidth={1.75}
                />
              ) : (
                <ContentIcon
                  name={entry.iconName}
                  className="size-5 text-primary"
                  strokeWidth={1.75}
                />
              )}
            </span>
            <span className="flex-1">
              <span className="block font-heading text-base font-semibold text-foreground">
                {entry.type === "explainer" ? entry.analogy.label : entry.title}
              </span>
              <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                {entry.type === "explainer" ? entry.concept.label : entry.topic}
              </span>
            </span>
            <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
    </FramedPanel>
  );
}

export { BlogConsole };
