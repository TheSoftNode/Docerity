import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero/hero";
import { Clients } from "@/components/sections/clients/clients";
import { Work } from "@/components/sections/work/work";
import { Mentorship } from "@/components/sections/mentorship/mentorship";
import { Explainers } from "@/components/sections/explainers/explainers";
import { Testimonials } from "@/components/sections/testimonials/testimonials";
import { Cta } from "@/components/sections/cta/cta";

/*
  Revalidated, because the testimonial section reads approved reviews.

  Without it the homepage is prerendered once at build and the rotation never
  changes, so a review approved after a deploy would only appear on the next
  one. Approving also calls `revalidatePath("/")`, which makes the change
  immediate; this window is the fallback for an invalidation that never lands,
  such as one issued while the build was still in flight.
*/
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Work />
        <Clients />
        <Mentorship />
        <Explainers />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
