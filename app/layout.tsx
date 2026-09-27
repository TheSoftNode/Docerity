import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { readPageMeta } from "@/lib/content/blocks/metadata";
import { Providers } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

/**
 * The site-wide defaults, and the homepage's own title.
 *
 * `generateMetadata` rather than a constant, because both are editable now.
 * The homepage is the one page with no `page.tsx` metadata of its own: it uses
 * `title.default`, so its entry in the editor has to be applied here or the
 * field is a box that does nothing, which is what it was.
 *
 * `template` is what every other page's title is threaded through, so a change
 * to the site name reaches all of them from this one place.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { title, description, site } = await readPageMeta("home");

  return {
    metadataBase: new URL(site.url),
    title: { default: title, template: `%s · ${site.name}` },
    description,
    alternates: {
      types: {
        "application/rss+xml": `${site.url}/blog/rss.xml`,
      },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title,
      description,
      url: site.url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#070b16" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
