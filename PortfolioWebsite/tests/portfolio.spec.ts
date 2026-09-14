import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

const originalProfile = JSON.parse(fs.readFileSync("tests/fixtures/profile.json", "utf8"));
const originalProjects = JSON.parse(fs.readFileSync("tests/fixtures/projects.json", "utf8"));
const accountId = "11111111-1111-4111-8111-111111111111";
const fixture = path.resolve(".qa/content/portfolios/" + accountId);
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(fixture, name), "utf8"));
async function login(page: Page) {
  await page.goto("/admin");
  await page.getByLabel("Email address").fill("qa@example.com");
  await page.getByLabel("Password", { exact: true }).fill("qa-password-only");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/onboarding/);
}
test.beforeEach(() => {
  for (const [name, data] of Object.entries({ "profile.json": originalProfile, "projects.json": originalProjects, "studio.json": { step: 0, completed: false, projectDraft: null } })) fs.writeFileSync(path.join(fixture, name), JSON.stringify(data));
});
test("authentication protects every editor and API; invalid requests never write", async ({ page, request }) => {
  for (const route of ["/admin", "/admin/dashboard", "/admin/onboarding", "/admin/projects/new", "/admin/projects/project-01", "/admin/preview"]) {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status()).toBe(307); expect(response.headers().location).toContain("/admin/login");
  }
  expect((await request.get("/api/content")).status()).toBe(401);
  expect((await request.put("/api/content", { data: { profile: originalProfile } })).status()).toBe(401);
  expect((await request.put("/api/studio", { data: { step: 1 } })).status()).toBe(401);
  expect((await request.post("/api/upload")).status()).toBe(401);
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill("qa@example.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator(".form-error[role=alert]")).toContainText("did not match");
  await login(page);
  const api = page.request;
  const before = fs.readFileSync(path.join(fixture, "profile.json"), "utf8");
  expect((await api.put("/api/content", { data: { profile: { ...originalProfile, name: "Changed" }, projects: [{}] } })).status()).toBe(400);
  expect(fs.readFileSync(path.join(fixture, "profile.json"), "utf8")).toBe(before);
  expect((await api.put("/api/content", { data: { profile: { name: 42 } } })).status()).toBe(400);
  expect((await api.put("/api/content", { data: "{", headers: { "Content-Type": "application/json" } })).status()).toBe(400);
  expect((await api.put("/api/content", { data: { profile: originalProfile }, headers: { Origin: "https://other.example" } })).status()).toBe(403);
  expect((await api.put("/api/content", { data: { project: { ...originalProjects[0], id: "duplicate" } } })).status()).toBe(400);
  for (const images of [[], Array(7).fill("/images/mara.svg")]) expect((await api.put("/api/content", { data: { project: { ...originalProjects[0], images } } })).status()).toBe(400);
  expect((await api.post("/api/upload", { multipart: { file: { name: "fake.png", mimeType: "image/png", buffer: Buffer.from("<script>bad</script>") } } })).status()).toBe(400);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  expect((await page.request.get("/api/content")).status()).toBe(401);
});
test("onboarding saves, survives reload, reports failures, skips, and finishes", async ({ page }) => {
  await login(page);
  await expect(page.getByLabel("Your name")).toHaveValue(originalProfile.name);
  await page.getByLabel("Your name").fill("Alex Morgan");
  await expect.poll(() => read("profile.json").name).toBe("Alex Morgan");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("face");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("face");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await page.getByLabel("Biography", { exact: true }).fill("Thoughtful **design** for everyday life.");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await page.getByRole("button", { name: "Add education" }).click();
  await page.getByLabel("Institution").fill("Design Institute");
  await page.getByLabel("Degree").fill("BA");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await page.getByRole("button", { name: "Add Figma", exact: true }).click();
  await page.getByRole("button", { name: "Add Blender", exact: true }).click();
  await page.getByLabel("Search tools or add your own").fill("My Custom Tool");
  await page.getByLabel("Search tools or add your own").press("Enter");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await page.getByRole("button", { name: "Add experience" }).click();
  await page.getByLabel("Company").fill("Studio North");
  await page.getByLabel("Position").fill("Designer");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await page.getByLabel("Project title").fill("First New Project");
  await page.reload();
  await expect(page.getByLabel("Project title")).toHaveValue("First New Project");
  await page.getByRole("button", { name: "Skip for now" }).click();
  await expect(page.getByRole("heading", { name: "Your portfolio, taking shape." })).toBeVisible();
  await page.getByRole("button", { name: "Finish setup" }).click();
  await expect(page).toHaveURL(/dashboard\?finished/);
  expect(read("studio.json").completed).toBe(true);
  expect(read("profile.json").education[0].institution).toBe("Design Institute");
  expect(read("profile.json").jobs[0].company).toBe("Studio North");
  expect(read("projects.json")).toEqual(originalProjects);
  await page.goto("/admin"); await expect(page).toHaveURL(/dashboard/);
  await page.goto("/admin/onboarding");
  await page.getByRole("button", { name: "01 Your name" }).click();
  await page.route("**/api/content", route => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Disk unavailable. Please retry." }) }));
  await page.getByLabel("Your name").fill("Recovery Draft");
  await page.getByRole("button", { name: "Save & continue" }).click();
  await expect(page.locator(".form-error[role=alert]")).toContainText("Disk unavailable");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("start with you");
  await page.reload();
  await expect(page.getByLabel("Your name")).toHaveValue("Recovery Draft");
});
test("dashboard profile CRUD and project create/edit/delete work; production stays frozen", async ({ page }) => {
  await login(page); await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: "Education", exact: true }).click();
  await page.getByRole("button", { name: "Add education" }).click();
  await page.getByLabel("Institution").fill("QA School");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status")).toContainText("Saved to your portfolio");
  await page.getByRole("button", { name: "Remove education 1" }).click();
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect.poll(() => read("profile.json").education.length).toBe(0);
  await page.getByRole("button", { name: "Experience", exact: true }).click();
  await page.getByRole("button", { name: "Add experience" }).click();
  await page.getByLabel("Company").fill("QA Studio"); await page.getByLabel("Position").fill("Designer");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect.poll(() => read("profile.json").jobs.length).toBe(1);
  await page.getByRole("button", { name: "Remove experience 1" }).click();
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect.poll(() => read("profile.json").jobs.length).toBe(0);
  await page.getByRole("link", { name: "Add project" }).click();
  await page.getByLabel("Project title").fill("Browser Test Project");
  await page.getByLabel("Project description").fill("A case study created through the real interface.");
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await page.getByRole("textbox", { name: "Thumbnail", exact: true }).fill("/images/common-ground.svg");
  await page.getByRole("button", { name: "Continue", exact: false }).click();
  await page.getByRole("button", { name: "Add Figma", exact: true }).click();
  await page.getByLabel("Search tools or add your own").fill("TypeScript");
  await page.getByLabel("Search tools or add your own").press("Enter");
  await page.getByLabel("External project link").fill("https://example.com/project");
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  await expect(page).toHaveURL(/dashboard\?saved/);
  const created = read("projects.json").find((p: { title: string }) => p.title === "Browser Test Project");
  expect(created.images).toHaveLength(1);
  await page.getByRole("link", { name: "Edit Browser Test Project" }).click();
  await page.getByLabel("Project title").fill("Revised Browser Project");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Save project" }).click();
  await expect(page).toHaveURL(/dashboard/);
  const updated = read("projects.json").find((p: { id: string }) => p.id === created.id);
  await page.goto("/admin/preview?view=" + encodeURIComponent("/projects/" + updated.slug));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Revised Browser Project");
  expect((await page.request.get("/u/qa-portfolio/projects/" + updated.slug)).status()).toBe(404);
  await page.request.put("/api/content", { data: { profile: { ...originalProfile, name: "Unpublished Name" } } });
  await page.goto("/u/qa-portfolio"); await expect(page.getByRole("banner")).toContainText(originalProfile.name);
  await page.goto("/admin/preview"); await expect(page.getByRole("banner")).toContainText("Unpublished Name");
  await page.goto("/admin/dashboard");
  const article = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Revised Browser Project" }) });
  await article.getByRole("button", { name: "Delete", exact: true }).click();
  await article.getByRole("button", { name: "Keep project" }).click();
  expect(read("projects.json")).toHaveLength(originalProjects.length + 1);
  await article.getByRole("button", { name: "Delete", exact: true }).click();
  await article.getByRole("button", { name: "Confirm delete" }).click();
  await expect(article).toHaveCount(0);
  expect(read("projects.json")).toHaveLength(originalProjects.length);
});
test("responsive pages, navigation, image loading, and accessibility", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message)); page.on("console", msg => { if (/hydration|hydrated|server rendered/i.test(msg.text())) errors.push(msg.text()); });
  fs.mkdirSync(".qa/screenshots", { recursive: true });
  await login(page);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [name, route] of Object.entries({ home: "/u/qa-portfolio", about: "/u/qa-portfolio/about", project: "/u/qa-portfolio/projects/" + originalProjects[0].slug, dashboard: "/admin/dashboard", onboarding: "/admin/onboarding", "new-project": "/admin/projects/new" })) {
      await page.goto(route); await page.locator("h1").waitFor(); await page.evaluate(() => document.fonts.ready);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator("img").evaluateAll(images => images.forEach(img => img.setAttribute("loading", "eager")));
      await expect.poll(() => page.locator("img").evaluateAll(images => images.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
      await page.screenshot({ path: `.qa/screenshots/${name}-${width}.png`, fullPage: true, animations: "disabled" });
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(results.violations.map(v => `${v.id}: ${v.nodes.map(n => n.target).join(", ")}`)).toEqual([]);
      expect(await page.locator("img").evaluateAll(images => images.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0))).toBe(true);
    }
  }
  await page.goto("/u/qa-portfolio"); await expect(page.getByRole("banner")).toContainText(originalProfile.name); await expect(page.getByRole("navigation").getByRole("link", { name: "About" })).toHaveAttribute("href", "/u/qa-portfolio/about"); await page.getByRole("navigation").getByRole("link", { name: "About" }).click(); await expect(page).toHaveURL("/u/qa-portfolio/about");
  await page.goto("/u/qa-portfolio"); await page.keyboard.press("Tab"); await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.getByRole("navigation").getByRole("link", { name: "About" }).click(); await expect(page).toHaveURL("/u/qa-portfolio/about");
  expect(errors).toEqual([]);
});

test("recovery drafts cannot overwrite newer saved profile content", async ({ page }) => {
  await login(page);
  await page.getByLabel("Your name").fill("Name A");
  await expect.poll(() => read("profile.json").name).toBe("Name A");
  await page.goto("/admin/dashboard");
  await page.getByLabel("Your name").fill("Name B");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect.poll(() => read("profile.json").name).toBe("Name B");
  await page.goto("/admin/onboarding");
  await expect(page.getByLabel("Your name")).toHaveValue("Name B");
  await expect(page.getByRole("status")).toContainText("Progress saved");
  expect(read("profile.json").name).toBe("Name B");
  await page.evaluate(old => localStorage.setItem("11111111-1111-4111-8111-111111111111:portfolio-onboarding-profile", JSON.stringify({ base: JSON.stringify(old), value: { ...old, name: "Stale browser draft" } })), originalProfile);
  await page.reload();
  await expect(page.getByLabel("Your name")).toHaveValue("Name B");
  await expect(page.getByText("A newer saved version was loaded.", { exact: false })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Progress saved");
  expect(read("profile.json").name).toBe("Name B");
  // A direct jump to preview must flush valid edits, even before the debounce.
  await page.getByLabel("Your name").fill("Immediate Preview");
  await page.getByRole("button", { name: "08 Preview" }).click();
  await page.getByRole("heading", { name: "Your portfolio, taking shape." }).waitFor();
  expect(read("profile.json").name).toBe("Immediate Preview");
  await page.goto("/admin/preview");
  await expect(page.getByRole("banner")).toContainText("Immediate Preview");
});

test("image picker rejects bad paths, uploads files, and enforces gallery capacity", async ({ page }) => {
  await login(page); await page.goto("/admin/projects/new");
  await page.getByRole("button", { name: "02 Images" }).click();
  await page.getByLabel("New supporting image", { exact: true }).fill("abc");
  await page.getByRole("button", { name: "Add image path" }).click();
  await expect(page.locator(".form-error[role=alert]")).toContainText("Choose an image from");
  await expect(page.getByRole("heading", { name: "Supporting images (0/6)" })).toBeVisible();
  await page.reload(); await page.getByRole("button", { name: "02 Images" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Add a project");
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7N8AAAAASUVORK5CYII=", "base64");
  const upload = page.waitForResponse(response => response.url().endsWith("/api/upload"));
  await page.getByLabel("Upload thumbnail", { exact: true }).setInputFiles({ name: "qa-image.png", mimeType: "image/png", buffer: png });
  await page.getByRole("button", { name: "Use this crop" }).click();
  const response = await upload;
  expect(response.status()).toBe(200);
  const uploaded = (await response.json()).path as string;
  try {
    await expect(page.getByRole("textbox", { name: "Thumbnail", exact: true })).toHaveValue(uploaded);
    for (const image of ["common-ground", "common-ground-detail", "soft-focus", "soft-focus-detail", "second-nature"]) {
      await page.getByLabel("New supporting image", { exact: true }).fill("/images/" + image + ".svg");
      await page.getByRole("button", { name: "Add image path" }).click();
    }
    await expect(page.getByRole("heading", { name: "Supporting images (6/6)" })).toBeVisible();
    await expect(page.getByText("All six image slots are filled.", { exact: false })).toBeVisible();
    await expect(page.getByLabel("New supporting image", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Remove image 6", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Supporting images (5/6)" })).toBeVisible();
    await expect(page.getByLabel("New supporting image", { exact: true })).toBeVisible();
  } finally {
    if (/^\/images\/[a-f0-9-]+\.webp$/.test(uploaded)) fs.unlinkSync(path.join(".qa/uploads", path.basename(uploaded)));
  }
});
