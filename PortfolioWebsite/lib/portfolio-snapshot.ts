import type { Profile, Project } from "./types";
import { imagePath, validateProfile, validateProject } from "./validation";

export type Snapshot = { profile: Profile; projects: Project[] };
export type Publication = Snapshot & { handle: string; revision: number; publishedAt: string; assets: Record<string, string>; contentRevision?: number };
export const MAX_PROJECTS = 20;
export const MAX_IMAGE_BYTES = 500 * 1024 * 1024;
export const IMAGE_CHUNK_BYTES = 8 * 1024 * 1024;
export const MAX_LIBRARY_BYTES = 1024 * 1024 * 1024;
export const MAX_SERVICE_STORAGE_BYTES = 10 * 1024 * 1024 * 1024;
export const MAX_SERVICE_DAILY_UPLOADS = 1000;
export const MAX_IN_FLIGHT_UPLOAD_BYTES = 32 * 1024 * 1024;
export const MAX_IN_FLIGHT_UPLOAD_REQUESTS = 4;
// Includes base64 overhead for a 500 MB image and portfolio metadata.
export const MAX_DRAFT_BYTES = 768 * 1024 * 1024;
export function imageReferences(snapshot: Snapshot): string[] {
  return [...new Set([snapshot.profile.headshotImage, snapshot.profile.bannerImage || "", ...snapshot.projects.flatMap(p => [p.thumbnail, ...p.images])].filter(Boolean))];
}
export function mapImages(snapshot: Snapshot, images: Record<string, string>): Snapshot {
  const image = (src: string) => images[src] || src;
  return {
    profile: { ...snapshot.profile, headshotImage: image(snapshot.profile.headshotImage), bannerImage: image(snapshot.profile.bannerImage || "") },
    projects: snapshot.projects.map(p => ({ ...p, thumbnail: image(p.thumbnail), images: p.images.map(image), imageDescriptions: Object.fromEntries(Object.entries(p.imageDescriptions || {}).map(([src, text]) => [image(src), text])) }))
  };
}
export function validateSnapshot(value: unknown, previous?: Snapshot): Snapshot {
  if (!value || typeof value !== "object") throw new Error("Choose a valid portfolio backup.");
  const s = value as Snapshot;
  if (!Array.isArray(s.projects) || s.projects.length > MAX_PROJECTS) throw new Error(`A portfolio can have up to ${MAX_PROJECTS} projects.`);
  const snapshot = { profile: validateProfile(s.profile, previous?.profile), projects: s.projects.map(p => validateProject(p, previous?.projects.find(old => old.id === p.id))) };
  if (new Set(snapshot.projects.map(p => p.id)).size !== snapshot.projects.length || new Set(snapshot.projects.map(p => p.slug)).size !== snapshot.projects.length) throw new Error("Each project needs a different ID and URL slug.");
  if (snapshot.projects.filter(p => p.featured).length > 1) throw new Error("Choose only one featured project.");
  if (JSON.stringify(snapshot).length > 350000) throw new Error("Your portfolio text is too large. Shorten it before publishing.");
  imageReferences(snapshot).forEach(src => imagePath(src));
  return snapshot;
}
export function validHandle(value: unknown): string {
  if (typeof value !== "string" || !/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(value) || value.includes("--")) throw new Error("Choose an address with 3–40 lowercase letters, numbers, and single hyphens.");
  return value;
}
