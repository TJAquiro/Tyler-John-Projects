import { test, expect } from "@playwright/test";
import { emptyDraft, parseBackup } from "../lib/browser-draft";
import { publicationIssues, projectsWithEditor } from "../lib/publication-validation";
import { publicationBase } from "../lib/account-draft-client";
import { draftContent, validateDraftContent } from "../lib/cloud-draft";

const project = { id: "project", title: "Case study", slug: "case-study", date: "2026-01-01", description: "A useful project", thumbnail: "/images/project.png", images: ["/images/project.png"], technologies: [], link: "" };

test("VALID-001 publishing issues include all mandatory blanks while empty optional fields stay valid", () => {
  const draft = emptyDraft();
  expect(publicationIssues(draft).map(i => i.key)).toEqual(["profile:Your name", "profile:Biography", "projects:Add project"]);
  draft.profile.name = "Designer"; draft.profile.biography = "My practice"; draft.projects = [project];
  expect(publicationIssues(draft)).toEqual([]);
  draft.profile.education = [{ institution: "", degree: "", field: "", startYear: "", endYear: "" }];
  draft.profile.jobs = [{ company: "", position: "", startDate: "", endDate: "", description: "" }];
  expect(publicationIssues(draft).map(i => i.key)).toEqual(["education.0:Institution", "job.0:Company", "job.0:Position"]);
  draft.profile.education = []; draft.profile.jobs = [];
  draft.projects = [{ ...project, title: "", slug: "", description: "", date: "", thumbnail: "", images: [] }];
  expect(publicationIssues(draft).map(i => i.key)).toEqual(["Project title", "Project date", "Project description", "URL slug", "Thumbnail", "Supporting images"].map(label => "project.project:" + label));
});

test("VALID-002 optional supplied formats and date ranges remain validated; open editor replaces its saved project", () => {
  const draft = emptyDraft(); draft.profile.name = "Name"; draft.profile.biography = "Bio";
  draft.profile.education = [{ institution: "School", degree: "", field: "", startYear: "2026-02-01", endYear: "2026-01-01" }];
  draft.projects = [{ ...project, link: "javascript:alert(1)" }];
  expect(publicationIssues(draft).map(i => i.key)).toEqual(["education.0:End date", "project.project:External project link"]);
  const updated = { ...project, title: "Changed" };
  expect(projectsWithEditor([project], updated)).toEqual([updated]);
  expect(projectsWithEditor([], updated)).toEqual([updated]);
});

test("VALID-003 private feedback survives backups/cloud validation and old backups default to untouched", () => {
  const draft = emptyDraft();
  draft.feedback = { touched: ["profile:Biography"], attempted: true };
  expect(parseBackup(JSON.stringify(draft)).feedback).toEqual(draft.feedback);
  expect(validateDraftContent(draftContent(draft)).feedback).toEqual(draft.feedback);
  delete draft.feedback;
  expect(parseBackup(JSON.stringify(draft)).feedback).toEqual({ touched: [], attempted: false });
  expect(() => parseBackup(JSON.stringify({ ...draft, feedback: { touched: [12], attempted: true } }))).toThrow("feedback metadata");
});

test("VALID-004 URL-only revision reconciliation preserves private edits without adopting newer public content", () => {
  const base = { handle: "old-url", revision: 2, publishedAt: "2026-01-01" };
  const current = { ...emptyDraft(), handle: "new-url", revision: 4, contentRevision: 2, assets: {}, publishedAt: "2026-01-01" };
  expect(publicationBase(base, current)).toEqual({ handle: "new-url", revision: 4, publishedAt: "2026-01-01" });
  expect(publicationBase(base, { ...current, contentRevision: 3 })?.revision).toBe(0);
  expect(publicationBase(base, { ...current, handle: "old-url", contentRevision: 3 })?.revision).toBe(2);
});
