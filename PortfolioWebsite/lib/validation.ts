import type { Profile, Project } from "./types";
import { dateISO } from "./dates";
export class ValidationError extends Error {}
type RecordValue = Record<string, unknown>;
function object(value: unknown, label: string): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ValidationError(`${label} must be an object.`);
  return value as RecordValue;
}
function string(value: unknown, label: string, required = false, max = 20000): string {
  if (typeof value !== "string" || value.length > max) throw new ValidationError(`${label} must be text (maximum ${max} characters).`);
  if (required && !value.trim()) throw new ValidationError(`${label} is required.`);
  return value.trim();
}
function list(value: unknown, label: string, max = 100): unknown[] {
  if (!Array.isArray(value) || value.length > max) throw new ValidationError(`${label} must be a list with at most ${max} entries.`);
  return value;
}
function strings(value: unknown, label: string) { return Array.from(new Set(list(value, label).map(item => string(item, label, true, 120)))); }
export function imagePath(value: unknown, required = true): string {
  const result = string(value, "Image path", required, 300);
  if (!result && !required) return "";
  if (!/^\/images\/[a-zA-Z0-9_-]+\.(png|jpe?g|webp|svg)$/i.test(result)) throw new ValidationError("Choose an image from /images/ (PNG, JPG, WebP, or SVG).");
  return result;
}
function date(value: unknown, label: string, previous?: string, required = false, present = false) {
  const text = string(value, label, required, 100);
  if (!text && !required) return "";
  if (present && text === "Present") return text;
  const iso = dateISO(text);
  if (iso) return iso;
  if (previous !== undefined && text === previous) return text;
  throw new ValidationError(`${label}: enter a real date as MM/DD/YYYY.`);
}
function range(start: string, end: string, label: string) {
  const a = dateISO(start), b = dateISO(end);
  if (a && b && a > b) throw new ValidationError(`${label}: end date must be on or after start date.`);
}
export function validateProfile(value: unknown, previous?: Profile): Profile {
  const p = object(value, "Profile");
  return {
    name: string(p.name, "Name", true, 100), headshotImage: imagePath(p.headshotImage, false),
    tagline: string(p.tagline ?? "Ideas, made into experiences.", "Homepage tagline", false, 200), bannerImage: imagePath(p.bannerImage ?? "", false),
    biography: string(p.biography, "Biography"), tools: strings(p.tools, "Tools"),
    education: list(p.education, "Education").map((item, index) => {
      const e = object(item, "Education entry");
      const old = previous?.education.find(entry => entry.institution === e.institution) ?? previous?.education[index];
      const startYear = date(e.startYear, "Education start date", old?.startYear), endYear = date(e.endYear, "Education end date", old?.endYear, false, true);
      range(startYear, endYear, "Education");
      return { institution: string(e.institution, "Institution", true, 200), degree: string(e.degree, "Degree", false, 200), field: string(e.field, "Field", false, 200), startYear, endYear, description: string(e.description ?? "", "Education description", false, 5000) };
    }),
    jobs: list(p.jobs, "Experience").map((item, index) => {
      const j = object(item, "Job entry");
      const old = previous?.jobs.find(entry => entry.company === j.company && entry.position === j.position) ?? previous?.jobs[index];
      const startDate = date(j.startDate, "Experience start date", old?.startDate), endDate = date(j.endDate, "Experience end date", old?.endDate, false, true);
      range(startDate, endDate, "Experience");
      return { company: string(j.company, "Company", true, 200), position: string(j.position, "Position", true, 200), description: string(j.description, "Job description"), startDate, endDate };
    })
  };
}
export function validateProject(value: unknown, previous?: Project): Project {
  const p = object(value, "Project");
  const id = string(p.id, "Project ID", true, 100), slug = string(p.slug, "Slug", true, 100);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ValidationError("Slug must contain lowercase letters, numbers, and single hyphens.");
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new ValidationError("Project ID is invalid.");
  const images = list(p.images, "Supporting images", 6).map(image => imagePath(image));
  if (!images.length) throw new ValidationError("Add at least one supporting image (maximum 6).");
  if (new Set(images).size !== images.length) throw new ValidationError("Each supporting image must be different.");
  const link = string(p.link, "Project link", false, 2000);
  if (link) { try { if (!["http:", "https:"].includes(new URL(link).protocol)) throw new Error(); } catch { throw new ValidationError("Project link must be a full http:// or https:// URL."); } }
  if (p.featured !== undefined && typeof p.featured !== "boolean") throw new ValidationError("Featured must be true or false.");
  return { id, slug, images, featured: p.featured === true, imageDescriptions: captions(p.imageDescriptions, images), link, title: string(p.title, "Project title", true, 200), date: date(p.date, "Project date", previous?.date, true), description: string(p.description, "Project description", true), thumbnail: imagePath(p.thumbnail), technologies: strings(p.technologies, "Technologies") };
}
function captions(value: unknown, images: string[]): Record<string, string> {
  if (value === undefined) return {};
  const entries = object(value, "Photo descriptions");
  return Object.fromEntries(images.filter(src => entries[src] !== undefined).map(src => [src, string(entries[src], "Photo description", false, 2000)]));
}
export function validateProjectDraft(value: unknown): Partial<Project> {
  const p = object(value, "Project draft"), result: RecordValue = {};
  for (const key of ["id", "title", "thumbnail", "date", "description", "link", "slug"]) {
    if (p[key] !== undefined) result[key] = string(p[key], `Draft ${key}`);
  }
  if (p.images !== undefined) result.images = list(p.images, "Draft images", 6).map(item => imagePath(item));
  if (p.imageDescriptions !== undefined) result.imageDescriptions = captions(p.imageDescriptions, (result.images || []) as string[]);
  if (p.featured !== undefined) { if (typeof p.featured !== "boolean") throw new ValidationError("Featured must be true or false."); result.featured = p.featured; }
  if (p.technologies !== undefined) result.technologies = strings(p.technologies, "Technologies");
  return result;
}
