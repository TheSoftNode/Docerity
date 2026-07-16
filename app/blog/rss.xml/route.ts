import { siteConfig } from "@/lib/config/site";
import { entries } from "@/components/sections/blog/blog-data";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items = [...entries]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .map((entry) => {
      const title = entry.type === "explainer" ? entry.analogy.label : entry.title;
      const url = `${siteConfig.url}/blog/${entry.slug}`;
      const pubDate = new Date(entry.publishedAt).toUTCString();

      return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(entry.hook)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)} — Tech Explainers</title>
    <link>${siteConfig.url}/blog</link>
    <description>${escapeXml(
      "Complex engineering concepts explained through everyday analogies, plus articles on engineering practice."
    )}</description>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
