import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Contact } from "@/components/sections/contact/contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project, apply for mentorship, or just say hello. Tell Docerity what you're building.",
};

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
