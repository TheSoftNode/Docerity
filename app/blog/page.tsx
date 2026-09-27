import { pageMetadata } from "@/lib/content/blocks/metadata";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BlogIndex } from "@/components/sections/blog/blog-index";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("blog");

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <BlogIndex />
      </main>
      <Footer />
    </>
  );
}
