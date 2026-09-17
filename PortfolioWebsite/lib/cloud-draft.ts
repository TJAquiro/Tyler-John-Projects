import { emptyDraft, parseBackup, type BrowserDraft } from "./browser-draft";
import { imageReferences } from "./portfolio-snapshot";

type DraftContent = Pick<BrowserDraft, "profile" | "projects" | "section" | "projectDraft" | "projectStep" | "requestedHandle" | "feedback">;
export type CloudDraft = { version: 1; revision: number; savedAt: string; publication?: BrowserDraft["publication"]; content: DraftContent; assets: Record<string, string> };
export function draftContent(draft: DraftContent): DraftContent {
  return { feedback: draft.feedback || { touched: [], attempted: false }, profile: draft.profile, projects: draft.projects, section: draft.section, projectDraft: draft.projectDraft, projectStep: draft.projectStep ?? 0, requestedHandle: draft.requestedHandle || "" };
}
export function draftReferences(draft: DraftContent) {
  return [...new Set([...imageReferences(draft), ...(draft.projectDraft ? [draft.projectDraft.thumbnail, ...draft.projectDraft.images] : [])].filter(Boolean))];
}
// Incomplete fields are valid drafts. Reuse backup validation without requiring publication-ready content.
export function validateDraftContent(value: unknown): DraftContent {
  const draft = value as DraftContent;
  const refs = draftReferences(draft);
  const images = Object.fromEntries(refs.map(path => [path, "data:image/png;base64,AA=="]));
  const checked = parseBackup(JSON.stringify({ ...emptyDraft(), ...draftContent(draft), images }));
  return draftContent(checked);
}
