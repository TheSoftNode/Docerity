import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteConfig } from "@/lib/config/site";
import { getProject, getProjectSlugs, getWork } from "@/lib/content/work";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactBand } from "@/components/sections/contact-band/contact-band";
import { ProjectHero } from "@/components/sections/project-detail/project-hero";
import { ProjectPreview } from "@/components/sections/project-detail/project-preview";
import { StackTicker } from "@/components/sections/project-detail/stack-ticker";
import { ProjectOutcomes } from "@/components/sections/project-detail/project-outcomes";
import { ProjectWriteUp } from "@/components/sections/project-detail/project-write-up";
import { ProjectGlance } from "@/components/sections/project-detail/project-glance";
import { ProjectGallery } from "@/components/sections/project-detail/project-gallery";
import { UpNext } from "@/components/sections/project-detail/up-next";
import { siblingsOf } from "@/components/sections/project-detail/project-detail-content";

/*
  Revalidated, because projects come from the database. Editing one calls
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

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getProject(slug);

  if (!found) notFound();

  const { project } = found;
  /* The whole published list, for the position, the neighbours and their
     screenshots. One extra query on a route cached for five minutes. */
  const { projects, media } = await getWork();
  const siblings = siblingsOf(projects, project.slug);
  const sections = project.body ?? [];
  const hasWriteUp = sections.length > 0;

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <article>
          <ProjectHero project={project} siblings={siblings} hasWriteUp={hasWriteUp} />
          <ProjectPreview project={project} media={found.media} />
          <StackTicker tags={project.tags} />
          <ProjectOutcomes results={project.results ?? []} />
          {hasWriteUp ? <ProjectWriteUp sections={sections} /> : <ProjectGlance project={project} />}
          <ProjectGallery images={project.gallery ?? []} name={project.name} />
        </article>
        {siblings ? <UpNext siblings={siblings} media={media} /> : null}
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
