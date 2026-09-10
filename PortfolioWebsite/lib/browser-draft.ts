import type { Profile, Project } from "./types";
import type { Publication } from "./portfolio-snapshot";
import { MAX_DRAFT_BYTES, imageReferences } from "./portfolio-snapshot";
import { imagePath } from "./validation";

export type BrowserDraft = {
  format: "portfolio-draft"; version: 1; profile: Profile; projects: Project[];
  images: Record<string, string>; section: number; projectDraft: Project | null;
  publication: Pick<Publication, "handle" | "revision" | "publishedAt"> | null;
  ownerUid: string | null; updatedAt: string;
};
export function emptyDraft(): BrowserDraft {
  return { format: "portfolio-draft", version: 1, profile: { name: "", headshotImage: "", biography: "", tagline: "", bannerImage: "", education: [], tools: [], jobs: [] }, projects: [], images: {}, section: 0, projectDraft: null, publication: null, ownerUid: null, updatedAt: new Date().toISOString() };
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("portfolio-browser-studio", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Browser storage is unavailable. Enable site storage or download a backup before leaving."));
  });
}
export async function readDraft(key: string): Promise<BrowserDraft | null> {
  const db = await database();
  try { return await new Promise((resolve, reject) => { const tx = db.transaction("drafts", "readonly"), req = tx.objectStore("drafts").get(key); req.onsuccess = () => resolve(req.result || null); req.onerror = () => reject(req.error); }); }
  finally { db.close(); }
}
export async function writeDraft(key: string, draft: BrowserDraft, expected?: string | null): Promise<void> {
  const db = await database();
  try { await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("drafts", "readwrite"), store = tx.objectStore("drafts");
    const current = store.get(key); let conflict = false;
    current.onsuccess = () => {
      if (expected !== undefined && (current.result?.updatedAt || null) !== expected) { conflict = true; tx.abort(); return; }
      store.put(draft, key);
    };
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(new Error(conflict ? "Another tab saved a newer draft. Download this draft as a backup, then reload to open the newer version." : "Could not save on this device. Storage may be full. Download a backup before closing this page."));
  }); }
  finally { db.close(); }
}
export function fileData(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Could not read the image.")); reader.readAsDataURL(file); });
}
// Backup imports may contain unfinished fields, but never executable or external image references.
export function parseBackup(text: string): BrowserDraft {
  if (text.length > MAX_DRAFT_BYTES) throw new Error("Backups must be smaller than 100 MB.");
  const raw = JSON.parse(text);
  if (raw?.format !== "portfolio-draft" || raw.version !== 1 || !raw.profile || !Array.isArray(raw.projects) || raw.projects.length > 20 || !raw.images || typeof raw.images !== "object") throw new Error("This is not a supported portfolio backup.");
  const p = raw.profile;
  for (const key of ["name", "biography", "headshotImage"]) if (typeof p[key] !== "string") throw new Error("The backup profile is incomplete.");
  for (const key of ["education", "tools", "jobs"]) if (!Array.isArray(p[key]) || p[key].length > 100) throw new Error("The backup profile is invalid.");
  const strings = (obj: Record<string, unknown>, keys: string[]) => keys.every(key => typeof obj?.[key] === "string");
  if (!p.tools.every((s: unknown) => typeof s === "string") || !p.education.every((e: Record<string, unknown>) => strings(e, ["institution", "degree", "field", "startYear", "endYear"])) || !p.jobs.every((j: Record<string, unknown>) => strings(j, ["company", "position", "description", "startDate", "endDate"]))) throw new Error("The backup contains invalid profile entries.");
  if (p.education.some((e: Record<string, unknown>) => e.description !== undefined && typeof e.description !== "string") || (p.bannerImage !== undefined && typeof p.bannerImage !== "string")) throw new Error("The backup contains invalid profile fields.");
  for (const project of [...raw.projects, ...(raw.projectDraft ? [raw.projectDraft] : [])]) {
    if (!strings(project, ["id", "title", "description", "thumbnail", "date", "link", "slug"]) || !Array.isArray(project.images) || project.images.length > 6 || !Array.isArray(project.technologies) || !project.technologies.every((s: unknown) => typeof s === "string")) throw new Error("The backup contains an invalid project.");
    if (project.imageDescriptions && (typeof project.imageDescriptions !== "object" || !Object.values(project.imageDescriptions).every(v => typeof v === "string"))) throw new Error("The backup contains invalid captions.");
    if (project.link && !/^https?:\/\//i.test(project.link)) throw new Error("The backup contains an unsafe project link.");
    if (project.featured !== undefined && typeof project.featured !== "boolean") throw new Error("The backup contains an invalid featured project.");
  }
  for (const [key, data] of Object.entries(raw.images)) {
    imagePath(key);
    if (typeof data !== "string" || data.length > 7 * 1024 * 1024 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(data)) throw new Error("The backup contains an invalid image.");
  }
  const refs = imageReferences(raw);
  if (raw.projectDraft) refs.push(raw.projectDraft.thumbnail, ...raw.projectDraft.images);
  refs.filter(Boolean).forEach(src => { imagePath(src); if (!raw.images[src]) throw new Error("The backup is missing an image."); });
  if (p.tagline !== undefined && typeof p.tagline !== "string") throw new Error("The backup headline is invalid.");
  return { ...emptyDraft(), profile: p, projects: raw.projects, images: raw.images, section: Number.isInteger(raw.section) ? Math.max(0, Math.min(8, raw.section)) : 0, projectDraft: raw.projectDraft || null };
}
export function backupText(draft: BrowserDraft): string {
  return JSON.stringify({ ...draft, ownerUid: null, publication: null }, null, 2);
}
