import { test, expect } from "@playwright/test";
import { dateISO, formatDate, inputDate } from "../lib/dates";
import { validateProfile, validateProject, imagePath } from "../lib/validation";
import { imageReferences, mapImages, validateSnapshot, validHandle } from "../lib/portfolio-snapshot";
import { emptyDraft, parseBackup, backupBlob } from "../lib/browser-draft";

const profile = { name: "QA Designer", biography: "Design practice", headshotImage: "", education: [], tools: [], jobs: [] };
const project = { id: "case-1", slug: "case-1", title: "Case study", date: "2024-02-29", description: "A complete case study", thumbnail: "/images/one.png", images: ["/images/one.png"], technologies: [], link: "" };

test("BOUND-001 real dates preserve leap years, historical display and timezone-independent values", () => {
  for (const [input, expected] of [["02/29/2024", "2024-02-29"], ["2000-02-29", "2000-02-29"], ["1900-02-29", null], ["2023-02-29", null], ["2024-04-31", null], ["2024-13-01", null], ["2024-01-00", null], ["999-01-01", null], ["2024-02-29T00:00:00Z", null]]) expect(dateISO(input!)).toBe(expected);
  expect(inputDate("2024-02-29")).toBe("02/29/2024");
  expect(formatDate("2024-02-29")).toBe("Feb 29, 2024");
  expect(formatDate("2024-02")).toBe("Feb 2024");
  expect(formatDate("Present")).toBe("Present");
});

test("BOUND-002 project and profile boundaries reject unsafe paths, links, duplicates and invalid ranges", () => {
  for (const src of ["/images/../secret.png", "https://example.com/a.png", "data:image/png;base64,a", "/images/a.html", "/images/a%2fb.png"]) expect(() => imagePath(src)).toThrow();
  expect(imagePath("/images/one.png")).toBe("/images/one.png");
  expect(validateProject({ ...project, images: Array.from({ length: 6 }, (_, i) => `/images/${i}.png`) }).images).toHaveLength(6);
  for (const images of [[], Array.from({ length: 7 }, (_, i) => `/images/${i}.png`), ["/images/one.png", "/images/one.png"]]) expect(() => validateProject({ ...project, images })).toThrow();
  for (const link of ["javascript:alert(1)", "data:text/html,test", "//example.com", "not-a-url"]) expect(() => validateProject({ ...project, link })).toThrow();
  expect(validateProject({ ...project, link: "https://example.com/case" }).link).toBe("https://example.com/case");
  expect(validateProfile({ ...profile, name: "x".repeat(100) }).name).toHaveLength(100);
  expect(() => validateProfile({ ...profile, name: "x".repeat(101) })).toThrow();
  expect(() => validateProfile({ ...profile, name: "   " })).toThrow();
  expect(() => validateProfile({ ...profile, jobs: [{ company: "QA", position: "Designer", description: "", startDate: "2025-01-01", endDate: "2024-01-01" }] })).toThrow(/end date/);
  expect(validateProfile({ ...profile, tools: ["Figma", "Figma", "React"] }).tools).toEqual(["Figma", "React"]);
});

test("BOUND-003 publication limits, unique identities and image caption mapping preserve their contracts", () => {
  for (const handle of ["abc", "a".repeat(40), "qa-designer"]) expect(validHandle(handle)).toBe(handle);
  for (const handle of ["ab", "a".repeat(41), "-abc", "abc-", "a--b", "Upper", "a/b"]) expect(() => validHandle(handle)).toThrow();
  const projects = Array.from({ length: 20 }, (_, i) => ({ ...project, id: `case-${i}`, slug: `case-${i}` }));
  expect(validateSnapshot({ profile, projects }).projects).toHaveLength(20);
  expect(() => validateSnapshot({ profile, projects: [...projects, { ...project, id: "extra", slug: "extra" }] })).toThrow();
  expect(() => validateSnapshot({ profile, projects: [project, { ...project, id: "other" }] })).toThrow(/different ID and URL/);
  expect(() => validateSnapshot({ profile, projects: projects.slice(0, 2).map(p => ({ ...p, featured: true })) })).toThrow(/one featured/);
  const source = { profile, projects: [{ ...project, imageDescriptions: { "/images/one.png": "Original caption" } }] };
  const original = JSON.stringify(source);
  expect(imageReferences(source)).toEqual(["/images/one.png"]);
  const mapped = mapImages(source, { "/images/one.png": "/images/published.png" });
  expect(mapped.projects[0].imageDescriptions).toEqual({ "/images/published.png": "Original caption" });
  expect(mapped.projects[0].thumbnail).toBe("/images/published.png");
  expect(JSON.stringify(source)).toBe(original);
});

test("BOUND-004 backups reject corruption and missing images while stripping account ownership", async () => {
  const draft = { ...emptyDraft(), profile, ownerUid: "private-account", projects: [project], images: { "/images/one.png": "data:image/png;base64,aGVsbG8=" } };
  const text = await backupBlob(draft).text();
  const backup = JSON.parse(text);
  expect(backup.ownerUid).toBeNull(); expect(backup.publication).toBeNull();
  expect(parseBackup(text).projects[0].title).toBe(project.title);
  for (const invalid of ["{", JSON.stringify({ ...backup, version: 999 }), JSON.stringify({ ...backup, images: {} }), JSON.stringify({ ...backup, projects: [{ ...project, link: "javascript:alert(1)" }] })]) expect(() => parseBackup(invalid)).toThrow();
});
