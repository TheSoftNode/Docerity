import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BlogIndex } from "@/components/sections/blog/blog-index";

export const metadata: Metadata = {
  title: "Tech Explainers",
  description:
    "Complex engineering concepts explained through everyday analogies — caching, load balancing, API requests, concurrency, and more.",
};

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
