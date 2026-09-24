import { type APIRequestContext, type Page } from "@playwright/test";
import { test as base, expect } from "../fixtures";
import { getStorage } from "firebase-admin/storage";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { Snapshot } from "../../lib/portfolio-snapshot";

process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "127.0.0.1:9199";

export const app = initializeApp({ projectId: "demo-portfolio" }, "qa-publishing-tests");
export const auth = getAuth(app);
export const db = getFirestore(app);

export const test = base.extend<{ firebaseIsolation: void }>({
  firebaseIsolation: [async ({ request }, use) => {
    expect((await request.delete("http://127.0.0.1:9099/emulator/v1/projects/demo-portfolio/accounts")).ok()).toBe(true);
    expect((await request.delete("http://127.0.0.1:8080/emulator/v1/projects/demo-portfolio/databases/(default)/documents")).ok()).toBe(true);
    await getStorage(app).bucket("demo-portfolio.firebasestorage.app").deleteFiles({ force: true });
    await use();
  }, { auto: true }],
});

export { expect };

export const blank = (name: string) => ({
  profile: { name, biography: "I make useful things.", headshotImage: "", education: [], tools: [], jobs: [] },
  projects: [],
});

export const fixturePNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==",
  "base64",
);

export const fixtureProject = (src: string) => ({
  id: "required-project",
  title: "A considered project",
  slug: "considered-project",
  date: "2026-01-01",
  description: "Research and design for a useful experience.",
  thumbnail: src,
  images: [src],
  technologies: ["Figma", "Research"],
  link: "",
});

export async function publishRequest(request: APIRequestContext, options: {
  headers?: Record<string, string>;
  data: { handle: string; snapshot: Snapshot; assets: Record<string, string>; revision: number };
}) {
  if (options.data.snapshot.projects.length) return request.post("/api/publish", options);
  const assets = { ...options.data.assets };
  const src = Object.keys(assets)[0] || "/images/required-project.png";
  if (!assets[src]) {
    const upload = await request.post("/api/publish/image", { headers: options.headers, data: fixturePNG });
    assets[src] = upload.ok() ? (await upload.json()).id : "a".repeat(64);
  }
  return request.post("/api/publish", {
    ...options,
    data: { ...options.data, assets, snapshot: { ...options.data.snapshot, projects: [fixtureProject(src)] } },
  });
}

export async function addCompleteProject(page: Page) {
  await page.getByRole("navigation", { name: "Portfolio setup" }).getByRole("button", { name: /Projects/ }).click();
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  await page.getByLabel("Project title", { exact: true }).fill("A considered project");
  await page.getByLabel("Project description", { exact: true }).fill("Research and design for a useful experience.");
  await page.getByRole("button", { name: "Images", exact: true }).click();
  const png = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 200;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#355f52";
    context.fillRect(0, 0, 300, 200);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page.getByLabel("Upload thumbnail", { exact: true }).setInputFiles({
    name: "project.png",
    mimeType: "image/png",
    buffer: Buffer.from(png, "base64"),
  });
  await page.getByRole("button", { name: "Use this crop" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  // Leave complete edits open: publishing must commit this editor automatically.
}

export async function account(request: APIRequestContext, email: string, verified = true) {
  const user = await auth.createUser({ email, password: "qa-password-only", emailVerified: verified });
  const response = await request.post(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-test-key",
    { data: { email, password: "qa-password-only", returnSecureToken: true } },
  );
  const { idToken } = await response.json();
  return { uid: user.uid, headers: { Authorization: `Bearer ${idToken}` } };
}

export const draftBody = (name = "", revision = 0) => ({
  version: 1,
  revision,
  content: {
    ...blank(name),
    section: 0,
    projectStep: 0,
    requestedHandle: "",
    projectDraft: null as null | { id: string; title: string; thumbnail: string; images: string[]; date: string; description: string; technologies: string[]; link: string; slug: string },
  },
  assets: {} as Record<string, string>,
});

export async function loginStudio(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email address", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("qa-password-only");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/studio$/);
}
