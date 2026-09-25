import { siteConfig } from "@/lib/config/site";
import { getPublishedEntries } from "@/lib/content/posts";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* The feed is regenerated on the same window as the blog itself. */
export const revalidate = 300;

/*
  The Dublin Core namespace is declared on <rss> because a contributor's post
  carries <dc:creator>. An undeclared prefix makes the whole document invalid
  XML, and a reader that validates refuses all of it rather than that one
  element.

  Explained here rather than in an XML comment: anything inside the template
  literal is shipped to every feed reader, and an internal note about namespaces
  is not something a subscriber should receive.
*/
export async function GET() {
  const entries = await getPublishedEntries();

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
      <description>${escapeXml(entry.hook)}</description>${
        entry.author
          ? `
      <dc:creator>${escapeXml(entry.author.name)}</dc:creator>`
          : ""
      }
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(siteConfig.name)} · Tech Explainers</title>
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
