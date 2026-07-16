"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  articlePosts,
  explainerPosts,
  type ArticlePost,
  type ExplainerPost,
} from "@/components/sections/blog/blog-data";

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
          className="size-1 rounded-full bg-[#0b1330]/40"
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

function ExplainerDetail({ post }: { post: ExplainerPost }) {
  return (
    <motion.div
      key={post.slug}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-[#0b1330]/15 bg-[#f3f1ea]">
          <post.concept.Icon className="size-6 text-[#0b1330]" strokeWidth={1.75} />
        </span>
        <TranslationConnector />
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <post.analogy.Icon className="size-6 text-primary" strokeWidth={1.75} />
        </span>
      </div>

      <p className="mt-5 font-mono text-xs tracking-[0.15em] text-[#0b1330]/50 uppercase">
        {post.concept.label} &middot; explained as
      </p>
      <h3 className="mt-1 font-heading text-2xl font-medium text-[#0b1330] sm:text-3xl">
        {post.analogy.label}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#0b1330]/70 sm:text-base">
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
        <span className="text-xs text-[#0b1330]/50">{post.readTime}</span>
      </div>
    </motion.div>
  );
}

function ArticleDetail({ post }: { post: ArticlePost }) {
  return (
    <motion.div
      key={post.slug}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-[#0b1330]/15 bg-[#f3f1ea]">
        <post.Icon className="size-6 text-[#0b1330]" strokeWidth={1.75} />
      </span>

      <p className="mt-5 font-mono text-xs tracking-[0.15em] text-[#0b1330]/50 uppercase">
        {post.topic}
      </p>
      <h3 className="mt-1 font-heading text-2xl font-medium text-[#0b1330] sm:text-3xl">
        {post.title}
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#0b1330]/70 sm:text-base">
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
        <span className="text-xs text-[#0b1330]/50">{post.readTime}</span>
      </div>
    </motion.div>
  );
}

function BlogConsole() {
  const [activeTab, setActiveTab] = useState<Tab>("explainers");
  const [activeExplainer, setActiveExplainer] = useState(explainerPosts[0].slug);
  const [activeArticle, setActiveArticle] = useState(articlePosts[0].slug);

  const list = activeTab === "explainers" ? explainerPosts : articlePosts;
  const activeSlug = activeTab === "explainers" ? activeExplainer : activeArticle;
  const setActiveSlug =
    activeTab === "explainers" ? setActiveExplainer : setActiveArticle;
  const activeEntry = list.find((entry) => entry.slug === activeSlug) ?? list[0];

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#0b1330]/10 bg-[#f3f1ea] lg:min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0b1330]/10 px-6 py-4">
        <p className="font-mono text-xs tracking-[0.2em] text-[#0b1330]/60 uppercase">
          Tech Explainers &middot; Blog
        </p>
        <div className="flex items-center gap-1 rounded-full bg-[#0b1330]/[0.05] p-1">
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
                  : "text-[#0b1330]/60 hover:text-[#0b1330]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: two-pane master/detail console, fills remaining height */}
      <div className="hidden flex-1 lg:grid lg:min-h-0 lg:grid-cols-[0.85fr_1.15fr]">
        <nav className="flex flex-col justify-center divide-y divide-[#0b1330]/10 overflow-y-auto border-r border-[#0b1330]/10">
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
                  isActive ? "bg-[#0b1330]/[0.04]" : "hover:bg-[#0b1330]/[0.02]"
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-1.5 rounded-full transition-colors",
                      isActive ? "bg-primary" : "bg-transparent"
                    )}
                  />
                  <span className="font-mono text-sm font-medium text-[#0b1330]">
                    {entry.type === "explainer" ? entry.concept.label : entry.title}
                  </span>
                </span>
                <span className="pl-3.5 text-xs text-[#0b1330]/50">
                  {entry.type === "explainer" ? entry.analogy.label : entry.topic}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="relative flex flex-col justify-center overflow-y-auto p-8 sm:p-10">
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
            className="flex items-center gap-4 rounded-xl border border-[#0b1330]/10 bg-white/60 p-4"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#0b1330]/15 bg-[#f3f1ea]">
              {entry.type === "explainer" ? (
                <entry.concept.Icon className="size-5 text-[#0b1330]" strokeWidth={1.75} />
              ) : (
                <entry.Icon className="size-5 text-[#0b1330]" strokeWidth={1.75} />
              )}
            </span>
            <span className="flex-1">
              <span className="block font-heading text-base font-medium text-[#0b1330]">
                {entry.type === "explainer" ? entry.analogy.label : entry.title}
              </span>
              <span className="mt-0.5 block font-mono text-xs text-[#0b1330]/50">
                {entry.type === "explainer" ? entry.concept.label : entry.topic}
              </span>
            </span>
            <ArrowRightIcon className="size-4 shrink-0 text-[#0b1330]/40" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export { BlogConsole };
