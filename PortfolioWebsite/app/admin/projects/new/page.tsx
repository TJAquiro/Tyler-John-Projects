import { randomUUID } from "node:crypto";
import { todayISO } from "@/lib/dates";
import { AdminNav } from "@/components/AdminNav";
import { ProjectEditor } from "@/components/AdminEditor";
import { requireAuth } from "@/lib/auth";
export default async function NewProjectPage() {
  await requireAuth();
  const project = { id: randomUUID(), title: "", thumbnail: "", images: [], date: todayISO(), description: "", technologies: [], link: "", slug: "" };
  return <><AdminNav /><main id="main-content" className="mx-auto max-w-3xl px-5 py-12"><p className="eyebrow">Build your body of work</p><h1 className="display mb-8 mt-3 text-5xl">Add a project.</h1><ProjectEditor initial={project} isNew /></main></>;
}
