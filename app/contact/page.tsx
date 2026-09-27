import { pageMetadata } from "@/lib/content/blocks/metadata";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact/contact";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("contact");

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Contact />
      </main>
      <Footer />
    </>
  );
}
