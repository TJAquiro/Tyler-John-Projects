import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/dates";
import type { Project } from "@/lib/types";

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  return <Link href={`/projects/${project.slug}`} className={`project-card group block ${featured ? "md:col-span-2" : ""}`}>
    <div className={`relative aspect-[4/3] overflow-hidden bg-line ${featured ? "md:aspect-[2/1]" : ""}`}>
      <Image className="project-image object-cover" src={project.thumbnail} alt="" fill sizes={featured ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"} />
      <span className="absolute left-4 top-4 bg-paper px-2 py-1 mono text-xs">{formatDate(project.date)}</span>
    </div>
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-4">
      <h2 className="display text-2xl font-semibold md:text-3xl">{project.title}</h2>
      <span className="text-coral transition-transform group-hover:translate-x-1">↗</span>
    </div>
  </Link>;
}
