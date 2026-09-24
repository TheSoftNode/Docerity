import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config/site";
import { getPublishedEntries } from "@/lib/content/posts";
import { projects } from "@/components/sections/work/work-data";

/* Async now, because the post list is a query rather than an import. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getPublishedEntries();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "monthly", priority: 1 },
    { url: `${siteConfig.url}/reviews`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/work`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/ai`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/web3`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/mentorship`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

  const postRoutes: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${siteConfig.url}/blog/${entry.slug}`,
    lastModified: entry.publishedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const workRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteConfig.url}/work/${project.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes, ...workRoutes];
}
