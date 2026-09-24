import { createHmac } from "node:crypto";
import fs from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

test("ROUTE-001 missing routes and missing portfolios show an accessible recovery path", async ({ page, request }) => {
  for (const route of ["/does-not-exist", "/u/does-not-exist", "/u/qa-portfolio/projects/does-not-exist"]) {
    expect((await request.get(route)).status()).toBe(404);
    await page.goto(route);
    await expect(page.getByRole("heading", { name: "That page has moved." })).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to Portfolio studio/ })).toHaveAttribute("href", "/");
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  }
  await page.getByRole("link", { name: /Back to Portfolio studio/ }).click();
  await expect(page).toHaveURL("/");
});

test("ROUTE-002 forged and expired sessions fail while valid sessions use protected cookies", async ({ request }) => {
  const value = `11111111-1111-4111-8111-111111111111.1.${"a".repeat(32)}`;
  const expired = value + "." + createHmac("sha256", "qa-session-secret-never-used-for-real-content").update(value).digest("hex");
  for (const token of ["forged", expired, expired + ".extra"]) {
    expect((await request.get("/api/content", { headers: { Cookie: `portfolio_session=${token}` } })).status()).toBe(401);
    expect((await request.get("/admin/dashboard", { headers: { Cookie: `portfolio_session=${token}` }, maxRedirects: 0 })).status()).toBe(307);
  }
  const login = await request.post("/api/auth/login", { form: { email: "qa@example.com", password: "qa-password-only" }, maxRedirects: 0 });
  expect(login.status()).toBe(303);
  expect(login.headers()["set-cookie"]).toMatch(/HttpOnly/i);
  expect(login.headers()["set-cookie"]).toMatch(/SameSite=strict/i);
  expect(login.headers()["set-cookie"]).toMatch(/Path=\//i);
  expect((await request.get("/api/content")).status()).toBe(200);
});

test("ROUTE-003 rejected setup updates preserve all saved content", async ({ request }) => {
  await request.post("/api/auth/login", { form: { email: "qa@example.com", password: "qa-password-only" } });
  const root = ".qa/content/portfolios/11111111-1111-4111-8111-111111111111/";
  const snapshot = () => ["profile.json", "projects.json", "studio.json"].map(file => fs.readFileSync(root + file, "utf8"));
  const before = snapshot();
  for (const body of [{ step: -1 }, { step: 8 }, { step: 1.5 }, { completed: "yes" }, { unknown: true }, { projectDraft: { images: Array(7).fill("/images/one.png") } }]) {
    expect((await request.put("/api/studio", { data: body })).status()).toBe(400);
    expect(snapshot()).toEqual(before);
  }
  expect((await request.put("/api/studio", { data: { step: 1 }, headers: { Origin: "https://foreign.example" } })).status()).toBe(403);
  expect(snapshot()).toEqual(before);
});

test("ROUTE-004 private preview has a usable empty state and accessible responsive saved content", async ({ page }) => {
  await page.goto("/studio/preview");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("No saved draft");
  await page.getByRole("link", { name: "Back to studio" }).click();
  await page.getByRole("textbox", { name: "Your name", exact: true }).fill("Baseline Designer");
  await page.getByRole("button", { name: "03 Biography", exact: true }).click();
  await page.getByLabel("Biography", { exact: true }).fill("Accessible work, saved privately.");
  await page.getByRole("button", { name: "Preview portfolio" }).click();
  await expect(page.getByText("Accessible work, saved privately.", { exact: true })).toBeVisible();
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `.qa/screenshots/baseline-preview-${width}.png`, fullPage: true, animations: "disabled" });
  }
  await page.getByRole("link", { name: "About", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/view=%2Fabout/);
  await expect(page.getByText("Accessible work, saved privately.", { exact: true })).toBeVisible();
});

test("ROUTE-005 original fonts load locally with third-party network access blocked", async ({ page }) => {
  const external: string[] = [];
  await page.route("https://**/*", route => { external.push(route.request().url()); return route.abort(); });
  await page.goto("/");
  const faces = await page.evaluate(async () => {
    const specifications = ['400 16px "DM Mono"', '500 16px "DM Mono"', '400 16px "DM Sans"', '500 16px "DM Sans"', '700 16px "DM Sans"', '600 16px "Playfair Display"', 'italic 600 16px "Playfair Display"'];
    return Promise.all(specifications.map(async font => ({ font, count: (await document.fonts.load(font)).length, loaded: document.fonts.check(font) })));
  });
  for (const face of faces) { expect(face.count, face.font).toBeGreaterThan(0); expect(face.loaded, face.font).toBe(true); }
  expect(external).toEqual([]);
});
