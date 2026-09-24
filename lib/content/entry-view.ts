import { nameForIcon } from "@/lib/content/icons";
import type {
  ArticlePost,
  BlogEntry,
  ExplainerPost,
} from "@/components/sections/blog/blog-data";

/**
 * A post, in a shape that can cross into a Client Component.
 *
 * `BlogEntry` carries `Icon` as a React component, and React cannot serialise a
 * function across the server boundary: passing one produces "Functions cannot be
 * passed directly to Client Components", which is how this type came to exist.
 * An icon travels as its registry name instead, and the client resolves it with
 * `iconFor`.
 *
 * Only the fields the blog index actually renders. The body is deliberately
 * absent: the console shows a hook and metadata, and shipping eight full article
 * bodies into the client bundle to render a list of titles would be several
 * times the page's weight for nothing.
 */

export type TermView = {
  label: string;
  caption: string;
  iconName: string;
};

type BaseView = {
  slug: string;
  title: string;
  hook: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
};

export type ExplainerView = BaseView & {
  type: "explainer";
  concept: TermView;
  analogy: TermView;
};

export type ArticleView = BaseView & {
  type: "article";
  topic: string;
  iconName: string;
};

export type EntryView = ExplainerView | ArticleView;

function base(entry: BlogEntry): BaseView {
  return {
    slug: entry.slug,
    title: entry.title,
    hook: entry.hook,
    readTime: entry.readTime,
    publishedAt: entry.publishedAt,
    tags: [...entry.tags],
  };
}

export function toExplainerView(entry: ExplainerPost): ExplainerView {
  return {
    ...base(entry),
    type: "explainer",
    concept: {
      label: entry.concept.label,
      caption: entry.concept.caption,
      iconName: nameForIcon(entry.concept.Icon),
    },
    analogy: {
      label: entry.analogy.label,
      caption: entry.analogy.caption,
      iconName: nameForIcon(entry.analogy.Icon),
    },
  };
}

export function toArticleView(entry: ArticlePost): ArticleView {
  return {
    ...base(entry),
    type: "article",
    topic: entry.topic,
    iconName: nameForIcon(entry.Icon),
  };
}
