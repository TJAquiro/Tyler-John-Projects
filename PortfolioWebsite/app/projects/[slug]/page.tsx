import { notFound } from "next/navigation";
import { ProjectView } from "@/components/PublicPages";
import { getProfile, getProjects } from "@/lib/content";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return getProjects().map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, project = getProjects().find(item => item.slug === slug);
  return { title: project ? `${project.title} | ${getProfile().name}` : "Project not found" };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, project = getProjects().find(item => item.slug === slug);
  if (!project) notFound();
  return <ProjectView profile={getProfile()} project={project} />;
}
