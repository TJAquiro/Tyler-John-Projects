import type { Profile, Project } from "./types";
import { validateProfile, validateProject } from "./validation";
import { validateSnapshot, type Snapshot } from "./portfolio-snapshot";

export type PublicationIssue = { key: string; label: string; message: string; section: number; step?: number; projectId?: string };
const profileBase: Profile = { name: "Name", biography: "Biography", headshotImage: "", education: [], jobs: [], tools: [] };
const projectBase: Project = { id: "project", title: "Title", date: "2026-01-01", description: "Description", slug: "project", thumbnail: "/images/project.png", images: ["/images/project.png"], technologies: [], link: "" };

// Field probes reuse the save validators, so optional formats and required rules cannot drift.
export function publicationIssues(snapshot: Snapshot): PublicationIssue[] {
  const issues: PublicationIssue[] = [];
  function check(key: string, label: string, section: number, task: () => unknown, extra: Partial<PublicationIssue> = {}) {
    try { task(); } catch (error) { issues.push({ key, label, section, message: error instanceof Error ? error.message : `Check ${label}.`, ...extra }); }
  }
  const fields = { name: ["Your name", 0], headshotImage: ["Headshot", 1], biography: ["Biography", 2], tools: ["Tools and software", 4], tagline: ["Homepage tagline", 6], bannerImage: ["Homepage banner", 6] } as const;
  for (const [key, [label, section]] of Object.entries(fields)) {
    check(`profile:${label}`, label, section, () => {
      if (key === "biography" && !snapshot.profile.biography.trim()) throw new Error("Biography is required.");
      validateProfile({ ...profileBase, [key]: snapshot.profile[key as keyof Profile] });
    });
  }
  snapshot.profile.education.forEach((entry, index) => {
    const base = { institution: "Institution", degree: "", field: "", startYear: "", endYear: "", description: "" };
    const labels = { institution: "Institution", degree: "Degree", field: "Field of study", startYear: "Start date", endYear: "End date", description: "Education description" };
    for (const [field, label] of Object.entries(labels)) check(`education.${index}:${label}`, `Education ${index + 1}: ${label}`, 3, () => validateProfile({ ...profileBase, education: [{ ...base, [field]: entry[field as keyof typeof entry] ?? "" }] }));
    if (!issues.some(i => i.key.startsWith(`education.${index}:`))) check(`education.${index}:End date`, `Education ${index + 1}: dates`, 3, () => validateProfile({ ...profileBase, education: [entry] }));
  });
  snapshot.profile.jobs.forEach((entry, index) => {
    const base = { company: "Company", position: "Position", description: "", startDate: "", endDate: "" };
    const labels = { company: "Company", position: "Position", description: "Role description", startDate: "Start date", endDate: "End date" };
    for (const [field, label] of Object.entries(labels)) check(`job.${index}:${label}`, `Experience ${index + 1}: ${label}`, 5, () => validateProfile({ ...profileBase, jobs: [{ ...base, [field]: entry[field as keyof typeof entry] }] }));
    if (!issues.some(i => i.key.startsWith(`job.${index}:`))) check(`job.${index}:End date`, `Experience ${index + 1}: dates`, 5, () => validateProfile({ ...profileBase, jobs: [entry] }));
  });
  if (!snapshot.projects.length) issues.push({ key: "projects:Add project", label: "Add project", message: "Add at least one completed project before publishing.", section: 7 });
  snapshot.projects.forEach(project => {
    const fields = { title: ["Project title", 0], date: ["Project date", 0], description: ["Project description", 0], slug: ["URL slug", 0], thumbnail: ["Thumbnail", 1], images: ["Supporting images", 1], technologies: ["Tools and software", 2], link: ["External project link", 2] } as const;
    for (const [field, [label, step]] of Object.entries(fields)) check(`project.${project.id}:${label}`, `${project.title || "Untitled project"}: ${label}`, 7, () => validateProject({ ...projectBase, [field]: project[field as keyof Project] }), { projectId: project.id, step });
    project.images.forEach((src, index) => {
      const label = `Description for photo ${index + 1}`;
      check(`project.${project.id}:${label}`, `${project.title || "Untitled project"}: ${label}`, 7, () => validateProject({ ...projectBase, images: [src], imageDescriptions: { [src]: project.imageDescriptions?.[src] || "" } }), { projectId: project.id, step: 1 });
    });
    if (!issues.some(i => i.projectId === project.id)) check(`project.${project.id}:Project title`, project.title || "Untitled project", 7, () => validateProject(project), { projectId: project.id, step: 0 });
    if (snapshot.projects.some(p => p.id !== project.id && p.slug === project.slug)) issues.push({ key: `project.${project.id}:URL slug`, label: `${project.title}: URL slug`, message: "Another project uses this URL slug. Choose a different slug.", section: 7, projectId: project.id, step: 0 });
  });
  return issues;
}

export function validatePublication(value: unknown): Snapshot {
  // Structural validation first makes issue collection safe for untrusted requests.
  const snapshot = validateSnapshot(value);
  const issues = publicationIssues(snapshot);
  if (issues.length) throw new Error(issues.map(issue => issue.message).join(" "));
  return snapshot;
}

export function projectsWithEditor(projects: Project[], editor: Project | null): Project[] {
  return !editor ? projects : projects.some(p => p.id === editor.id) ? projects.map(p => p.id === editor.id ? editor : p) : [...projects, editor];
}
