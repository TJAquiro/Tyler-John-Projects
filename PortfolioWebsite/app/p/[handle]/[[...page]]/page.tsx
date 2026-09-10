import { notFound } from "next/navigation";
import { readPublication } from "@/lib/firebase-server";
import { mapImages } from "@/lib/portfolio-snapshot";
import { HomeView, AboutView, ProjectView } from "@/components/PublicPages";
export const dynamic = "force-dynamic";
type Parameters = { handle: string; page?: string[] };
export async function generateMetadata({ params }: { params: Promise<Parameters> }) {
  const { handle, page = [] } = await params, publication = await readPublication(handle);
  const project = page[0] === "projects" ? publication?.projects.find(p => p.slug === page[1]) : null;
  const title = publication ? `${project ? `${project.title} | ` : ""}${publication.profile.name} | Portfolio` : "Portfolio not found";
  const description = (project?.description || publication?.profile.biography || "").replace(/[*#_\[\]]/g, "").slice(0, 160);
  return { title, description, openGraph: { title, description, type: "website" } };
}
export default async function PublishedPage({ params }: { params: Promise<Parameters> }) {
  const { handle, page = [] } = await params, publication = await readPublication(handle);
  if (!publication) notFound();
  const { profile, projects } = mapImages(publication, publication.assets), basePath = `/p/${handle}`;
  if (!page.length) return <HomeView profile={profile} projects={projects} basePath={basePath} />;
  if (page.length === 1 && page[0] === "about") return <AboutView profile={profile} basePath={basePath} />;
  const project = page.length === 2 && page[0] === "projects" ? projects.find(p => p.slug === page[1]) : null;
  if (!project) notFound();
  return <ProjectView profile={profile} project={project} basePath={basePath} />;
}
