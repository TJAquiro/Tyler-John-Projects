import { notFound } from "next/navigation";
import { readManifest, getProfile, getProjects } from "@/lib/content";
import { HomeView, AboutView, ProjectView } from "@/components/PublicPages";
export const dynamic = "force-static";
export const dynamicParams = false;
type Parameters = { handle: string; page?: string[] };
export function generateStaticParams() {
  return readManifest().flatMap(item => [{ handle: item.handle, page: [] }, { handle: item.handle, page: ["about"] }, ...getProjects(item.id).map(project => ({ handle: item.handle, page: ["projects", project.slug] }))]);
}
export async function generateMetadata({ params }: { params: Promise<Parameters> }) {
  const { handle } = await params, item = readManifest().find(portfolio => portfolio.handle === handle);
  return { title: item ? `${getProfile(item.id).name} | Design portfolio` : "Portfolio not found" };
}
export default async function PortfolioPage({ params }: { params: Promise<Parameters> }) {
  const { handle, page = [] } = await params, item = readManifest().find(portfolio => portfolio.handle === handle);
  if (!item) notFound();
  const profile = getProfile(item.id), projects = getProjects(item.id), basePath = `/u/${handle}`;
  if (!page.length) return <HomeView profile={profile} projects={projects} basePath={basePath} />;
  if (page.length === 1 && page[0] === "about") return <AboutView profile={profile} basePath={basePath} />;
  const project = page.length === 2 && page[0] === "projects" ? projects.find(item => item.slug === page[1]) : undefined;
  if (!project) notFound();
  return <ProjectView profile={profile} project={project} basePath={basePath} />;
}
