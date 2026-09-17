import { accountFetch, publishingFetch, uploadPublishingImage } from "./firebase-client";
import { emptyDraft, fileData, type BrowserDraft } from "./browser-draft";
import { draftContent, draftReferences, type CloudDraft } from "./cloud-draft";
import { imageReferences, type Publication } from "./portfolio-snapshot";

type AccountDraftResult = { draft: CloudDraft | null; publication: Publication | null };
export const loadAccountDraft = (uid: string, signal?: AbortSignal): Promise<AccountDraftResult> => publishingFetch("/api/draft", { cache: "no-store", signal }, uid);
async function publicationDraft(publication: Publication, uid: string, signal?: AbortSignal): Promise<BrowserDraft> {
  const images: Record<string, string> = {};
  for (const path of imageReferences(publication)) {
    const response = await fetch(publication.assets[path], { signal });
    if (!response.ok) throw new Error("An image could not be restored. Your draft has not been replaced. Retry when connected.");
    images[path] = await fileData(await response.blob());
  }
  return { ...emptyDraft(), profile: publication.profile, projects: publication.projects, images, ownerUid: uid, section: 8, publication: publicationMeta(publication) };
}
export function publicationMeta(p: Publication | null) { return p ? { handle: p.handle, revision: p.revision, publishedAt: p.publishedAt } : null; }
// Keep the revision the editable draft was based on; a later publication is not permission to overwrite it.
export function publicationBase(base: BrowserDraft["publication"] | undefined, current: Publication | null) {
  if (!current) return null;
  // A URL-only move may advance the revision without changing the public content.
  // Reconcile that move while keeping stale content edits protected by their old base.
  if (base && current.contentRevision && base.revision >= current.contentRevision && base.revision <= current.revision) return publicationMeta(current);
  return base?.handle === current.handle ? base : { ...publicationMeta(current)!, revision: 0 };
}
export async function hydrateCloud(result: AccountDraftResult, uid: string, signal?: AbortSignal): Promise<BrowserDraft> {
  if (!result.draft) return result.publication ? publicationDraft(result.publication, uid, signal) : { ...emptyDraft(), ownerUid: uid };
  const cloud = result.draft;
  if (cloud.version !== 1) throw new Error("Reload the latest app to open this draft format.");
  const images: Record<string, string> = {}, assets: NonNullable<BrowserDraft["cloud"]>["assets"] = {};
  for (const path of draftReferences(cloud.content)) {
    const response = await accountFetch(`/api/draft/image?id=${cloud.assets[path]}`, { cache: "no-store", signal }, uid);
    if (!response.ok) throw new Error("A saved image could not be loaded. Retry to open your complete portfolio.");
    const blob = await response.blob(); images[path] = await fileData(blob); assets[path] = { id: cloud.assets[path], hash: await imageHash(blob) };
  }
  const value = { ...emptyDraft(), ...cloud.content, images, ownerUid: uid, publication: publicationBase(cloud.publication, result.publication) };
  return { ...value, cloud: { revision: cloud.revision, syncedUpdatedAt: value.updatedAt, assets } };
}
async function imageHash(blob: Blob) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))).map(n => n.toString(16).padStart(2,"0")).join("");
}
export async function saveAccountDraft(draft: BrowserDraft, uid: string, revision: number, stillActive: () => boolean, signal?: AbortSignal) {
  const assets: NonNullable<BrowserDraft["cloud"]>["assets"] = {};
  for (const path of draftReferences(draft)) {
    if (!stillActive()) throw new Error("Draft changed accounts before saving.");
    if (!draft.images[path]) throw new Error("A draft image is missing. Restore a backup or choose the image again.");
    const blob = await (await fetch(draft.images[path], { signal })).blob(), hash = await imageHash(blob);
    const existing = draft.cloud?.assets[path];
    const id = existing?.hash === hash ? existing.id : (await uploadPublishingImage(blob, () => {}, uid, signal)).id;
    assets[path] = { id, hash };
  }
  if (!stillActive()) throw new Error("Draft changed accounts before saving.");
  const result = await publishingFetch("/api/draft", { method: "PUT", signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version: 1, revision, publication: draft.publication, content: draftContent(draft), assets: Object.fromEntries(Object.entries(assets).map(([path, asset]) => [path, asset.id])) }) }, uid);
  return { revision: result.revision as number, syncedUpdatedAt: draft.updatedAt, assets };
}
export function hasDraftWork(draft: BrowserDraft) {
  const blank = emptyDraft();
  return JSON.stringify(draft.profile) !== JSON.stringify(blank.profile) || draft.projects.length > 0 || Boolean(draft.projectDraft) || Boolean(draft.requestedHandle) || Object.keys(draft.images).length > 0;
}
