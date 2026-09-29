import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteConfig } from "@/lib/config/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WorkCaseStudy } from "@/components/sections/work/work-case-study";
import { getProject, getProjectSlugs, getWork } from "@/lib/content/work";

/*
  Revalidated, because projects come from the database now. Editing one calls
  `revalidatePath` for its page; this is the ceiling on staleness otherwise.
*/
export const revalidate = 300;

/* Anything published after the build is rendered on demand and then cached,
   rather than 404ing. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await getProject(slug);

  if (!found) return { title: "Not found" };
  const { project } = found;

  return {
    title: `${project.name} · Work`,
    description: project.description,
    openGraph: {
      type: "article",
      title: `${project.name} · Work`,
      description: project.description,
      url: `${siteConfig.url}/projects/${project.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} · Work`,
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
  const found = await getProject(slug);

  if (!found) notFound();

  /* The sibling list, for the previous and next links at the foot of the
     page. One extra query on a route cached for five minutes. */
  const { projects } = await getWork();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <WorkCaseStudy
          project={found.project}
          projects={projects}
          media={found.media}
        />
      </main>
      <Footer />
    </>
  );
}
