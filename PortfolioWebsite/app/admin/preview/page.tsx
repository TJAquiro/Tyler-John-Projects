import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getProfile, getProjects } from "@/lib/content";
import { HomeView, AboutView, ProjectView } from "@/components/PublicPages";
export default async function PreviewPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const account = await requireAuth();
  const view = (await searchParams).view || "/", profile = getProfile(account.id), projects = getProjects(account.id);
  const project = projects.find(item => view === `/projects/${item.slug}`);
  if (!["/", "/about"].includes(view) && !project) notFound();
  return <><div className="flex flex-wrap items-center justify-between gap-3 bg-ink px-6 py-3 text-sm text-paper"><p>Private preview · saved changes</p><Link className="underline underline-offset-4" href="/admin/dashboard">Back to studio →</Link></div>{view === "/" ? <HomeView profile={profile} projects={projects} preview /> : view === "/about" ? <AboutView profile={profile} preview /> : project && <ProjectView profile={profile} project={project} preview />}</>;
}
