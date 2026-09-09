import { notFound } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { ProjectEditor } from "@/components/AdminEditor";
import { requireAuth } from "@/lib/auth";
import { getProjects } from "@/lib/content";
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const account = await requireAuth();
  const { id } = await params, project = getProjects(account.id).find(item => item.id === id);
  if (!project) notFound();
  return <><AdminNav /><main id="main-content" className="mx-auto max-w-3xl px-5 py-12"><p className="eyebrow">Project studio</p><h1 className="display mb-8 mt-3 text-4xl sm:text-5xl">Edit {project.title}.</h1><ProjectEditor initial={project} /></main></>;
}
