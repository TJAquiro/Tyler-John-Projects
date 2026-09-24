import { type Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import fs from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
test.use({ baseURL: "http://127.0.0.1:3101" });
// Compile development-only routes before measuring the functional flows.
// GET requests are anonymous and never create accounts or mutate fixture data.
test.beforeAll(async ({ request }) => {
  test.setTimeout(180000);
  for (const route of ["/admin", "/admin/register", "/admin/login", "/admin/onboarding", "/admin/dashboard", "/admin/projects/new", "/admin/projects/qa-warmup", "/admin/preview", "/admin/dev", "/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/content", "/api/upload", "/api/dev"]) {
    const response = await request.get(route);
    expect(response.status()).toBeLessThan(500);
  }
});
async function register(page: Page, suffix: string) {
  await page.goto("/admin/register");
  if (suffix === "new-account") for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 960 });
    await page.screenshot({ path: `.qa/screenshots/security-register-${width}.png`, fullPage: true, animations: "disabled" });
  }
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Test Designer");
  await page.getByRole("textbox", { name: "Email address", exact: true }).fill(suffix + "@example.com");
  await page.getByRole("textbox", { name: "Portfolio address", exact: true }).fill(suffix);
  await page.getByLabel("Password", { exact: true }).fill("my-strong-password");
  await page.getByLabel("Confirm password", { exact: true }).fill("my-strong-password");
  await page.getByLabel("Local admin token").fill("qa-local-admin-token");
  await page.getByRole("button", { name: "Create account & start setup" }).click();
  await expect(page).toHaveURL(/\/admin\/onboarding/);
}
test("ACCT-001 accounts start empty, onboard immediately, sign in, and isolate content", async ({ page, browser }) => {
  const errors: string[] = [];
  page.on("console", msg => { if (/hydration|hydrated|server rendered/i.test(msg.text())) errors.push(msg.text()); });
  await register(page, "new-account");
  const content = await (await page.request.get("/api/content")).json();
  expect(content.projects).toEqual([]); expect(content.profile.tools).toEqual([]); expect(content.profile.biography).toBe("");
  await page.getByRole("button", { name: "Save & continue" }).click(); await expect(page.getByRole("heading", { level: 1 })).toContainText("face"); await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("face");
  await page.getByRole("button", { name: "Log out" }).click();
  await page.getByLabel("Email address").fill("new-account@example.com"); await page.getByLabel("Password", { exact: true }).fill("my-strong-password");
  await page.getByRole("button", { name: "Sign in" }).click(); await expect(page).toHaveURL(/onboarding/);
  const other = await browser.newContext({ baseURL: "http://127.0.0.1:3101" });
  try {
    const denied = await other.request.post("/api/auth/register", { headers: { Origin: "http://127.0.0.1:3101" }, data: { name: "Denied", email: "denied@example.com", handle: "denied-account", password: "another-strong-password", importExisting: true } });
    expect(denied.status()).toBe(403);
    const signup = await other.request.post("/api/auth/register", { headers: { Origin: "http://127.0.0.1:3101" }, data: { name: "Other Account", email: "other-account@example.com", handle: "other-account", password: "another-strong-password", adminToken: "qa-local-admin-token" } });
    expect(signup.ok()).toBe(true);
    const otherData = await (await other.request.get("/api/content")).json();
    expect(otherData.profile.name).toBe("Other Account"); expect(otherData.projects).toEqual([]);
    expect((await other.request.delete("/api/content", { data: { id: "does-not-belong-to-me" } })).status()).toBe(404);
    expect((await other.request.post("/api/dev", { headers: { Origin: "http://127.0.0.1:3101" }, data: { action: "reset", confirmation: "RESET ALL", adminToken: "qa-local-admin-token" } })).status()).toBe(403);
    const duplicate = await other.request.post("/api/auth/register", { headers: { Origin: "http://127.0.0.1:3101" }, data: { name: "Duplicate", email: "new-account@example.com", handle: "duplicate", password: "another-strong-password", adminToken: "qa-local-admin-token" } });
    expect(duplicate.status()).toBe(400);
  } finally { await other.close(); }
  expect((await (await page.request.get("/api/content")).json()).profile.name).toBe("Test Designer");
  expect(errors).toEqual([]);
});
test("ACCT-002 software, education descriptions, exact crop, photo caption, and responsive crop dialog", async ({ page }) => {
  test.setTimeout(180000);
  const hydration: string[] = []; page.on("console", msg => { if (/hydration|hydrated|server rendered/i.test(msg.text())) hydration.push(msg.text()); });
  await register(page, "feature-account"); await page.goto("/admin/dashboard");
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("button", { name: "Add Figma", exact: true }).click();
  await page.getByLabel("Search tools or add your own").fill("Custom Studio App");
  await page.getByLabel("Search tools or add your own").press("Enter");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect.poll(async () => (await (await page.request.get("/api/content")).json()).profile.tools).toEqual(["Figma", "Custom Studio App"]);
  await page.getByRole("button", { name: "Education", exact: true }).click();
  await page.getByRole("button", { name: "Add education" }).click();
  await page.getByRole("textbox", { name: "Institution", exact: true }).fill("Example University");
  await page.getByLabel("Education description").fill("Graduated with a focus on accessible interfaces.");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status")).toContainText("Saved to your portfolio");
  await page.getByRole("link", { name: "Add project" }).click();
  await page.getByRole("textbox", { name: "Project title", exact: true }).fill("Cropped Study");
  await page.getByLabel("Project description").fill("A study in careful framing.");
  await page.getByRole("button", { name: "Continue" }).click();
  const png = await page.evaluate(() => { const canvas = document.createElement("canvas"); canvas.width=100;canvas.height=80; const c=canvas.getContext("2d")!;c.fillStyle="#627b63";c.fillRect(0,0,100,80);c.fillStyle="#e47b5c";c.fillRect(0,0,50,40);return canvas.toDataURL("image/png").split(",")[1]; });
  await page.getByLabel("Upload thumbnail", { exact: true }).setInputFiles({ name: "crop-test.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.setViewportSize({ width: 375, height: 900 });
  await page.getByLabel("Width (px)").fill("50"); await page.getByLabel("Height (px)").fill("40");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  fs.mkdirSync(".qa/screenshots", { recursive: true });
  await page.screenshot({ path: ".qa/screenshots/crop-mobile.png", fullPage: true });
  const violations = (await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa"]).analyze()).violations;
  expect(violations.map(v => v.id)).toEqual([]);
  const upload = page.waitForResponse(r => r.url().endsWith("/api/upload"));
  await page.getByRole("button", { name: "Use this crop" }).click();
  const response = await upload; expect(response.status()).toBe(200);
  const src = (await response.json()).path as string;
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const dimensions = await page.evaluate(async source => { const img = new Image(); img.src=source;await img.decode();return [img.naturalWidth,img.naturalHeight]; }, src);
  expect(dimensions).toEqual([50,40]);
  await page.getByLabel("Description for photo 1").fill("A precisely cropped view of the visual system.");
  await page.getByRole("button", { name: "Continue" }).click(); await page.getByRole("button", { name: "Add project", exact: true }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.goto("/admin/preview?view=" + encodeURIComponent("/projects/cropped-study"));
  await expect(page.locator("figcaption")).toHaveText("A precisely cropped view of the visual system.");
  await page.goto("/admin/preview?view=" + encodeURIComponent("/about"));
  await expect(page.getByText("Graduated with a focus on accessible interfaces.")).toBeVisible();
  expect(hydration).toEqual([]);
  if (/^\/images\/[a-f0-9-]+\.webp$/.test(src)) fs.unlinkSync(path.join(".qa/uploads", path.basename(src)));
});
test("ACCT-003 dev showcase is opt-in and reset clears accounts, projects, and sessions", async ({ page, request }) => {
  const existingAccounts = JSON.parse(fs.readFileSync(".qa/dev-accounts/accounts.json", "utf8")) as Array<{ email: string; role?: string }>;
  if (existingAccounts.length === 0) {
    await register(page, "dev-owner");
  } else {
    await page.goto("/admin/login");
    await page.getByLabel("Email address").fill(existingAccounts.find(account => account.role === "owner")?.email || existingAccounts[0].email);
    await page.getByLabel("Password", { exact: true }).fill("my-strong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/admin\/(?:onboarding|dashboard)/);
  }
  const originalCookie = await page.context().cookies();
  await page.getByRole("link", { name: "Dev tools", exact: true }).click();
  await page.getByLabel("Local admin token").fill("qa-local-admin-token");
  await page.getByRole("button", { name: "Open showcase profile" }).click();
  await expect(page).toHaveURL(/dashboard/);
  const showcase = await (await page.request.get("/api/content")).json();
  expect(showcase.profile.name).toBe("Alex Morgan"); expect(showcase.profile.education[0].description).toBeTruthy(); expect(showcase.profile.tools.length).toBeGreaterThan(5); expect(showcase.projects).toHaveLength(3);
  await page.goto("/admin/preview?view=%2Fabout");
  await page.setViewportSize({ width: 1440, height: 900 }); await page.locator("img").evaluateAll(images => images.forEach(img => img.setAttribute("loading", "eager")));
  await page.screenshot({ path: ".qa/screenshots/showcase-about-desktop.png", fullPage: true, animations: "disabled" });
  await page.goto("/admin/dev");
  await page.getByLabel("Local admin token").fill("qa-local-admin-token");
  await expect(page.getByRole("button", { name: "Reset all accounts and projects" })).toBeDisabled();
  await page.getByLabel("Type RESET ALL to confirm").fill("RESET ALL");
  await page.getByRole("button", { name: "Reset all accounts and projects" }).click();
  await expect(page).toHaveURL(/register/);
  expect(JSON.parse(fs.readFileSync(".qa/dev-accounts/accounts.json","utf8"))).toEqual([]);
  expect(JSON.parse(fs.readFileSync(".qa/dev-content/projects.json","utf8"))).toEqual([]);
  expect(JSON.parse(fs.readFileSync(".qa/dev-content/portfolios/index.json","utf8"))).toEqual([]);
  const cookie = originalCookie.find(item=>item.name==="portfolio_session")!;
  expect((await request.get("/api/content",{headers:{Cookie:"portfolio_session="+cookie.value}})).status()).toBe(401);
});
