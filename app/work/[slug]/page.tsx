import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteConfig } from "@/lib/config/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WorkCaseStudy } from "@/components/sections/work/work-case-study";
import { getProjectBySlug, projects } from "@/components/sections/work/work-data";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return { title: "Not found" };

  return {
    title: `${project.name} — Work`,
    description: project.description,
    openGraph: {
      type: "article",
      title: `${project.name} — Work`,
      description: project.description,
      url: `${siteConfig.url}/work/${project.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} — Work`,
      description: project.description,
    },
  };
}

export default async function WorkCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <WorkCaseStudy project={project} />
      </main>
      <Footer />
    </>
  );
}
