import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { ServicesHero } from "@/components/sections/services/services-hero";
import { ServicesLines } from "@/components/sections/services/services-lines";
import { pageMetadata } from "@/lib/content/blocks/metadata";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("services", "/services");

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <ServicesHero />
        <ServicesLines />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
