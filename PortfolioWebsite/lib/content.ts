import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Profile, Project } from "./types";
export const contentRoot = process.env.PORTFOLIO_CONTENT_DIR || path.join(process.cwd(), "content");
export type StudioState = { step: number; completed: boolean; projectDraft: Partial<Project> | null };
export type PortfolioListing = { id: string; handle: string; name: string };
export const defaultStudio: StudioState = { step: 0, completed: false, projectDraft: null };
export function portfolioDirectory(accountId?: string) {
  if (!accountId) return contentRoot;
  if (!/^[a-z0-9-]+$/.test(accountId)) throw new Error("Invalid portfolio.");
  return path.join(contentRoot, "portfolios", accountId);
}
function read<T>(file: string, accountId?: string): T { return JSON.parse(fs.readFileSync(path.join(portfolioDirectory(accountId), file), "utf8")) as T; }
export function writeContent(file: "profile.json" | "projects.json" | "studio.json", value: unknown, accountId?: string) {
  const directory = portfolioDirectory(accountId); fs.mkdirSync(directory, { recursive: true });
  const temporary = path.join(directory, `.${file}.${randomUUID()}.tmp`);
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, path.join(directory, file));
}
export function getProfile(accountId?: string): Profile { return read<Profile>("profile.json", accountId); }
export function getProjects(accountId?: string): Project[] { return read<Project[]>("projects.json", accountId); }
export function getStudio(accountId?: string): StudioState { return fs.existsSync(path.join(portfolioDirectory(accountId), "studio.json")) ? read<StudioState>("studio.json", accountId) : { ...defaultStudio }; }
export function initializePortfolio(id: string, name: string, importExisting = false) {
  writeContent("profile.json", importExisting ? getProfile() : { name, headshotImage: "", biography: "", education: [], tools: [], jobs: [] }, id);
  writeContent("projects.json", importExisting ? getProjects() : [], id);
  writeContent("studio.json", { ...defaultStudio }, id);
}
export function readManifest(): PortfolioListing[] {
  const file = path.join(contentRoot, "portfolios", "index.json");
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) as PortfolioListing[] : [];
}
export function writeManifest(value: PortfolioListing[]) {
  const folder = path.join(contentRoot, "portfolios"); fs.mkdirSync(folder, { recursive: true });
  const file = path.join(folder, "index.json"), temporary = file + "." + randomUUID() + ".tmp";
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + "\n"); fs.renameSync(temporary, file);
}
