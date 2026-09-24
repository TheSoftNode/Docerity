import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero/hero";
import { Clients } from "@/components/sections/clients/clients";
import { Work } from "@/components/sections/work/work";
import { Mentorship } from "@/components/sections/mentorship/mentorship";
import { Explainers } from "@/components/sections/explainers/explainers";
import { Testimonials } from "@/components/sections/testimonials/testimonials";
import { Cta } from "@/components/sections/cta/cta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Clients />
        <Work />
        <Mentorship />
        <Explainers />
        <Testimonials />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
